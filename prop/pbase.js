// Not exported by raf.js
import {PFactory} from "./pfactory.js";

import {E, Ez, F, Is, P} from "../raf.js";

export class PBase { // the base class for Prop, Bute, PrAtt, Bute2
    static #separator = E.sp;   // only font-family separates w/comma, and
    #func; #units;              // it's non-numeric, so no value arrays.

    constructor(name, units, utype, func, multiFunc) {
        Ez.readOnly(this, "name", name);
        this.#units = units;
        this.#func  = func;
        if (multiFunc)                // filter & transform, see PFactory.init()
            Ez.is(this, "MultiFunc");

        this.remove = this.cut;       // for pseudo-compatibility

        // utype = isUn | _noU | _noUPct | _len | _lenPct | _lenPctN | _ang
        Ez.readOnly(this, utype, true);
        Ez.is(this, "PBase");
    }
//  static _validate() validates PBase instances and converts from String
    static _validate(val, name, notUndef) {
        if (val?.isPBase)
            return val;
        if (Is.String(val)) {
            if (P[val])
                return P[val];
            else
                throw new Error(val + " is not a supported property or attribute.");
        }
        if (!Is.def(val)) {
            if (notUndef)
                Ez._mustBeErr(name, "defined");
            else
                return val;
        }
        Ez._mustBeErr(name, "a String or an instance of Prop: " + val);
    }
//==============================================================================
// this.func
    get func() { return this.#func; }
    set func(val) {
        if (Is.def(val) || this.needsFunc) {
            if (!val?.isFunc)
                Ez._mustBeErr(
                    `${this.name}.func`,
                    `an instance of Func ${this.needsFunc ? "" : " or undefined"}`
                );
            else if (this.isColor && !val?.isColor)
                Ez._invalidErr("func", val?.name ?? val, PFactory.funcC,
                               `${this.name}.func`);
        }
        this.#func = val;
    }
// this.units
    get units()    { return this.#units; }
    set units(val) { this.#units = PFactory._validUnits(val, this.name, this); }
    set _u   (u)   { this.#units = u; } // backdoor avoids double-validation

//  _unitz() gets the active units, which might be the func's units
    _unitz(f = this.func) { return f?.units ?? this.units; }
//==============================================================================
//  join() joins an array of sub-values using the appropriate separators
    join(arr, f = this.func, u = this._unitz(f)) {
        return (f?.join ?? Ez._join)(arr, u, PBase.#separator);
    }
    joinUn(o) { // not static because PBase not exported by raf.js
        let i, str;//!!o.nums and o.seps are 2D byElm!!
        const l = o.nums.length;

        for (i = 0, str = ""; i < l; i++)
            str += o.seps[i] + o.nums[i];

        return str + (o.seps[l] ?? "");
    }
//  static _seps() sets o.seps to a dense array of concatenated units +
//          separators or leaves it undefined. Also sets the o.numBeg & o.numEnd
//          booleans. Returns a value as a convenience for Easy.#plugCV().
    static _seps(o) {
        if (o.func)
            return o.func._seps(o);
        //--------------
        o.numBeg = true;
        o.numEnd = !o.u;             // o.u is string, but can be empty
        if (o.c == 1 && o.numEnd)
            return;                  // 1 arg, no units, o.seps stays undefined
        //-------
        let c, i;
        c = o.c - o.numEnd;          // c  = arg count
        const us = new Array(c--);   // us = combined units + separators
        for (i = 0; i < c; i++)
            us[i] = o.u + this.#separator;
        if (o.u)
            us[c] = o.u;
        o.seps = us;
        return us;
    }
//==============================================================================
//  _mask() returns an argument mask as a dense array of argument indexes.
//   The m argument can be a dense or sparse array, or an integer bitmask. If
//   it is a dense array, _mask() validates the contents to prevent obscure
//   errors later. Otherwise it auto-generates the mask from the m argument,
//   ensuring that the returned mask is correctly formatted.
//   0 is not a valid bitmask value. {mask:0} is ignored and calculate() will
//   spread the eased value across arguments. If you want to mask only the
//   first arg of a prop|func that has no Ez.bitmask values, use {mask:[0]}.
    _mask(m, f = this.func, c = this.count(f)) {
        let   name = "mask";
        const isAm = Is.A(m);
        if (!isAm)
            try {
                m = Ez.toNumber(m, name, ...Ez.defGrThan0, true);
            } catch {
                Ez._mustBeErr(name, "a positive integer or an Array");
            }
        //-------
        let mask;
        if (isAm && !m.includes(undefined)) { // m is a dense array
            mask = Ez.toArray(m, name, (val, nm) => {
                return Ez.toNumber(val, nm, ...Ez.defNotNeg, true);
            });
            name += " values";
            Ez._mustAscendErr(mask, name);
            if (new Set(mask).size != mask.length)
                Ez._mustBeErr(name, `unique, no duplicates: ${mask}`);
            else if (mask.at(-1) >= c)
                Ez._mustBeErr(name, `< ${c}, the max number of arguments for `
                                  + `${this.name}: ${mask}`);
        }
        else {                                // generate the dense array
            let i;
            mask = [];
            if (isAm) {                       // m is a sparse array
                for (i = 0; i < c; i++)
                    if (Is.def(m[i]))
                        mask.push(i);
            }
            else {                            // m is a bitmask
                if (this === P.transSVG && f === F.r) {
                    if (m & Ez.y)     m += Ez.y; // SVG rotate() is funky
                    if (m & Ez.x)     m += Ez.x;
                    if (m & Ez.angle) m -= Ez.angle - 1;
                }
                let j;
                for (i = 0, j = 1; i < c && j <= m; i++, j *= 2)
                    if (m & j)
                        mask.push(i);
            }
        }
        return mask;
    }
//  static _maskAll() returns a full, sequential mask, masking all arguments
    static _maskAll(l) { return Array.from({length:l}, (_, i) => i); }
//==============================================================================
//  The get functions:
//  get() is the most generic. elms can be an Element or any kind of collection
//  of Elements. It returns String or [String] by element.
    get(elms, getComputed) {
        return Ez._isElmy(elms) ? this.getOne (Ez.toElement (elms), getComputed)
                                : this.getMany(Ez.toElements(elms), getComputed);
    }
//  getMany() gets an array of values for multiple elements
    getMany(elms, getComputed) { // elms must be pre-validated as [Element]
        let i;
        const l = elms.length;
        const a = new Array(l);
        for (i = 0; i < l; i++)
            a[i] = this.getOne(elms[i], getComputed);
        return a;
    }
//  getn() wraps get() to return Number or [Number] instead of String.
    getn(elms, f, u) {
        let v = this.get(elms);
        return Is.A(v) ? this.#a2N(v, f, u) : this._2Num(v, f, u);
    }
//  _2Num() parses a string into a Number or an array of Number (and/or String
//          because toNumby() returns the original value instead of NaN). Uses
//          parseFloat(), not Number(), because it's better at parsing strings.
    _2Num(v, f, u = this._unitz(f)) {
        const arr = this.parse(v, f);
        return arr.length < 2
             ? Ez.toNumby(arr[0], f, u)
             : arr.map(n => Ez.toNumby(n, f, u));
    }
//  #a2N() is an array-based wrapper for _2Num()
    #a2N(a, f, u) { return a.map(v => this._2Num(v, f, u)); }

//  getUn() is for "unstructured" props & funcs, though it can be used with any
//  prop or func, ideally one that has numeric parameters.
    getUn(elms, getComputed) {
        let v, vals = this.get(elms, getComputed);
        const isAVals = Is.A(vals);
        if (!isAVals)
            vals = [vals];

        const arr = Array.from({length:vals.length}, (_, i) => {
            v = vals[i];
            return v ? { seps:   v.split(E.nums),         // string separators
                         vals:   v.match(E.nums) ?? [""], // numbers as strings
                         numBeg: E.numBeg.test(v),        // begins with number
                         numEnd: E.numEnd.test(v) }       // ends   with number
                     : v;
         });
        return isAVals ? arr : arr[0];
    }
//  getUnObj() is getUn() reconfigured for EFactory.create()
//!!they should be more alike, array by element of objects,
//!!.cv is not a great name outside of EFactory
    getUnToObj(o) { //!!o.cv can already have been retrieved and parsed
        o.cv     = new Array(o.l);  // 2D [elm[arg]] numeric values as strings
        o.seps   = new Array(o.l);  // 2D [elm[arg]] non-numeric separators
        o.lens   = new Array(o.l);  // 1D by elm: [o.cv[elm].length]
        o.numBeg = new Array(o.l);  // 1D begins with number (vs separator)
        o.numEnd = new Array(o.l);  // 1D ends   with number (vs separator)
        this.getMany(o.elms).forEach((v, i) => { // 1D array of strings by elm
            if (v) {
                v = v.replace(/\s\s+/g, E.sp);   // consolidate whitespace
                o.cv[i] = v.match(E.nums);
                if (!o.cv[i])
                    throw new Error(`P.${this.name}.getUnToObj(o): `
                                  + `o.elms[${i}] contains no numbers: ${v}`);
                //-----------------------------
                o.seps[i] = v.split(E.nums);
                o.lens[i] = o.cv[i].length;
                o.numBeg[i] = E.numBeg.test(v);
                o.numEnd[i] = E.numEnd.test(v);
            }
        });
    }
//  computed() wraps getComputedStyle() for one or more elements
    computed(elms) {
        if (this.isBute) return;
        //-------------------
        if (Ez._isElmy(elms))
            return getComputedStyle(Ez.toElement(elms))[this.name];
        else {
            elms = Ez.toElements(elms);
            const vals = new Array(l);
            for (let i = 0, l = elms.length, name = this.name; i < l; i++)
                vals[i] = getComputedStyle(elms[i])[name];
            return vals;
        }
    }
//  parse() parses one element's value into an array, not for multi-function
    parse(v, f = this.func) {
        if (f?.isColor)
            return f.fromColor(v, false);
        else if (v.at(-1) == E.rp)
            return v.split(E.sepfunc).slice(1, -1);
        else
            return v.split(E.comsp);
    }
//==============================================================================
//  The set() functions:
//  set() validates elms and determines if it's 1 or >1 elements
//!!It should probably validate units, v gets validated in Ez._appendUnits()
//!!I never validate func here, only in animation classes
    set(elms, v, f, u) {
        return Ez._isElmy(elms)
             ? this.setOne (Ez.toElement (elms), v, f, u)
             : this.setMany(Ez.toElements(elms), v, f, u);
    }
//  setOne() elm must be Element, v must be Number, String, or Array
    setOne(elm, v, f = this.func, u = this._unitz(f)) {
        v = Is.A(v) ? this.join(v, f) //!!inconsistent validation of u and v!!
                    : Ez._appendUnits(v, u);

        this.setIt(elm, f?.apply(v) ?? v);
    }
//  setMany() elms must be [Element]
    setMany(elms, v, f, u) {
        if (!Is.A(v))        // handle it here or inside the loop
            v = new Array(elms.length).fill(v);
        elms.forEach((elm, i) => this.setOne(elm, v[i], f, u));
    }
//  setIt() and setEm() are for when you need no validation or conversion
    setIt(elm,  val) { elm.style[this.name] = val; }
    setEm(elms, arr, l = elms.length) {
        for (var i = 0, name = this.name; i < l; i++)
            elms[i].style[name] = arr[i];
    }
//  setOneUn()
    setOneUn(elm, obj) {
        if (obj.numBeg)           // loop starts with seps, ensure seps
            obj.seps.unshift(""); // and vals are the same length.
        if (!obj.numEnd)
            obj.vals.push("");

        let i, l, str;
        for (i = 0, l = obj.vals.length, str = ""; i < l; i++)
            str += obj.seps[i] + obj.vals[i];

        this.setIt(elm, str);
    }
}