// export everything but update
export {initEzXY, updateTrip, twoLegs, isBezier, bezierArray};

export let ezY;
export const
LINK  = "link",
OTHER = "other",
TYPE  = "type",  // would be in tio-pow.js if not for _update.js
IO    = "io",
POW   = "pow";

import {E, P, Easy} from "../../raf.js";

import {ezX}                        from "../load.js";
import {PLAYS, elms, g, errorAlert} from "../common.js";
//==============================================================================
// Animation object functions:
// initEzXY() <= refresh(), loadFinally=>initEasies(), openNamed=>updateNamed()
function initEzXY(obj) {
    g.easies.delete(ezY);
    try { ezY = new Easy(obj); }
    catch (err) {
        let msg;
        if (err.cause) {          // only a few causes set at this time
            msg = err.message;
            switch (err.cause) {
            case "reverse time":  // time only goes up
                elms.easyTiming.selectedIndex = 0;
                break;
            case "zero steps":    // elms.steps, elms.jump
                document.activeElement.selectedIndex = 1;
            case "multiPlayTripNoAuto":
            default:
            }
        }
        errorAlert(err, msg);
        return false;
    } //-------------
    g.easies.add(ezY);
    ezX.time = obj.legs
             ? obj.legs[0].time + obj.legs[1].time + (obj.legs[1].wait ?? 0)
             : obj.time || obj.timing.at(-1);

    for (const prop of [PLAYS, "loopWait", ...g.trips.map(elm => elm.id)])
        ezX[prop] = obj[prop];

    return true;
}
//==============================================================================
// updateTrip() updates roundTrip display, called by openNamed(), initEasies(),
//              change.roundTrip()
function updateTrip(isTrip = elms.roundTrip.checked) {
    elms.roundTrip.label = "Round trip" + (isTrip ? ":" : " ");
    P.visible([elms.flipTrip, elms.autoTrip, elms.tripWait], isTrip);
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