// Not exported by raf.js
import {PFactory}  from "./pfactory.js";
import {fromColor} from "./color-convert.js";

import {E, Ez, F, Fn, Is, P, Rx} from "../raf.js";

const               // style/attribute values that require getComputedStyle():
listOfValues = ["auto","inherit","initial","revert","revert-layer","unset"],
listOfFuncs  = [Fn.calc,"var","attr","max","min","clamp"];

export class PBase {    // the base class for Prop, Bute, PrAtt, HtmlBute:
    static #separator = E.sp;  // only font-family separates w/comma, and
    #func; #units;             // it's non-numeric, so no value arrays.

    // name is the CSS/SVG function name, key is a camelCase version of name
    // utype = isUn | _noU | _noUPct | _len | _lenPct | _lenPctN | _ang | _pct
    constructor(name, key, units, utype, func, multiFunc) {
        Ez.readOnly(this, "name", name);
        Ez.readOnly(this, "key",  key);
        this.#units = units;
        this.#func  = func;
        if (multiFunc)                // filter & transform, see PFactory.init()
            Ez.is(this, "MultiFunc");

        this.remove = this.cut;       // for pseudo-compatibility
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
        Ez._mustBeErr(`Invalid value: ${val}. ${name}`,
                      "a String or an instance of one of the PBase subclasses");
    }
//==============================================================================
// this.func
    get func() { return this.#func; }
    set func(val) {
        if (Is.def(val) || this.needsFunc) {
            if (!val?.isFunc)
                Ez._mustBeErr(
                    `P.${this.key}.func`,
                    `an instance of Func ${this.needsFunc ? "" : " or undefined"}`
                );
            else if (this.isColor && !val?.isCFunc)
                Ez._invalidErr("func", val?.key ?? val, PFactory.funcC,
                               `P.${this.key}.func`);
        }
        this.#func = val;
    }
// this.units
    get units()    { return this.#units; }
    set units(val) { this.#units = PFactory._validUnits(val, this.key, this); }
    set _u   (u)   { this.#units = u; } // backdoor avoids double-validation

//  _unitz() gets the active units, which might be the func's units
    _unitz(f = this.func) { return f?._u ?? this.units; }
//==============================================================================
//  join() joins an array of sub-values using the appropriate separators
    join(arr, f = this.func, u = this._unitz(f)) {
        return f ? f.join(arr, u) : Ez._join(arr, u, PBase.#separator);
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
        o.numEnd = !o.u;            // o.u is string, but can be empty
        if (o.c == 1 && o.numEnd)
            return;                 // 1 arg, no units, o.seps stays undefined
        //-------
        let c, i;
        c = o.c - o.numEnd;         // c  = arg count
        const us = Array(c--);      // us = combined units + separators
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
                m = Ez.toNumber(m, name, ...Ez.intGrThan0, true);
            } catch {
                Ez._mustBeErr(name, "a positive integer or an Array");
            }
        //-------
        let mask;
        if (isAm && !m.includes(undefined)) { // m is a dense array
            mask = Ez.toArray(m, name, (val, nm) => {
                return Ez.toNumber(val, nm, 0, ...Ez.intNotNeg, true);
            });                               // defaultValue = 0 is meaningless
            name += " values";
            Ez._mustAscendErr(mask, name);
            if (new Set(mask).size != mask.length)
                Ez._mustBeErr(name, `unique, no duplicates: ${mask}`);
            else if (mask.at(-1) >= c)
                Ez._mustBeErr(name, `< ${c}, the max number of arguments for `
                                  + `${this.key}: ${mask}`);
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
// The get functions:
//  get() is the most generic. elms can be an Element or any kind of collection
//  of Elements. It returns String or [String] by element.
    get(elms) {
        return Ez._isElmy(elms) ? this.getOne (Ez.toElement(elms))
                                : this.getMany(Ez.toElements(elms));
    }
//  getMany() gets an array of values for multiple elements
    getMany(elms) { // elms must be pre-validated as [Element]
        let i;
        const l = elms.length;
        const a = Array(l);
        for (i = 0; i < l; i++)
            a[i] = this.getOne(elms[i]);
        return a;
    }
//  getOne() overridden by Bute and HtmlBute, maybe it should always use gCS()
//           if (!isCSS), does gCS() mangle anything except color properties?
//           .style preserves units, gCS() converts units to its constant value.
    getOne(elm) {  // elm must be pre-validated as Element or CSSStyleRule
        const isCSS = Is.CSSRule(elm);
        const name  = this.name;
        let   value = elm.style[name];  // style overrides attribute in HTML/SVG
        if (value) {
            if (!isCSS && (this.isColor || this === F.colorMix)
                       && value.includes(Fn.rgb + E.lp)) {
                // elm.style converts hsl(), hwb() to rgb() or rgba()
                // parse getAttribute("style") to get the original value
                const style = elm.getAttribute("style").split(/[:;]\s*/);
                value = style[style.indexOf(this.cssName) + 1];
            }
            else { // some values and funcs require calling getComputedStyle()
                const isFunc = listOfFuncs.some(v => value.includes(v + E.lp));
                if (isFunc || listOfValues.includes(value)) {
                    if (isCSS) {        // var() is the only one that's gettable
                        const split = isFunc ? value.split(Rx.func) : [value];
                        if (split[0] != Fn.var)
                            Ez._cantErr("You", `get a numeric value from a CSSStyleRule if the property uses ${split[0]}().`
                                            +  "You must use an HTMLElement instead.");
                        else
                            value = getComputedStyle(document.documentElement)
                                                    .getPropertyValue(split[1]);
                    }
                    else                // fall back to gCS()
                        value = getComputedStyle(elm)[name];
                }
            }
        }
        else if (!isCSS) {              // && !value
            if (this.isPratt)           // fall back to attribute
                value = elm.getAttribute(name);
            if (!value)                 // fall all the way back to gCS()
                value = getComputedStyle(elm)[name];
        }
        return value.trim();            // .style and gCS() return "" for empty
    }
//  getn() wraps get() to return Number or [Number] instead of String.
    getn(elms, f, u) {
        let v = this.get(elms);
        return Is.A(v) ? v.map(w => this._2Num(w, f, u))
                       : this._2Num(v, f, u);
    }
//  _2Num() parses a string into a Number or an array of Number (and/or String
//          because toNumby() returns the original value instead of NaN). Uses
//          parseFloat(), not Number(), because it's better at parsing strings.
    _2Num(v, f, u = this._unitz(f)) {
        const arr = this.parse(v, f, u);
        return arr.length < 2
             ? Ez.toNumby(arr[0], f, u)
             : arr.map(n => Ez.toNumby(n, f, u));
    }
//  getUn() is for "unstructured" props & funcs, though it can be used with any
//  prop or func, ideally one that has numeric parameters.
    getUn(elms) {
        let v, vals = this.get(elms);
        const isAVals = Is.A(vals);
        if (!isAVals)
            vals = [vals];

        const arr = Array.from({length:vals.length}, (_, i) => {
            v = vals[i];
            return v ? { seps:   v.split(Rx.nums),         // string separators
                         vals:   v.match(Rx.nums) ?? [""], // numbers as strings
                         numBeg: Rx.numBeg.test(v),         // begins with number
                         numEnd: Rx.numEnd.test(v) }        // ends   with number
                     : v;
         });
        return isAVals ? arr : arr[0];
    }
//  getUnObj() is getUn() reconfigured for EFactory create()
    //!!they should be more alike, array by element of objects,
    getUnToObj(o, cv = this.getMany(o.elms)) {  // cv is "current value"
        o.cv     = Array(o.l);  // 2D [elm[arg]] numeric values as strings
        o.seps   = Array(o.l);  // 2D [elm[arg]] non-numeric separators
        o.lens   = Array(o.l);  // 1D by elm: [o.cv[elm].length]
        o.numBeg = Array(o.l);  // 1D begins with number (vs separator)
        o.numEnd = Array(o.l);  // 1D ends   with number (vs separator)
        cv.forEach((v, i) => {  // 1D array of strings by elm
            if (v) {            // consolidate whitespace:
                v = v.replace(/\s\s+/g, E.sp);
                o.cv[i] = v.match(Rx.nums);
                if (!o.cv[i])
                    throw new Error(`P.${this.key}.getUnToObj(o): `
                                  + `o.elms[${i}] contains no numbers: ${v}`);
                //-----------------------------
                o.seps[i] = v.split(Rx.nums);
                o.lens[i] = o.cv[i].length;
                o.numBeg[i] = Rx.numBeg.test(v);
                o.numEnd[i] = Rx.numEnd.test(v);
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
            const vals = Array(l);
            for (let i = 0, l = elms.length, name = this.name; i < l; i++)
                vals[i] = getComputedStyle(elms[i])[name];
            return vals;
        }
    }
//  parse() parses one element's value into an array
    parse(v, f = this.func, u) {
        if (this.isUn || f?.isUn)
            throw new Error("Prop.prototype.parse() is not designed for "
                + `"unstructured" ${this.isUn ? "properties" : "functions"} `
                + `such as ${this.isUn ? this.key : f.key + "()"}.`);
        else if (this.isColor)      // function, #hex, or color name
            return fromColor(v, false, f, u);
        else if (v.at(-1) == E.rp)  // non-color function
            return v.split(Rx.sepfunc).slice(1, -1);
        else                        // property or attribute value(s)
            return v.split(Rx.comsp);
    }
//==============================================================================
// The set() functions: TODO!!repair, remodel, and restore let() and net()!!
//  set() validates elms and determines if it's 1 or >1 elements
//!!It should probably validate units, v gets validated in Ez._appendUnits()
//!!I never validate func here, only in animation classes
    set(elms, v, f, u) {
        return Ez._isElmy(elms)
             ? this.setOne (Ez.toElement (elms), v, f, u)
             : this.setMany(Ez.toElements(elms), v, f, u);
    }
//  setOne() - elm must be Element, v must be Number, String, or Array
    setOne(elm, v, f = this.func, u = this._unitz(f)) { // what about arrays for multi-arg properties?
        v = Is.A(v) ? this.join(v, f) //!!inconsistent validation of u and v!!
                    : Ez._appendUnits(v, u);

        this.setIt(elm, f?.apply(v) ?? v);
    }
//  setMany() - elms must be [Element]
    setMany(elms, v, f, u) { //!!validate elms.length == v.length??
        if (!Is.A(v))        // handle it here or inside the loop
            v = Array(elms.length).fill(v);
        elms.forEach((elm, i) => this.setOne(elm, v[i], f, u));
    }
//  setIt() and setEm() are for when you need no validation or conversion
    setIt(elm, val) {
        elm.style[this.name] = val;
    }
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