import {easings}            from "./easings.js";
import {create}             from "./efactory.js";
import {EBase}              from "./easer.js";
import {stepsToLegs}        from "./easy-steps.js"
import {prepLegs, override, legUnit, spreadToEmpties, getType, getIO, splitIO,
        toBezier}           from "./easy-construct.js"

import {E, Ez, Is, Easies} from "../raf.js";

export class Easy {
//  Public string arrays for enums and <select><option> or other list display
    static status = ["arrived","tripped","waiting","inbound","outbound",
                     "initial","original","pausing","playing","empty"];
    static type   = ["linear","sine","circ","expo","back","elastic","bounce",
                     "pow","bezier","steps","increment"];
    static io     = ["in","out","inIn","outIn","inOut","outOut"];
    static set    = ["let","set","net"];
    static jump   = ["none","start","end","both"];
    static eKey   = ["value","unit","comp"];

    static #unitComp = Easy.eKey.slice(1);
   // Easy.#unitComp vs this.#compUnit ensures that unit always goes up, 0 to 1,
   // and comp always goes down, 1 to 0. Otherwise it would be more difficult
   // for EBase to assign an eKey, harder for users too.

    #autoTrip; #base; #compUnit; #dist; #e; #end; #flipTrip; #lastLeg;
    #legsWait; #loopWait; #onAutoTrip; #onLoop; #oneShot; #peri; #plays; #post;
    #pre; #reversed; #roundTrip; #setValue; #start; #targets; #time; #tripWait;
    #wait; #zero;

    _leg; _now; _inbound; // shared with Incremental.prototype._calc()
    _value;               // for Incremental only, but used in shared code here
    _firstLeg;            // shared with easeSteps(), may be useful elsewhere...
//==============================================================================
    constructor(obj, isInc = false) {
        Ez._validObj(obj, "Easy constructor's only argument");
        const
        c = "count", e = "end", s = "start", t = "time", w = "wait",
        o = Ez.shallowClone(obj),

        props = ["pre","peri","post","onLoop","oneShot","targets","tripWait"];
        for (const prop of props)   // use setters for validation, defaults
            this[prop] = o[prop]

        //  #plays is only used as a default for targets that don't define it
        this.plays = o.plays || o.repeats + 1 || undefined;

        // Don't use setters for these initial settings
        this.#wait      = Ez.toNumber(o[w], w, ...Ez.defZero);
        this.#loopWait  = Ez.toNumber(o.loopWait, "loopWait", ...Ez.defZero);
        this.#roundTrip = Boolean(o.roundTrip);
        this.#autoTrip  = Ez.defaultToTrue(o.autoTrip);
        this.#flipTrip  = Ez.defaultToTrue(o.flipTrip);

        if (Is.def(o.legs))         // validate/pseudo-clone user-defined legs
            o.legs = Ez.toArray(o.legs, "legs", Ez._validObj)
                       .map(v => Object.assign({}, v));
        const
        type = isInc ? E.increment : getType(o),
        io   = getIO(o.io);         // getType() requires o.legs to be defined
        o[t] = Ez.toNumber(o[t], t, ...Ez.undefGrThan0);

        if (!o.legs) {              // create default legs
            const ios = splitIO(io, Is.def(o.split) || Is.def(o.gap));
            const leg = {type, io:ios[0], bezier:o.bezier};
            o.legs = [leg];
            if (ios.length == 2) {
                if (!Is.def(o[t]))  // assignment above allows undefined for now
                    Ez._mustErr("You", `define obj.${t} or each leg.${t}`);
                //-------------------------------------------------------------------
                const split = Ez.toNumber(o.split, "split", o[t] / 2, ...Ez.grThan0);
                const gap   = Ez.toNumber(o.gap,   "gap", ...Ez.defZero);
                const wait  = gap || undefined; // merely a preference
                leg.time = split;
                leg.end  = Ez.toNumber(o.mid, "mid");
                o.legs.push({wait, time:o[t] - split - gap, type, io:ios[1]});
            }
        }
        if (isInc && !o[t])
            o[c] = Ez.toNumber(o[c], c, ...Ez.undefGrThan0)

        const isT = !o[c];
        let   tc  = isT ? t : c;          // "time" or "count"
        this.#legsWait = prepLegs(o, type, s, e, w, tc, isInc);

        // _firstLeg and #lastLeg are starting points for two linked lists of
        // leg objects. The outbound list starts with _firstLeg. The inbound
        // list is made up of clones of the outbound list's legs, starting with
        // a clone of #lastLeg, see #reverseMe(). stepsToLegs() can modify both.
        const last = o.legs.length - 1;
        this._firstLeg = o.legs[0];
        this.#lastLeg  = o.legs[last];

        // _firstLeg shares .start with o, #lastLeg shares .end
        // o[e] is subject to further change in stepsToLegs() if no jump end
        override(s, this._firstLeg, o, "the first", [0]);
        if (!this.#lastLeg.stepsReady)
            override(e, this.#lastLeg,  o, "the last", [isInc ? undefined : 1]);
        else {
            if (Is.def(o[e]))
                console.warn(o.end != this.#lastLeg.steps.at(-1));
            o[e] = this.#lastLeg.steps.at(-1);
            this.#lastLeg[e] = o[e];
        }
        if (!Is.def(this._firstLeg[s]))   // normalize o[s] and o[e] with
            this._firstLeg[s] = o[s];     // legs prior to _finalizeLegs().
        if (!Is.def(this.#lastLeg[e]))
            this.#lastLeg[e] = o[e];

        const
        down = this._finishLegs(o, s, e, t, ...(isInc ? [c,  tc] : [io, last])),
        unit = down ? 1 : 0,
        comp = Ez.comp(unit);             // isInc ignores unit and comp

        // A dummy _firstLeg.prev simplifies _calc(), must precede #reverseMe()
        // #lastLeg's dummy .prev is set on the cloned leg in #reverseLeg()
        this._firstLeg.prev = {unit, comp, end:o[s], wait:0};
        if (this.#roundTrip)
            this.#reverseMe(isInc);       // requires _firstLeg.prev

        this.#start = o[s];
        this.#end   = o[e];               // must follow stepsToLegs()
        if (isT)
            this.#time = o[t];

        if (isInc)                        // initial, base animation values
            this._value = o[s];
        else
            this.#base  = down ? o[e] : o[s];

    //!!if (down)                         // see _calc() and #leg2e()
    //!!    this.#compUnit = Easy.#unitComp.slice();

        // this.e    stores the current state
        // this.e2   is a secondary e w/o status, for loops/trips without waits
        // this.#e   is the initial configuration for this.#init_e()
        // e.value   is the current eased value
        // e.unit    is the unit interval for that value, range: 0-1 inclusive
        // e.comp    is the complement of unit: 1 - unit
        // e.status  is the current status, range: E.arrived to E.original
        // e.waitNow helps calc(), _nextLeg(), Easies.proto.next() at run-time
        this.e  = {waitNow:undefined, status:undefined};
        this.e2 = {};
        this.#e = {unit, comp, value:o[s]};

        this.#init_e();
        Object.seal(this.e);
        Object.seal(this.e2);
        Object.freeze(this.#e);

        Ez.is(this);
        Object.seal(this);
    }
//  static _validate() is a validation function for Ez.toArray()
    static _validate(obj, err) {
        if (!obj?.isEasy)
            Ez._mustBeErr(err, "an instance of Easy");
        return obj;
    }
//==============================================================================
//  _finishLegs() is the second iteration over legs by constructor(), overriden
//                by Incremental. This version only does time, not count.
//   If legs go up & down, this.#dist is less than the total distance traveled;
//   legDist can be greater than this.#dist; and leg.start/leg.end can be
//   outside the bounds of this.#start/this.#end, thus e.unit can be > 1 or < 0.
//   E.steps does not use leg.part
//   The sum of all leg.parts = this.#dist
//   The sum of abs(leg.part) = total distance traveled
    _finishLegs(o, s, e, t, io, last) {
        const start = o[s];
        if (this.#lastLeg.stepsReady) {     // user steps can have start == end,
            let i = 0;                      // distance is max distance traveled
            this.#lastLeg.steps.forEach((step, j) => {
                if (Math.abs(step - start) > i)
                    i = j;                  // only matters for e.unit, e.comp
            });
            o[e] = this.#lastLeg.steps[i];
        }
        for (const leg of o.emptyLegs)      // must precede stepsToLegs()
            spreadToEmpties(leg, t, o.spread);

        let legDist;                        // legDist, objDist are signed floats
        const
        objDist = o[e] - o[s],              // leg default distance is:
        defDist = objDist / o.legs.length,  //   total / # of legs
        isDown  = objDist < 0,
        keys    = isDown ? Easy.#unitComp.slice().reverse()
                         : Easy.#unitComp;  // unit and comp swap if dist < 0

        o.legs.forEach((leg, i) => {
            // Ensure that every leg.start and leg.end are defined. #prepLegs()
            // defaults _firstLeg.start and #lastLeg.end to o.start|end, which
            // default to 0|1 or 1|0. The semi-circular logic here does the rest.
            if (!Is.def(leg[s]))
                leg[s] = leg.prev[e];
            if (!Is.def(leg[e]))
                leg[e] = leg.next[s] ?? leg[s] + defDist;

            legDist = leg[e] - leg[s];
            if (!legDist && !leg.stepsReady)
                Ez._mustBeErr("Each leg's distance",
                              `greater than zero.\nlegs[${i}] start:${leg[s]} == end:${leg[e]}`);
            //------------------------
            if (leg.type == E.steps) {
                const obj = stepsToLegs(o, leg, legDist, objDist, i, last, keys);
                if (obj.firstLeg)           // sTL() modifies o.legs
                    this._firstLeg = obj.firstLeg;
                if (obj.lastLeg)
                    this.#lastLeg  = obj.lastLeg;
            }
            else {
                legUnit(leg, o[s], objDist, keys);
                leg.part = legDist / Math.abs(objDist);
                leg.io   = getIO(leg.io, io);
                leg.ease = easings[leg.io][leg.type];
                if (leg.type == E.bezier)   // must wait for leg.time
                    leg.bezier = toBezier(leg.bezier, leg.time);
            }
        });
        this.#dist = Math.abs(objDist);     // unsigned, see _calc()
        this._leg  = this._firstLeg;        // the current leg for animation
        return isDown;
    }
//==============================================================================
// Round trip methods, called by contructor and setters:
//  #reverseMe() creates a new, inbound linked list that starts with a reversed
//               clone of #lastLeg and ends with a reversed clone of _firstLeg.
    #reverseMe(isInc = this.isIncremental) {
        let
        orig = this.#lastLeg,
        next = orig.prev,
        prev = {end:orig.end, unit:orig.unit};

        this.#lastLeg = this.#reverseLeg(orig, prev, 0, isInc);
        prev = this.#lastLeg;
        while (next && next.prev) {     // (&& next.prev) avoids _firstLeg.prev
            prev.next = this.#reverseLeg(next, prev, orig.wait, isInc);
            prev = prev.next;
            orig = next;
            next = next.prev;
        }
        this.#reversed = true;          // for set roundTrip() and other setters
    }
//  #reverseLeg() helps #reverseMe() create a new inbound leg for round-trip.
    #reverseLeg(leg, prev, wait, isInc) {   //??which properties don't change?? type, time, count...
        const clone = Ez.shallowClone(leg); //!!round-trip incremental w/undefined stuff!!
        if (isInc) {
            if (clone.increment)        // not #isInc because .increment can
                clone.increment *= -1;  // be undefined, see #nextInc().
        }
        else {                          // E.steps legs have no start
            clone.end   = leg.start ?? leg.prev.end;
            clone.start = leg.end;
            clone.part  = -leg.part;
            if (this.#flipTrip)         // defaults to true
                Easy.#flipTripLeg(clone);
        }
        clone.unit = leg.prev.unit;
        clone.prev = prev;
        clone.next = undefined;
        clone.wait = wait + (leg.leftover ?? 0);
        this.#legsWait += wait;
        return clone;
    }
//  static #flipTripLeg() flips io for a leg's inbound trip
    static #flipTripLeg(leg) {
        if (leg.type < E.steps) {
            leg.io = Number(!leg.io);   // doesn't apply to E.bezier, E.linear,
            if (leg.type == E.bezier)   // but necessary if user changes type.
                leg.bezier = leg.bezier.reversed;
            else
                leg.ease = easings[leg.io][leg.type];
        }
    }
//==============================================================================
// Getters and setters:
    get start()    { return this.#start; }
    get end()      { return this.#end;   }
    get distance() { return this.#dist;  }  // unsigned

// animation callbacks:
    get pre()     { return this.#pre;  }
    get peri()    { return this.#peri; }
    get post()    { return this.#post; }
    set pre(val)  { this.#pre  = Ez._validFunc(val, "pre");  }
    set peri(val) { this.#peri = Ez._validFunc(val, "peri"); }
    set post(val) { this.#post = Ez._validFunc(val, "post"); }

    get onAutoTrip()    { return this.#onAutoTrip; } // called upon looping
    set onAutoTrip(val) { this.#onAutoTrip = Ez._validFunc(val, "autoTrip"); }

    get onLoop()    { return this.#onLoop; } // called upon looping
    set onLoop(val) { this.#onLoop = Ez._validFunc(val, "loop"); }

// this.oneShot causes AFrame.proto.#stop() to call clearTargets() upon arrival
    get oneShot()    { return this.#oneShot; }
    set oneShot(val) { this.#oneShot = Boolean(val); }

// this.plays
    get plays() { return this.#plays; }
    set plays(val) {
        val = this.#multiPlayTripNoAuto(
                            Ez.toNumber(val, "plays", 1, ...Ez.intGrThan0));
        this.#plays = val;
    }
// round-trip properties:
    get roundTrip() { return this.#roundTrip; }
    set roundTrip(val) {
        val = this.#multiPlayTripNoAuto(undefined, Boolean(val)); // throws
        this.#roundTrip = val;
        if (val && !this.#reversed)
            this.#reverseMe();
    }
    get autoTrip() { return this.#autoTrip; }
    set autoTrip(val) {
        val = this.#multiPlayTripNoAuto(...[,,Ez.defaultToTrue(val)]);
        this.#autoTrip = val;
    }
    get flipTrip() { return this.#flipTrip; }
    set flipTrip(val) {
        if (!this.isIncremental) {
            val = Ez.defaultToTrue(val);
            if (val != this.#flipTrip) {
                this.#flipTrip = val;
                if (this.#reversed) {
                    let leg = this.#lastLeg;
                    do {
                        Easy.#flipTripLeg(leg);
                    } while((leg = leg.next));
                }
            }
        } //!!else error?? log?? warn??
    }
//  #multiPlayTripNoAuto() helps set plays(), roundTrip(), autoTrip() validate
    #multiPlayTripNoAuto(plays = this.#plays,
                         trip  = this.#roundTrip,
                         auto  = this.#autoTrip)
    {
        if (plays != 1 && trip && !auto)
            throw new Error("plays > 1 w/roundTrip w/o autoTrip is not supported.",
                            {cause:"multiPlayTripNoAuto"});
        //--------------------------
        for (const arg of arguments)
            if (arg) return arg;    // one arg per caller
    }
// time-related properties:
    get wait()           { return this.#wait; }
    set wait(val)        { this.#wait = this.#setWait(val, "wait"); }

    get loopWait()       { return this.#loopWait; }
    set loopWait(val)    { this.#loopWait = this.#setWait(val, "loopWait"); }

    get tripWait()       { return this.#tripWait; }
    set tripWait(val)    { this.#tripWait = this.#setWait(val, "tripWait"); }

    #setWait(val, name)  { return Ez.toNumber(val, name, ...Ez.defZero); }

// this.firsTime and this.loopTime are used by new MEaser
    get firstTime() { return this.#playTime(this.#wait); }
    get loopTime()  { return this.#playTime(this.#loopWait); }
    #playTime(wait) { // the duration of one play
        let val = wait + this.#time;
        if (this.#roundTrip && this.#autoTrip)
            val += this.#time + this.#tripWait;
        return val;
    }
// this.time: setter is simpler than I expected. It spreads the new value
//            proportionally across all the leg.time and leg.wait values.
//            #wait, #loopWait, #tripWait are not included or affected.
//            Also note: set time() for E.steps doesn't separate _firstLeg.wait
//            or #lastLeg.wait from #wait and #tripWait respectively. Fixable...
    get time()    { return this.#time; }
    set time(val) {
        if (this.#time)
            this.#time = this._setTimeCount(val, this.#time, "time");
        else  // the only case where #time is not defined:
            Ez._cantErr("You", "set time for count-based incremental");
    }
//  _setTimeCount() consolidates code for time and count setters
    _setTimeCount(val, cv, tc) {
        val = Ez.toNumber(val, tc, ...Ez.defGrThan0);
        if (val == cv)          // val = new value, cv = current value
            return val;         // no change
        //----------------------
        const factor = val / cv;
        Easy.#spreadLegTimeCount(this._firstLeg, tc, factor);
        if (this.#reversed)
            Easy.#spreadLegTimeCount(this.#lastLeg, tc, factor);
        return val;
    }
//  static #spreadLegTimeCount() consolidates code for #setTimeCount()
    static #spreadLegTimeCount(leg, tc, f) {
        do {
            leg[tc] *= f;         // leg.time defaults to 0 for E.steps
            if (tc[0] == "t")
                leg.wait *= f;    // leg.wait defaults to 0
        } while((leg = leg.next));
    }
// this.setValue is a boolean used in _calc() for efficiency, called by
//               Easies.proto._zero() prior to playing animation.
    get setValue()  { return this.#setValue; }
    set setValue(v) { this.#setValue = Boolean(v); }
//==============================================================================
// Target-related public properties and methods:
// this.targets Returns a shallow copy and sets a clone to ensure users don't
//              modify it outside of these methods. #targets is never undefined,
//              but it can be an empty Set.
    get targets() { return new Set(this.#targets); }
    set targets(val) {
        this.#targets = new Set(Ez.toArray(val, "targets", EBase._validate,
                                           ...Ez.okEmptyUndef));
    }
//  newTarget() creates an Easer or EaserByElm instance, ~ adds it to #targets
    newTarget(o, addIt = true) {
        const set = addIt ? this.#targets : null;
        return create(o, set, !o.easies, "multi", [Easies, Easy]);
    }
//  addTarget() validates t and adds it to #targets
    addTarget(t) {
        this.#targets.add(EBase._validate(t, "addTarget(arg): arg"));
    }
//  cutTarget() removes t from #targets, if it can find it.
    cutTarget(t) { return this.#targets.delete(t); }

//  clearTargets() clears #targets
    clearTargets() { this.#targets.clear(); }
//==============================================================================
//  _zero() and _resume() help AFrame.prototype.play() via Easies
    _zero(now = 0) {
        const        // these two blocks similar to end of Easies.proto._next()
        isT  = (this.e.status == E.tripped),
        wait = isT ? this.#tripWait
                   : this._firstLeg.wait + this.#wait;

        this.#zero    = now + wait;
        this.e.status = wait ? E.waiting
                      : isT  ? E.inbound : E.outbound; //$$

        for (const t of this.#targets)
            t._zero(this);
    }
    _resume(now) {
        if (this.e.status) // E.arrived == 0
            this.#zero = now - this._now;
    }
//==============================================================================
//  _reset() helps AFrame.prototype.#stop() via Easies, calls one of the
//           public reset methods below or does nothing.
    _reset(sts) {  // sts == undefined is local only
        switch (sts) {
        case E.arrived:  this.arrive();        break;
        case E.original: this.restore();       break;
        case E.initial:  this.init();          break;
        case E.tripped:  this.initRoundTrip(); break;
        default:
        }
    }
//  arrive()
    arrive() {
        let apply;
        if (this.e.status > E.tripped)
            apply = (e) => {    // fast-forward to the end
                while (this._leg.next)
                    this._leg = this._leg.next;
                this.#leg2e(e, this._leg);
                for (const t of this.#targets)
                    t._apply(e);
            };
        this.#setup(E.arrived, apply);
    }
//  restore()
    restore() {
        this.#setup(E.original, (e) => {
            this.#init_e();
            for (const t of this.#targets)
                t.restore(e);
        });
    }
//  init()
    init(applyIt = true) {
        this.#setup(E.initial, applyIt ? this.#initOrTrip : null);
    }
//  initRoundTrip() sets up for starting the inbound trip
    initRoundTrip() {
        if (!this.#roundTrip)
            this.roundTrip = true;
        this.#setup(E.tripped, this.#initOrTrip, true);
    }
//  #initOrTrip() is the apply argument to #setup() for init() and
//                initRoundTrip(), sets e.value and applies e.
    #initOrTrip(e) {
        let peri
        if (this.isIncremental)
            e.value = this._value;
        else
            this.#leg2e(e, this._leg.prev);

        for (const t of this.#targets) {
            if (t.elmCount) {       // no elms = nothing to apply
                peri   = t.peri;    // don't run target.peri()
                t.peri = undefined;
                if (t.loopByElm)
                    do {t._apply(e)} while (t._nextElm());
                else
                    t._apply(e);
                t.peri = peri;
            }
        }
    }
//  #setup() does the work for arrive(), restore(), init(), and initRoundTrip()
    #setup(sts, apply, isRT) {
        const e = this.e
        if (sts && sts == e.status) return;
        //--------------------------------- // E.arrived falls through
//!!    if (sts || e.status != E.tripped)   //!! !sts always wants _firstLeg !!
//!!        this._leg = isRT ? this.#lastLeg : this._firstLeg;
        this._inbound = isRT;
        if (isRT) {
            this._leg = this.#lastLeg;
            if (this.isIncremental)
                if (this.#end)
                    this._value = this.#end;
                else
                    apply = null;
        }
        else {
            this._leg = this._firstLeg;
            if (this.isIncremental)
                this._value = this.#start;
        }
        e.status = sts;       // must follow ifs above and precede apply() below //$$
        apply?.bind(this)(e);
    }
//==============================================================================
//  setters for this.e and this.e2:
    #init_e(status) {
        Object.assign(this.e,  this.#e);
        Object.assign(this.e2, this.#e);
        if (Is.def(status))             // option to leave status alone
            this.e.status = status;     // e2 doesn't have status //$$
    }
//  #leg2e() sets the three eKey properties of e: value, unit, comp
    #leg2e(e, leg) {
        e.unit  = leg.unit;
        e.comp  = leg.comp;
        e.value = leg.end ?? this._value; // _value is for incremental
    }
//==============================================================================
// Animation methods:
//  _easeMe() calculates & applies values during animation, called only by
//            Easies.prototype._next(), this.e.status is never E.arrived prior
//            to calling _calc(): Easies temporarily deletes *this* from #easies
    _easeMe(timeStamp) {
        const e    = this.e;
        timeStamp -= this.#zero;
        this._now  = timeStamp;
        if (timeStamp >= 0) {
            if (e.status == E.waiting)  // time to stop waiting
                e.status = this._inbound ? E.inbound : E.outbound; //$$
            this._calc(timeStamp, this._leg, e);
            this.#peri?.(this);         // doesn't run while waiting
        }
        return e.status;
    }
//  _calc() calculates an eased value, overridden in Incremental
    _calc(now, leg, e) {
        if (now >= leg.time) {
            leg = this._nextLeg(leg, e);  // sets this._leg and e.status
            const
            hasNext = e.status > E.tripped,
            waitNow = e.waitNow,
            isSteps = leg.type == E.steps;
            if (!hasNext || waitNow || isSteps) {
                if (hasNext)              // E.arrived, E.tripped, E.waiting
                    leg = leg.prev;       // i.e. e.status <= E.waiting (or isSteps)
                this.#leg2e(e, leg);
                if (hasNext || (!e.status && isSteps)) //!!these comments need revisions!!
                    return;               // waiting or steps = E.arrived, or steps !e.waitNow...
                //----------------------- //!!loopbyelm && steps must continue!!
                this._leg = this._inbound ? this.#lastLeg : this._firstLeg;
                e = this.e2;              // for looping, autoTrip steps no wait
                if (isSteps) {
                    if (!waitNow)
                        this.#leg2e(e, leg);
                    return;
                } //------------------------ steps is done, no calculations
                leg = this._leg;
            }
            now = this._now;              // _nextLeg modified it
        }                                 // ...leg.part is signed
        const unit = leg.ease(now / leg.time) * leg.part + leg.prev.unit;
    //!!keys = this.#compUnit ?? Easy.#unitComp,
    //!!uc   = leg.ease(now / leg.time) * leg.part + leg.prev.unit;
    //!!e[keys[0]] = uc;                  // uc because it might be unit or comp
    //!!e[keys[1]] = Ez.comp(uc);
        e.unit  = unit;
        e.comp  = Ez.comp(unit);
        e.value = unit * this.#dist + this.#base;
    }
//  _nextLeg helps both _calc()s to get time-based next leg
    _nextLeg(leg, e) {
        let wait;
        let next   = leg.next;
        let time   = leg.time;
        this._now -= time;
        //!!Is there a way to condense this logic?? some identical repitition!!
        if (next) {             // proceed to the next leg, skipping a leg
            this._leg = next;   // happens, especially with eased steps.
            wait = next.wait;
            while (next && this._now >= time + wait) {
                time += wait + next.time;
                next = next.next
                this._now -= time;
                if (next) {
                    this._leg = next;
                    wait = next.wait;
                }               // else handled by if (!next) below: wait =
            }
        }
        // The changes to wait below only apply if autoTrip or plays > 1, but
        // those are set on targets, so easies._next() sorts it out later.
        if (!next) {            // arrive or trip
            this._trip(e);      // sets e.status
            if (this._inbound)  // E.tripped
                wait = this.#autoTrip ? this.#tripWait : 0;
            else                // E.arrived
                wait = this.#loopWait;
        }
        e.waitNow   = wait && (wait >= this._now);
        this.#zero += wait + time;
        return this._leg;
    }
//  _trip() helps both _calc()s, handles both ends of the round trip
    _trip(e) {
        if (this.#roundTrip)
            this._inbound = !this._inbound;
        e.status = this._inbound ? E.tripped : E.arrived; //$$
    }
//==============================================================================
//  static _listE() returns a comma + space-separated list of Easy E.xxx names
    static _listE(name, start = 0, end = Infinity) {
        return this[name].slice(start, end)
                         .map(v => E.prefix + v)
                         .join(", ");
    }
}