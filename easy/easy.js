import {easings}            from "./easings.js";
import {create}             from "./efactory.js";
import {EBase}              from "./easer.js";
import {steps, stepsToLegs} from "./easy-steps.js"
import {override, spreadToEmpties, legNumber, getType, legType, getIO}
                            from "./easy-construct.js"

import {E, Ez, Is} from "../raf.js";

export class Easy {
    #autoTrip; #base; #dist; #e; #end; #flipTrip; #firstLeg; #lastLeg;
    #legsWait; #loopWait; #onArrival; #onLoop; #peri; #plays; #post; #pre;
    #reversed; #roundTrip; #start; #targets; #time; #tripWait; #wait; #zero;

    _leg; _now; _inbound; // shared with Incremental.prototype._calc()
    _value;               // for Incremental only, but used in shared code here

//  Public string arrays for enums and <select><option> or other list display
    static status = ["arrived","tripped","waiting","inbound","outbound",
                     "initial","original","pausing","running","empty"];
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
        const o = structuredClone(obj); // so we can set properties safely

        this.pre  = o.pre;          // use setters for validation
        this.peri = o.peri;
        this.post = o.post;
        this.loop = o.loop;
        this.onArrival = o.onArrival;
        Ez.is(this);                // required before the end of constructor

        if (Is.def(o.legs))         // format\validate user-defined legs
            o.legs = Ez.toArray(o.legs, "legs", Ez._validObj);
                                    // getType() requires o.legs to be defined
        const type = isInc ? E.increment : getType(o);
        const io   = getIO(o.io);

        o[t] = Ez.toNumber(o[t], t, ...Ez.undefGrThan0);
        if (!o.legs) {              // create default legs
            const ios = Easy.splitIO(io);
            const leg = {type, io:ios[0]};
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

        // #firstLeg and #lastLeg are starting points for two linked lists of
        // leg objects. The outbound list starts with #firstLeg. The inbound
        // list is made up of clones of the outbound list's legs, starting with
        // a clone of #lastLeg ?? #firstLeg. #firstLeg is always defined.
        // #lastLeg is only defined if/when #roundTrip == true. It would be
        // convenient fallback to #lastLeg = #firstLeg, and always define
        // #lastLeg, but it would be prone to misunderstanding. Both properties
        // can be overwritten by stepsToLegs(), #lastLeg by #reverseMe() too.
        this.#firstLeg = o.legs[0];
        if (last)
            this.#lastLeg = o.legs[last];

        // o[e] is subject to further change in stepsToLegs()
        // #firstLeg shares .start and .wait with this, #lastLeg shares .end
        override(s, this.#firstLeg, o, "the first");
        override(e, this.#lastLeg ?? this.#firstLeg, o, "the last");
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

        // Dummy #firstLeg.prev simplifies _calc(), must precede #reverseMe()
        // #lastLeg's dummy .prev is set on the cloned leg in #reverseLeg()
        // if (#isInc) unit is ignored
        this.#firstLeg.prev = {unit:defUnit, end:this.#start, wait:0};
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

        this._leg = this.#firstLeg;             // start off on the right foot
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

        this.#init_e(E.original);        // inits to #e, e.status = E.original
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
            legNumber(leg, s, i); // all non-incremental legs define
            legNumber(leg, e, i); // start and end.
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
        if (!Is.def(this.#firstLeg[s])) // see _finishlegs()
            this.#firstLeg[s] = o[s];

        if (!this.#lastLeg) {
            if (!Is.def(this.#firstLeg[e]))
                this.#firstLeg[e] = o[e];
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
        for (const leg of o.emptyLegs)     // must precede stepsToLegs()
            spreadToEmpties(leg, t, o.spread);

        // leg default distance is linearly proportional
        const defDist = this.#dist / o.legs.length * (down ? -1 : 1);
        o.legs.forEach((leg, i) => {
            // Ensure that every leg.start and leg.end are defined. #prepLegs()
            // defaults #firstLeg.start and #lastLeg.end to o.start|end, which
            // default to 0|1 or 1|0. The semi-circular logic here does the rest.
            if (!Is.def(leg[s]))
                leg[s] = leg.prev[e];
            if (!Is.def(leg[e]))
                leg[e] = leg.next[s] ?? leg[s] + defDist;

            leg.unit = this._legUnit(leg, o[s], down);
            leg.dist = Math.abs(leg[e] - leg[s]);
            leg.down = leg[e] < leg[s];
            if (leg.type == E.steps) {
                const obj = stepsToLegs(o, leg, this, i, last);
                if (obj)            // the price of modularizing stepsToLegs(),
                    obj.first ? this.#firstLeg = obj.leg  // and keeping these
                              : this.#lastLeg  = obj.leg; // two private.
            }
            else {
                leg.part = leg.dist / this.#dist; // leg's part of the whole
                leg.io   = getIO(leg.io, io);
                leg.ease = easings[leg.io][leg.type];
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
//               clone of #lastLeg and ends with a reversed clone of #firstLeg.
    #reverseMe(tripWait = 0, isInc = this.isIncremental) {
        let leg, next, orig, prev;  // prev is a clone or a dummy

        orig = this.#lastLeg;       // orig and next are outbound legs
        next = orig?.prev;
        prev = {end:this.#end, unit:Number(!this.#firstLeg.prev.unit)};

        this.tripWait = tripWait;   // setter validates and handles undefined
        this.#lastLeg = this.#reverseLeg(orig ?? this.#firstLeg,
                                         prev, {wait:0}, isInc);
        prev = this.#lastLeg;       // the first clone in new inbound linked list
        while (next && next.prev) { // (&& next.prev) avoids #firstLeg.prev
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
                        ? Easy._validArrival(sts, "Easy")
                        : sts;
    }
//  static _validArrival() enforces the 4 legit statuses for arrival
    static _validArrival(sts, name, noErr) {
        switch (sts) {
        case undefined:
        case E.arrived: case E.original: case E.initial: case E.empty:
            return sts;
        default:
            if (noErr) return false;
            //----------------------
            const txt = (name == "Easy") ? " E.tripped," : "";
            Ez._mustBeErr(name + ".prototype.onArrival is a status value and",
                 `set to E.original, E.initial, E.empty,${txt} or E.arrived`);
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

// this.loopTime and this.firstTime are used by new Measer
    get loopTime()  { return this.#firstLoop(this.#loopWait); }
    get firstTime() { return this.#firstLoop(this.#wait); }
    #firstLoop(wait) {
        let val = wait + this.#time;
        if (this.#roundTrip && this.#autoTrip) // #autoTrip in case anything else uses it
            val += this.#tripWait + this.#time;
        return val;
    }
// this.time: setter is simpler than I expected. It spreads the new value
//            proportionally across all the leg.time and leg.wait values.
//            #wait, #loopWait, #tripWait are not included or affected.
//            Also note: set time() for E.steps doesn't separate #firstLeg.wait
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
        Easy.#spreadLegTimeCount(this.#firstLeg, tc, factor);
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
//  newTarget() creates an Easer or EaserByElm instance and adds it to #targets
    newTarget(o) {
        return create(o, this.#targets, !o.easies, "multi", "Easies");
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
// Reset methods:
//  arrive()
    arrive() {
        let apply;
        if (this.e.status > E.tripped) {
            apply = (e) => {
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
//  #setup() does the work for arrive(), restore(), init(), and initRoundTrip()
    #setup(sts, apply, isRT) {
        const e = this.e
        if (sts && sts == e.status) return; // let E.arrived fall through
        //-------------------------------
        if (sts || e.status != E.tripped)
            this._leg = isRT ? this.#lastLeg : this.#firstLeg;
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
        apply?.bind(this)(e);
        this.#init_e(sts);
    }
    #initOrTrip(e) {
        let peri
        if (this.isIncremental)
            e.value = this._value;
        else
            this.#set_e(e, this._leg.prev.end, this._leg.prev.unit);

        for (const t of this.#targets) {
            peri   = t.peri;    // don't want to run target.peri() if it exists
            t.peri = undefined;
            if (t.loopByElm)
                do {
                    t._apply(e);
                } while (t._nextElm());
            else
                t._apply(e);
            t.peri = peri;
        }
    }
//==============================================================================
    #init_e(status) {
        Object.assign(this.e,  this.#e);
        this.e.status = status;
        Object.assign(this.e2, this.#e);
    }
    #set_e(e, value, unit) {
        e.value = value;
        e.unit  = unit;
        e.comp  = Ez.flip(unit);
    }
//==============================================================================
//  static splitIO() splits two-legged io values into a 2 element array
//                   first leg = in:0, out:1, second leg = _in:2, _out:4
    static splitIO(io, fillTwo) {
        return io > E.out ? [io % 2, (io & 4) / 4] // 4 = _out = 2nd leg E.out
               : fillTwo  ? [io, io]
                          : [io];
    }
//  static _listE() returns a comma+space-separated list of E.xxx values
    static _listE(name, start = 0, end = Infinity) {
        return this[name].slice(start, end)
                         .map(v => E.prefix + v)
                         .join(", ");
    }
//==============================================================================
//  _zero() and _resume() help AFrame.prototype.play() via Easies
    _zero(now) {
        if (this.e.status == E.tripped) {
            this.#zero    = now + this.#lastLeg.wait + this.#tripWait;
            this.e.status = E.inbound;
        }
        else {
            this.#zero    = now + this.#firstLeg.wait + this.#wait;
            this.e.status = E.outbound;
        }
        for (const t of this.#targets)
            t._zero(this);
    }
    _resume(now) {
        if (this.e.status) // E.arrived == 0
            this.#zero = now - this._now;
    }
//  _reset() helps AFrame.prototype.#cancel() via Easies
    _reset(sts) {
        switch (sts) {
        case E.arrived:
            this.arrive();  break;
        case E.original:
            this.restore(); break;
        case E.initial:
            this.init();    break;
        case E.tripped:
            this.initRoundTrip();
        default: // undefined or E.empty == noop
        }
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
            const hasNext = e.status > E.tripped;
            const waitNow = e.waitNow;
            if (!hasNext || waitNow) {    // E.arrived, E.tripped, or waiting
                if (hasNext)
                    leg = leg.prev;
                this.#set_e(e, leg.end, leg.unit);
                if (hasNext || (!e.status && leg.type == E.steps))
                    return;               // waiting or steps = E.arrived
                //----------------------- //!!loopbyelm + steps must continue!!
                this._leg = this._inbound ? this.#lastLeg : this.#firstLeg;
                e = this.e2;              // for looping, autoTrip steps no wait
                if (leg.type == E.steps) {
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
//  _nextLeg helps both _calc()s get time-based next leg
    _nextLeg(leg, e) {
        let wait;
        let next   = leg.next;
        let time   = leg.time;
        this._now -= time;
        //!!Is there a way to condense this logic?? some identical repitition!!
        if (next) {             // proceed to the next leg
            this._leg = next;   // skipping a leg happens, especially with
            wait = next.wait;   // eased steps.
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
                wait = this.#firstLeg.wait * (this.#roundTrip ? 2 : 1)
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
}