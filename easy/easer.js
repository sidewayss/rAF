// Not exported by raf.js
export {EBase, Easer, EaserByElm};

import {ECalc} from "./ecalc.js";
import {Easy}  from "./easy.js";

import {E, Ez, Is} from "../raf.js";

class EBase {
    #assign; #autoTrip; #cElms; #eKey; #elms; #evaluate; #iElm; #loopByElm;
    #mask; #oneD; #peri; #plays; #prop; #restore; #twoD; #value;
    _autoTripping;  // the active autoTrip value during an animation

    constructor(o) {
        if (o.calcByElm) {
            this.#oneD = o.oneD;
            this.#iElm = 0;
            this.#loopByElm = o.loopByElm;
        }
        else {
            this.#assign = o.bAbE
                         ? EBase.#assignByArgByElm
                         : EBase.#assignByElmByArg;
        }
        if (o.easies) {             // o.easies validated by EFactory.#easies()
            this.#eKey     = new Array(o.lz);
            this.#plays    = new Array(o.lz);
            this.#autoTrip = new Array(o.lz);
            Ez.is(this, "Measer");  // do it here so setters can use it below
        }
        // Use setters for values that have not yet been validated
        this.#prop = o.prop;    this.#cElms   = o.l;
        this.#elms = o.elms;    this.#value   = o.value;
        this.#mask = o.mask;    this.#restore = o.cvRaw;
        this.#peri = o.peri;    this.autoTrip = o.autoTrip;
        this.#twoD = o.twoD;    this.plays    = o.plays;
        this.eKey  = o.eKey;    this.evaluate = o.evaluate;
        Ez.is(this, "Easer");
    }
//  static _validate() validates that obj is an instance an Easer class
    static _validate(obj, err) {
        if (!obj?.isEaser || obj.isMEaser)
            Ez._mustBeErr(err, "an instance of an Easer class");
        return obj;
    }
//==============================================================================
// Getters, setters, and some related methods:
    get peri()    { return this.#peri; }
    set peri(val) { this.#peri = Ez._validFunc(val, "peri"); }

    get elmIndex()  { return this.#iElm;  } // used by sub-classes in _apply()
    get elmCount()  { return this.#cElms; } // unused internally
    get loopByElm() { return this.#loopByElm; }

    set loopByElm(val) { this.#loopByElm = Boolean(val); }

    get evaluate()    { return this.#evaluate; }
    set evaluate(val) { this.#evaluate = Ez._validFunc(val,  "evaluate"); }

    eVal(e, i)   {
        return this.#evaluate?.(e, i) ?? (this.isMeaser ? e[this.#eKey[i]]
                                                        : e[this.#eKey]);
    }
// this.autoTrip, this.plays, and this.eKeys are arrays byEasy for Measers
    get autoTrip()  {
        return this.isMeaser
             ? this.#autoTrip.slice()
             : this.#autoTrip;
    }
    set autoTrip(val) { // 3 states: true, false, undefined
        const validate = EBase.#validTrip;
        this.#autoTrip = this.isMeaser
                       ? this.#tripPlays(val, "autoTrip", this.#autoTrip, validate)
                       : validate(val);
    }
    get plays()    {
        return this.isMeaser
             ? this.#plays.slice()
             : this.#plays;
    }
    set plays(val) {    // a positive integer or undefined
        const validate = EBase.#validPlays;
        this.#plays    = this.isMeaser
                       ? this.#tripPlays(val, "plays", this.#plays, validate)
                       : validate(val);
    }
    get eKey()    {
        return this.isMeaser
             ? this.#eKey.slice()
             : this.#eKey;
    }
    set eKey(val) {
        if (!this.isMeaser)
            this.#eKey = EBase.#validEKey(val);
        else if (!Is.Arrayish(val))
            this.#eKey.fill(EBase.#validEKey(val));
        else {
            const eKey = Ez.toArray(val, "eKey", EBase.#validEKey);
            const lNew = eKey.length;
            const lOld = this.#eKey.length;
            if (lNew != lOld)
                Ez._mustBeErr("eKey.length", "the same as easies.length: "
                                            + `${lNew} != ${lOld}`);
            //----------------
            this.#eKey = eKey;
        }
    }
    #tripPlays(val, name, cv, validate) {
        const arr = Ez.toArray(val, name, validate, ...Ez.okEmptyUndef);
        if (!arr.length || (arr.length == 1 && arr[0] == val)) {
            arr.length = cv.length;
            arr.fill(arr[0]);
        }
        return arr;
    }
    static #validTrip(val) {
        return Is.def(val) ? Boolean(val) : val;
    }
    static #validPlays(val) {
        return Ez.toNumber(val, "plays", undefined, ...Ez.intGrThan0);
    }
    static #validEKey(val, name = "eKey") {
        if (!Is.def(val))
            return E.value;         // hard default
        else if (Easy.eKey.includes(val))
            return val;
        else
            Ez._invalidErr(name, val, Easy._listE(name));
    }
//  Some MEaser-specific methods here because of private members
    meTrip(i, val) {
        this.#autoTrip[i] = this.#meOne(val, "meTrip",  EBase.#validTrip);
    }
    mePlays(i, val) {
        this.#plays   [i] = this.#meOne(val, "mePlays", EBase.#validPlays);
    }
    meEKey(i, val) {
        this.#eKey    [i] = this.#meOne(val, "meEKey",  EBase.#validEKey);
    }
    #meOne(val, name, validate) {
        return this.isMeaser ? validate(val) // console.log returns undefined
                             : console.log(name + "() is only for Measers.");
    }
//==============================================================================
// "Protected" methods:
//  _autoTrippy() returns run-time autoTrip, falling back to ez.autoTrip or false
    _autoTrippy(ez, autoTrip) { return autoTrip ?? ez.autoTrip ?? false; }

//  _zero() resets stuff before playback
    _zero(ez, dontSetIt) { // dontSetIt is used by MEBase().prototype._zero()
        if (!dontSetIt)
            this._autoTripping = this._autoTrippy(ez, this.#autoTrip);
        if (this.#loopByElm)
            this.#iElm = 0;
    }
//  _restore() reverts to the values from when this instance was created
    _restore() {
        if (this.#restore)
            this.#elms.forEach((elm, i) =>
                this.#prop.setIt(elm, this.#restore[i])
            );
        else
            Ez._cantErr("You", "restore because you set noRestore:true");
    }
//  _nextElm() moves to the next element for loopByElm, cycles back to zero
    _nextElm(plugCV = this.isMeaser) { // plugCV for Measer w/loopByElm
        if (plugCV)      // only necessary first time, not when looping
            this.#twoD[this.#iElm] = this.#oneD.slice();
        if (++this.#iElm == this.#cElms)
            this.#iElm = 0;
        if (plugCV)
            this.#twoD[this.#iElm].forEach((v, i) => this.#oneD[i] = v);
        return this.#iElm;
    }
//==============================================================================
// The two set functions set the property value on one or more elements:
//  _set() is the basic (set all the elms) set function
    _set(e) {
        const prop = this.#prop
        const val  = this.#value;
        this.#assign(this.#twoD, this.#mask, this.#value);
        this.#elms.forEach((elm, i) => prop.setIt(elm, val[i].join("")));
        this.#peri?.(this.#twoD, e);
    //!!console.log(val.map(v => v.toFixed(2)));
    }
//  _setElm() is the byElm set function
    _setElm(e) { // e is undefined for MEaser
        const elm  = this.#elms [this.#iElm];
        const val  = this.#value[this.#iElm]; //++for non-isUn, this.#value could be 1D, all plugs the same
        const oneD = this.#oneD;
        this.#mask.forEach((m, i) => val[m] = oneD[i]);
        this.#prop.setIt(elm, val.join(""));
        this.#peri?.(oneD, e, elm);
    //!!console.log(val.join(""));
    //!!console.log(oneD.map(v => v.toFixed(2)));
    }
//==============================================================================
//  The static assign methods: forEach() is nice here because of the multiple
//  callback arguments. If the performance becomes an issue, you can switch to
//  the //++ commented-out versions below that use basic for loops.
    static #assignByArgByElm(twoD, mask, val) {
        mask.forEach((m, i) =>
            twoD[i].forEach((v, j) => val[j][m] = v)
        );
    }
    static #assignByElmByArg(twoD, mask, val) {
        twoD.forEach((arr, i) =>
            mask.forEach((m, j) => val[i][m] = arr[j])
        );
    }
//++set(e) {
//++    const elms = this.#elms, prop = this.#prop, val = this.#value;
//++    for (var i = 0, l = this.#cElms; i < l; i++)
//++        prop.setIt(elms[i], val[i].join(""));
//++}
//++static #assignByArgByElm(twoD, mask, val) {
//++    let i, j; // if it comes to this, test declaring this inside the loops
//++    const lm = mask.length;
//++    const lt = twoD[0].length;
//++    for (i = 0; i < lm; i++)
//++        for (j = 0; j < lt; j++)
//++            val[j][mask[i]] = twoD[i][j];
//++}
//++static #assignByElmByArg(twoD, mask, val) {
//++    let i, j;
//++    const lm = mask.length;
//++    const lt = twoD.length;
//++    for (i = 0; i < lt; i++)
//++        for (j = 0; j < lm; j++)
//++            val[i][mask[j]] = twoD[i][j];
//++}
//++static #assignToElm(oneD, mask, val) {
//++    let i;
//++    const lm = mask.length;
//++    for (i = 0; i < lm; i++)
//++        val[mask[i]] = oneD[i];
//++}
}
////////////////////////////////////////////////////////////////////////////////
class Easer extends EBase {      // basic Easer
    #calc;
    constructor(o) {
        super(o);
        this.#calc = new ECalc(o);
        Object.seal(this);
    }
    _apply(e) {
        this.#calc.calculate(this.eVal(e));
        this._set(e);
    }
}
////////////////////////////////////////////////////////////////////////////////
class EaserByElm extends EBase { // Easer by Element
    #calcs;
    constructor(o) {
        super(o);
        this.#calcs = Array.from({length:o.l}, (_, i) => new ECalc(o, o.calcs[i]));
        Object.seal(this);
    }
    _apply(e) {
        this.#calcs[this.elmIndex].calculate(this.eVal(e));
        this._setElm(e);
    }
}