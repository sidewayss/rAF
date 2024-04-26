// export everything but update
export {ezY, LINK, OTHER, initEzXY, newEzY,
        pointToString, updateTrip, twoLegs, isBezier, bezierArray};

import {E, P, Easy} from "../../raf.js";

import {ezX}                        from "../load.js";
import {PLAYS, elms, g, errorAlert} from "../common.js";

import {objEz} from "./_named.js";
import {TIME}  from "./tio-pow.js";

let ezY;
const LINK  = "link";
const OTHER = "other";
//==============================================================================
// Animation object functions:
// initEzXY() called by loadFinally=>updateAll(), openNamed=>updateNamed()
function initEzXY(obj) {
    const b = Boolean(newEzY(obj));
    if (b)
        for (const prop of [TIME, PLAYS, "loopWait", ...g.trips.map(elm => elm.id)])
            ezX[prop] = obj[prop];
    return b;
}
// newEzY() called by initEzXY() and refresh()
function newEzY(obj = objEz) {
    g.easies.delete(ezY);
    try {
        ezY = new Easy(obj);
    } catch (err) {
        errorAlert(err);
        return;
    }
    g.easies.add(ezY);
    return obj;
}
//==============================================================================
// pointToString() converts x and y to a comma-separated pair of coordinates,
//                 called by drawEasing(), drawSteps().
function pointToString(x, y) {
    return `${x.toFixed(2)},${y.toFixed(2)}`;
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