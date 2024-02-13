// Not exported by raf.js
// This module is its create() function, literally. Everything else is called
// exclusively by create(). So the module is effectively one huge function.
// It could be broken into sub-modules, but the sub-module functions will still
// only be imported into and called from here.
export {create};

import {Easy}                from "./easy.js";
import {ECalc}               from "./ecalc.js";
import {Easer,  EaserByElm}  from "./easer.js";
import {MEaser, MEaserByElm} from "./measer.js";

import {PBase} from "../prop/pbase.js";

import {E, Ez, Is} from "../raf.js"

const keys   = ["f",           "a",           "max",      "min"     ];
const calcs  = [ ECalc.f,       ECalc.a,       Math.min,   Math.max ];
const byElms = ["factorByElm", "addendByElm", "maxByElm", "minByElm"];
const noop   = {cNN:"_noop"};
//==============================================================================
function create(o, set, b, q, cls) {
    if (!b)                 // q for quantity: "single" or "multi") {
        throw new Error(`For ${q}-ease targets you must use ${cls}`
                      + ".prototype.newTarget().");
    //---------------------------------------------
    o.prop = PBase._validate(o.prop, "prop", true);
    o.func = o.func || o.prop.func;
    o.peri = Ez._validFunc(o.peri, "peri");

    if (o.func && !o.func.isFunc)
        Ez._mustBeErr("func", "an instance of Func or undefined");
    if (o.prop.isUn || o.func?.isUn)
        o.set = E.net;           // just force it

    o.isNet = (o.set == E.net);
    o.elms  = Ez.toElements(o.elms || o.elm || o.elements || o.element);
    o.l     = o.elms.length;
//??if (!o.l)
//??    throw new Error("Every target must have elements.");
//??//--------------------------------------------------------
    o.loopByElm = o.l > 1 && (o.loopByElm ?? o.loopByElement);
    o.calcByElm = o.loopByElm || o.l == 1;

    if (o.isNet)
        o.prop.getUnToObj(o);
    else if (!o.noRestore)       // an obscure option, might as well...
        getCV(o);                // for restore()

    if (o.byElm || o.byElement)
        o.byElm = true;          // 1D arrays are by element
    if (o.bAbE  || o.byArgbyElm)
        o.bAbE = true;           // 2D arrays are [arg[elm]]

    afcru (o);
    config(o);
    mask  (o);
    easies(o);
    if (!o.isNet)
        optional(o);
    else {
        const lens = o.lens;
        const c = o.mask.at(-1) + 1;
        const i = lens.findIndex(len => len < c);
        if (i >= 0)
            throw new Error(`elms[${i}]'s value has fewer than ${c} numbers.`);
        //-------------------
        o.c  = c;
        o.lm = o.mask.length;

        // normalize .numBeg, .numEnd, .cv, and .seps across elements
        o.numBeg = o.numBeg.every(b => b);
        if (Math.max(...lens) > c){
            let j, l, s;            // squeeze trailing cv & seps into last sep
            o.cv.forEach((v, i) => {
                l = lens[i];
                if (l > c) {
                    s = o.seps[i];
                    for (j = c; j < l;)
                        s[c] += v[j] + s[++j];
                    v.length = c;
                    s.length = c + 1;
                }
            });
            o.numEnd = false;
        }
        else
            o.numEnd = o.numEnd.every(b => b);
    }
    maskCV   (o, o.l, o.mask, o.lm);
    endToDist(o);
    plugCV   (o); //!!careful with E.net and getUn() here!!
    resetDims(o, o.dims);

    let tar;              // tar for target, the return value
    if (o.calcByElm) {
        calcByElm(o);
        tar = o.easies ? new MEaserByElm(o) : new EaserByElm(o);
    }
    else {
        o.bAbE = true;    // default is bAbE, only one exception:
        o.l2   = o.lm;    //  no 2D arrays and all 1D are byArg
        o.l1   = o.l;     // bySame() handles the exception
        bySame(o);
        o.twoD = Array.from({length:o.l2}, () => new Array(o.l1));
        if (o.easies) {
            calcMEaser(o);
            tar = new MEaser(o);
        }
        else {
            calc(o);
            tar = new Easer(o);
        }
    }
    set.add(tar);
    return tar;
}
//==============================================================================
// Everything else is for portioning create() into manageable chunks
// afcru() processes addend, factor, count, required, units
function afcru(o) {
    //    okNull is because E.cV === null is a legit value for o.a and o.f
    const okNull = [undefined, false, false, false, false, false];

    // addend and factor can be undefined (unused) or null (E.currentValue)
    // if defined, o.start is addend and o.end is factor
    o.start = Ez.toNumber(o.start, "start", ...okNull);
    o.end   = Ez.toNumber(o.end,   "end",   ...okNull);

    // o.a = addend: if it's zero, set it undefined, adding 0 is pointless
    o.a = o.start ?? Ez.toNumber(o.addend, "addend", ...okNull);
    if (o.a === 0)
        o.a = undefined;

    // o.f = factor: can only be 0 if it's o.end, else multiply by 0
    o.isTo = Is.def(o.end); // o.f = end instead of distance
    if (o.isTo) {
        if (o.end === o.a)  // more validation in endToDist()
            Ez._cantBeErr("start and end values", "the same");
        //----------
        o.f = o.end;
    }
    else {                  // more alt names for factor
        const name = Is.def(o.factor)   ? "factor"
                    : Is.def(o.distance) ? "distance"
                    : Is.def(o.dist)     ? "dist"
                                        : "";
        okNull[2] = true    // factor can't be zero
        o.f = name ? Ez.toNumber(o[name], name, ...okNull)
                    : undefined;
    }

    // o.c and o.r are not user-defined, o.u is user-optional w/default
    if (!o.isNet) {                    // isNet = (o.set == E.net);
        o.c = o.prop.count(o.func);    // c = arg count
        o.r = o.prop.required(o.func); // r = required arg count
        o.u = o.units                  // u = units, Prop provides default
            ?? o.prop._unitz(o.func);
    }
}
// config() processes factor, addend, max, and min into o.config.
// 1D config.param arrays can be byArg (the default) or byElm. Users can
// explicitly set byElm for all 1D arrays or for each one separately.
// There are also obvious cases where byElm can be implied.
function config(o) {
    let cfg, hasCV, j, l, prm;

    Object.assign(o, {config:[], dims:[]});
    keys.forEach((key, i) => {
        prm = o[key];
        if (Is.def(prm)) {
            cfg = { param: prm,
                    calc:  calcs[i],
                    dim:   Ez._dims(prm)   };

            switch (cfg.dim) {
            case 0:
                hasCV = (prm === E.cV);
                break;
            case 1:                // .byElm and .bAbE are true or undefined
                l     = prm.length;
                hasCV = prm.includes(E.cV);
                if (o.byElm || Object.hasOwn(o, byElms[i]))
                    cfg.byElm = true;
                else if (o.c == 1)
                    cfg.byElm = true;
                else if (l > o.c && l <= o.l)
                    cfg.byElm = true;
                paramLength(l, key, cfg.byElm);
                if (!cfg.byElm)    // .byArg is duplicative, but useful
                    cfg.byArg = true;
                break;
            case 2:
                cfg.bAbE = o.bAbE; // maskCV() & endToDist() can alter this
                paramLength(l, key, !cfg.bAbE);
                l     = prm.length;
                hasCV = false;
                for (j = 0; j < l; j++) {
                    paramLength(prm[j].length, key, cfg.bAbE);
                    if (!hasCV)
                        hasCV = !Is.def(prm[j]) || prm[j].includes(E.cV);
                }
            }
            o.config.push(cfg);
            o.dims  .push(cfg.dim);
            if (hasCV) {
                if (!o.configCV)
                    o.configCV = [cfg];
                else
                    o.configCV.push(cfg);
            }
        }
    });
    if (o.configCV)
        o.oneArg = (o.c == 1);     // see maskCV()
}
// paramLength() helps config()
function paramLength(l, key, byElm) {
    const elmArg = [[o.l, "elements"], [o.c, "arguments"]]
                    [!byElm];
    if (l > elmArg[0])
        throw new Error(`${key} array length exceeds the number of `
                        `${elmArg[1]}: ${l} > ${elmArg[0]}`);
}
// mask() sets o.mask to a dense array of sorted argument indexes.
// Valid user mask types are:
//  - dense array of arg indexes (pre-formatted by user)
//  - bitmask int:  Ez defines them for specific func/prop arguments
//  - sparse array: non-empty slots = masked indexes
//  - o.config:     sequential indexes 0 to array.length - 1
//  - undefined:    sequential indexes 0 to o.r - 1
// For all mask types except the first one, o.mask is code-generated.
// PBase.prototype._mask() validates the first type to prevent errors later.
function mask(o) {
    const count = o.isNet ? Math.min(...o.cv.map(arr => arr.length))
                            : o.c;
    if (o.mask)                      // user mask: validate/format it
        o.mask = o.prop._mask(o.mask, o.func, count);
    else if (o.dims.some(dim => dim > 0)) {
        const l = [];                // the longest cfg.param array is mask:
        o.config.forEach((cfg, i) => { // treats array contents as dense &
            switch (cfg.dim) {         // sequential from 0 to length - 1.
            case 2:                    // empty array slots are noops for
                l[i] = cfg.bAbE        // for calcs, not unmasked args.
                        ? cfg.param.length
                        : Math.max(...cfg.param.map(arr => arr.length));
                break;
            case 1:
                l[i] = cfg.byElm ? 0 : cfg.param.length;
                break;
            case 0:
                l[i] = 0;
            }
        });
        o.mask = PBase._maskAll(Math.min(count, Math.max(...l)));
    }
    else if (o.isNet)                // undefined: mask all required args
        o.mask = PBase._maskAll(count);
    else {                           // ditto
        o.mask = PBase._maskAll(o.r);
        o.c = o.r;
    }
    o.lm = o.mask.length;
    if (!o.isNet && o.lm == o.c)
        o.set = E.set;
}
// easies() processes o.easies for MEasers.
// Consolidates array of easies into a Map: easy => mask indexes.
// These are indexes into cfg.param/o.mask, not into prop/func args.
// o.easies cannot be sparse and must be the same length as o.mask.
function easies(o) {
    const easies = "easies";
    if (o[easies]) {
        o[easies] = Ez.toArray(o[easies], easies, Easy._validate)
        if (o[easies].length != o.lm)
            Ez._mustBeErr(easies, "the same length as mask");
    }
    else
        return;
    //--------------------
    o.easy2Mask = new Map;
    o[easies].forEach((ez, i) => {
        if (o.easy2Mask.has(ez))
            o.easy2Mask.get(ez).push(i);
        else
            o.easy2Mask.set(ez, [i]);
    });
    // Reduce o.easies to unique values
    o[easies] = Array.from(o.easy2Mask.keys());
    o.lz = o[easies].length;
}
// getCV() gets current values and parses them into a 2D array of strings
// by element by argument: [elm[arg]]
function getCV(o) {
    o.cvRaw = o.prop.getMany(o.elms);
    o.cv    = o.cvRaw.map(v => o.prop.parse(v, o.func));
}
// optional() sets o.c to the actual number of arguments provided, adjusting it
// downward if optional parameters are not provided.
function optional(o) {
    if (o.r == o.c || o.lm == o.c)
        return;
    ///////////
    let l = o.mask.at(-1) + 1;
    if (l == o.c)
        return;
    ///////////
    let c;
    if(o.set == E.set)          // sets c < o.c
        c = Math.max(o.r, l);
    else {                      // sets c <= o.c
        if (!Is.def(o.cv))      // o.cv is an array or not yet defined
            getCV(o);
        c = o.cv ? Math.max(...o.cv.map(v => v.length)) : 0;
        c = Math.max(o.r, l, c);
    }
    if (c < o.c) {
        if (c == l)
            o.set = E.set;
        o.c = c;
    }
}
//==============================================================================
// maskCV() populates factor/addend with current values as specified by the
//          user via E.currentValue or its shorthand E.cV.
//          Users are not allowed to mix 2D array types, but maskCV() can
//          create byElmByArg arrays in spite of {byArgByElm:true}. o.cv is
//          byElmByArg, so that's how maskCV() operates. Not a problem, but
//          it complicates endToDist() and creates the need for ECalc._c22s().
function maskCV(o, l, mask, lm) {
    if (!o.configCV) return;
    //------------------------------------------
    let allValues, byDim, cfg, cv, idx, isSame,
        len, m, maskCV, prm, sameArgs, sameElms;

    // Convert all of o.cv to numbers up front. It makes isSame comparisons
    // more efficient and the code simpler. Yes, it might convert values
    // that are never used as numbers, but converting on demand can convert
    // some values more than once, so neither method is perfect. Optimizing
    // beyond that is not worth it, and these arrays are small.
    if (!Is.def(o.cv))
        getCV(o);

    const cvNum  = o.cv.map(cv => cv.map(v => Ez.toNumby(v, o.func, o.u)));
    const minLen = mask.at(-1) + 1;
    const err    = "E.currentValue requires elements to have a value in "
                    + o.prop.name + " for every masked argument specified.";

    // Process by cfg.dim, 0 is the most diverse
    byDim = o.configCV.filter(cfg => !cfg.dim);
    if (byDim.length) {
        let cvFlat, dim;
        allValues = allMustHaveValues(o);
        if (o.oneArg) {
            cvFlat = cvNum.flat();
            cv     = cvFlat[0];
            isSame = cvFlat.every(v => v == cv);
            dim    = isSame ? 0 : 1;
        }
        else {
            sameArgs = isSameByArg(cvNum, l, mask, lm);
            sameElms = isSameByElm(cvNum, l, mask, lm);
            dim = sameArgs && sameElms ? 0
                : sameArgs || sameElms ? 1
                                        : 2;
        }
        switch (dim) {
        case 0:
            prm = cvNum[0][0];
            break;
        case 1:
            if (o.oneArg)         // 1D array byElm
                prm = cvFlat;
            else if (sameArgs) {  // 1D array byArg
                prm = new Array(lm);
                cv  = cvNum[0];
                minArgs(cv, minLen, err, 0);
                mask.forEach((w, j) => prm[j] = cv[w]);
            }
            else {                // 1D array byElm
                prm = new Array(l);
                m   = mask[0];
                cvNum.forEach((v, i) => {
                    mustBeNumber(v[m], err, i, m);
                    prm[i] = v[m];
                });
            }
            break;
        case 2:
            prm = Array.from({length:l}, () => new Array(lm));
            cvNum.forEach((v, i) => {
                minArgs(v, minLen, err, i);
                mask.forEach((w, j) =>  prm[i][j] = v[w]);
            });
        }
        for (cfg of byDim) {
            cfg.dim   = dim;
            cfg.param = prm;
            if (dim == 1 && (o.oneArg || sameElms)) {
                cfg.byElm = true;
                delete cfg.byArg;
            }
        }
    }
    // 1D byElm
    byDim = o.configCV.filter(cfg => cfg.byElm);
    if (byDim.length) {
        for (cfg of byDim) {
            isSame = sameElms ?? lm == 1;
            maskCV = [];    // the indexes containing E.cV: masked elements
            idx    = 0;
            while ((idx = cfg.param.indexOf(E.cV, idx)) > -1) {
                mustHaveValue(o.cv[idx], err, idx);
                maskCV.push(idx);
            }
            if (!isSame) {
                cv = [];    // cvNum for the masked elements only
                for (m of maskCV)
                    cv.push(cvNum[m]);
                isSame = isSameByElm(cv, cv.length, mask, lm);
            }
            if (isSame) {
                prm = cfg.param;
                idx = mask[0];
                m   = maskCV[0]
                minArgs(cvNum[m], idx + 1, err, m);
                for (m of maskCV)
                    prm[m] = cvNum[m][idx];
            }
            else {          // creates a 2D byElmByArg array
                prm = new Array.from({length:cfg.param.length},
                                        () => new Array(lm));
                cfg.param.forEach((p, i) => {
                    if (p === E.cV) {
                        minArgs(cvNum[i], minLen, err, i);
                        mask.forEach((w, j) => prm[i][j] = cvNum[i][w]);
                    }
                    else
                        prm[i].fill(p);
                });
                cfg.param = prm;
                cfg.dim++;
            }
        }
    }
    // 1D byArg
    byDim  = o.configCV.filter(cfg => cfg.byArg);
    if (byDim.length) {
        allValues = allMustHaveValues(o, allValues);
        for (cfg of byDim) {
            isSame = sameArgs ?? l == 1;
            maskCV = [];      // the indexes containing E.cV
            idx    = 0;
            while ((idx = cfg.param.indexOf(E.cV, idx)) > -1)
                maskCV.push(idx);
            if (!isSame)
                isSame = isSameByArg(cvNum, l, maskCV,
                                                maskCV.length);
            len = maskCV.at(-1) + 1;
            if (isSame) {
                prm = cfg.param;
                minArgs(cvNum[0], len, err, 0);
                for (m of maskCV)
                    prm[m] = cvNum[0][m];
            }
            else {            // creates a 2D byElmByArg array
                prm = new Array.from({length:l}, () => [...cfg.param]);
                cvNum.forEach((v, i) => {
                    minArgs(v, len, err, i);
                    for (m of maskCV)
                        prm[i][m] = v[m];
                });
                cfg.param = prm;
                cfg.dim++;
            }
        }
    }
    // 2D bAbE, byArgByElm: [arg[elm]]
    byDim = o.configCV.filter(cfg => cfg.bAbE);
    for (cfg of byDim) {
        if (!allValues && cfg.param.includes(E.cV))
            allValues = allMustHaveValues(o, allValues);
        cfg.param.forEach((p, i) => {
            if (p === E.cV) {
                prm = new Array(l);
                cvNum.forEach((v, j) => {
                    mustBeNumber(v[i], err, j, i);
                    prm[j] = v[i];
                });
                cfg.param[i] = prm;
            }
            else if (Is.A(p)) {
                idx = 0;
                while ((idx = p.indexOf(E.cV, idx)) > -1) {
                    mustHaveValue(o.cv[idx], err, idx);
                    mustBeNumber (cvNum[idx][i], err, idx, i);
                    p[idx] = cvNum[idx][i];
                }
            }
        });
    }
    // 2D bEbA, byElmByArg: [elm[arg]]
    byDim = o.configCV.filter(cfg => cfg.dim == 2 && !cfg.bAbE);
    for (cfg of byDim) {
        cfg.param.forEach((p, i) => {
            if (p === E.cV) {
                mustHaveValue(o.cv[i], err, i);
                minArgs(cvNum[i], minLen, err, i);
                prm = new Array(lm);
                mask.forEach((w, j) => prm[j] = cvNum[i][w]);
                cfg.param[i] = prm;
            }
            else if (Is.A(p)) {
                mustHaveValue(o.cv[i], err, i);
                len = p.lastIndexOf(E.cV);
                minArgs(cvNum[i], len, err, i);
                idx = 0;
                while ((idx = p.indexOf(E.cV, idx)) > -1)
                    p[idx] = cvNum[i][idx];
            }
        });
    }
    if (o.max && o.min) {
        //!!reorder by dim for minor efficiency gain
        //!!if fa.dim < max or min.dim and max dim <> min dim, etc.
    }
}
// Helpers for maskCV():
// isSameByArg() - Is every masked arg the same across elms?
function isSameByArg(cv, l, mask, lm) {
    let b, i, j;
    const v = cv[0];
    b = true;
    for (i = 0; b && i < l; i++)
        for (j = 0; b && j < lm; j++)
            b = (cv[i][mask[j]] == v[mask[j]]);
    return b;
}
// isSameByElm() - Is every masked arg within each elm the same?
function isSameByElm(cv, l, mask, lm) {
    let b, i, j;
    const m = mask[0];
    b = true;
    for (i = 0; b && i < l; i++)
        for (j = 0; b && j < lm; j++)
            b = (cv[i][mask[j]] == cv[i][m]);
    return b;
}
// Validation functions for maskCV(): Validation occurs at different levels in
// order to catch errors as early as possible in the code and achieve small
// efficiencies. The highest level prevents empty string in o.cv[n]. The next
// level down is minArgs(), which validates that the o.cv[n] array has enough
// elements, based on o.mask.at(-1). This assumes that a property which uses
// numeric values can leave an argument undefined, but it cannot define an
// argument as a non-numeric value. mustBeNumber() is the bottom level of
// validation, where isNaN() fails for both NaN and undefined.
// allMustHaveValues() throws an error if any element doesn't have a value
function allMustHaveValues(o, alreadyTrue) {
    if (!alreadyTrue && o.cv.some(v => !v))
        throw new Error(err);
    return true;
}
// mustHaveValue() throws an error if an element's property has no value
function mustHaveValue(val, err, i) {
    if (!val)
        throw new Error(`Element ${i}: ` + err);
}
// minArgs() throws an error if cv doesn't have enough arguments
function minArgs(cv, minLen, err, i) {
    if (cv.length < minLen)
        throw new Error(`Element ${i}: ` + err);
}
// mustBeNumber() throws an error if val is not a number
function mustBeNumber(val, err, i1, i2) {
    if (isNaN(val))
        throw new Error(`Element ${i1}, argument ${i2}: ${err}`);
}
//==============================================================================
// endToDist() converts factor from end to distance, if addend is undefined it
//             defaults to zero and no conversion is necessary.
//             User factor can be end or distance, run-time factor is distance.
function endToDist(o) {
    if (!o.isTo || !Is.def(o.a)) return;
    //----------------------------------
    let prm, val;
    const f  = o.config[0];
    const a  = o.config[1];
    const fp = f.param;
    const ap = a.param;
    const la = ap.length;
    // Every factor value must have a corresponding addend value, but I
    // default addend to 0 at the top level, so I do the same here.
    // Addends without factors are sketchy, but I let it slide because
    // you can have a start point without a distance, but not vice-versa.
    // You need both start and end to calculate distance.
    const err = Ez._mustBe("Every end value's corresponding start value",
                            "number or undefined (defaults to 0)");
    // To properly calculate distance, factor.dim must be >= addend.dim.
    // For example, consider a single end value with multiple start values,
    // the result requires as many distances as there are start values.
    // These are sparse arrays, which somewhat complicates the code below.
    if (f.dim < a.dim) {
        if (!f.dim || f.byElm == a.bAbE) {
            if (a.dim - f.dim == 1) {
                if (!f.dim) {         // 0 to 1 dims
                    prm = new Array(la);
                    ap.forEach((p, i) => prm[i] = fp - p);
                    f.byElm = a.byElm;
                    f.byArg = a.byArg;
                }
                else {                // 1 to 2 dims
                    prm = Array.from({length:la}, () => new Array(fp.length));
                    ap.forEach((p, i) =>
                        fp.forEach((q, j) =>
                            prm[i][j] = q - defaultToZero(p[j], err, j)
                        )
                    );
                    f.bAbE = a.bAbE;
                }
            }
            else {                    // 0 to 2 dims
                prm = Array.from({length:la}, () => []);
                ap.forEach((p, i) => {
                    if (Is.A(p))
                        p.forEach((q, j) => prm[i][j] = fp - q);
                    else
                        prm[i] = fp - p;
                });
                f.bAbE = a.bAbE;
            }
        }
        else {                        // 1 to 2 dims, swap dimensions
            prm = Array.from({length:fp.length}, () => []);
            fp.forEach((p, i) => {
                if (Is.A(ap[i]))
                    ap[i].forEach((q, j) => prm[i][j] = p - q);
                else
                    prm[i] = p - defaultToZero(ap[i], err, i);
            });
            delete f.byElm;
            delete f.byArg;
            f.bAbE = a.bAbE;
        }
        f.dim   = a.dim;
        f.param = prm;
    }
    else {
        if (f.dim == a.dim && f.byElm != a.byElm) {
            // mismatched 1D arrays: f.dim must be >= a.dim, so factor to 2D
            prm = new Array(la);
            ap.forEach((_, i) => prm[i] = fp);
            if (f.byArg)
                delete f.byArg;
            else {
                delete f.byElm;
                f.bAbE = true;  // in spite of !o.bAbE
            }
            f.dim    = 2;
            fp.param = prm;
            fp       = prm;
        }
        switch (f.dim) {
        case 0:
            f.param -= ap;
            break;
        case 1:
            if (a.dim == 0)
                fp.forEach((_, i) => fp[i] -= ap);
            else
                fp.forEach((_, i) =>
                    fp[i] -= defaultToZero(ap[i], err, i)
                );
            break;
        case 2:
            if (!a.dim)
                fp.forEach((p, i) => {
                    if (Is.A(p))
                        p.forEach((_, j) => p[j] -= ap);
                    else
                        p[i] -= ap;
                });
            else if (a.dim == 1) {
                if (f.bAbE == a.byElm)
                    fp.forEach((p, i) => {
                        if (Is.A(p))
                            p.forEach((_, j) =>
                                p[j] -= defaultToZero(ap[j], err, j)
                            );
                        else {
                            prm = new Array(la);
                            ap.forEach((q, j) => prm[j] = p - q);
                            fp[i] = prm;
                        }
                    });
                else // mismatched dims
                    fp.forEach((p, i) => {
                        prm = ap[i];
                        val = defaultToZero(prm, err, i);
                        if (Is.A(p))
                            p.forEach((_, j) => p[j] -= val);
                        else
                            fp[i] -= val;
                    });
            }
            else {   // both f.dim and a.dim == 2
                if (f.bAbE == a.bAbE)
                    fp.forEach((p, i) => {
                        prm = ap[i];
                        if (Is.A(p)) {
                            if (Is.A(prm))
                                p.forEach((_, j) =>
                                    p[j] -= defaultToZero(prm[j], err, i, j)
                                );
                            else
                                p.forEach((_, j) =>
                                    p[j] -= defaultToZero(prm, err, i)
                                );
                        }
                        else {
                            if (Is.A(prm)) {
                                fp[i] = new Array(prm.length);
                                prm.forEach((q, j) => fp[i][j] = p - q[j]);
                            }
                            else
                                fp[i] -= prm;
                        }
                    });
                else // mismatch: maskCV() or mismatched 1D array above
                    fp.forEach((p, i) => {
                        if (Is.A(p))
                            p.forEach((_, j) => {
                                prm = ap[j];
                                if (Is.A(prm))
                                    p[j] -= defaultToZero(prm[i], err, j, i);
                                else
                                    p[j] -= defaultToZero(prm, err, j);
                            });
                        else {
                            prm = new Array(la);
                            ap.forEach((q, j) => {
                                if (Is.def(q[i]))
                                    prm[j] = p - q[i];
                            });
                            fp[i] = prm;
                        }
                    });
            }
        }
    }
}
// defaultToZero is the validation function for for endToDist(). These
// values can come from the DOM or the user, and the user values can be
// almost anything, so checking for NaN is necessary. Addend defaults to 0,
// so defaultToZero() returns a value, unlike all the other validators.
// forEach loops skip empty slots, which precludes the need to verify that
// a value is defined; these are cases where numeric validation is skipped.
function defaultToZero(val, err, i1, i2) {
    if (!Is.def(val))
        return 0;
    if (Number.IsNaN(val)) {
        let prefix = `No start[${i1}]`;
        if (Is.def(i2))
            prefix += `[${i2}]`;
        prefix += ": "
        throw new Error(prefix + err);
    }
    return val;
}
//==============================================================================
// plugCV() creates o.value[elm[arg]] and plugs it with unmasked current
// values and separators. Plug contents derive from these two arrays:
//   o.cv   = 2D: current numeric values as strings
//   o.seps = 1D: separators w/units, function text
//            2D for E.net: all the stuff inbetween the numbers
// In the process of plugging, we "squeeze" the plug text together so
// that the length of o.value's inner dimension is as short as possible.
// Pre-filling o.value with "" allows for += in innermost while loop.
// Padding the end of o.seps with "" affects only 25% of the cases and
// simplifies the inner for loop.
function plugCV(o) {
    if (!o.seps && !PBase._seps(o)) {
        o.value = Array.from({length:o.l}, () => new Array(1));
        return;
    } //-------------------------------------------------------
    // nb and ne indicate that o.value[n] starts or ends with
    // a calculated number, not a plugged number as string.
    const isSet = (o.set == E.set);
    const nb    = isSet ? o.numBeg : o.numBeg && (o.mask[0] == 0);
    const ne    = isSet ? o.numEnd : o.numEnd && (o.mask.at(-1) == o.c - 1);
    const izero = Number(nb);        // start for (i, p) loop at 0 or 1
    const pzero = Number(o.numBeg);  // ditto
    const lp    = o.lm * 2 - (nb && ne) + !(nb || ne);

    // i, m, mi, and p are array indexes (mask values are array indexes)
    //   i  = elm  index: arr[i] = o.value[j][i]
    //   m  = mask value: sets boundaries, doesn't get array values
    //   mi = mask index: o.mask[mi]
    //   p  = plug index: sep[p] & val[p] (o.seps[j][p] & o.cv[j][p])
    let i, p;
    if (isSet) {
        o.value = Array.from({length:o.l}, () => new Array(lp));
        o.value.forEach((arr) => {
            for (i = izero, p = 0; i < lp; i += 2, p++)
                arr[i] = o.seps[p];
        });
    }
    else {
        let m, mi, seps, vals;
        const prop = o.prop.name;
        if (!o.isNet) {
            if (!Is.def(o.cv))
                getCV(o);
            if (o.numEnd && !ne)
                o.seps.forEach(arr => arr.push(""));
        }
        o.value = Array.from({length:o.l}, () => new Array(lp).fill(""));
        o.value.forEach((arr, j) => {
            seps = o.isNet ? o.seps[j] : o.seps;
            vals = o.cv[j];
            if (!vals)
                throw new Error(`Element ${j} has no value for ${prop}`);
            //------------------
            if (o.numBeg && !nb)
                arr[0] = vals[0];
            for (i = izero, p = pzero, mi = i; i < lp; i += 2, p++, mi++) {
                m = mi < o.lm ? o.mask[mi] : o.c;
                while (p < m) {
                    if (!vals[p])
                        throw new Error(`element ${j}: ${prop} requires ${o.c} arguments`);
                    //--------------------------
                    arr[i] += seps[p] + vals[p++];
                }
                arr[i] += seps[p];
            }
        });
    }
    i = Number(!nb);
    if (o.easies && o.loopByElm)
        o.maskCV = o.mask;
    o.mask = o.mask.map((_, j) => j * 2 + i);
}
// resetDims rebuilds o.dims after potential alterations to
// dimensionality by maskCV() and endToDist()
function resetDims(o, dims) {
    o.config.forEach((cfg, i) => dims[i] = cfg.dim);
}
// bySame() - ECalc.#twoD is byArgByElm except in the one case where config
// has no 2D arrays and all 1D arrays are byArg. o.bySame gets set for all
// 1D are byElm too, see calc() and new ECalc.
function bySame(o) {
    if (Math.max(...o.dims) == 1) {
        const d1 = o.config.filter(cfg => cfg.dim == 1);
        if (d1.every(cfg => cfg.byElm))
            o.bySame = true;
        else if (d1.every(cfg => cfg.byArg)) {
            o.bySame = true;
            delete o.bAbE;    // true or undefined
            o.l2 = o.l;
            o.l1 = o.lm;
        }
    }
}
//==============================================================================
// calc functions convert configs into objects used by class ECalc to run
// the necessary calculations during animation:
// init_calc() returns a baseline calc object with calc and cNN props cN_ and
//             c_N args are input and output dimension count, respectively.
//             It is the naming convention for the ECalc static functions too.
//             Some calcs change their output's dimensionality. For example:
//               ECalc._c01() converts a number to a 1D array of numbers
function init_calc(calc, cN_, c_N) {
    return {calc:calc, cNN:`_c${cN_}${c_N}`};
}
function calc(o) {
    o.calcs = [];               // the target array of calc objects
    if (o.config.length) {
        let calc, cfg, dim, prm;
        dim = 0;
        o.dims.length = 0;      // re-populated at the bottom of the loop
        for (cfg of o.config) {
            calc = init_calc(cfg.calc, dim, cfg.dim);
            prm  = cfg.param;
            calc.param = prm;
            dim = upDim(o, cfg, prm, calc, dim,
                                swapDims(o, cfg, calc));
            o.calcs.push(calc);
            o.dims. push(dim);
        }
    }
    o.dmax = Math.max(0, ...o.dims);
    o.dmin = Math.min(0, ...o.dims);
    if (o.dmax == 0)
        o.calcs.push(Object.assign({}, noop));
}
function calcByElm(o) {
    const byElm = Array.from({length:o.l}, () => []);
    const isME  = Boolean(o.easies);
    const ez2M  = o.easy2Mask;

    o.oneD = new Array(o.lm);
    if (o.config.length) {//c_N is the output dim count
        let c, calc, cfg, cN_, c_N, i, mask, notOrByArg, prm, src;
        cN_ = 0;    // cN_ is the input dim count
        for (cfg of o.config) {         //>loop by f, a, max, min:
            c_N = isME ? Math.max(cfg.dim, 1) : cfg.dim;
            src = init_calc(cfg.calc, cN_, c_N);

            notOrByArg = !cfg.dim || cfg.byArg;
            if (notOrByArg)                // 0D or 1D byArg
                prm = cfg.param;
            for (i = 0; i < o.l; i++) {    //>loop byElm:
                if (!notOrByArg) {
                    if (!cfg.bAbE)            // 1D byElm or 2D byElmByArg
                        prm = cfg.dim < 2     // -prm might be undefined-
                            ? cfg.param
                            : cfg.param[i];
                    else {                    // 2D byArgbyElm
                        prm = new Array(cfg.param.length);
                        cfg.param.forEach((p, j) => {
                            if (!Is.A(p))     // single value: fill it
                                prm[j] = p;
                            else {            // array: make a sparse copy
                                prm[j] = [];
                                if (Is.def(p[i]))
                                    prm[j][i] = p[i];
                            }
                        });
                    }
                }
                // cfg.param always defined, but if !Is.def(prm): cfg.param
                // and byElm[] are sparse, and the calc object not created.
                if (Is.def(prm)) {
                    calc = Object.assign({}, src);
                    if (c_N > cN_) {          // we're up-dimensioning
                        calc.noop = noop1D(prm, o.lm);
                        cN_ = c_N;            // .noop fills the gaps in prm
                    }
                    if (isME) {               // convert byElm to 3D:
                        if (!byElm[i].length) //   byElm byEasy byConfig
                            byElm[i] = Array.from({length:o.lz}, () => []);

                        o.easies.forEach((ez, j) => {
                            mask = ez2M.get(ez);
                            c = Object.assign({}, calc);
                            c.param = meParam(prm, mask);
                            c.noop  = calc.noop?.length
                                    ? meNoop1D(c.param, mask)
                                    : calc.noop; // empty array or undefined
                            byElm[i][j].push(c);
                        });
                    }
                    else {
                        calc.param = prm;
                        byElm[i].push(calc);  // 2D byElm byConfig
                    }
                }
            }
        }
    }
    else if (isME) {
        src = {cNN:"_c01", param:[]};
        for (i = 0; i < o.l; i++) {       // byElm
            byElm[i] = new Array(o.lz);
            o.easies.forEach((ez, j) =>   // byEasy
                byElm[i][j] = [Object.assign({noop:ez2M.get(ez)}, src)]
            );                            // .noop only, .param is empty
        }
    }

    if (!isME && Math.max(0, ...o.dims) == 0)
        for (let i = 0; i < o.l; i++)
            byElm[i].push(Object.assign({}, noop));

    o.calcs = byElm;
}
function calcMEaser(o) {
    let calc;
    const calcs = Array.from({length:o.lz}, () => []);
    if (o.config.length) {
        let cfg, dim, i, mask, notOrByElm, prm, src, swap1D;
        o.dims.length = 0;
        dim = 0;
        for (cfg of o.config) {
            src    = init_calc(cfg.calc, dim, cfg.dim);
            swap1D = swapDims(o, cfg, src);

            notOrByElm = !cfg.dim || cfg.byElm;       // 0D or 1D byElm
            if (notOrByElm)                           //!!no mask??no way...
                prm = cfg.param;
            for (i = 0; i < o.lz; i++) {              // loop byEasy:
                if (!notOrByElm) {
                    mask = o.easy2Mask.get(o.easies[i]);
                    if (cfg.dim == 1 || cfg.bAbE)     // 1D byArg or 2D bAbE
                        prm = meParam(cfg.param, mask);
                    else                              // 2D byElmByArg
                        cfg.param.forEach((p, j) =>
                            prm[j] = Is.A(p) ? meParam(p, mask)
                                                : p
                        );
                }
                calc = Object.assign({}, src);
                dim  = upDim(o, cfg, prm, calc, dim, swap1D, true);
                calc.param = prm;
                calcs[i].push(calc);
            }
            o.dims.push(dim);
        }
        o.dmax = Math.max(...o.dims);
        o.dmin = Math.min(...o.dims);
    }
    else { // no configs, easer uses raw _calc() return value
        o.dmax = 0;
        o.dmin = 0;
    }

    if (o.dmax == 0)
        for (calc of calcs)
            calc.push(Object.assign({}, noop));

    o.calcs = calcs;
}
// noop functions populate the calc.noop[] array.
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
// me functions for MEaser, with Param as well as Noop
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
// swapDims() sets the "s" suffix on calc.CNN, indicating that the method
// swaps dimensions. It also handles 1D byArg params when twoD is bAbE, and
// returns a boolean indicating if that is the case.
function swapDims(o, cfg, calc) {
    const swap1D = (cfg.byArg && !o.bySame);
    if (swap1D || (cfg.dim == 2 && !cfg.bAbE))
        calc.cNN += "s"
    return swap1D;
}
// upDim() handles the up-dimensioning a calc, which is when the previous
// highest cfg.dim value is exceeded by a new high and ECalc._cNN() switches
// from storing results in thisVal to oneD or twoD, or from oneD to twoD.
function upDim(o, cfg, prm, calc, dim, swap1D, isMEaser) {
    if (!swap1D && cfg.dim <= dim) return dim;
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
                   || prm.some(p => p.length < l1
                                 || p.includes(undefined));
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
// validateParams() validates that all cfg.param values are numeric and
// forcibly converts them to numbers. It balks at infinite values, as even
// for max and min they are pointless. For factor, it balks at zero values.
// Should be called after maskCV(), when all the params are finally set.
// It would prevent the need to call isNaN() in defaultToZero().
//!!To be evaluated and maybe completed!!
function validateParams(o) {
    let cfg, val;
    for (cfg of o.config) {
        if (!cfg.dim) { // Number() or parseFloat() here? No clear winner.
            val = Number(cfg.param);
            if (!Number.isFinite(val))
                throw new Error("...");
            if (isFactor && !val) // How do I know if it's factor?
                throw new Error("zero factor!");
            cfg.param = val;
        }
    }
}