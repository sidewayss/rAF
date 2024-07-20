import {spreadToEmpties, legText, legNumber} from "./easy-construct.js"

import {Ez, Is, Easy} from "../raf.js";

export class Incremental extends Easy {
    #count;
    constructor(obj) {
        super(obj, true);
        Ez.is(this);
    }
//==============================================================================
//  _finishLegs() is more complicated than its counterpart in easy.js because
//   it allows for leg.increment, leg.end, and leg.start to remain undefined.
//   _calc() can compute these properties at run-time, which allows for mixing
//   time-based and end-based incremental legs.
    _finishLegs(o, _, e, t, c, tc) {
        if (!o[t] && !o[c])
            tc = "";

        let err, hasCount, hasEnd, hasInc, hasTime;
        const
        spreads = [],
        isTime  = (tc == t),
        isCount = (tc == c),
        inc  = "increment",
        errT = " defines time but not increment.",
        errC = " defines count but not increment or end.",
        err2 = " must define two of three: increment, end, count.";

        o[inc]  = Ez.toNumber(o[inc], inc, ...Ez.undefNotZero);
        o.legs.forEach((leg, i) => {
            hasInc = Is.def(legNumber(leg, inc, i, o[inc], ...Ez.notZero));
            if ((!isTime && !isCount) || !leg[tc]) {
                hasEnd = Is.def(legNumber(leg, e, i));
                if (isTime)
                    hasTime  = Is.def(legNumber(leg, t, i, ...Ez.undefNotZero));
                if (isCount)
                    hasCount = Is.def(legNumber(leg, c, i, ...Ez.undefNotZero));
            }
            if (isTime) {
                if (!leg[tc]) {      // o.emptyLegs.includes(leg) == true
                    if (hasInc) {
                        if (!hasEnd) {
                            if (hasCount)              // try to set end
                                this.#computeOne(leg, hasInc);
                            else {                     // set time
                                spreadToEmpties(leg, tc, o.spread);
                                spreads.push(leg);
                            }
                        }                              // else if (hasEnd) noop;
                    }
                    else if (hasCount && hasEnd)       // try to set increment
                        this.#computeOne(leg, hasInc);
                    else
                        err = err2;
                }
                if (leg[tc] && !hasInc)
                    err = errT;
            }
            else if (isCount) {
                if (!leg[tc]) {      // o.emptyLegs.includes(leg) == true
                    if (!hasInc && (hasTime || !hasEnd))
                        err = hasTime ? errT : errC;
                    else if (!hasTime) {
                        spreadToEmpties(leg, tc, o.spread);
                        spreads.push(leg);             // set count
                        this.#computeOne(leg, hasInc); // try to set inc or end
                    }
                }
                if (leg[tc])
                    this.#computeOne(leg, hasInc);     // try to set inc or end
            }
            else {
                if (!hasInc && (hasTime || (!hasEnd || !hasCount)))
                    err = hasTime ? errT : err2;
                if (!hasTime) {
                    if (hasInc + hasEnd + hasCount < 2)
                        err = err2;
                    else if (!hasInc || !hasEnd)
                        this.#computeOne(leg, hasInc); // try to set inc or end
                }
            }
            if (err)
                throw new Error(legText(leg, i, tc), err);
        });
        if (!spreads.length) {  // validate the spread allocation
            if (o.spread)
                throw new Error("There is surplus " + tc
                            + ", and no legs able to accept it.");
        }
        else if (spreads.length < o.cEmpties) {
            const v = o.leftover / spreads.length;   // spread is wrong, do over
            for (const leg of spreads) {
                spreadToEmpties(leg, tc, v)
                if (leg[c])
                    this.#computeOne(leg, leg[inc]); // re-compute inc or end
            }
        }
        if (isCount)
            this.#count = o[c];
    }
    #computeOne(leg, hasInc) {
        if (!Is.def(leg.start))
            leg.start = leg.prev.end;
        if (Is.def(leg.start))
            (hasInc ? this.#computeEnd : this.#computeInc)(leg, leg.start);
    }
    #computeEnd(leg, start) {
        leg.end = leg.increment * leg.count + start;
    }
    #computeInc(leg, start) {
        leg.increment = (leg.end - start) / leg.count;
    }
//==============================================================================
// this.count is for Incremental only, but the code is shared with .time
    get count()    { return this.#count; }
    set count(val) {
        if (this.#count)
            this.#count = this._setTimeCount(val, this.#count, "count");
        else //!!or can you mix time/count-based legs??
            Ez._cantErr("You", "set count for time-based incremental");
    }
//==============================================================================
//  _calc() increments e.value until the time is up or end is reached
    _calc(now, leg, e) {
        if (leg.time) { // time-based
            if (now >= leg.time) {           // leg is always this._leg
                leg = this._nextLeg(leg, e); // sets this._leg
                if (e.status) {
                    if (!leg.time)
                        this.#nextInc(leg);
                    if (!Is.def(leg.start))
                        this.#incrementLeg(leg, e);
                }
            }
            else
                this.#incrementLeg(leg, e);
        }
        else {          // count-based (or end-based)
            this.#incrementLeg(leg, e);
            const end = leg.end;
            if (e.value >= end) {
                let wait;
                if (leg.next) {
                    leg = leg.next;
                    if (leg.time) {
                        this._now = 0;
                        this._zero(now);
                    }
                    this.#nextInc(leg, true);
                    this._leg = leg;
                    wait      = leg.wait;
                    e.value   = end;
                    if (wait)
                        e.waitNow = true;
                }
                else { //!!need to set #zero and _leg here!!
                    this._trip(e);
                    if (this._inbound) {
                        e.value = end;
                        wait = this.tripWait;
                    }
                    else if (e.status) {
                        wait = this.loopWait;
                        if (!wait)
                            e.value = this.start;
                    }
                }
            }
        }
    }
//  The rest of the animation methods help #ease() and #increment():
//  #incrementLeg() helps #increment()
    #incrementLeg(leg, e) {
        this._value += leg.increment;
        e.value      = this._value;
    }
//  #nextInc() helps #increment()
    #nextInc(leg, checkWait) {
        if (checkWait && leg.wait) {
            if (leg.prev.end)
                this._value = leg.prev.end;
        }
        else if (Is.def(leg.start))
            this._value = leg.start;
        if (!leg.increment)             // it's undefined
            this.#computeInc(leg, this._value);
        else if (!Is.def(leg.end))      // can be any number
            this.#computeEnd(leg, this._value);
    }
}