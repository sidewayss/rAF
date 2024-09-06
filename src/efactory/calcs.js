// calc functions convert configs into objects used by class ECalc to run
// the necessary calculations during animation.
// cNN is the naming convention for the ECalc static calculation functions.
// The first N is the input dimensionality, the second N is output.
// vars named cN_ and c_N are input and output dimension count, respectively.
// Some calcs change their output's dimensionality. For example:
//   ECalc._c01() converts a single number to a 1D array of numbers
export {calcEaser, calcMEaser, calcByElm, calcNoElms};

import {Easer,  EaserByElm}  from "../easer/easer.js";
import {MEaser, MEaserByElm} from "../easer/measer.js";

import {PBase}  from "../prop/pbase.js";
import {Ez, Is} from "../raf.js"

const noop = {cNN:"_noop"};
//==============================================================================
// calcEaser() returns new Easer
function calcEaser(o) {
    const calcs = [];           // the target array of calc objects
    if (o.config.length) {
        let calc, cfg, dim;
        dim = 0;
        o.dims.length = 0;      // re-populated at the bottom of the loop
        for (cfg of o.config) {
            calc = initCalc(cfg.calc, dim, cfg.dim);
            calc.param = cfg.param;
            calcs.push(calc);
            dim = upDim(o, cfg, cfg.param, calc, dim, swapDims(o, cfg, calc));
            o.dims.push(dim);
        }
    }
    o.dmax = Math.max(0, ...o.dims);
    o.dmin = Math.min(0, ...o.dims);
    calcNoDims(o, calcs);
    o.calcs = calcs;
    return new Easer(o);
}
//==============================================================================
// calcMEaser() returns new MEaser
function calcMEaser(o) {
    let calc;
    const calcs = Ez.newArray2D(o.lz);
    if (o.config.length) {
        let cfg, dim, i, mask, notDimOrByElm, prm, src, swap1D;
        o.dims.length = 0;
        dim = 0;
        for (cfg of o.config) {                 // loop by config:
            src    = initCalc(cfg.calc, dim, cfg.dim);
            swap1D = swapDims(o, cfg, src);

            notDimOrByElm = !cfg.dim || cfg.byElm;  // 0D or 1D byElm
            if (notDimOrByElm)                      //!!no mask??no way...
                prm = cfg.param;
            for (i = 0; i < o.lz; i++) {            // loop by Easy:
                if (!notDimOrByElm) {
                    mask = o.easy2Mask.get(o.easies[i]);
                    if (cfg.dim == 1 || cfg.bAbE)       // 1D byArg or 2D bAbE
                        prm = meParam(cfg.param, mask); // !hasElms runs this
                    else
                        cfg.param.forEach((p, j) =>     // 2D byElmByArg
                            prm[j] = Is.A(p) ? meParam(p, mask) : p
                        );
                }
                calc = Ez.shallowClone(src);        // clone src
                calc.param = prm;
                calcs[i].push(calc);
                dim = upDim(o, cfg, prm, calc, dim, swap1D, true);
            }
            o.dims.push(dim);
        }
        o.dmax = Math.max(...o.dims);
        o.dmin = Math.min(...o.dims);
    }
    else { // no configs, easer uses raw Easy.proto.e
        o.dmax = 0;
        o.dmin = 0;
    }
    calcNoDims(o, calcs, true);
    o.calcs = calcs;
    return new MEaser(o);
}
//==============================================================================
// calcByElm() returns new EaserByElm or MEaserByElm
function calcByElm(o, isME) {
    const calcs = Ez.newArray2D(o.l); // if (isME) setCalc() overwrites calcs[i]

    o.oneD = Array(o.lm);
    if (o.config.length) {            // parse configs into calcs:
        let cfg, i, isUp, notOrByArg, prm, src,
        c_N,                          // c_N = output dim count, part of cNN
        cN_ = 0;                      // cN_ = input  ditto

        for (cfg of o.config) {       // loop byConfig: f, a, max, min
            [c_N, src, isUp] = prepCalc(cfg, isME, cN_);

            notOrByArg = !cfg.dim || cfg.byArg;
            if (notOrByArg)           // 0D or 1D byArg
                prm = cfg.param;
            for (i = 0; i < o.l; i++) {     // loop byElm:
                if (!notOrByArg) {
                    if (!cfg.bAbE)          // 1D byElm or 2D byElmByArg
                        prm = cfg.dim < 2   // prm might be undefined
                            ? cfg.param
                            : cfg.param[i];
                    else {                  // 2D byArgByElm
                        prm = Array(cfg.param.length);
                        cfg.param.forEach((p, j) => {
                            if (!Is.A(p))   // single value: fill it
                                prm[j] = p;
                            else {          // array: make a sparse copy
                                prm[j] = [];
                                if (Is.def(p[i]))
                                    prm[j][i] = p[i];
                            }
                        });
                    }
                }
                // cfg.param is always defined, but if (!Is.def(prm)): cfg.param
                // and calcs[] are sparse, and the calc object not created.
                // For MEasers, calcs array is 3D: byElm, byEasy, byConfig.
                if (Is.def(prm))
                    setCalc(o, prm, Ez.shallowClone(src), calcs, isUp, isME, i);
            }
            if (isUp)
                cN_ = c_N;
        }
    }
    else if (isME) {                  // no configs, yes easies
        src = {cNN:"_c01", param:[]};
        for (i = 0; i < o.l; i++) {      // loop byElm:
            calcs[i] = Array(o.lz);
            o.easies.forEach((ez, j) =>  // byEasy
                calcs[i][j] = [Ez.shallowClone(src, {noop:o.easy2Mask.get(ez)})]
            );                           // .noop only, .param is empty
        }
    }
    if (!isME)                        // maybe configs, no easies
        calcNoDims(o, calcs, true);

    o.calcs = calcs;
    return isME ? new MEaserByElm(o) : new EaserByElm(o);
}
//==============================================================================
// calcNoElms() returns new (M)Easer for pseudo-target, no elms|prop, yes peri()
function calcNoElms(o, isME) {
    const calcs = isME ? Ez.newArray2D(o.lz) : [];
    o.oneD = Array(o.c);
    if (o.config.length) {
        let cfg, cN_, c_N, isUp, prm, src;
        cN_ = 0;
        for (cfg of o.config) { // loop by f, a, max, min:
            [c_N, src, isUp, prm] = prepCalc(cfg, isME, cN_);
            setCalc(o, prm, src, calcs, isUp, isME);
            if (isUp)
                cN_ = c_N;
        }
    }
    calcNoDims(o, calcs);
    o.calcs = calcs;
    return isME ? new MEaser(o) : new Easer(o);
}
//==============================================================================
// Private helpers:
// calcNoDims() pushes a noop() onto each calc array for 0 => 1D conversion
function calcNoDims(o, arr, is2D) {
    if (!(o.dmax ?? Math.max(0, ...o.dims))) { // only if dmax == 0
        if (is2D)
            for (const a of arr)
                a.push(Ez.shallowClone(noop));
        else
            arr.push(Ez.shallowClone(noop));
    }
}
// initCalc() returns a baseline calc object with calc and cNN properties
function initCalc(calc, cN_, c_N) {
    return {calc:calc, cNN:`_c${cN_}${c_N}`};
}
function prepCalc(cfg, isME, cN_) {
    const
        c_N  = isME ? Math.max(cfg.dim, 1) : cfg.dim,
        src  = initCalc(cfg.calc, cN_, c_N),
        isUp = c_N > cN_,   // this iteration ups the dimensionality
        prm  = cfg.param    // only used by calcNoElms()
    ;
    return [c_N, src, isUp, prm];
}
// setCalc() sets up a calc object or calcs byEasy, and pushes it/them onto arr,
//           helps calcByElm(), calcNoElms().
function setCalc(o, prm, calc, arr, isUp, isME, i) {
    let c, mask;
    if (isUp)                   // calc ups the dimensionality, .noop required
        calc.noop = noop1D(prm, o.lm);

    if (isME) {                 // MEaser
        if (Is.def(i)) {
            if (!arr[i].length) // empty or full of o.lz arrays, not undefined
                arr[i] = Ez.newArray2D(o.lz);
            arr = arr[i];       // i doesn't change inside loop:
        }
        o.easies.forEach((ez, j) => {
            mask = o.easy2Mask.get(ez);
            c    = Ez.shallowClone(calc);
            c.param = meParam(prm, mask);
            c.noop  = calc.noop?.length ? meNoop1D(c.param, mask)
                                        : calc.noop;
            arr[j].push(c);
        });
    }
    else {                      // Easer
        if (Is.def(i))
            arr = arr[i];
        calc.param = prm;
        arr.push(calc);
    }
}
//==============================================================================
// swapDims() sets the "s" suffix on calc.CNN, indicating that the method
//            swaps dimensions. It also handles 1D byArg params when twoD is
//            bAbE, and returns a boolean indicating if that is the case.
function swapDims(o, cfg, calc) {
    const swap1D = cfg.byArg && !o.bySame;
    if (swap1D || (cfg.dim == 2 && !cfg.bAbE))
        calc.cNN += "s"
    return swap1D;
}
// upDim() handles up-dimensioning a calc, which is when the previous highest
//         cfg.dim value is exceeded by a new high and ECalc._cNN() switches
//         from storing results in thisVal to oneD or twoD or from oneD to twoD.
function upDim(o, cfg, prm, calc, dim, swap1D, isMEaser) {
    if (cfg.dim <= dim && !swap1D) return dim;
    //----------------------------------------
    let func, noop;
    if (cfg.dim == 1) {
        dim  = swap1D ? 2 : 1;
        func = isMEaser ? meNoop1D : noop1D;
        noop = func(prm, cfg.byElm ? o.l : o.lm);
    }
    else {
        const l2 = cfg.bAbE ? o.lm : o.l;
        const l1 = cfg.bAbE ? o.l  : o.lm;
        const undef = prm.length < l2
                   || prm.includes(undefined)
                   || prm.some(p => Is.A(p) && (p.length < l1
                                             || p.includes(undefined)));
        dim  = 2;
        noop = [];
        if (undef) {
            func = isMEaser ? meNoop2D : noop2D;
            for (let i = 0; i < l2; i++)
                func(prm, noop, i, l1, dim);
        }
    }
    calc.noop = noop;
    return dim;
}
//==============================================================================
// noop functions populate the calc.noop[] array:
function noop1D(prm, l) {
    const noop = [];//prm is sparse, noop is dense.
    if (Is.A(prm) && (prm.length < l || prm.includes(undefined))) {
        let i;
        for (i = 0; i < l; i++)
            if (!Is.def(prm[i]))
                noop.push(i);
    }
    return noop;
}
function noop2D(prm, noop, i, l1, dim) {
    if (Is.def(prm[i]))      // exclude start, no offset for inner dimension
        noop[i] = noop1D(prm[i], l1);
    else if (dim)            // dim = 1, fill noop with indexes
        noop[i] = PBase._maskAll(l1);
    else                     // dim = 0, undefined is not empty
        noop[i] = undefined; // see ECalc.prototype._c02() and _c02s()
}
// meNoop functions for MEaser, plus meParam()
function meNoop1D(prm, mask) {
    const noop  = [];
    for (const m of mask)
        if (!Is.def(prm[m]))
            noop.push(m);
    return noop;
}
function meNoop2D(prm, noop, i, mask, dim) {
    if (Is.def(prm[i]))
        noop[i] = meNoop1D(prm[i], mask);
    else if (dim)
        noop[i] = mask;
    else
        noop[i] = undefined;
}
function meParam(prm, mask) {
    const p = [];
    if (!Is.A(prm))             // spread single value
        for (const m of mask)
            p[m] = prm;
    else                        // mask and prm are both arrays
        for (const m of mask)
            if (Is.def(prm[m])) // prm is sparse
                p[m] = prm[m];
    return p;
}