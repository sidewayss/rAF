// Not exported by raf.js
export {MEBase, MEaser, MEaserByElm};

import {EBase} from "./easer.js";
import {ECalc} from "./ecalc.js";

import {Ez}    from "../raf.js";

// This would benefit from multiple inheritance: ByElm and ME
class MEBase extends EBase { // M = multi E = Easer, the multi-ease base class
    #easies; #easy2Mask; #loopEasy;
    constructor(o) {
        super(o);
        this.#easies    = o.easies;    // [Easy] validated in EFactory mask()
        this.#easy2Mask = o.easy2Mask; // may never be used...

        if (this.loopByElm) {          // loopByElm requires easies to sync time
            let name, time;            // across first play and any loop plays.
            const easies = o.easies;
            for (name of ["firstTime","loopTime"]) {
                time = easies[0][name];
                if (easies.some(ez => ez[name] != time))
                    Ez._mustBeErr(`MEaser loopByElm: easy.${name}`,
                                  "the same for all of this.easies");
            } //--------------------------------------------------------
            const // the ez with the most plays has the longest duration
            plays = easies.map(ez => this._playings(ez)),
            index = plays.findIndex(Math.max(plays));
            this.#loopEasy = easies[index];           // for onLoop callback
        }
    }
//  static _validate() validates that obj is an instance a MEaser class
    static _validate(obj, name) {
        if (!obj?.isMEaser)
            Ez._mustBeErr(name, "an instance of a MEaser class");
        return obj;
    }
//==============================================================================
// this.easies is a shallow copy, easy2Mask too
    get easies()    { return this.#easies.slice(); }
    get easy2Mask() { return new Map(this.#easy2Mask); }
    get loopEasy()  { return this.#loopEasy; } // see Easies.prototype._next()

    get autoTripping() {
        const trips = this.autoTrip;  // #autoTrip not available here
        return this.#easies.map((ez, i) => this._autoTripping(ez, trips[i]));
    }

    get playings() {
        const plays = this.plays;     // #plays not available here
        return this.#easies.map((ez, i) => this._playings(ez, plays[i]));
    }

// this.duration returns the total duration, with autoTripping and playings
    get duration() {
        let first, t;
        const
        trips = this.autoTripping,
        plays = this.playings;
        return Math.max(...this.#easies.map((ez, i) => {
            t = ez.time;
            first = t + ez.wait;
            if (trips[i])
                first += t + ez.tripWait;

            return ez._duration(first, trips[i]) // _duration() trims time
                 + (first + ez.loopWait)         // * has precedence over +
                 * (plays[i] - 1);               // plays[i] range is 1 to COUNT
        }));
    }
// this.delay is the start of animation, after the shortest ez.wait
    get delay() {
        return Math.min(...this.#easies.map(ez => ez.delay));
    }
//==============================================================================
//  _zeroOut()
    _zeroOut() {
        super._zeroOut();
        const start = this.#easies[0].delay;
        if (this.#easies.some(ez => ez.delay != start))
            this.calcInitial(); // pre-populate #twoD or #oneD
    }
//  init() calls super.init() with an array of ez.#e as the argument
    init() {
        super.init(this.#easies.map(ez => ez.initial_e));
    }
}
////////////////////////////////////////////////////////////////////////////////
class MEaser extends MEBase {        //\ Multi-ease Easer
    #calcs;
    constructor(o) {
        super(o);
        this.#calcs = Array.from({length:o.lz}, (_, i) =>
                            new ECalc(o, o.calcs[i]));
        Object.seal(this);
    }
    _apply(es) { // es = easies.map(ez => ez.e)
        this._calc(es);
        this._set (es);
    }
    _calc(es) {
        es.forEach((e, i) => this.#calcs[i].calculate(this._eVal(e, i)));
    }
}
////////////////////////////////////////////////////////////////////////////////
class MEaserByElm extends MEBase {
    #calcs;
    constructor(o) {
        super(o);
        this.#calcs = Array.from({length:o.l}, (_, i) =>
                            Array.from({length:o.lz}, (_, j) =>
                                  new ECalc(o, o.calcs[i][j])));
        this.setInitial();
        Ez.is(this, "ByElm");
        Object.seal(this);
    }
    _apply(es) { // es = easies.map(ez => ez.e)
        this._calc(es, this.elmIndex);
        this._set (es);
    }
    _calc(es, iElm) {
        const calcs = this.#calcs[iElm];
        es.forEach((e, i) => calcs[i].calculate(this._eVal(e, i)));
    }
}