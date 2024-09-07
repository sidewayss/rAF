// Not exported by raf.js
export {EBase, Easer, EaserByElm};

import {ECalc} from "./ecalc.js";

import {E, Ez, Is, Easy} from "../raf.js";
import {CFunc}           from "../prop/func.js"

// A whole lot of crap ends up in this base class because javascript has no
// multiple inheritance and there are two forks: ME and ByElm.
class EBase {
    #assign; #autoTrip; #cElms; #cjs; #eKey; #elms; #evaluate; #hasF; #iElm;
    #initByElm; #initial; #isLooping; #isSDE; #loopByElm; #loopElms; #lz; #mask;
    #oneD; #onLoop; #onLoopByElm; #original; #peri; #plays; #prop; #setOne;
    #space; #twoD; #value;

    _eVal; // run-time evaluate function

    constructor(o) {
        this.#mask = o.mask;        this.#cElms = o.l;
        this.#twoD = o.twoD;        this.#value = o.value;
        this.#peri = o.peri;        this.#isSDE = o.isSDE;
        this.#hasF = Boolean(o.f);  this.#initial = o.initial;
                                    this.#original = o.original;
        if (o.l) {
            this.#elms = o.elms;
            this.#prop = o.prop;
            if (o.calcByElm) {
                this._set  = this.#setElm;
                this.#oneD = o.oneD;
                this.#iElm = 0;
                this.#loopByElm  = Boolean(o.loopByElm);
                this.onLoopByElm = o.onLoopByElm;
            }
            else {                  // Easer.proto._apply() calls _set()
                this._set = this.#setElms;
                this.#assign = o.bAbE ? EBase.#assignByArgByElm
                                      : EBase.#assignByElmByArg;
            }
        }
        else                        // zero elements, for pseudo-only
            this.#oneD = o.oneD;    // similar to calcByElm

        if (o.pseudo)               // overrides any previous setting
            this._set = this.#runPeri;

        if (o.cjs) {                // Color.js settings
            this.#cjs    = o.cjs;
            this.#space  = o.displaySpace;
            this.#setOne = this.#setCjs;
        }
        else
            this.#setOne = this.#setIt;

        if (o.easies) {             // o.easies validated by EFactory mask()
            this.#lz   = o.lz;
            this.#eKey = Array(o.lz);
            Ez.is(this, "MEaser");  // do it here so setters can use it:
        }                           // use setters for values not yet validated
        this.plays = o.plays;   this.evaluate = o.evaluate;
        this.eKey  = o.eKey;    this.autoTrip = o.autoTrip;
        Ez.is(this, "Easer");
    }
//  static _validate() validates that obj is an instance an Easer class
    static _validate(obj, err) {
        if (!obj?.isEaser || obj.isMEaser)
            Ez._mustBeErr(err, "an instance of an Easer class");
        return obj;
    }
//==============================================================================
// Callbacks, getters, setters, and some related methods:
    get peri()    { return this.#peri; }
    set peri(val) { this.#peri = Ez._validFunc(val, "peri"); }

    get onLoop()    { return this.#onLoop; }
    set onLoop(val) { this.#onLoop = Ez._validFunc(val, "onLoop"); }

    get onLoopByElm()    { return this.#onLoopByElm; }
    set onLoopByElm(val) { this.#onLoopByElm = Ez._validFunc(val, "onLoopByElm"); }

    get loopByElm() { return this.#loopByElm; }
//!!set loopByElm(val) {
//!!    this.#loopByElm = Boolean(val);
//!!    if (this.isMEaser)
//!!        this.setInitial(); // only for MEaserByElm, else no way to get easy.e
//!!}                          // thus no setter, must be done via create()

// this.elmCount is for loopByElm, and for identifying targets w/o elements
    get elmCount() { return this.#cElms; } // loopByElm + everything else too

// this.elmIndex is for loopByElm
    get elmIndex() { return this.#iElm;  }

// this._isLooping is true when loopByElm loops by play, see Easies.proto._next()
    set _isLooping(b) { this.#isLooping = Boolean(b); }

// this.eKey, this.autoTrip, this.plays are byEasy arrays for MEBase
// this.eKey
    get eKey()    {
        return this.isMEaser ? this.#eKey.slice() : this.#eKey;
    }
    set eKey(val) {
        const
        name     = "eKey",
        validate = this.#validEKey.bind(this);  // bind for Ez.toArray()
        if (!this.isMEaser)
            this.#eKey = validate(val, name);
        else if (!Is.Arrayish(val))
            this.#eKey.fill(validate(val, name));
        else {
            const
            eKey = Ez.toArray(val, name, validate),
            lNew = eKey.length,
            lOld = this.#eKey.length;
            if (lNew != lOld)
                Ez._mustBeErr("eKey.length", "the same as easies.length: "
                                           + `${lNew} != ${lOld}`);
            //----------------
            this.#eKey = eKey;
        }
    }
    #validEKey(val, name) {
        const isDef = Is.def(val);
        if (this.#isSDE) {
            if (isDef) {
                const
                eKey = "The eKey property",
                SDE  = "because you created it using start-distance-end style"
                if (val != E.unit)
                    Ez._mustBeErr(`${eKey} for this ${this.constructor.name}`,
                                `E.unit ${SDE}`);
                else if (Is.def(this.#eKey))
                    console.info(`${eKey} was already set to E.unit by default ${SDE}.`);
            }
            return E.unit;
        }
        if (!isDef)   // hasFactor defaults to E.unit
            return this.#hasF ? E.unit : E.value;
        if (Easy.eKey.includes(val))
            return val;
        else
            Ez._invalidErr(name, val, Easy._listE(name));
    }

// this.autoTrip
    get autoTrip()  {
        return this.isMEaser ? this.#autoTrip.slice() : this.#autoTrip;
    }
    set autoTrip(val) { // 3 states: true, false, undefined
        const validate = EBase.#validTrip;
        this.#autoTrip = this.isMEaser
                       ? this.#tripPlays(val, "autoTrip", validate)
                       : validate(val);
    }
    static #validTrip(val) {
        return Is.def(val) ? Boolean(val) : val;
    }
    // _autoTripping computes a run-time autoTrip value, no this.autoTripping
    // because getter can't have an ez argument, see Easies.proto._zero() and
    _autoTripping(ez, val) {                      // MEaser.proto.autoTripping
        return Is.def(val) ? val && ez.roundTrip
                           : ez.autoTripping;     // ez.autoTrip && ez.roundTrip
    }

// this.plays
    get plays()    {
        return this.isMEaser ? this.#plays.slice() : this.#plays;
    }
    set plays(val) {    // a positive integer or undefined
        const validate = EBase.#validPlays;
        this.#plays    = this.isMEaser
                       ? this.#tripPlays(val, "plays", validate)
                       : validate(val);
    }
    static #validPlays(val) {           // default, !neg,!zero,!float,!undef,!null
        return Ez.toNumber(val, "plays", undefined, true, true, true, false, false);
    }
    // no this.playings because it requires ez and getters don't take args
    _playings(ez, val) { return val ?? ez.plays; }

// this.evaluate allows the user to do their own evaluation
    get evaluate()    { return this.#evaluate; }
    set evaluate(val) {
        this.#evaluate = Ez._validFunc(val,  "evaluate");
     // this._eVal is the public property used at run-time
        this._eVal = this.#evaluate
                ?? (this.isMEaser ? this.#MEval : this.#Eval);
    }

//  eval functions return the correct e.property's value at run-time
    #Eval (e)    { return e[this.#eKey];    }
    #MEval(e, i) { return e[this.#eKey[i]]; }

//  MEaser only:
    #tripPlays(val, name, validate) {
        const arr = Ez.toArray(val, name, validate, ...Ez.okEmptyUndef);
        if (!arr.length || (arr.length == 1 && arr[0] == val)) {
            arr.length = this.#lz;  // should always be > 1
            arr.fill(arr[0]);       // undefined || val
        }
        return arr;
    }
//  Some MEaser methods are here to accommodate shared private members.
//  Getters all return a slice(), so these allow setting values by index.
    meEKey(i, val) {
        this.#eKey[i]     = this.#meOne(val, "meEKey",  this.#validEKey);
    }
    meTrip(i, val) {
        this.#autoTrip[i] = this.#meOne(val, "meTrip",  EBase.#validTrip);
    }
    mePlays(i, val) {
        this.#plays[i]    = this.#meOne(val, "mePlays", EBase.#validPlays);
    }
    #meOne(val, name, validate) {
        return this.isMEaser ? validate(val) // console.log returns undefined
                             : console.log(name + "() is only for MEasers.");
    }
//==============================================================================
// "Protected" methods:
//  _zero() resets stuff before playback
    _zero() {
        if (this.#loopByElm)
            this.#iElm = 0;
    }
//  restore() reverts to the elms' values from when this instance was created
    restore() {
        if (this.#original)
            this.#prop.setEm(this.#elms, this.#original);
        else {
            const reason = this.#cElms ? "you set {dontGetValues:true}"
                                       : "your target has no elements";
            Ez._cantErr("You", `restore values because ${reason}.`);
        }
    }
//  init() sets the elements to their initial property values. It's public,
//         but has no validation, and is designed only to be called by
//         Easy.proto.init() and Easies.proto.init=>MEBase.proto.init().
    init(e, isRT) {                  // e is easy.e/[easy.e] for Easer/MEaser
        if (!this.#cElms) return;    // no elms = nothing to apply
        //------------------
        if (this.#loopByElm)
            this.#iElm = 0;
        if (!isRT && this.#initial)
            this.#prop.setEm(this.#elms, this.#initial);
        else {
            const peri = this.#peri; // don't want apply() to run target.peri()
            this.#peri = undefined;
            if (this.#loopByElm)
                do    {this._apply(e)}
                while (this._nextElm());
            else
                this._apply(e);
            this.#peri = peri;
        }
    }
//  _nextElm() moves to the next element for loopByElm, cycles back to zero
    _nextElm(plugCV = this.isMEaser) { // plugCV for MEaser w/loopByElm
        if (plugCV)      // only necessary first time, not when looping
            this.#twoD[this.#iElm] = this.#oneD.slice();
        if (++this.#iElm == this.#cElms)
            this.#iElm = 0;
        if (plugCV)      //!!needs serious review/testing for MEaser!!
            this.#twoD[this.#iElm].forEach((v, i) => this.#oneD[i] = v);
        return this.#iElm;
    }
//==============================================================================
//  #runPeri() does not apply values: zero elms, no prop, no mask
    #runPeri(e) {
        this.#peri(this.#oneD, e);
    }
// The two set functions set the property value on one or more elements.
// forEach() is nice here because of the multiple callback arguments. If
// performance becomes an issue, you can switch to the versions in alt/ebase.js.
//  #setElms() is the basic (set all the elms) set function
    #setElms(e) {
        const
        prop = this.#prop,
        val  = this.#value;
        this.#assign(this.#twoD, this.#mask, this.#value);
        this.#elms.forEach((elm, i) => this.#setOne(prop, elm, val[i]));
        this.#peri?.(this.#twoD, e);
    }
//  #setElm() is the byElm set function, for single-elm and loopByElm
    #setElm(e) {
        const
        i   = this.#iElm,
        elm = this.#elms[i];
        this.#setOne(this.#prop, elm, this._parseElm(i));
        if (this.#isLooping) {  // loopByElm is looping by plays
            this._initByElm();  // initialize the rest of the elements
            this.#isLooping = false;
        }
        this.#peri?.(this.#oneD, e, elm);
    }
    _parseElm(iElm) {
        const  //++for non-isUn, this.#value could be 1D, all plugs the same
        val  = this.#value[iElm],
        oneD = this.#oneD;
        this.#mask.forEach((m, i) => val[m] = oneD[i]);
        return val;
    }
//  _initByElm() initializes all but the first element, for loopByElm
    _initByElm() { // called by setElm(), Easies.proto._next()
        this.#prop.setEm(this.#loopElms, this.#initByElm);
    //++this.#onLoop?.(this); //++run callback after wait, not on arrival
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
    //!!if (elm.selectorText?.endsWith("abled]") && prop.name == "fill")
    //!!    console.log(prop.name, arr.map(n => n.toFixed(2)));
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
//  setInitial() ensures #initial and friends are populated
//               called by new [M]EaserByElm and set loopByElm()
//               o is only defined by Easy.proto.newTarget() via new EaserByElm
//               loopByElm requires that #cElms is > 1.
    setInitial(o) {
        if (!this.#loopByElm) return;
        //---------------------------
        if (!Is.def(this.#initial)) {
            this.calcInitial(o);
            this.#initial = Array(l);
            for (let i = 0, l = this.#cElms; i < l; i++)
                this.#initial[i] = arr.map((_, i) => this._parseElm(i).join(""));
        }
        this.#initByElm = this.#initial.slice(1); // see _initByElm()
        this.#loopElms  = this.#elms   .slice(1); // ditto
    }
//  calcInitial() pre-populates #twoD or #oneD with initial values, necessary
//                for MEasers where an Easy waits longer than another to start,
//                and for loopByElm/#initial. Used by pseudo-animations that
//                have no elements, thus #cElms || 1.
    calcInitial(o) {
        const e = this.easies?.map(ez => ez.e) ?? o.e;
        if (this.isByElm)
            for (let i = 0, l = this.#cElms || 1; i < l; i++)
                this._calc(e, i);
        else
            this._calc(e);
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
        this._calc(e);
        this._set (e);
    }
    _calc(e) {
        this.#calc.calculate(this._eVal(e));
    }
}
////////////////////////////////////////////////////////////////////////////////
class EaserByElm extends EBase { // Easer by Element, single-elm or loopByElm
    #calcs;
    constructor(o) {
        super(o);
        this.#calcs = Array.from({length:o.l},
                                 (_, i) => new ECalc(o, o.calcs[i]));
        this.setInitial(o); // must follow super() and this.#calcs assignment
        Ez.is(this, "ByElm");
        Object.seal(this);
    }
    _apply(e) {
        this._calc(e, this.elmIndex);
        this._set (e);
    }
    _calc(e, i) {
        this.#calcs[i].calculate(this._eVal(e));
    }
}