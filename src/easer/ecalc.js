import {Is} from "../raf.js";

// Not exported by raf.js
export class ECalc {
    #calcs; #oneD; #twoD; #value;
    constructor(o, calcs = o.calcs) {
        for (const c of calcs)
            c.cNN = ECalc[c.cNN]; // convert string to static function
        this.#calcs = calcs;
        this.#value = undefined;
        if (o.calcByElm || !o.l)
            this.#oneD = o.oneD;
        else {
            this.#twoD = o.twoD;
            if (o.dmin < 2) {
                this.#oneD = Array(o.l1);
                if (!o.dmax || o.bySame)
                    if (o.easies)
                        for (const ez of o.easies)
                            for (const m of o.easy2Mask.get(ez))
                                this.#twoD[m] = this.#oneD;
                    else
                        this.#twoD.fill(this.#oneD);
            }
        }
        Object.seal(this);
    }
    static f(a, b) { return a * b; } // factor
    static a(a, b) { return a + b; } // addend

    calculate(ev) {
        this.#value = ev;
        for (const c of this.#calcs)
            this.#value = c.cNN(c, c.calc, this.#value, this.#oneD, this.#twoD);
    }
//==============================================================================
// The cNN functions: calculate() cycles through these functions, up to four of
// them, for factor, addend, max, and/or min. The first N, cN_, is the number of
// array dimensions for the cached value: #value, #oneD, #twoD. The second N,
// c_N, is the the number of dimensions for c.param. The "s" suffix means "swap"
// dimensions. _c11() & _c22() don't use .noop because the .noop array slots are
// already populated and .param doesn't touch them.
// These functions use forEach() because it excludes empty array elements and
// c.param is sparse. forEach() is also convenient and compact where there are
// >1 callback arguments. If the performance is deemed problematic, then you can
// convert to for() loops, but the c.param loops will have to explicitly exclude
// undefined elements. c.noop, twoD, and oneD are dense.
// twoD callback arguments: a is for argument index, e is for element index
//==============================================================================
    static _c00(c, calc, thisVal) {  // the only one that returns a value
        return calc(c.param, thisVal);
    }
    static _c01(c, calc, thisVal, oneD) {
        c.param.forEach((p, i) =>    // iterate c.param because it's sparse
            oneD[i] = calc(p, thisVal)
        );
        for (const n of c.noop)
            oneD[n] = thisVal;
    }
    static _c01s(c, calc, thisVal, _, twoD) {
        c.param.forEach((p, a) =>
            twoD[a].fill(calc(p, thisVal))
        );
        for (const n of c.noop)
            twoD[n].fill(thisVal);
    }
    static _c02(c, calc, thisVal, _, twoD) {
        let n
        c.param.forEach((p, a) => {
            if (Is.A(p))
                p.forEach((q, e) => twoD[a][e] = calc(q, thisVal));
            else
                twoD[a].fill(calc(p, thisVal));
        });
        c.noop.forEach((p, a) => {   // c.noop = 2D, sparse outer, dense inner
            if (p)                   // p = array or undefined
                for (n of p)
                    twoD[a][n] = thisVal;
            else
                twoD[a].fill(thisVal);
        });
    }
    static _c02s(c, calc, thisVal, _, twoD) {
        let arr, n;
        c.param.forEach((p, e) => {
            if (Is.A(p))
                p.forEach((q, a) => twoD[a][e] = calc(q, thisVal));
            else                     // twoD is empty until now
                for (arr of twoD)
                    arr[e] = calc(p, thisVal);
        });
        c.noop.forEach((p, e) => {
            if (p)
                for (n of p)
                    twoD[n][e] = thisVal;
            else                     // twoD is still sparse
                for (arr of twoD)
                    arr[e] = thisVal;
        });
    }
    static _c10(c, calc, _, oneD) {
        oneD   .forEach((v, i) => oneD[i] = calc(c.param, v));
    }
    static _c11(c, calc, _, oneD) {
        c.param.forEach((p, i) => oneD[i] = calc(p, oneD[i]));
    }
    static _c11s(c, calc, _, oneD, twoD) {
        let n;                       // param byArg, oneD byElm
        c.param.forEach((p, a) =>
            oneD.forEach((v, e) => twoD[a][e] = calc(p, v))
        );
        for (n of c.noop)
            oneD.forEach((v, e) => twoD[n][e] = v);
    }
    static _c12(c, calc, _, oneD, twoD) {
        let n;
        c.param.forEach((p, a) => {
            if (Is.A(p))
                p   .forEach((q, e) => twoD[a][e] = calc(q, oneD[e]));
            else
                oneD.forEach((v, e) => twoD[a][e] = calc(p, v));
        });
        c.noop.forEach((p, a) => {   // p = array, never undefined
            for (n of p)
                twoD[a][n] = oneD[n];
        });
    }
    static _c12s(c, calc, _, oneD, twoD) {
        let arr, n;                  // param byElmbyArg, oneD byElm
        c.param.forEach((p, e) => {
            if (Is.A(p))
                p.forEach((q, a) => twoD[a][e] = calc(q, oneD[e]));
            else                     // twoD is empty until now
                for (arr of twoD)
                    arr[e] = calc(p, oneD[e]);
        });
        c.noop.forEach((p, e) => {
            for (n of p)
                twoD[n][e] = oneD[e];
        });
    }
    static _c20(c, calc, _, __, twoD) {
        for (const arr of twoD)
            arr.forEach((v, e) => arr[e] = calc(c.param, v));
    }
    static _c21(c, calc, _, __, twoD) {
        let arr;
        c.param.forEach((p, e) => {
            for (arr of twoD)
                arr[e] = calc(p, arr[e]);
        });
    }
    static _c21s(c, calc, _, __, twoD) {
        c.param.forEach((p, a) =>
            twoD[a].forEach((v, e, arr) => arr[e] = calc(p, v))
        );
    }
    static _c22(c, calc, _, __, twoD) {
        c.param.forEach((p, a) => {
            if (Is.A(p))
                p.forEach((q, e) => twoD[a][e] = calc(q, twoD[a][e]));
            else
                twoD[a].forEach(
                         (v, e, arr) => arr[e] = calc(p, v));
        });
    }
    static _c22s(c, calc, _, __, twoD) {
        let arr;
        c.param.forEach((p, e) => {
            if (Is.A(p))
                p.forEach((q, a) => twoD[a][e] = calc(q, twoD[a][e]));
            else
                for (arr of twoD)
                    arr[e] = calc(p, arr[e]);
        });
    }
    // _noop() works for 1D & 2D setups because twoD is already filled with oneD
    static _noop(_, __, thisVal, oneD) { oneD.fill(thisVal); }
}