export {endToDist};

import {faDelete} from "./urcfa.js";

import {Is} from "../globals.js";
import {Ez} from "../ez.js";
//==============================================================================
// endToDist() converts factor from end to distance, if addend is undefined it
//             defaults to zero and end already equals distance.
//             User property is end or distance, run-time factor is distance.
//
//  Every end value must have a corresponding start value in order to calculate
//  distance. There's no way to default to the parent Easy's distance because
//  there can be multiple parent Easys and none are available here.
//  To properly calculate distance, factor.dim must be >= addend.dim.
//  For example, consider a single end value with multiple start values:
//    the result requires as many distances as there are start values
function endToDist(o) {
    if (!o.isTo || !Is.def(o.a)) return;
    //---------------
    let fp, idx, prm, val;
    const
    config = o.config,
    f  = config[0],       // factor calculates first, then addend
    a  = config[1],
    ap = a.param;         // config[n].param is a sparse array
    fp = f.param;         // the source for end = the target for distance

    if (f.dim < a.dim) {  // increase dimensionality of f.param to match a.param
        if (!f.dim || f.byElm == a.bAbE) {
            if (a.dim - f.dim == 1) {
                if (!f.dim) {         // 0 to 1 dims
                    prm = toDistMap(ap, fp);
                    f.byElm = a.byElm;
                    f.byArg = a.byArg;
                }
                else {                // 1 to 2 dims
                    prm = ap.map(p => fp.map((q, i) => q - defaultToZero(p[i], i)));
                    f.bAbE = a.bAbE;
                }
            }
            else {                    // 0 to 2 dims
                prm = ap.map(p => Is.A(p) ? toDistMap(p, fp) : fp - p);
                f.bAbE = a.bAbE;
            }
        }
        else {                        // 1 to 2 dims, swap dimensions
            prm = fp.map((p, i) =>
                    Is.A(ap[i]) ? ap[i].map(q => p - q)
                                : p - defaultToZero(ap[i], i));
            delete f.byElm;
            delete f.byArg;
            f.bAbE = a.bAbE;
        }
        f.dim   = a.dim;
        f.param = prm;
    }
    else {//f.dim >= a.dim
        if (f.dim == a.dim && f.byElm != a.byElm) {
            prm = Array.from({length:ap.length}, () => fp.slice());
            if (f.byArg)        // mismatched 1D arrays: f.dim must be >= a.dim,
                delete f.byArg; // so factor bumps up to 2D.
            else {
                delete f.byElm;
                f.bAbE = true;  // in spite of !o.bAbE
            }
            f.dim   = 2;
            f.param = prm;
            fp = prm;
        }
        switch (f.dim) {
        case 0:
            f.param -= ap;
            break;
        case 1:
            !a.dim ? toDistVal    (fp, ap)
                   : toDistDefZero(fp, ap);
            break;
        case 2:
            if (!a.dim)
                fp.forEach((p, i) =>
                    Is.A(p) ? toDistVal(p, ap)
                            : p[i] -= ap);
            else if (a.dim == 1) {
                if (f.bAbE == a.byElm)
                    fp.forEach((p, i) =>
                        Is.A(p) ? toDistDefZero(p, ap)
                                : fp[i] = toDistMap(ap, p));
                else // mismatched dims
                    fp.forEach((p, i) => {
                        val = defaultToZero(ap[i], i);
                        Is.A(p) ? toDistVal(p, val)
                                : fp[i] -= val;
                    });
            }
            else if (f.bAbE == a.bAbE)
                fp.forEach((p, i) => {
                    prm = ap[i];
                    val = Is.A(prm);
                    if (Is.A(p))
                        p.forEach((_, j) =>
                            p[j] -= defaultToZero(prm, i, j, val));
                    else
                        fp[i] = val ? toDistMap(prm, p)
                                    : fp[i] - prm;
                });
            else                // mismatch: maskCV() or 1D arrays above
                fp.forEach((p, i) => {
                    if (Is.A(p))
                        p.forEach((_, j) => {
                            prm   = ap[j];
                            p[j] -= defaultToZero(prm, j, i, Is.A(prm));
                        });
                    else
                        fp[i] = ap.map(q =>
                                    Is.def(q[i]) ? p - q[i] : undefined);
                });
        }                       // end switch (f.dim)
    }                           // end f.dim >= a.dim

    // Distance = factor cannot be zero, and in arrays that translates to an
    // empty element. Converting from zero or undefined to empty is delete().
    // If the right combination of param array elements is empty, then it's
    // time to remove those empty elements and splice out the mask indexes too.
    switch (f.dim) {
    case 0:                     // factor.param is a number
        if (!fp)
            throw new Error("The distance between start and end is zero.");
        break;
    case 1:                     // factor.param is a 1D array
        prm = faDelete(fp);
        if (prm.length && f.byArg)
            for (idx of prm.reverse())
                spliceMask(o, config, idx);
        break;
    case 2:                     // factor.param is a 2D array
        if (fp.bAbE) {          // byArgByElm
            val = [];           // to-be-spliced indexes, sorted descending
            fp.forEach((p, i) => {
                prm = faDelete(p);
                if (prm.length == p.length)
                    val.unshift(i);
            });
            for (idx of val)    // splice the outer dimension
                spliceMask(o, config, idx);
        }
        else {                  // byElmByArg
            for (val of fp)     // convert them all up front
                faDelete(val);
                                // splice across elms, in inner arg dimension
            for (idx = o.lm - 1; idx >= 0; idx--)
                spliceMask(o, config, idx);
        }
    }
}
function toDistMap(arr, val) {  // returns a new array
    return arr.map(v => val - v);
}
function toDistVal(arr, val) {  // modifies arr in-place
    arr.forEach((_, i) => arr[i] -= val)
}
function toDistDefZero(arr, val) {
    arr.forEach((_, i) => arr[i] -= defaultToZero(val[i], i));
}
// spliceMask() checks to see if a param index is empty across params, and if so
//              it splices the param and the mask index.
function spliceMask(o, config, idx) {
    const b = config.every(cfg => {
        switch (cfg.dim) {
        case 0:
            return true;
        case 1:
            return cfg.byArg ? !Is.def(cfg.param[idx]) : true;
        case 2:
            return cfg.bAbE ? cfg.param[idx].every(v => !Is.def(v))
                            : cfg.param.every(prm => !Is.def(prm[idx]));
        }
    });
    if (b) {
        o.mask.splice(idx, 1);              // splice mask
        o.maskAll = false;                  // not worth if (o.maskAll)
        for (const cfg of config)           // splice config[].params:
            if (cfg.byArg || cfg.bAbE)      // 1D or 2D slice outer
                cfg.param.splice(idx, 1);
            else if (cfg.dim == 2)          // 2D slice inner
                cfg.param.forEach(prm => prm.splice(idx, 1));
    }                                       // else not an array: noop
}
// defaultToZero() is the validation function for for endToDist(). These values
// can come from the DOM or the user, and user values can be almost anything,
// so checking for NaN is necessary. Addend defaults to 0, so defaultToZero()
// returns a value, unlike all the other validators. forEach() loops skip empty
// slots, which precludes the need to verify that a value is defined; these are
// cases where numeric validation is skipped.
function defaultToZero(val, i1, i2, useI2) {
    const err = Ez._mustBe("Every end value's corresponding start value",
                           "a number or undefined (defaults to 0)");
    if (useI2)
        val = val[i2];
    if (!Is.def(val))
        return 0;
    if (!Number.isNaN(val))
        return val;

    let prefix = `No start[${i1}]`;
    if (useI2)
        prefix += `[${i2}]`;
    prefix += ": "
    throw new Error(prefix + err);
}