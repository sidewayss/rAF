export {easingFromObj, easingFromForm};

import {Is, Ez}  from "../../raf.js";
import {splitIO} from "../../easy/easy-construct.js";

import {msecs}             from "../update.js";
import {formatInputNumber} from "../input-number.js";
import {MILLI, TWO, elms, g, orUndefined, elseUndefined}
                           from "../common.js";

import {MSG, disableClear} from "./msg.js";
import {setLink, isPow}    from "./tio-pow.js";
import {LINK, TYPE, IO, POW, twoLegs, isBezier, bezierArray}
                           from "./index.js";
//==============================================================================
// easingFromObj() creates an object from localStorage and updates controls,
//                 called exclusively by formFromObj().
function easingFromObj(obj, leg0, leg1) {
    const isBez = isBezier();
    if (isBez)
        for (let i = 0; i < 4; i++)
            formatInputNumber(elms.beziers[i], obj.bezier[i]);
    else if (isPow())
        formatInputNumber(elms.pow, obj.pow ?? leg0.pow);

    if (leg1?.pow)
        formatInputNumber(elms.pow2, leg1.pow);
    else
        elms.pow2.value = elms.pow.value;

    let elm, id, isDefN, n, val;
    [leg0?.end,                          // #mid,
     leg0?.time,                         // #split,
     leg1?.wait].forEach((v, i) => {     // #gap - initial default values:
        id  = MSG[i];
        elm = elms[id];
        n   = obj[id] ?? v;
        isDefN = Is.def(n)
        val    = isDefN ? n / getDF(id)  // default value
                        : elm.default(); // fallback
        formatInputNumber(elm, val);
        disableClear(elm, val, isDefN);
    });
    if (!isBez) {                        // bezier has only one leg here
        elms.type2.value = leg1?.type ?? g.type;
        for (id of [TYPE, POW])          // #linkType and #linkPow
            setLink(
                elms[Ez.toCamel(LINK, id)],
                elms[id].value == elms[id + TWO].value
            );
    }
}
// easingFromForm() creates an object from controls for localStorage or
//                  new Easy(), called exclusively by objFromForm().
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
        let pow2, type2;
        const
        ios   = splitIO(g.io, true).map(v => orUndefined(v)),
        time2 = msecs - split - gap;
        type2 = Number(elms.type2.value);
        pow2  = elseUndefined(isPow(type2), elms.pow2.valueAsNumber);
        type2 = orUndefined(type2);         // can't be undefined for isPow()

        for (let id of ["time", TYPE, IO])  // set by each leg instead
            delete obj[id];

        obj.legs = [
            {time:split, type:orUndefined(g.type), io:ios[0], pow, end:mid},
            {time:time2, type:type2,               io:ios[1], pow:pow2,
             wait:orUndefined(gap)}
        ];
        return obj;
    }
    else
        return Object.assign(obj, {mid, split, gap, pow,
                                   bezier:elseUndefined(isBez, bezierArray())});
}
// getDF() gets a divisor or factor
function getDF(id) {
    return id.endsWith("d") ? 1 : MILLI; // "mid" ends with "d"
}