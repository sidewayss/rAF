// export everything but update
export {initEzXY, newEzY, updateTrip, twoLegs, isBezier, bezierArray};

export let ezY;
export const
    LINK   = "link",
    OTHER  = "other",
    TYPE   = "type",    // would be in tio-pow.js if not for _update.js
    IO     = "io",
    POW    = "pow"
;

import {E, P, Easy} from "../../raf.js";

import {ezX}                        from "../load.js";
import {PLAYS, elms, g, errorAlert} from "../common.js";
//==============================================================================
// Animation object functions:
// initEzXY() called by loadFinally=>updateAll(), openNamed=>updateNamed()
function initEzXY(obj) {
    const b = Boolean(newEzY(obj));
    if (b) {
        ezX.time = obj.legs
                 ? obj.legs[0].time + obj.legs[1].time + (obj.legs[1].wait ?? 0)
                 : obj.time || obj.timing.at(-1);
        for (const prop of [PLAYS, "loopWait", ...g.trips.map(elm => elm.id)])
            ezX[prop] = obj[prop];
    }
    return b;
}
// newEzY() called by initEzXY() and refresh()
function newEzY(obj) {
    g.easies.delete(ezY);
    try {
        ezY = new Easy(obj);
    } catch (err) {
        switch (err.cause) {
        case "multiPlayTripNoAuto":
        case "reverse time":
            alert(err.message);
            break;
        default:
            errorAlert(err);
        }
        return;
    }
    g.easies.add(ezY);
    return obj;
}
//==============================================================================
// updateTrip() updates roundTrip display, called by openNamed(), initEasies(),
//              change.roundTrip()
function updateTrip(isTrip = elms.roundTrip.checked) {
    const isAuto = isTrip && elms.autoTrip.checked;
    elms.roundTrip.label = "Round trip" + (isTrip ? ":" : "");

    P.visible([elms.flipTrip, elms.autoTrip], isTrip);
    P.visible(elms.tripWait.parentNode,       isAuto);
}
//==============================================================================
// Boolean functions:
// twoLegs() <= easingFromForm(), updateTypeIO(), refresh()
function twoLegs(val = g.io) {
    return val > E.out; // > E.out = two legs
}
// isBezier() <= easingFromObj(), easingFromForm(), updateTypeIO(),
//               refresh(), objFromForm(), setSplitGap().
function isBezier(val = g.type) {
    return val == E.bezier;
}
// bezierArray() converts the 4 <input>s' values into an array of 4 numbers,
//               <= easingFromForm(), refresh(), isOutOfBounds().
function bezierArray() {
    return elms.beziers.map(elm => elm.valueAsNumber);
}