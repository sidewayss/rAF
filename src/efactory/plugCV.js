export {plugCV};

import {CFunc} from "../prop/func.js";
import {PBase} from "../prop/pbase.js";
import {Ez}    from "../raf.js"
//==============================================================================
// plugCV() creates o.value[elm[arg]] and plugs it with unmasked current
//          values and separators. Plug contents derive from these two arrays:
//            o.cv   = 2D: current numeric values as strings
//            o.seps = 1D: separators w/units, function text
//                     2D for E.net: all the stuff inbetween the numbers
//          In the process of plugging, we "squeeze" the plug text together so
//          the length of o.value's inner dimension is as short as possible.
function plugCV(o, hasElms, is1Elm) {
    if (!hasElms) return;
    //-------------------
    let i;
    if (o.cjs) {             // colorjs is all numbers, no units or separators
        const                // add alpha as a plug if it varies across elements
        a0 = o.cv[0][CFunc.A],
        l  = o.c + (!is1Elm && o.mask.at(-1) != CFunc.A
                            && o.cv.some(arr => arr[CFunc.A] != a0));

        o.value = Ez.newArray2D(o.l, l);
        if (!o.maskAll) {
            let   start = 0; // plug o.value
            const plugs = [];
            for (i = 0; i < l; i++)
                (o.mask[start] == i) ? ++start : plugs.push(i);
            o.value.forEach((arr, j) => {
                for (i of plugs)
                    arr[i] = o.cv[j][i];
           });
        }
        return;
    } //-----------------------------
    if (!o.seps && !PBase._seps(o)) {
        o.value = Ez.newArray2D(o.l, 1);
        return;
    } //------------------------------------------------------------------
    // nb and ne indicate that o.value[n] starts or ends with a calculated
    // number, not a plugged number as string.
    const nb = o.maskAll ? o.numBeg : o.numBeg && (o.mask[0] == 0);
    const ne = o.maskAll ? o.numEnd : o.numEnd && (o.mask.at(-1) == o.c - 1);
    const lv = o.lm * 2 - (nb && ne) + !(nb || ne);

    // i, m, mi, and p are array indexes (mask values are array indexes)
    //   i  = elm  index: arr[i] = o.value[j][i]
    //   p  = plug index: sep[p] & val[p] (o.seps[j][p] & o.cv[j][p])
    //   m  = mask value: sets boundaries, doesn't get array values
    //   mi = mask index: o.mask[mi]
    let p;
    const izero = Number(nb);        // start for (i) at 0 or 1
    const pzero = Number(o.numBeg);  // ditto for (p) if (!o.maskAll)
    if (o.maskAll) {
        o.value = Ez.newArray2D(o.l, lv);
        for (const arr of o.value)
            for (i = izero, p = 0; i < lv; i += 2, p++)
                arr[i] = o.seps[p];
    }
    else {
        let m, mi, seps, vals;
        if (!o.isNet && o.numEnd && !ne)         // pad the end of o.seps to
            o.seps.forEach(arr => arr.push("")); // simplify the inner for loop

        // pre-filling o.value with "" allows for += in the innermost while loop
        o.value = Array.from({length:o.l}, () => Array(lv).fill(""));
        o.value.forEach((arr, j) => {
            seps = o.isNet ? o.seps[j] : o.seps;
            vals = o.cv[j];
            if (!vals)
                throw new Error(`elms[${j}] has no value for ${o.prop.name}`);
            //------------------
            if (o.numBeg && !nb)
                arr[0] = vals[0];
            for (i = izero, p = pzero, mi = i; i < lv; i += 2, p++, mi++) {
                m = mi < o.lm ? o.mask[mi] : o.c;
                while (p < m && vals[p])
                    arr[i] += seps[p] + vals[p++];
                arr[i] += seps[p];
            }
        });
    }
    if (o.easies && o.loopByElm) //!!
        o.maskCV = o.mask;       //!!?? unused, but MEaser loopByElm is untested
    i = Number(!nb);
    o.mask = o.mask.map((_, j) => j * 2 + i);
}