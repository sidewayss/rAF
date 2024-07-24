// Not exported by raf.js
export {MEBase, MEaser, MEaserByElm};

import {EBase} from "./easer.js";
import {ECalc} from "./ecalc.js";

import {Ez}    from "../raf.js";

// This would benefit from multiple inheritance: ByElm and ME
class MEBase extends EBase { // M = multi E = Easer, the multi-ease base class
    #easies; #loopEasy;
    constructor(o) {
        super(o);
        this.#easies = o.easies;        // [Easy] validated in EFactory.easies()
        this._autoTripping = new Array(o.lz);
        if (this.loopByElm) {
            const easies = o.easies;
            let   time   = easies[0].loopTime;
            if (easies.some(ez => ez.loopTime != time))
                Ez._mustBeErr("MEaser loopByElm: easy.loopTime",
                              "the same for all easies");
            //-------
            let p, v;
            const plays = this.plays;   // #plays is not available here
            p = 0;
            time = Math.max(...easies.map(ez => ez.firstTime));
            easies.forEach((ez, i) => {
                if (time - ez.firstTime - ez.loopWait > 0) //!!needs testing!!
                    Ez._cantErr("MEaser loopByElm:", "align easies' loops");
                //-------------------------
                if (ez.firstTime == time) {
                    v = plays[i] || ez.plays;
                    if (v > p) {
                        this.#loopEasy = ez;
                        p = v;
                    }
                }
            });
        }
    }
//  static _validate() validates that obj is an instance a MEaser class
    static _validate(obj, name) {
        if (!obj?.isMEaser)
            Ez._mustBeErr(name, "an instance of a MEaser class");
        return obj;
    }
// this.easies is a shallow copy
    get easies()   { return this.#easies.slice(); }
    get loopEasy() { return this.#loopEasy; } // see Easies.prototype._next()

//  init() calls super.init() with an array of ez.#e as the argument
    init() {
        super.init(this.#easies.map(ez => ez.initial_e));
    }
//  _zero() resets stuff before playback
    _zero() {
        let i, l;
        const aT = this.autoTrip; // #autoTrip not available here
        super._zero(null, true);  // resets #iElm
        for (i = 0, l = this.#easies.length; i < l; i++) {
            this._autoTripping[i] = this._autoTrippy(this.#easies[i], aT[i]);
        }
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
        es.forEach((e, i) => this.#calcs[i].calculate(this._eVal(e, i)));
        this._set(es);
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
        this.setInitial(); //!!test!!
        Object.seal(this);
    }
    _apply(es) { // es = easies.map(ez => ez.e)
        this._calc(es, this.elmIndex);
        this._setElm(es);
    }
    _calc(es, iElm) {
        const calcs = this.#calcs[iElm];
        es.forEach((e, i) => calcs[i].calculate(this._eVal(e, i)));
    }
}