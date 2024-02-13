export {easingFromLocal, easingFromForm, drawEasing};

import {E, Is, P, Easy} from "../../raf.js";

import {msecs}         from "../load.js";
import {points}        from "../update.js";
import {setLocalBool}  from "../local-storage.js";
import {MILLI, TWO, elms, g, formatInputNumber, twoToCamel, orUndefined,
        elseUndefined} from "../common.js";

import {chart}         from "./chart.js";
import {midSplitGap}   from "./msg.js";
import {TIME, TYPE, IO, POW, setLink, isPow}
                       from "./tio-pow.js";
import {LINK, pointToString, twoLegs, isBezier, bezierArray}
                       from "./index.js";
//==============================================================================
// easingFromLocal() creates an object from localStorage and updates controls
//                   called exclusively by formFromObj()
function easingFromLocal(obj, legs) {
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

    let d, elm, id, isDef, n, v;
    for (id of [TYPE, POW])
        setLink(elms[twoToCamel(LINK, id)], // #linkType and #linkPow
                elms[id].value == elms[id + TWO].value);

    for ([id, v] of [["mid",   legs?.[0].end],
                     ["split", legs?.[0].time],
                     ["gap",   legs?.[1].wait]]) {
        elm   = elms[id];
        n     = obj[id] ?? v;               // first layer of default values
        isDef = Is.def(n)                   // isDefined not isDefault
        d = midSplitGap(elm, n, isDef, id); // d for divisor, denominator
        v = isDef ? n / d : elm.default();  // second layer of defaults
        formatInputNumber(elm, v);
    }
    return obj;
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
    if (has2) {
        if (useLegs || !elms.clearMid.disabled)
            mid = elms.mid.valueAsNumber;
        if (useLegs || !elms.clearSplit.disabled)
            split = elms.split.valueAsNumber * MILLI;
        if (useLegs || !elms.clearGap.disabled)
            gap = elms.gap.valueAsNumber * MILLI;
    }
    if (isP)
        pow = elms.pow.valueAsNumber;

    if (useLegs) {
        const ios   = Easy.splitIO(g.io, true).map(v => orUndefined(v));
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
    if (elms.drawSteps.checked) {
        str = points.map((p, i) =>
                `${pointToString(p.x, p.y)} `
              + `${pointToString(points[i < g.frames ? i + 1 : i].x, p.y)}`);
    }
    else
        str = points.map(p => `${pointToString(p.x, p.y)}`);

  //chart.line.setAttribute(Pn.points, str.join(E.sp));
    P.points.set(chart.line, str.join(E.sp));
    if (evt)
        setLocalBool(evt.target);
}