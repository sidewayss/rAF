export {easingFromObj, easingFromForm, drawEasing};

import {E, Is, P, Ez, Easy} from "../../raf.js";
import {splitIO}            from "../../easy/easy-construct.js";

import {msecs, frames, frameCount} from "../update.js";
import {setLocalBool}              from "../local-storage.js";
import {MILLI, TWO, elms, g, formatInputNumber, orUndefined, elseUndefined}
                                   from "../common.js";

import {chart}                               from "./chart.js";
import {MSG, disableClear}                   from "./msg.js";
import {TIME, TYPE, IO, POW, setLink, isPow} from "./tio-pow.js";
import {LINK, pointToString, twoLegs, isBezier, bezierArray} from "./index.js";
//==============================================================================
// easingFromObj() creates an object from localStorage and updates controls,
//                   called exclusively by formFromObj()
function easingFromObj(obj, legs) {
    elms.type2.value = legs?.[1]?.type ?? g.type;
    if (isPow())
        formatInputNumber(elms.pow, obj.pow ?? legs[0].pow);
    else if (isBezier()) {
        const strBez = Easy.type[E.bezier];
        for (let i = 0; i < 4; i++)
            formatInputNumber(elms[strBez + i], obj.bezier[i]);
    }
    if (legs?.[1].pow)
        formatInputNumber(elms.pow2, legs[1].pow);
    else
        elms.pow2.value = elms.pow.value;

    let elm, id, isDefN, n, val;
    for (id of [TYPE, POW])
        setLink(elms[Ez.toCamel(LINK, id)], // #linkType and #linkPow
                elms[id].value == elms[id + TWO].value);

    [legs?.[0].end,                      // mid,
     legs?.[0].time,                     // split,
     legs?.[1].wait].forEach((v, i) => { // gap initial default values:
        id  = MSG[i];
        elm = elms[id];
        n   = obj[id] ?? v;
        isDefN = Is.def(n)
        val    = isDefN ? n / getDF(id)  // default value
                        : elm.default(); // fallback
        formatInputNumber(elm, val);
        disableClear(elm, n, isDefN);
    });
}
// easingFromForm() creates an object from controls for localStorage or
//                   new Easy(), called exclusively by objFromForm().
function easingFromForm(obj) {
    let gap, mid, pow, split;
    const isP   = isPow();
    const isBez = isBezier();
    const has2  = !isBez && twoLegs();
    const useLegs = has2 && ((elms.type.value != elms.type2.value)
                          || (isP && elms.pow.value != elms.pow2.value));
    if (has2)
        [mid, split, gap] = MSG.map(id =>
            elseUndefined(useLegs || !elms[id].clear.disabled,
                          elms[id].valueAsNumber * getDF(id)));

    if (isP)
        pow = elms.pow.valueAsNumber;

    if (useLegs) {
        const ios   = splitIO(g.io, true).map(v => orUndefined(v));
        const time2 = msecs - split - gap;
        const type2 = orUndefined(Number(elms.type2.value));
        const pow2  = elseUndefined(isPow(type2), elms.pow2.valueAsNumber);

        for (let id of [TIME,TYPE,IO]) // set by each leg instead
            delete obj[id];

        obj.legs = [
            {time:split, end:  mid, type:orUndefined(g.type), io:ios[0], pow},
            {time:time2, start:mid, type:type2,     wait:gap, io:ios[1], pow:pow2}
        ];
        return obj;
    }
    else
        return Object.assign(obj, {mid, split, gap, pow,
                                   bezier:elseUndefined(isBez, bezierArray())});
}
//==============================================================================
// drawEasing() helps drawLine()
function drawEasing(evt) {
    let str;
    if (elms.drawAsSteps.checked) {
        str = frames.map((frm, i) =>
            `${pointToString(frm.x, frm.y)} `
          + `${pointToString(frames[Math.min(i + 1, frameCount)].x, frm.y)}`
        );
    }
    else
        str = frames.map(frm => `${pointToString(frm.x, frm.y)}`);

  //chart.line.setAttribute(Pn.points, str.join(E.sp));
    P.points.set(chart.line, str.join(E.sp));
    if (evt)
        setLocalBool(evt.target);
}
function getDF(id) { // divisor or factor
    return id.endsWith("d") ? 1 : MILLI; // "mid" ends with "d"
}