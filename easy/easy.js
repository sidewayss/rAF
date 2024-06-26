import {easings}            from "./easings.js";
import {create}             from "./efactory.js";
import {EBase}              from "./easer.js";
import {steps, stepsToLegs} from "./easy-steps.js"
import {override, spreadToEmpties, legNumber, getType, legType, getIO, splitIO,
        toBezier}           from "./easy-construct.js"

import {E, Ez, Is, Easies} from "../raf.js";

export class Easy {
    #autoTrip; #base; #dist; #e; #end; #flipTrip; #lastLeg; #legsWait;
    #loopWait; #onArrival; #onLoop; #oneShot; #peri; #plays; #post; #pre;
    #reversed; #roundTrip; #start; #targets; #time; #tripWait; #wait; #zero;

    _leg; _now; _inbound; // shared with Incremental.prototype._calc()
    _value;               // for Incremental only, but used in shared code here
    _firstLeg;            // shared with easeSteps(), may be useful elsewhere...

//  Public string arrays for enums and <select><option> or other list display
    static status = ["arrived","tripped","waiting","inbound","outbound",
                     "initial","original","pausing","playing","empty"];
    static type   = ["linear","sine","circ","expo","back","elastic","bounce",
                     "pow","bezier","steps","increment"];
    static io     = ["in","out","inIn","outIn","inOut","outOut"];
    static set    = ["let","set","net"];
    static jump   = ["none","start","end","both"];
    static eKey   = ["value","unit","comp"];
//==============================================================================
    constructor(obj, isInc = false) {
        Ez._validObj(obj, "Easy constructor's only argument");
        const c = "count", e = "end", s = "start", t = "time", w = "wait";
        const o = Ez.shallowClone(obj);

        this.pre  = o.pre;          // use setters for validation
        this.peri = o.peri;
        this.post = o.post;
        this.loop = o.loop;
        this.onArrival = o.onArrival;
        this.oneShot   = o.oneShot;
        Ez.is(this);                // required before the end of constructor

        if (Is.def(o.legs))         // validate/pseudo-clone user-defined legs
            o.legs = Ez.toArray(o.legs, "legs", Ez._validObj)
                       .map(v => Object.assign({}, v));

        const type = isInc ? E.increment : getType(o);
        const io   = getIO(o.io);   // getType() requires o.legs to be defined

        o[t] = Ez.toNumber(o[t], t, ...Ez.undefGrThan0);
        if (!o.legs) {              // create default legs
            const ios = splitIO(io, Is.def(o.split) || Is.def(o.gap));
            const leg = {type, io:ios[0], bezier:o.bezier};
            o.legs = [leg];
            if (ios.length == 2) {
                const split = Ez.toNumber(o.split, "split", o[t] / 2, ...Ez.grThan0);
                const gap   = Ez.toNumber(o.gap,   "gap", ...Ez.defZero);
                const wait  = gap || undefined;  // merely a preference
                leg.time = split;
                leg.end  = Ez.toNumber(o.mid, "mid");
                o.legs.push({wait, time:o[t] - split - gap, type, io:ios[1]});
            }
        }
        const last = o.legs.length - 1;

        // _firstLeg and #lastLeg are starting points for two linked lists of
        // leg objects. The outbound list starts with _firstLeg. The inbound
        // list is made up of clones of the outbound list's legs, starting with
        // a clone of #lastLeg ?? _firstLeg. _firstLeg is always defined.
        // #lastLeg is only defined if/when #roundTrip == true. It would be
        // convenient fallback to #lastLeg = _firstLeg, and always define
        // #lastLeg, but it would be prone to misunderstanding. Both properties
        // can be overwritten by stepsToLegs(), #lastLeg by #reverseMe() too.
        this._firstLeg = o.legs[0];
        if (last)
            this.#lastLeg = o.legs[last];

        // o[e] is subject to further change in stepsToLegs()
        // _firstLeg shares .start and .wait with o, #lastLeg shares .end
        override(s, this._firstLeg, o, "the first");
        override(e, this.#lastLeg ?? this._firstLeg, o, "the last");
        o[s] = Ez.toNumber(o[s], s, 0);
        o[e] = Ez.toNumber(o[e], e, isInc ? undefined : 1);
        if (o[s] == o[e]) {
            if (o.legs.length == 1      // it goes nowhere
            || !o.legs.some(leg => (Is.def(leg[s]) && leg[s] != o[s])
                                || (Is.def(leg[e]) && leg[e] != o[e])))
                throw new Error(`start and end are the same: ${o[s]} = ${o[e]}`);
        } //-------------------
        let down = o[e] < o[s];
        const defUnit = down ? 1 : 0;

        this.#wait = Ez.toNumber(o[w], w, ...Ez.defZero);
        this.#legsWait = 0;

        if (isInc && !o[t])
            o[c] = Ez.toNumber(o[c], c, ...Ez.undefGrThan0)
        const tc = !o[c] ? t : c;               // "time" or "count"
        this.#prepLegs(o, type, s, e, w, tc, isInc);

        const args = isInc ? [c, o[t] || o[c] ? tc : ""]
                           : [io, last, down];
        this._finishlegs(o, s, e, t, ...args);

        this.#start = o[s];
        this.#end   = o[e];                     // must follow stepsToLegs()
        if (!o[c])
            this.#time = o[t];

        // Dummy _firstLeg.prev simplifies _calc(), must precede #reverseMe()
        // #lastLeg's dummy .prev is set on the cloned leg in #reverseLeg()
        // if (#isInc) unit is ignored
        this._firstLeg.prev = {unit:defUnit, end:this.#start, wait:0};
        this.targets = o.targets;               // the Easers that apply values

        //  #plays is only used as a default for targets that don't define it
        this.plays  = o.plays || o.repeats + 1 || undefined;

        // Don't use setters for these initial settings
        this.#loopWait  = Ez.toNumber(o.loopWait, "loopWait", ...Ez.defZero);
        this.#roundTrip = Boolean(o.roundTrip); // autoTrip, flipTrip default to true
        this.#autoTrip  = Ez.defaultToTrue(o.autoTrip);
        this.#flipTrip  = Ez.defaultToTrue(o.flipTrip);
        if (this.#roundTrip)
            this.#reverseMe(o.tripWait, isInc);
        else
            this.tripWait = o.tripWait;         // in case it's defined

        this._leg = this._firstLeg;             // start off on the right foot
        if (isInc)                              // set initial animation values
            this._value = this.#start;
        else
            this.#base  = down ? this.#end : this.#start;

        // this.e stores the current state.
        // e.status is the current status, range: E.arrived to E.original.
        // e.value  is the current eased value.
        // e.unit   is the unit interval for that value, range: 0-1 inclusive.
        // e.comp   is the complement of unit: 1 - unit.
        // e.value and e.unit are the same if start/end are 0/1 or vice-versa.
        this.e  = { waitNow:undefined };
        this.e2 = {};                    // for looping, tripping, no status
        this.#e = { value:this.#start,   // initial state for #init_e()
                    unit: defUnit,
                    comp: Ez.flip(defUnit) };

        this.#init_e(E.original);        // assign(e/e2, #e), status: E.original
        Object.freeze(this.#e);
        Object.seal(this.e);
        Object.seal(this.e2);
        Object.seal(this);
    }
//  static _validate() is a validation function for Ez.toArray()
    static _validate(obj, err) {
        if (!obj?.isEasy)
            Ez._mustBeErr(err, "an instance of Easy");
        return obj;
    }
//==============================================================================
// Private functions that break out blocks of code from constructor(), they are
// only called once, but they make constructor() more readable.
// Leg times/counts can be portioned evenly or by the user, and E.steps creates
// new legs. Thus we iterate over o.legs twice: #prepLegs() and _finishlegs().
//  #prepLegs() collects legsTotal and o.emptyLegs for spreading #time or #count
//  across legs, and sets #wait, #legsWait, and #time or #count.
    #prepLegs(o, type, s, e, w, tc, isInc) { // tc is "time" or "count"
        let legsTotal = 0;
        o.emptyLegs   = [];
        o.legs.forEach((leg, i) => {
            leg.prev = o.legs[i - 1];   // overwritten by stepsToLegs()
            leg.next = o.legs[i + 1];   // ditto
            legNumber(leg, s, i);       // all non-incremental legs define
            legNumber(leg, e, i);       // start and end.
            legNumber(leg, w, i, ...Ez.defZero);
            this.#legsWait += leg[w];
                                        // time and count require extra effort
            legNumber(leg, tc, i, ...Ez.undefGrThan0);
            legType(o, leg, i, type, isInc);
            if (leg.type == E.steps)
                steps(o, leg);          // E.steps leg.timing can set leg.time
            if (leg[tc])
                legsTotal += leg[tc];   // accumulate leg.time|count
            else
                o.emptyLegs.push(leg);  // will receive o.spread
        });
        o.cEmpties = o.emptyLegs.length;
        if (!isInc)
            legsTotal += this.#legsWait;
        if (o[tc]) {
            o.leftover = o[tc] - legsTotal;
            if (o.cEmpties) {
                if (o.leftover <= 0)
                    throw new Error(`${o.cEmpties} legs with ${tc} undefined `
                                  + "and nothing left over to assign to them.");
                //---------------------------------
                o.spread = o.leftover / o.cEmpties;
            }
            else                        // override o[tc] with legsTotal...
                override(tc, undefined, o, "every", legsTotal);
        }
        else if (!o.cEmpties)           // ...for time and count setters
            o[tc] = legsTotal;
        else if (!isInc)
            throw new Error("You must define a non-zero value for "
                          + `obj.${tc} or for every leg.${tc}.`);
        //-----------------------------
        if (!Is.def(this._firstLeg[s])) // see _finishlegs()
            this._firstLeg[s] = o[s];

        if (!this.#lastLeg) {           // only one leg
            if (!Is.def(this._firstLeg[e]))
                this._firstLeg[e] = o[e];
        }
        else if (!Is.def(this.#lastLeg[e]))
            this.#lastLeg[e] = o[e];
    }
//  _finishlegs() is the second iteration over legs by constructor(). Overriden
//   by Incremental.
//   If legs go up & down, this.#dist is less than the total distance traveled;
//   leg.dist can be greater than this.#dist, and leg.start/leg.end can be
//   outside the bounds of this.#start/this.#end. That means e.unit can be >1.
    _finishlegs(o, s, e, t, io, last, down) {
        this.#dist = Math.abs(o[e] - o[s]);
        for (const leg of o.emptyLegs)      // must precede stepsToLegs()
            spreadToEmpties(leg, t, o.spread);

        // leg default distance is total / # of legs
        const defDist = this.#dist / o.legs.length * (down ? -1 : 1);
        o.legs.forEach((leg, i) => {
            // Ensure that every leg.start and leg.end are defined. #prepLegs()
            // defaults _firstLeg.start and #lastLeg.end to o.start|end, which
            // default to 0|1 or 1|0. The semi-circular logic here does the rest.
            if (!Is.def(leg[s]))
                leg[s] = leg.prev[e];
            if (!Is.def(leg[e]))
                leg[e] = leg.next[s] ?? leg[s] + defDist;

            leg.unit = this._legUnit(leg, o[s], down);
            leg.dist = Math.abs(leg[e] - leg[s]);
            leg.down = leg[e] < leg[s];
            if (leg.type == E.steps) {
                const obj = stepsToLegs(o, leg, this, i, last, this.#lastLeg);
                if (obj)    // only returns obj for _firstLeg and #lastLeg
                    obj.first ? this._firstLeg = obj.leg
                              : this.#lastLeg  = obj.leg;
            }
            else {
                leg.part = leg.dist / this.#dist; // leg's part of the whole
                leg.io   = getIO(leg.io, io);
                leg.ease = easings[leg.io][leg.type];
                if (leg.type == E.bezier)         // must wait for leg.time
                    leg.bezier = toBezier(leg.bezier, leg.time);
            }
        });
    }
//  _legUnit() leg.unit = this._legUnit() = the e.unit end value for a leg
    _legUnit(leg, start, down) {
        const val = Math.abs(leg.end - start) / this.#dist;
        return Ez.flipIf(val, down);
    }
//==============================================================================
// Round trip methods, called by contructor and setters:
//  #reverseMe() creates a new linked list of legs that starts with a reversed
//               clone of #lastLeg and ends with a reversed clone of _firstLeg.
    #reverseMe(tripWait = 0, isInc = this.isIncremental) {
        let leg, next, orig, prev;  // prev is a clone or a dummy

        orig = this.#lastLeg;       // orig and next are outbound legs
        next = orig?.prev;
        prev = {end:this.#end, unit:Number(!this._firstLeg.prev.unit)};

        this.tripWait = tripWait;   // setter validates and handles undefined
        this.#lastLeg = this.#reverseLeg(orig ?? this._firstLeg,
                                         prev, {wait:0}, isInc);
        prev = this.#lastLeg;       // the first clone in new inbound linked list
        while (next && next.prev) { // (&& next.prev) avoids _firstLeg.prev
            leg = this.#reverseLeg(next, prev, orig, isInc);
            prev.next = leg;
            prev = leg;
            orig = next;
            next = next.prev;
        }
        this.#reversed = true;      // for set roundTrip() and other setters
    }
//  #reverseLeg() helps #reverseMe() create a new inbound leg for round-trip.
    #reverseLeg(leg, prev, orig, isInc) {
        const clone = {...leg}; //??which properties don't change?? type, time, count...
        if (!isInc) {           //!!round-trip incremental w/undefined stuff!!
            clone.end   = leg.start ?? leg.prev.end; // E.steps legs have no start
            clone.start = leg.end;
            clone.down  = !leg.down;
            if (this.#flipTrip)
                Easy.#flipTripLeg(clone);
        }
        else if (clone.increment)    // not #isInc because .increment can
            clone.increment *= -1;   // be undefined, see #nextInc().

        clone.unit = leg.prev.unit;
        clone.prev = prev;
        clone.next = undefined;
        clone.wait = orig.wait + (leg.leftover ?? 0);
        this.#legsWait += orig.wait;
        return clone;
    }
//  static #flipTripLeg() flips io for a leg's inbound trip
    static #flipTripLeg(leg) {
        if (leg.type < E.steps) {
            leg.io = Number(!leg.io);  // doesn't apply to E.bezier or E.linear,
            if (leg.type == E.bezier)  // but necessary if user changes type*!!.
                leg.bezier = leg.bezier.reversed;
            else
                leg.ease = easings[leg.io][leg.type];
        }
    }
//==============================================================================
// Getters and setters (are there too many setters?? flipTrip, others??):
    get start()    { return this.#start; }
    get end()      { return this.#end;   }
    get distance() { return this.#dist;  }

// animation callbacks:
    get pre()     { return this.#pre;  }
    get peri()    { return this.#peri; }
    get post()    { return this.#post; }
    set pre(val)  { this.#pre  = Ez._validFunc(val,  "pre");  }
    set peri(val) { this.#peri = Ez._validFunc(val,  "peri"); }
    set post(val) { this.#post = Ez._validFunc(val,  "post"); }

    get onLoop()    { return this.#onLoop; } // callback called upon looping
    set onLoop(val) { this.#onLoop = Ez._validFunc(val,  "loop"); }

// this.onArrival
    get onArrival()    { return this.#onArrival; }
    set onArrival(sts) {  // Easy has an extra legit status for round-trip
        this.#onArrival = (sts !== E.tripped)
                        ? Easy._validArrival(sts, Easy.name)
                        : sts;
    }
// this.oneShot is *not* an alias/shortcut for onArrival(E.empty), it is an
//              additional property that you set separately. If #onArrival is
//              E.empty, it is ignored; else clearTargets() after t._apply().
    get oneShot()  { return this.#oneShot; }
    set oneShot(b) {
        this.#oneShot = Boolean(b);
    }
//  static _validArrival() enforces the legit statuses for arrival
    static _validArrival(sts, name, noErr) {
        let isEasy;
        switch (sts) {
        case undefined:
        case E.arrived: case E.initial: case E.original: case E.empty:
            return sts;
        case E.tripped:
            isEasy = (name == Easy.name);
            if (isEasy)
                return sts;
        default:
            if (noErr)
                return false;
            //--------------------------------------
            const txt = isEasy ? " E.tripped," : "";
            Ez._mustBeErr(name + ".prototype.onArrival is a status value and",
                `set to E.arrived,${txt} E.initial, E.original, or E.empty`);
        }
    }
// this.plays
    get plays() { return this.#plays; }
    set plays(val) {
        this.#plays = Ez.toNumber(val, "plays", 1, ...Ez.intGrThan0);
    }
// round-trip properties:
    get roundTrip() { return this.#roundTrip; }
    set roundTrip(val) {
        this.#roundTrip = Boolean(val);
        if (val && !this.#reversed)
            this.#reverseMe(this.#tripWait);
    }
    get autoTrip() { return this.#autoTrip; }
    set autoTrip(val) {
        this.#autoTrip = Ez.defaultToTrue(val);
        if (val && this.#onArrival == E.tripped)
            this.onArrival = undefined;
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
// time-related properties:
    get tripWait()    { return this.#tripWait; }
    set tripWait(val) { this.#tripWait = this.#setWait(val, "tripWait"); }

    get loopWait()    { return this.#loopWait; }
    set loopWait(val) { this.#loopWait = this.#setWait(val, "loopWait"); }

    get wait()        { return this.#wait; }
    set wait(val)     { this.#wait = this.#setWait(val, "wait"); }

    #setWait(val, name) { return Ez.toNumber(val, name, ...Ez.defZero); }

// this.firsTime and this.loopTime are used by new MEaser
    get firstTime() { return this.#playTime(this.#wait); }
    get loopTime()  { return this.#playTime(this.#loopWait); }
    #playTime(wait) { // the duration of one play
        let val = wait + this.#time;
        if (this.#roundTrip && this.#autoTrip) // #autoTrip in case anything else uses it
            val += this.#tripWait + this.#time;
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
        return create(o, set, !o.easies, "Multi", Easies.name);
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
        if (this.e.status == E.tripped) {
            this.#zero    = now + this.#lastLeg.wait + this.#tripWait;
            this.e.status = E.inbound;
        }
        else {
            this.#zero    = now + this._firstLeg.wait + this.#wait;
            this.e.status = E.outbound;
        }
        for (const t of this.#targets)
            t._zero(this);
    }
    _resume(now) {
        if (this.e.status) // E.arrived == 0
            this.#zero = now - this._now;
    }
//==============================================================================
// Reset methods:
//  _reset() helps AFrame.prototype.#cancel() via Easies, calls one of the
//           public reset methods below or does nothing.
//           see ../../docs/onArrival.svg for flow.
_reset(sts, forceIt) {  // sts == undefined is local only
        if (!forceIt)   // forceIt means sts is defined
            sts = this.#onArrival;
        switch (sts) {
        case E.arrived:
            this.arrive();        break;
        case E.tripped:
            this.initRoundTrip(); break;
        case E.initial:
            this.init();          break;
        case E.original:
            this.restore();       break;
        default:        // E.empty or undefined == noop
        }
        // any status can call clearTargets() if #oneShot == true
        if (this.#oneShot || sts == E.empty)
            this.clearTargets();
    }
//  arrive()
    arrive() {
        let apply;
        if (this.e.status > E.tripped) {
            apply = (e) => {            // fast-forward to the end
                while (this._leg.next)
                    this._leg = this._leg.next;
                this.#set_e(e, this._leg.end ?? this._value, this._leg.unit);
                for (const t of this.#targets)
                    t._apply(e);
            };
        }
        this.#setup(E.arrived, apply);
    }
//  restore()
    restore() {
        this.#setup(E.original, () => {
            for (const t of this.#targets)
                t._restore();
        });
        this.#init_e(E.original);   // sets e.status a 2nd time, see #setup()
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
        else //!!for init() this could call #init_e(E.initial)...??
            this.#set_e(e, this._leg.prev.end, this._leg.prev.unit);

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
//  #setup() does the work for arrive(), initRoundTrip(), init(), and restore()
    #setup(sts, apply, isRT) {
        const e = this.e
        if (sts && sts == e.status) return;
        //--------------------------------- // E.arrived falls through
        if (sts || e.status != E.tripped)
            this._leg = isRT ? this.#lastLeg : this._firstLeg;
        if (!isRT) {
            if (this.isIncremental)
                this._value = this.#start;
        }
        else if (this.isIncremental) {
            if (this.#end)
                this._value = this.#end;
            else
                apply = null;
        }
        this._inbound = isRT;
        this.e.status = sts;  // must follow ifs above and precede apply() below
        apply?.bind(this)(e);
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
                e.status = this._inbound ? E.inbound : E.outbound;
            this._calc(timeStamp, this._leg, e);
            this.#peri?.(this);
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
            isSteps = (leg.type == E.steps);
            if (!hasNext || waitNow || isSteps) { // E.steps must return in this block
                if (hasNext)              // E.arrived, E.tripped, E.waiting
                    leg = leg.prev;       // i.e. e.status <= E.waiting (or isSteps)
                this.#set_e(e, leg.end, leg.unit);
                if (hasNext || (!e.status && isSteps)) //!!these comments need revisions!!
                    return;               // waiting or steps = E.arrived, or steps !e.waitNow...
                //----------------------- //!!loopbyelm + steps must continue!!
                this._leg = this._inbound ? this.#lastLeg : this._firstLeg;
                e = this.e2;              // for looping, autoTrip steps no wait
                if (isSteps) {
                    if (!waitNow)
                        this.#set_e(e, leg.end, leg.unit);
                    return;               // steps = E.tripped
                } //------------
                leg = this._leg;
            }
            now = this._now;              // _nextLeg modified it
        }
        const val  = leg.ease(now / leg.time) * leg.part;
        const unit = leg.prev.unit + (leg.down ? -val : val);
        this.#set_e(e, unit * this.#dist + this.#base, unit);
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
                }
                else
                    wait = 0;
            }
        }
        if (!next) {            // trip, loop, or arrive
            this._trip(e);
            if (this._inbound)
                wait = this.#lastLeg.wait  * (this.#autoTrip  ? 2 : 1)
                     + this.#tripWait;
            else
                wait = this._firstLeg.wait * (this.#roundTrip ? 2 : 1)
                     + this.#loopWait;
        }
        this.#zero += time + wait;
        e.waitNow   = this._now < wait //!! && !(!this._now && !wait);
        return this._leg;
    }
//  _trip() helps both _calc()s, handles both ends of the round trip
    _trip(e) {
        if (this.#roundTrip)
            this._inbound = !this._inbound;
        e.status = this._inbound ? E.tripped : E.arrived;
    }
//==============================================================================
// Miscellaneous:
    #init_e(status) {
        Object.assign(this.e,  this.#e);
        Object.assign(this.e2, this.#e);
        this.e.status = status;         // e2 doesn't have status
    }
    #set_e(e, value, unit) {
        e.value = value;
        e.unit  = unit;
        e.comp  = Ez.flip(unit);
    }
//  static _listE() returns a comma+space-separated list of E.xxx values
    static _listE(name, start = 0, end = Infinity) {
        return this[name].slice(start, end)
                         .map(v => E.prefix + v)
                         .join(", ");
    }
}