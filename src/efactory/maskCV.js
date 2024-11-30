export {maskCV};

import {E, Is} from "../globals.js";
import {PBase} from "../prop/pbase.js";
//==============================================================================
// maskCV() populates factor/addend with current values as specified by the
//          user via E.currentValue or its shorthand E.cV.
//          Users are not allowed to mix 2D array types, but maskCV() can
//          create byElmByArg arrays in spite of {byArgByElm:true}. o.cv is
//          byElmByArg, so that's how maskCV() operates. Not a problem, but
//          it complicates endToDist() and creates the need for ECalc._c22s().
function maskCV(o) {
    if (!o.configCV) return;
    //-----------------------------------------------------------------
    let allValues, byElmArg, cfg, cv, cvMask, idx, isSame, len, m, prm,
        sameArgs, sameElms;
    const err = "E.currentValue requires elements to have a value in "
               + o.prop.name + " for every masked argument specified.",
    l    = o.l,
    lm   = o.lm,
    mask = o.mask,

    minLen = mask.at(-1) + 1,
    notDim = [],
    hasDim = [],
    // Convert all of o.cv to numbers up front. It makes isSame comparisons
    // more efficient and the code simpler. Yes, it might convert values
    // that are never used as numbers, but converting on demand can convert
    // some values more than once, and these arrays are generally tiny.
    nums = o.cjs
         ? o.cv
         : o.cv.map(arr => arr.map(v => PBase.toNumby(v, o.func, o.u)));

    // cfgs with .dim == 0 must be separated because later filters rely on
    // properties that the next if() modifies: byElm and byArg.
    for (cfg of o.configCV)
        (cfg.dim ? hasDim : notDim).push(cfg);

    if (notDim.length) {    // cfg.dim == 0
        let flat, dim;
        allValues = allMustHaveValues(o);
        if (o.oneArg) {
            flat   = nums.flat();
            cv     = flat[0];
            isSame = flat.every(v => v == cv);
            dim    = isSame ? 0 : 1;
        }
        else {
            sameArgs = isSameByArg(nums, l, mask, lm);
            sameElms = isSameByElm(nums, l, mask, lm);
            dim = sameArgs && sameElms ? 0
                : sameArgs || sameElms ? 1
                                       : 2;
        }
        switch (dim) {
        case 0:
            prm = nums[0][0];
            break;
        case 1:
            if (o.oneArg)         // 1D array byElm
                prm = flat;
            else if (sameArgs) {  // 1D array byArg
                prm = Array(lm);
                cv  = nums[0];
                minArgs(cv, minLen, err, 0);
                prm = mapMask(mask, cv);
            }
            else {                // 1D array byElm
                m   = mask[0];
                prm = nums.map((v, i) => {
                    mustBeNumber(v[m], err, i, m);
                    return v[m];
                });
            }
            break;
        case 2:
            prm = nums.map((v, i) => {
                minArgs(v, minLen, err, i);
                return mapMask(mask, v);
            })
        }
        for (cfg of notDim) {
            cfg.dim   = dim;
            cfg.param = prm;
            if (dim == 1 && (o.oneArg || sameElms)) {
                cfg.byElm = true;
                delete cfg.byArg;
            }
        }
    }
    if (hasDim.length) {    // cfg.dim > 0
        // 1D byElm
        byElmArg = hasDim.filter(con => con.byElm);
        for (cfg of byElmArg) {
            isSame = sameElms ?? lm == 1;
            cvMask = [];    // the indexes containing E.cV: masked elements
            idx    = 0;
            while ((idx = cfg.param.indexOf(E.cV, idx)) > -1) {
                mustHaveValue(o.cv[idx], err, idx);
                cvMask.push(idx);
            }
            if (!isSame) {
                cv = [];    // nums for the masked elements only
                for (m of cvMask)
                    cv.push(nums[m]);
                isSame = isSameByElm(cv, cv.length, mask, lm);
            }
            if (isSame) {
                prm = cfg.param;
                idx = mask[0];
                m   = cvMask[0]
                minArgs(nums[m], idx + 1, err, m);
                for (m of cvMask)
                    prm[m] = nums[m][idx];
            }
            else {          // creates a 2D byElmByArg array
                prm = cfg.param.map((p, i) => {
                    if (p === E.cV) {
                        minArgs(nums[i], minLen, err, i);
                        return mapMask(mask, nums[i]);
                    }
                    else
                        return Array(lm).fill(p);
                });
                cfg.param = prm;
                cfg.dim++;
            }
        }
        // 1D byArg
        byElmArg  = hasDim.filter(con => con.byArg);
        if (byElmArg.length) {
            allValues = allMustHaveValues(o, allValues);
            for (cfg of byElmArg) {
                isSame = sameArgs ?? l == 1;
                cvMask = [];      // the indexes containing E.cV
                idx    = 0;
                while ((idx = cfg.param.indexOf(E.cV, idx)) > -1)
                    cvMask.push(idx++);
                if (!isSame)
                    isSame = isSameByArg(nums, l, cvMask,
                                                    cvMask.length);
                len = cvMask.at(-1) + 1;
                if (isSame) {
                    prm = cfg.param;
                    minArgs(nums[0], len, err, 0);
                    for (m of cvMask)
                        prm[m] = nums[0][m];
                }
                else {            // creates a 2D byElmByArg array
                    prm = nums.map((v, i) => {
                        minArgs(v, len, err, i);
                        val = cfg.param.slice();
                        for (m of cvMask)
                            val[m] = v[m];
                        return val;
                    });
                    cfg.param = prm;
                    cfg.dim++;
                }
            }
        }
        // 2D bAbE, byArgByElm: [arg[elm]]
        byElmArg = hasDim.filter(con => con.bAbE);
        for (cfg of byElmArg) {
            if (!allValues && cfg.param.includes(E.cV))
                allValues = allMustHaveValues(o, allValues);
            cfg.param.forEach((p, i) => {
                if (p === E.cV) {
                    prm = nums.map((v, j) => {
                        mustBeNumber(v[i], err, j, i);
                        return v[i];
                    })
                    cfg.param[i] = prm;
                }
                else if (Is.A(p)) {
                    idx = 0;
                    while ((idx = p.indexOf(E.cV, idx)) > -1) {
                        mustHaveValue(o.cv[idx], err, idx);
                        mustBeNumber (nums[idx][i], err, idx, i);
                        p[idx] = nums[idx][i];
                    }
                }
            });
        }
        // 2D bEbA, byElmByArg: [elm[arg]]
        byElmArg = hasDim.filter(con => con.dim == 2 && !con.bAbE);
        for (cfg of byElmArg) {
            cfg.param.forEach((p, i) => {
                if (p === E.cV) {
                    mustHaveValue(o.cv[i], err, i);
                    minArgs(nums[i], minLen, err, i);
                    prm = mapMask(mask, nums[i]);
                    cfg.param[i] = prm;
                }
                else if (Is.A(p)) {
                    mustHaveValue(o.cv[i], err, i);
                    len = p.lastIndexOf(E.cV);
                    minArgs(nums[i], len, err, i);
                    idx = 0;
                    while ((idx = p.indexOf(E.cV, idx)) > -1)
                        p[idx] = nums[i][idx];
                }
            });
        }
    }
    if (o.max && o.min) {
        //!!reorder by dim for minor efficiency gain
        //!!if fa.dim < max or min.dim and max dim <> min dim, etc.
    }
}
// Helpers for maskCV():
// mapMask() maps the sparse mask values from arr to a new array
function mapMask(mask, arr) {
    return mask.map(m => arr[m]);
}
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