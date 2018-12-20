////////////////////////////////////////////////////////////////////////////////
// Easy, Easee, Easer, Teaser, and Geaser classes. Part of raf.js project, but
// also standalone. Copyright (C) 2018 Sideways S. www.sidewayss.com
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
////////////////////////////////////////////////////////////////////////////////
// Lint settings
/* jshint esversion: 6 */
/* jshint strict: global */
/* jshint elision: true */
/* jshint -W014 */
/* jshint -W069 */
/* jshint -W078 */
/* jshint -W083 */
/* jshint -W117 */
/* jshint -W138 */
"use strict";
///////////////////////////////////////|||||||||||||||||||||||||||||||||||||||||
class Easer {                        // Subject of: "The easer eases the easee."
    constructor(ee, elms,            // args after elms defined only by Teaser
                func = ee.func, u = ee.units, c = ee.count,
                values, prefix, suffix,
                f   = (Is.def(values) ? undefined : ee.factor),
                a   = (Is.def(values) ? undefined : ee.addend),
                p   = (Is.def(values) ? undefined : ee.plug),
                max = (Is.def(values) ? undefined : ee.max),
                min = (Is.def(values) ? undefined : ee.min),
                b   = (c ? Attr.toBools(Attr.zap(ee.mask, f, a, p), c) : false))
    {
        if (!elms) return;           // called from new Geaser() via super()
        let d, dims, o, xv;
        let l  = elms.length;
        let bl = elms.length > 1;
        let tc = this.constructor;   // a much shorter name, and one less lookup

        this.easee = ee;    this.elms  = elms;          this.prefix = prefix;
        this.count = c;     this.func  = func;          this.suffix = suffix;
        this.units = u;     this.bools = undefined;     this.addend = undefined;
        this.max = max;     this.plug  = undefined;     this.factor = undefined;
        this.min = min;     this.turn  = undefined;     this.number = undefined;
        this.idx = 0;   this.separator = undefined;   this.computer = undefined;
        /////////////////////////////// parse the factor, addend, and plug /////
        o    = tc.zobj(max, min, a, f, p, c, b, ee.attr.plug(func));
        dims = Array.from(o, (v) => v.dims);
        d    = Math.max(...dims);
        if (ee.attr.izAll & d < 1 && !ee.mask) {
            c = undefined;           // it's not a value list this time
            o.length--;              // trims the plug out of the array
        }
        if (!c && o.length == 3 && !Is.def(a) && o[0].value == Infinity
                                && !Is.def(p) && o[1].value ==-Infinity) {
            this.type = null;     ////\ apply raw ease().value to attribute
            this.max  = o[0].value;  // 0 = max, 1 = min, 2 = addend, 3 = factor
            this.min  = o[1].value;  // if (c) {4 = plug; if (f == 1) 3 = plug;}
            Object.seal(this);       // if (factor == 1) 3 is spliced out
            return;                  // the logic gets goofy w/o this return
        }
        if (!c) {                 ////\ single value with factor/addend/plug
            if (bl)                  // izF = izFull, like the static function
                o.forEach((v) => { v.izF = Is.A(v.value); });
                                     // if any undefined, get existing values
            if (o.some(v => tc.zundef(v)))
                xv = tc.zex(elms, ee, values, true);
                                     // this.type = true|false = array|value
            this.type = o.some(v => v.izF) || (xv && xv.length > 1) || false;
            if (this.type) {         // 1D array by element
                this.number = new Array(l);
                b = Attr.toBools(null, l);
            }                        // b.true contains 100% of the indices
            o.forEach((v) => {       // it's an off-label use of Attr.toBools()
                if (this.type) {     // it makes this call to izFull() possible
                    v.bools = b.true;
                    if (v.izF)
                        v.izF &= tc.izFull(v, 1, l);
                    this[v.key] = tc.zap(v, xv, l, 0);
                }
                else                 // xv is alway an array, if it's defined
                    this[v.key] = tc.zval(v, xv ? xv[0] : undefined);
            });
            if (Is.def(this.factor)) {
                this.factor   = tc.zReplace(ee.isEnd, this.factor, this.addend);
                this.computer = this.type ? this.computeSub : this.computeOne;
            }
            else
                this.computer = this.type ? this.addSub     : this.addOne;
        }
        else {                    ////\ value list assumes factor|addend|plug
            let be, l2;
            be = ee.byElm;           // determine dimensionality and fullness
            if (b.true.length == 1) {// single sub-value has multiple syntaxes
                let i = dims.indexOf(0);
                if (i >= 0) {
                    d = Math.max(d, 1);
                    do {             // ensure that it's an array
                        o[i].value = [o[i].value];
                        o[i].dims++;
                        i = dims.indexOf(0, i + 1);
                    } while (i >= 0);
                }
                if (d > 0 && bl) {   // 1D array for one sub-value is by elm...
                    o.forEach((v) => {
                        if (v.dims == 1 && v.value.length > 1) {
                            v.tmp   = v.value;
                            v.value = new Array(c);
                            v.value[v.bools[0]] = v.tmp;
                            v.dims++;
                            d = Math.max(d, 2);
                        }            // ...convert it to 2D by sub-value by elm.
                    });
                }
            }
            d = Math.max(d, 1);      // if (c) it's a minimum of 1
            o.forEach((v) => {
                v.izF = tc.izFull(v, d, c, l, be);
            });
            if (d == 1 && bl && o.some(v => !v.izF)) {
                d++;                 // if getting existing values for >1 elm,
                o.forEach((v) => {   // it's a two-dimensional setup.
                    if (v.izF)
                        v.izF = tc.izFull(v, d, c, l, be);
                });
            }
            l2 = (d == 2 ? l : 0);  //\ get existing values?
            if (o.some(v => !v.izF)) {
                xv = tc.zex(elms, ee, values);
                if (!l2)
                    xv = xv[0];
                if (func && func.color) {
                    let isAu = Is.A(u);
                    for (let i = 0; i < l; i++) {
                        if (xv[i] && xv[i].length == 1)
                            xv[i] = func.fromColor(xv[i][0], u)
                                        .map(n => n + (isAu ? u[i] : u));
                    }
                }
            }
            o.reverse();            //\ set this.max, min, factor, addend, plug
            o.forEach((v, i) => {    // plug must be first, pre-zReplace()
                this[v.key] = tc.zap(v, xv, c, l2, be);
                if (i == 0)          // convert xv to numbers for post-plug
                    xv = tc.zReplace(3, xv, ee);
            });
            if (Is.def(this.factor)) {
                this.factor   = tc.zReplace(ee.isEnd, this.factor, this.addend);
                this.computer = (d == 2 ? this.computeElm : this.computeSub);
            }                       //\ set everything else
            else
                this.computer = (d == 2 ? this.addElm     : this.addSub);

            this.type      = d;      // this.type = 1 or 2
            this.bools     = b;
            this.number    = tc.arrayz(c, l2);
            this.separator = ee.attr.separator(ee.func);
        }
        Object.seal(this);
    } ///////////////////////////////// end constructor() //////////////////////
    /////////////////////////////////// static helpers for Easer and Geaser ////
    static arrayz(li, lo, fill) { ////\ arrayz() creates a sized/filled array
        if (Is.def(fill))           //\ li = inner length, lo = outer length
            return(lo ? Array.from({length:lo}, () => new Array(li).fill(fill))
                      : new Array(li).fill(fill));
        else                         // the outer dimension is the optional one
            return(lo ? Array.from({length:lo}, () => new Array(li))
                      : new Array(li));
    }                             ////\ zex() gets and/or parses existing values
    static zex(elms, ee, v = ee.attr.get(elms), n) {
        return n ? ee.attr.za(v, ee.func, ee.units)
                 : v.map(s => ee.attr.zparse(s, ee.func));
    }                               //\ zobj() creates and fills the o variable
    static zobj(max, min, a, f, p, hasPlug, b, pv) {
        let o = Array.from({length:hasPlug ? 5 : 4}, () => Object.create(null));
        const key  = ["max", "min", "addend", "factor", "plug"];
        const plug = [Infinity, -Infinity, , 1, ];
        o.forEach((v, i) => {
            v.key   = key[i];
            v.plug  = plug[i];
            v.value = Easer.zReplace(2, arguments[i], v.plug);
            v.dims  = Attr.dims(v.value);
            v.bools = b ? b.true : b;
        });
        o[2].plug = Attr.toNumber(pv);
        if (hasPlug) {               // zReplace(2) = undefined for addend/plug
            o[4].plug  = pv;
            o[4].bools = b.false;    // plug is the filler, not the meat
        }
        if (o[3].value == 1)         // if no factor, remove its array element,
            o.splice(3, 1);          // which is best left until the end.
        return o;
    }
    static zundef(v) {            ////\ zundef() = v.value is or has undefined?
        return v.izF ? v.value.includes(undefined) : !Is.def(v.value);
    }
    static zap(o, xv, li, lo, byElm, g) {
        if (o.izF) return o.value;////\ zap() populates factor, addend, plug
                                    //\ g == array of indices into xv: Geaser()
        let b, bi, i, j, v;
        v = Easer.arrayz(li, lo);
        for (i = 0; i < o.bools.length; i++) {
            b  = o.bools[i];
            bi = g ? g[i] : b;
            if (lo) {
              for (j = 0; j < lo; j++)
                v[j][b] = Easer.zval(o, xv[j][bi], b, j, byElm);
            }
            else   v[b] = Easer.zval(o,    xv[bi], b);
        }
        return v;
    }
    static zval(o, xv, b, j, byElm) {
        let v;                    ////\ zval() assigns a value from the correct
        switch (o.dims) {           //\ source, or one of two fallback values.
        case -1:  v = xv;          break;
        case  0:  v = o.value;     break;
        case  1:  v = o.value[b];  break;
        case  2:  v = byElm
                    ? o.value[j][b]
                    : o.value[b][j];
        }
        if (!v && v !== 0)           // double fallback: existing value, plug
            v = (xv || xv === 0 ? xv : o.plug);
        return v;
    }
    static zReplace(b, v, z) {    ////\ zReplace() handles three processes:
        if (!b)                      //#1. factor = end (versus distance)
            return v;                //#2. replace undefined with "no change"
        if (!Is.A(v)) {              //    and null with undefined = get values
            switch(b) {              //#3. convert existing values to numbers
            case 1:                  //#1. v = factor, z = addend
                return !Is.def(v) || v == 1 ? v : v - z;
            case 2:                  //#2. v = factor, addend, plug, max, or min
                return  Is.def(v) ? (v === null ? undefined : v) : z;
            case 3:                  //#3. v = factor, addend, max, or min
                return Attr.toNumber(v, z.func, z.units);
            }
        }
        let l = v.length;
        let a = new Array(l);        // handles arrays recursively
        for (let i = 0; i < l; i++)
            a[i] = Easer.zReplace(b, v[i], Is.A(z) ? z[i] : z);
        return a;
    }
    static izFull(o, d, li, lo, byElm) {
        let b, lb;                ////\ izFull() checks the contents of an array
        if (o.bools)                 // if (1D array by elm) bools == undefined
            lb = o.bools.length;     // if (d == 2 && dfap == 1) 1D array by
        if (o.dims == 1)             // sub-value only, by element not allowed.
            Easer.zSpread(o.value, o.bools, li);
        if (o.dims == d) {           // d == 1 or 2, never 0 or -1
            if (d == 1)
                b = Easer.zFu(o.value, lb);
            else if (byElm) {
                b = Easer.zFu(o.value, lb, lo);
                Easer.zSpread(o.value, o.bools, lo, li); }
            else {
                b = Easer.zFu(o.value, lo, lb);
                Easer.zSpread(o.value, o.bools, li, lo); }
        }
        return b;
    }
    static zFu(arr, li, lo) {       //\ zFu() helps izFull()
        let b = Is.A(arr) && arr.filter(v => Is.def(v)).length >= lo ? lo : li;
        if (b && lo) {
            for (let i of arr) {     // if (!Is.A(i)) it's filled by zSpread()
                if (Is.A(i) && arr.filter(v => Is.def(v)).length < li)
                    return false;
            }
        }
        return b;
    }
    static zSpread(arr, bools, lo, li, byElm) {
        let i;                    ////\ zSpread() preps an array for processing.
        if (byElm) {                //\ here, li is the optional 2nd dimension,
            arr.length = lo;        //\ elsewhere it's lo. confusing, but true.
            for (i = 0; i < lo; i++) {
                if (Is.A(arr[i]))
                    Easer.zSp(arr[i], bools, li);
                else
                    arr[i] = new Array(li).fill(arr[i]);
            }
        }
        else {
            if (arr.length < lo) {
                if (bools)           // 1D array by sub-value
                    Easer.zSp(arr, bools, lo, li);
                else
                    arr.length = lo; // 1D array by element
            }
            if (li) {                // 2D array, spread inner dimension
                for (i = 0; i < lo; i++) {
                    if (Is.A(arr[i]))
                        arr[i].length = li;
                    else
                        arr[i] = new Array(li).fill(arr[i]);
                }
            }
        }
    }
    static zSp(arr, bools, lo, li) {//\ zSp() helps zSpread()
        let bi, i;
        i = arr.length - 1;
        arr.length = lo;
        for (; i >= 0; i--) {
            bi = bools[i];
            if (bi > i) {
                arr[bi] = arr[i];
                arr[i]  = li ? [] : undefined;
            }
        }
    }
    /////////////////////////////////// apply() and compute() //////////////////
    apply(e) {                       // e = easeMe() return value
        let ee = this.easee;
        let ev = ee.evaluate(e);
        if (ev === false)   return;

        let v    = this.compute(ev);
        let isAv = Is.A(v);
        let attr = ee.attr;
        if (ee.easy.byElm) {
            if (Is.def(this.turn)) {
                let tv = this.compute(this.turn);
                if (Is.A(tv))
                    tv = tv[this.idx];
                Attr.set(attr, this.elms[this.idx], tv);
                ee.turn(this);
            }
            Attr.set(attr, this.elms[this.idx], isAv ? v[this.idx] : v);
        }
        else if (isAv)
            this.elms.forEach((elm, i) => {Attr.set(attr, elm, v[i]);});
        else
            this.elms.forEach((elm)    => {Attr.set(attr, elm, v);});

        if (ee.peri)
            ee.peri(this, e);
    }
    compute(ev) {
        switch (this.type) {
        case null:
            return this.vfps(this.vnu(ev));
        case false:
            return this.vfps(this.vnu(this.computer(ev)));
        case true:
            return Array.from({length:this.elms.length}, (_, i) =>
                   this.vfps(this.vnu(this.computer(ev, i), false, i), i));
        case 1:
            return this.vfps(
                   this.varr(this.count, ev, this.plug).join(this.separator));
        case 2:
            return Array.from({length:this.elms.length}, (_, i) =>
                   this.vfps(
                   this.varr(this.count, ev, this.plug[i], i)
                                        .join(this.separator), i));
        }
    }                            ////// "private" instance helpers for compute()
    vfps(v, i = 0) {                 // v   = value
        if (this.func)               // fps = func, prefix, suffix
            v = this.func.apply(v);
        if (this.easee.attr.isTransform)
            return this.prefix[i] + v + this.suffix[i];
        else
            return v;
    }
    varr(c, ev, p, idx) {            // arr = array, for computing value lists
        let bi, v;                   // idx is element index for 2D array
        v = new Array(c);
        if (Is.def(idx)) {
            for (bi of this.bools.true)
                v[bi] = this.vnu(this.computer(ev, bi, idx), false, idx, bi);
            for (bi of this.bools.false)
                v[bi] = this.vnu(p[bi],                      true,  idx, bi);
        }
        else {
            for (bi of this.bools.true)
                v[bi] = this.vnu(this.computer(ev, bi),      false, bi);
            for (bi of this.bools.false)
                v[bi] = this.vnu(p[bi],                      true,  bi);
        }
        return v;
    }
    vnu(v, isP, i, j) {              // nu = numbers & units, isP = isPlug
        if (isP) {                   // plugs are strings, with units
            if      (Is.def(j)) this.number[i][j] = Attr.toNumber(v);
            else if (Is.def(i)) this.number[i]    = Attr.toNumber(v);
            else                this.number       = Attr.toNumber(v);
            return v;
        }
        else {                       // non-plugs are numbers, enforce max/min
            if (Is.def(j)) {
                this.number[i][j] = Math.max(this.min[i][j],
                                    Math.min(this.max[i][j], v));
                return this.number[i][j] + this.units;
            }
            else if (Is.def(i)) {
                this.number[i]    = Math.max(this.min[i],
                                    Math.min(this.max[i], v));
                return this.number[i]    + this.units;
            }
            else {
                this.number       = Math.max(this.min, Math.min(this.max, v));
                return this.number       + this.units;
            }
        }
    }
    /////////////////////////////////// the computers return a single number ///
    computeOne(ev) {                 // ease().value, units
        return this.factor           * ev + this.addend;
    }
    computeSub(ev, sub) {            // ease().value, f/a sub-value index
        return this.factor[sub]      * ev + this.addend[sub];
    }
    computeElm(ev, sub, idx) {       // ease().value, f/a sub index, elm index
        return this.factor[idx][sub] * ev + this.addend[idx][sub];
    }
    addOne(ev)           { return      ev + this.addend;           }
    addSub(ev, sub)      { return      ev + this.addend[sub];      }
    addElm(ev, sub, idx) { return      ev + this.addend[idx][sub]; }
}             ///////////////////////// end class Easer ||||||||||||||||||||||||
///////////////////////////////////////|||||||||||||||||||||||||||||||||||||||||
class Geaser extends Easer {         // Easer for CSS gradients and for the SVG
    constructor(ee, elms) {          // <path d> and <poly* points> attributes.
        let b, bi, c, f, i, j, k, l, la, lb, lp, m, n1, nb, ne, o, p, s, v, x;
        super(ee);                   // only one arg: creates this and returns
        l  = elms.length;            // if (>1 elms) value structure cannot vary
        f  = ee.func;
        x  = ee.attr.getu(elms);     // x = parsed existing values object
        m  = Is.A(ee.mask) ? ee.mask : [ee.mask];
        la = m.length;               // mask = array of indices into x.nums[i][]
        nb = Number(x.numBeg && (m[0] == 0));
        ne = x.numEnd && (m[la-1] == x.nums[0].length - 1);
        c  = la * 2 - (nb && ne) + !(nb || ne);
        lp = c - la;                 // addend/plug are interwoven, every other:
        p  = Easer.arrayz(c, l, ""); // their lengths might differ by 1, and
        b  = Object.create(null);    // either one can appear first and/or last.
      //b.bools = Array.from({length:c }, (_, i) => (nb + i) % 2);
        b.true  = Array.from({length:la}, (_, i) => !nb + (i * 2));
        b.false = Array.from({length:lp}, (_, i) =>  nb + (i * 2));
                                     // parse the addend, factor, max, and min
        o = this.constructor.zobj(ee.max, ee.min, ee.addend, ee.factor,
                                  false,  false,  b, ee.attr.plug());
        o.forEach((v) => {           // using numbers, not strings
            v.izF       = Easer.izFull(v, 2, c);
            this[v.key] = Easer.zap(v, x.nums, c, l, ee.byElm, m);
        });
        n1 = nb - 1;                 // parse the plug, using string values
        lb = b.false.length;
        for (i = 0; i < l; i++){
            v = x.vals[i];
            s = x.seps[i];
            for (j = n1; j < lb; j++) {
                bi = b.false[j];     // j can start at -1
                lp = m[j + 1] || v[i].length;
                for (k = (j < 0 ? 0 : m[j] + 1); k < lp; k++)
                    p[i][bi] += s[i][k] + v[i][k];
                p[i][bi] += s[i][k];
            }
        }
        this.type = 2;               // always all 2D arrays
        this.plug = p;       this.bools = b;    this.easee = ee;
        this.elms = elms;    this.count = c;    this.units = "";

        this.number    = this.constructor.arrayz(c, l);
        this.computer  = this.factor ? this.computeElm : this.addElm;
        this.separator = "";
        Object.seal(this);
    }
}             ///////////////////////// end class Geaser |||||||||||||||||||||||
///////////////////////////////////////|||||||||||||||||||||||||||||||||||||||||
class Teaser {                       // Easer for transforms, wraps 1+ Easers in
    constructor(ee, elms) {          // this.easers by Func instance.
     let a, b, bfc, c, f, fc, fi, fn, func, i, l, m, max, min, p, pre, suf, val;
        this.easee  = ee;
        this.elms   = elms;
        this.easers = new Map();     // key = Func, value = Easer
        this.values = new Map();     // multi-easers: previous frame's values
        this.idx    = 0;
        func = ee.func;
        if (!Is.A(func))
            func = [func];
        this.funcs = func;           // one func per writable function
        fc  = func.length;           // func count
        bfc = fc > 1;                // it's an array even if it's only one func
        c   = Array.from({length:fc}, (_, i) => ee.attr.count(func[i]));
        l   = elms.length;           // new Easer() arrays by func by element
        pre = Easer.arrayz(l, fc, "");
        suf = Easer.arrayz(l, fc, "");
        val = Easer.arrayz(l, fc, "");
        if (!ee.set) {              //\ get existing values by element
            let v = ee.attr.get(elms);
            if (v) {
                let felm, j, k, s, z;// this.felms = by elm by func, for apply()
                this.felms = new Array(l);
                                     // loop by element: parse existing values
                for (i = 0; i < l; i++) {
                    if (v[i]) {      // split into duples: func.name, arg(s)
                        felm = new Set();
                        p = "";      // every has prefix, only last has suffix
                        z = -1;      // z tracks last func index for suffix
                        s = v[i].split(E.func);
                        s.length--;  // always an extra trailing array element
                                     // parse one value: maintain func order
                        for (j = 0, k = 0; j < s.length; j++) {
                            fn = s[j++].trim();
                            fi = func.indexOf(FN[fn]);
                            if (fi >= 0) {
                                felm.add(FN[fn]);
                                val[fi][i] = s[j].trim();
                                pre[fi][i] = p;
                                p = "";
                                z = fi;
                                k++;
                            }
                            else
                                p += fn + E.lp + s[j] + E.rp + E.sp;
                        }
                        if (p && z >= 0)
                            suf[z][i] = E.sp + p.trimEnd();
                        if (k < fc) {// push non-existent funcs to the end
                            for (j of func)
                                felm.add(j);
                        }
                        this.felms[i] = Array.from(felm);
                    }                // end if (v[i])
                    else             // else no existing value for this element
                        this.felms[i] = func;
                }                    // end for (i by element)
            }                        // end if (v): !v same as (ee.set == E.set)
        }                           //\ end if (!ee.set) get existing values
        for (i = 0; i < fc; i++) {  //\ compute the bools and create the Easers
            fi = func[i];
            fn = fi.name;
            if (bfc) {
                f = Attr.ztf(ee.factor, fi, i);  m   = Attr.ztf(ee.mask, fi, i);
                a = Attr.ztf(ee.addend, fi, i);  max = Attr.ztf(ee.max,  fi, i);
                p = Attr.ztf(ee.plug,   fi, i);  min = Attr.ztf(ee.min,  fi, i);
            }
            else {
                f = ee.factor;   p = ee.plug;   max = ee.max;
                a = ee.addend;   m = ee.mask;   min = ee.min;
            }
            if (c[i]) {              // compute b: the bools object for fi
                m = Attr.svgRot(ee.attr.svg, fi, m, l, f, a, p);
                b = Attr.toBools(m, c[i]);
            }
            this.easers.set(fi,      // one easer per func
                new Easer(ee, elms, fi,
                          Is.A(ee.units) ? ee.units[i] : undefined,
                          c[i], val[i], pre[i], suf[i], f, a, p, max, min, b));
        }
        Object.seal(this);
    }
    /////////////////////////////////// end constructor() //////////////////////
    apply(e) { //////////////////////// apply() maintains func order by element
        let ee, ev, ez, v;
        ee = this.easee;
        ez = ee.eases;
        v  = new Map();
        if (e) {                    //\ compute & store values by Func instance
            if (ez)                  // if (ez) then multiple eases, processed
                return this;         // at the end of easeEm(), using each ez.e
            ev = ee.evaluate(e);     // property, and evaluate(noFalse = true).
            if (ev === false)
                return;              // noop
            this.easers.forEach((er, f) => { v.set(f, er.compute(ev)); });
        }
        else {                       // process multiple eases
            this.easers.forEach((er, f) => {
                e  = ez.get(f).e;
                ev = ee.evaluate(e);
                v.set(f, ev === false || e.status == E.pausing
                       ? this.values.get(f) : er.compute(ev));
            });
            this.values = v;
        }                           //\ apply the values to the elements
        if (ee.easy.byElm) {         // easy.byElm is loop by element
            if (Is.def(this.turn)) { // at the turning point, set values on two
                let tv = new Map();  // elements: current and next//!!easy.break
                this.easers.forEach((er, f) => {
                    tv.set(f, er.compute(this.turn));
                });
                this.applyOne(ee.attr, tv, this.idx);
                ee.turn(this);
            }
            this.applyOne(ee.attr, v, this.idx);
        }
        else {
            for (let i = 0; i < this.elms.length; i++)
                this.applyOne(ee.attr, v, i);
        }
        if (ee.peri)                //\ run the callback
            ee.peri(this, e);
    }
    applyOne(attr, v, i) { ////////// applyOne() helps apply()
        let j, s, vf;
        for (s = "", j = 0; j < this.funcs.length; j++) {
            vf = v.get(this.felms ? this.felms[i][j] : this.funcs[j]);
            s += (Is.A(vf)  ? vf[i] : vf) + E.sp;
        }
        Attr.set(attr, this.elms[i], s.trimEnd());
    }
}             ///////////////////////// end class Teaser |||||||||||||||||||||||
///////////////////////////////////////|||||||||||||||||||||||||||||||||||||||||
class Easee {                        // Object of: "The easer eases the easee."
    constructor(o, ez) {
        this.set = o.set;    this.attr = o.attr;    this.easy = ez;
        this.min = o.min;    this.mask = o.mask;    this.peri = o.peri;
        this.max = o.max;    this.plug = o.plug;    this.eval = o.eval;
        this.gpu = o.gpu;            // invert the leg value to simplify apply()
        this.leg = o.leg == E.return  ? E.outward
                 : o.leg == E.outward ? E.return  : undefined;

        this.value = Is.def(o.value) ? o.value : (o.eval ? true : undefined);
        this.func  = o.func  || o.attr.func;
        this.units = o.units || o.attr.unitz(this.func);
        this.byElm = o.byElm || o.byElement;
        this.is1m  = o.is1m  || o.oneMinus || o.complement;
        this.isEnd = Number(o.isEnd || Is.def(o.end));
        this.count = o.attr.count(o.func);
        this.isGDP = o.attr.isDPoints || (o.func && o.func.isGradient)
                  || o.set == E.net; // forces Geaser: dx, dy, x, y, rotate are
                                     // optionally unstructured w/<text>,<tspan>
        this.addend = Is.def(o.addend) ? o.addend : o.start;
        this.factor = Is.def(o.factor) ? o.factor
                       : Is.def(o.end) ? o.end : o.distance;
                                     // this syntax gets existing factors (null)
        if (!Is.def(this.factor) && this.is1m && this.addend === 0)
            this.factor = null;
                                     // elms must be processed second-to-last
        this.constructor.elmz(this, o.elm || o.elms || o.element || o.elements);

        this.eases = o.eases || o.easy;
        if (this.eases) {            // multi-ease transforms processed last
            if (Is.A(this.eases)) {  // there must be >1 func, and func is array
                let fez = new Map(); // this.eases ends up as a map Func => Easy
                this.func.forEach((f, i) => {
                    fez.set(f, this.eases[i] || ez);
                    if (this.eases[i])
                        this.eases[i].targets.push(this);
                });
                this.eases = fez;
            }
            else {
                if (!Is.def(this.eases.get)) {
                    let fez = new Map();
                    Object.entries(this.eases).forEach(([fn, easy]) => {
                        fez.set(FN[fn], easy);
                        easy.targets.push(this);
                    });
                    this.eases = fez;
                }
                this.func.forEach((f) => {
                    if (!this.eases.has(f))
                        this.eases.set(f, ez);
                });
            }
        }
        Object.seal(this);
    }
    /////////////////////////////////// for reusing an instance w/alternate elms
    set    elms(elms) { this.constructor.elmz(this, elms); }
    static elmz(ee, elms) {          // kludgy to call setter from constructor
        elms = Attr.elmArray(elms);
        ee.easer = !elms ? elms : (ee.attr.isTransform ? new Teaser(ee, elms)
                                           : (ee.isGDP ? new Geaser(ee, elms)
                                                       : new  Easer(ee, elms)));
    }
    /////////////////////////////////// used by Easer and Teaser.apply() ///////
    evaluate(e) {
        if (this.leg == e.status    // this.leg is reversed: outward vs return
        || (this.leg == E.return && e.status == E.arrived)
        || (this.eval && this.eval(e) !== this.value))
            return false;
        else
            return this.is1m ? 1 - e.value : e.value;
    }
    turn(er) {                       // for loops by element, er = easer
        if (++er.idx == er.elms.length)
            er.idx = 0;
        er.turn = undefined;
    }
}             ///////////////////////// end class Easee ||||||||||||||||||||||||
/////////////////////////////////////|||||||||||||||||||||||||||||||||||||||||||
class Easy {                         // Outermost in the Easy instance hierarchy
    constructor(zero = 0, time = 0, type = E.in,  pow = 1, start, end, wait = 0,
      /* trip()     */  mid, pause, type2= type,  pow2= pow,      end2,
      /* looping    */  turns = 1, breaK, byElm,
      /* callbacks  */  pre, peri, post,
      /* RAF.test() */  gpu)
    {
        this.zero = zero;    this.type  = type;     this.pow  = pow;
        this.time = time;    this.type2 = type2;    this.pow2 = pow2;
        this.wait = wait;    this.byElm = byElm;    this.pre  = pre;
        this.dly  = wait;    this.break = breaK;    this.peri = peri;
        this.mid  = mid;     this.turns = turns;    this.post = post;
        this.gpu  = gpu;     this.volte = turns;    this.fois = turns;
                                     // volte = Italian, fois = French
        this.targets = [];           // targets is an array of Easee instances
        if (type == E.increment) {
            this.increment = pow;    // fully encapsulating incremental value
            this.base      = 0;      // changes means managing a base value too.
        }
        else if (Is.def(end)) {      // if (!Is.def(end)) start is ignored
            this.start = Is.def(start) ? start : 0;
            this.dist  = end - this.start;
            this.end   = end;
        }
        else {
            this.start = 0;
            this.end   = 1;
        }

        if (!mid) {                  // one-way, one-leg trip
            this.func  = this.ease;
            this.pause = 0;
        }
        else {                       // two-leg trip, round-trip or otherwise
            this.func  = this.trip;
            this.pause = pause ? mid + pause : mid;
            this.time2 = time - this.pause;
            if (Is.def(end2)) {      // return destination fully specified
                this.dist2 = end2 - end;
                this.end2  = end2;
            }
            else if (this.dist) {    // default to round trip
                this.dist2 = this.dist * -1;
                this.end2  = this.start;
            }
            else {                   // fall back to raw ease() return value
                this.dist2 = -1;
                this.end2  =  0;
            }
        }
    } ///////////////////////////////// this is extensible, not sealed /////////
    static create(o) {  /////////////// create() has named args, flex arg order
        return new Easy(o.zero, o.time,
                        o.increment ? E.increment : o.type,
                        o.increment || o.pow,
                        o.start, o.end,  o.wait, o.mid, o.pause,
                        o.type2, o.pow2, o.end2,
                        o.turns || o.plays || o.repeats + 1 || undefined,
                        o.break,
                        o.byElm || o.byElement,
                        o.pre, o.peri, o.post, o.gpu);
    }
    /////////////////////////////////// reuse() resets the basics to go again //
    reuse(time = this.time, wait = this.dly) {
        this.time  = time;           // dly = "delay", synonym of "wait"
        this.wait  = wait;           // this.wait gets set to 0 in easeMe()
        this.turns = this.fois;      // .turns and .wait have backup values
        if (!Is.def(this.zero) || this.zero)
            this.zero = 0;           // preserve null and false values
        if (this.increment)
            this.base = 0;
    }
    /////////////////////////////////// .total & Easy.last() help set this.post
    static last(it) {
        let ez;
        it.forEach((v) => { if (!ez || ez.total <= v.total) ez = v; });
        return ez;
    }
    get total() { return this.wait + this.time; }
    /////////////////////////////////// 4 ways to add a target (class Easee) ///
    add(o) {                         //#1. flex arg order, named args, alt names
        let ee = new Easee(o, this); // ...see Easee.constructor() for alt names
        this.targets.push(ee);
        if (this.byElm && ee.easer) {//    if (!o.elms) ee.easer = undefined
            this.turns = Math.max(this.turns,
                                  this.volte * ee.easer.elms.length);
            this.fois  = this.turns;
        }
        return ee.easer || ee;
    }
                                     //#2. By: factor is multiplier, distance
    addBy(attr, elms, factor, addend, func, mask, plug, units) {
        return this.constructor.zadd(this,  0, arguments);
    }
                                     //#3. To: end is endpoint, destination
    addTo(attr, elms, end,    start,  func, mask, plug, units) {
        return this.constructor.zadd(this,  1, arguments);
    }
                                     //#4. 1m: 1 - ease().value, the complement
    add1m(attr, elms, factor, addend, func, mask, plug, units) {
        return this.constructor.zadd(this, -1, arguments);
    }
    static zadd(ez, type, args) {    // a helper for the addXX() functions
        let o   = Object.create(null);
        o.isEnd = type > 0;
        o.is1m  = type < 0;   o.factor = args[2];   o.mask  = args[5];
        o.attr  = args[0];    o.addend = args[3];   o.plug  = args[6];
        o.elms  = args[1];    o.func   = args[4];   o.units = args[7];
        return ez.add(o);
    }
    /////////////////////////////////// the animation methods //////////////////
    static easeEm(it, now) {         //\ Easy.easeEm() is the batch easeMe()
        let combo, e, i, v;          //\ Em = 'em = them, it = iterable
        v = { status:E.arrived };    // default return value is safest, simplest
        if (!Is.A(it))               // array, map, set, object, or error
            it = it.values() || Object.values(it);

        combo = new Set();
        for (i of it) {
            if (Is.def(i.zero)) {
                e = i.easeMe(now, combo);
                if (!e.status)       // final value set, stop animating i
                    i.zero = undefined;
                if (e.status > v.status)
                    v = e;
            }
        }
        combo.delete(undefined);     // combined transforms
        combo.forEach((t) => { t.apply(); });

        return v;                    // one e returned, the rest are in it[n].e
    }
    easeMe(now, combo = new Set()) {//\ easeMe() calculates and applies values
        switch (this.zero) {         // this.zero should never be NaN
        case null:                   // undefined = pre-handled by Easy.easeEm()
            break;                   // null      = now is already adjusted
        case false:                  // false     = run once, set final values
            now = Infinity;          // 0         = set it to now, skip 1st frame,
            break;                   //             because timeStamp was unknown.
        case 0:                      // truthy    = use it to adjust now
            this.zero = now;
            if (this.pre && !this.wait)
                this.pre(this);
            return      { status:E.outward, value:(this.start || 0) };
        default:
            now -= this.zero;
        }
        if (this.wait) {             // wait is handled here, not ease()
            if (this.wait > now)
                return  { status:E.waiting, value:(this.start || 0) };
            if (this.pre)
                this.pre(this);
            this.zero += this.wait;
            now       -= this.wait;
            this.wait  = 0;
        }
        let e = this.func(now);
        if (e.status !== E.pausing && !this.noop)
            this.targets.forEach((t) => { combo.add(t.easer.apply(e)); });
        if (this.peri)
            this.peri(this);         // peri() runs every time after apply()
        if (!e.status && this.post)
            this.post(this);
        return e;
    }
    /////////////////////////////////// the easing methods /////////////////////
    // ease(now, duration, type, power, start, distance, end)
    //  now   == elapsed animation time (milliseconds)
    //  time  == animation duration
    //  type  == E.in, E.out, E.increment : E.in = default = 0 = falsy
    //  pow   == power for Math.pow()
    //  start == optional starting point, required if dist specified
    //  dist  == optional distance, required if start specified
    //  end   == optional cached version of start + dist
    //  returns: {value, status}
    //   status: 0 = ending (E.arrived), 4 = running (E.outward)
    ////////////////////////////////////////////////////////////////////
    // trip() goes there and back, it has the same args as ease() plus:
    //  mid   = required end time for go portion
    //  pause = optional wait time between go and return portions
    //  type2, pow2, dist2, end2 are optional return leg values
    //  additional statuses: 3 = E.mid, 2 = E.pausing, 1 = E.return
    //  easeMe() returns the one remaining status val: 5 = E.waiting
    ease(now, time = this.time,  type = this.type, pow = this.pow,
             start = this.start, dist = this.dist, end = this.end)
    {
        let e, n, v;
        if (now >= time) {           // now always < time if outward leg of trip
            v = this.increment ? this.base + this.increment : end;
            if (--this.turns > 0) {
                if (this.zero !== false)
                    this.zero += this.time;
                now -= time;         // if (return leg) time != this.time
                if (this.mid) {      // if (return leg) flip direction
                    this.pastMid = false;
                    if (this.increment)
                        this.increment *= -1;
                    else {
                        start = this.start;
                        dist  = this.dist;
                    }
                }
                if (this.byElm)
                    this.targets.forEach((t) => { t.easer.turn = v; });
            }
            else
                e = {status:E.arrived} ;
        }
        if (!e) {
            e = {status:E.outward};
            if (!this.noop) {
                if (this.increment) {
                    this.base += this.increment;
                    v = this.base;   // better than updating easer.addend
                }
                else {
                    n = now / time;
                    v = type ? 1 - Math.pow(1 - n, pow) : Math.pow(n, pow);
                    if (dist)
                        v = start + (dist * v);
                }
            }
        }
        if (now < Infinity)          // Infinity == jump to end, but
            this.now = now;          // leave this.now intact.

        e.value = v;
        this.e  = e;
        return e;
    }
    trip(now) {
        let e;
        if (now < this.mid)          // if (!pause) it never arrives at end
            return this.ease(now, this.mid);
        if (now < this.pause) {
            e = {value:(this.increment ? 0 : this.end)};
            if (this.pastMid)
                e.status = E.pausing;
            else {
                e.status = E.mid;
                if (this.increment)
                    this.increment *= -1;
                this.pastMid = true;
            }
            return e;
        }
        now -= this.pause;
        e    = this.ease(now, this.time2, this.type2, this.pow2, this.end,
                              this.dist2, this.end2);
        if (e.status)
            e.status = E.return;
        return e;
    }
} ///////////////////////////////////// end class Easy |||||||||||||||||||||||||
