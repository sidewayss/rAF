// Not exported by raf.js
export {EBase, Easer, EaserByElm};

import {ECalc} from "./ecalc.js";

import {E, Ez, Is, Easy} from "../raf.js";
import {CFunc}           from "../prop/func.js"

class EBase {
    #assign; #autoTrip; #cElms; #cjs; #eKey; #elms; #evaluate; #iElm;
    #loopByElm; #mask; #oneD; #peri; #plays; #prop; #restore; #setOne;
    #space; #twoD; #value;

    _autoTripping;  // the active autoTrip value during an animation

    constructor(o) {
        if (o.l) {
            if (o.calcByElm) {
                this.#oneD = o.oneD;
                this.#iElm = 0;     // EaserByElm.proto.apply() calls _setElm()
                this.#loopByElm = o.loopByElm;
            }
            else {                  // Easer.proto.apply() calls _set()
                this._set = this.#setElms;
                this.#assign = o.bAbE ? EBase.#assignByArgByElm
                                      : EBase.#assignByElmByArg;
            }
            this.#elms = o.elms;
            this.#prop = o.prop;
        }
        else {                      // no elements, no property, just #peri()
            this._set  = this.#runPeri;
            this.#oneD = o.oneD;
        }
        if (o.cjs) {                // Color.js settings (or not)
            this.#cjs    = o.cjs;
            this.#space  = o.displaySpace;
            this.#setOne = this.#setCjs;
        }
        else
            this.#setOne = this.#setIt;

        if (o.easies) {             // o.easies validated by EFactory.#easies()
            this.#eKey     = new Array(o.lz);
            this.#plays    = new Array(o.lz);
            this.#autoTrip = new Array(o.lz);
            Ez.is(this, "MEaser");  // do it here so setters can use it below
        }
                                    // use setters for values not yet validated
        this.#mask = o.mask;     this.#cElms   = o.l;
        this.#twoD = o.twoD;     this.#value   = o.value;
        this.#peri = o.peri;     this.#restore = o.restore;
        this.plays = o.plays;    this.evaluate = o.evaluate;
        this.eKey  = o.eKey;     this.autoTrip = o.autoTrip;

        Ez.is(this, "Easer");
    }
//  static _validate() validates that obj is an instance an Easer class
    static _validate(obj, err) {
        if (!obj?.isEaser || obj.isMEaser)
            Ez._mustBeErr(err, "an instance of an Easer class");
        return obj;
    }
//==============================================================================
// The two set functions set the property value on one or more elements.
// forEach() is nice here because of the multiple callback arguments. If
// performance becomes an issue, you can switch to the versions in alt/ebase.js.
//  #setElms() is the basic (set all the elms) set function
    #setElms(e) {
        const prop = this.#prop
        const val  = this.#value;
        this.#assign(this.#twoD, this.#mask, this.#value);
        this.#elms.forEach((elm, i) => this.#setOne(prop, elm, val[i]));
        this.#peri?.(this.#twoD, e);
      //console.log(val.map(v => v.toFixed(2)));
    }
//  #runPeri() does not apply values to an element property, no elms, no prop
    #runPeri(e) {
        this.#peri(this.#oneD, e);
    }
//  _setElm() is the byElm set function, for single-elm and loopByElm
    _setElm(e) { // e is undefined for MEaser
        const elm  = this.#elms [this.#iElm];
        const val  = this.#value[this.#iElm]; //++for non-isUn, this.#value could be 1D, all plugs the same
        const oneD = this.#oneD;
        this.#mask.forEach((m, i) => val[m] = oneD[i]);
        this.#setOne(this.#prop, elm, val);
        this.#peri?.(oneD, e, elm);
      //console.log(val.join(""));
      //console.log(oneD.map(v => v.toFixed(2)));
    }
//==============================================================================
// The two #setOne functions:
    #setIt(prop, elm, arr) {  // could be static
        prop.setIt(elm, arr.join(""));
    }
    #setCjs(prop, elm, arr) { // could be static if this.#cjs passed as argument
        this.#cjs.coords = arr; // .slice(0, CFunc.A) appears to be unnecessary
        if (arr[CFunc.A])       // color.js ignores but preserves extra elements
            this.#cjs.alpha = arr[CFunc.A];
        prop.setIt(elm, this.#cjs.display(this.#space));
    }
//==============================================================================
// The static assign methods used by #setElms(). ditto forEach().
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
//==============================================================================
// Getters, setters, and some related methods:
    get peri()    { return this.#peri; }
    set peri(val) { this.#peri = Ez._validFunc(val, "peri"); }

    get loopByElm()    { return this.#loopByElm; }
    set loopByElm(val) { this.#loopByElm = Boolean(val); }

// this.elmIndex is for loopByElm
    get elmIndex()  { return this.#iElm;  }

// this.elmCount is for loopByElm, and for identifying targets w/o elements
    get elmCount()  { return this.#cElms; } // loopByElm + everything else too

//  eval functions return the correct e.property's value at run-time
    #Eval (e)    { return e[this.#eKey];    }
    #MEval(e, i) { return e[this.#eKey[i]]; }

// this.evaluate allows the user to do their own evaluation
    get evaluate()    { return this.#evaluate; }
    set evaluate(val) {
        this.#evaluate = Ez._validFunc(val,  "evaluate");
     // this.eVal is the public property used at run-time
        this.eVal = this.#evaluate
                ?? (this.isMEaser ? this.#MEval : this.#Eval);
    }

// this.eKeys, this.autoTrip, this.plays are byEasy arrays for MEBase
    get eKey()    {
        return this.isMEaser
             ? this.#eKey.slice()
             : this.#eKey;
    }
    set eKey(val) {
        const name = "eKey";
        if (!this.isMEaser)
            this.#eKey = EBase.#validEKey(val, name);
        else if (!Is.Arrayish(val))
            this.#eKey.fill(EBase.#validEKey(val, name));
        else {
            const eKey = Ez.toArray(val, name, EBase.#validEKey);
            const lNew = eKey.length;
            const lOld = this.#eKey.length;
            if (lNew != lOld)
                Ez._mustBeErr("eKey.length", "the same as easies.length: "
                                           + `${lNew} != ${lOld}`);
            //----------------
            this.#eKey = eKey;
        }
    }
    static #validEKey(val, name) {
        if (!Is.def(val))
            return E.value; // hard default
        else if (Easy.eKey.includes(val))
            return val;
        else
            Ez._invalidErr(name, val, Easy._listE(name));
    }
    get autoTrip()  {
        return this.isMEaser
             ? this.#autoTrip.slice()
             : this.#autoTrip;
    }
    set autoTrip(val) { // 3 states: true, false, undefined
        const validate = EBase.#validTrip;
        this.#autoTrip = this.isMEaser
                       ? this.#tripPlays(val, "autoTrip", this.#autoTrip, validate)
                       : validate(val);
    }
    static #validTrip(val) {
        return Is.def(val) ? Boolean(val) : val;
    }
    get plays()    {
        return this.isMEaser
             ? this.#plays.slice()
             : this.#plays;
    }
    set plays(val) {    // a positive integer or undefined
        const validate = EBase.#validPlays;
        this.#plays    = this.isMEaser
                       ? this.#tripPlays(val, "plays", this.#plays, validate)
                       : validate(val);
    }
    static #validPlays(val) {
        return Ez.toNumber(val, "plays", undefined, ...Ez.intGrThan0);
    }
    #tripPlays(val, name, cv, validate) {
        const arr = Ez.toArray(val, name, validate, ...Ez.okEmptyUndef);
        if (!arr.length || (arr.length == 1 && arr[0] == val)) {
            arr.length = cv.length;
            arr.fill(arr[0]);
        }
        return arr;
    }
// Some MEaser-specific methods are here because of private members
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
        return this.isMEaser ? validate(val) // console.log returns undefined
                             : console.log(name + "() is only for MEasers.");
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
            this.#prop.setEm(this.#elms, this.#restore);
        else
            throw new Error("These settings require explicitly enabling {restore:true}.");
    }
//  _nextElm() moves to the next element for loopByElm, cycles back to zero
    _nextElm(plugCV = this.isMEaser) { // plugCV for MEaser w/loopByElm
        if (plugCV)      // only necessary first time, not when looping
            this.#twoD[this.#iElm] = this.#oneD.slice();
        if (++this.#iElm == this.#cElms)
            this.#iElm = 0;
        if (plugCV)
            this.#twoD[this.#iElm].forEach((v, i) => this.#oneD[i] = v);
        return this.#iElm;
    }
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
class EaserByElm extends EBase { // Easer by Element, single-elm or loopByElm
    #calcs;
    constructor(o) {
        super(o);
        this.#calcs = Array.from({length:o.l},
                                 (_, i) => new ECalc(o, o.calcs[i]));
        Object.seal(this);
    }
    _apply(e) {
        this.#calcs[this.elmIndex].calculate(this.eVal(e));
        this._setElm(e);
    }
}