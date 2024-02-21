// export everything but update
export {ezY, LINK, OTHER, updateEzXY, newEzY, newTargets,
        pointToString, trip, twoLegs, isBezier, bezierArray};

import {E, P, Easy} from "../../raf.js";

import {ezX, raf}          from "../load.js";
import {updateFrame, eGet} from "../update.js";
import {PLAYS, elms, g, elseUndefined, errorAlert} from "../common.js";

import {objFromForm}  from "./_named.js";
import {TIME}         from "./tio-pow.js";
import {chart, range} from "./chart.js";

let ezY;
const LINK  = "link";
const OTHER = "other";
//==============================================================================
// Animation object functions:
// updateEzXY() called by initDoc() and openNamed()
function updateEzXY(obj) {
    const b = Boolean(newEzY(obj));
    if (b)
        for (var prop of [TIME,PLAYS,"loopWait", ...g.trips.map(elm => elm.id)])
            ezX[prop] = obj[prop];
    return b;
}
// newEzY() called by updateEzXY() and redraw()
function newEzY(obj = objFromForm()) {
    g.easies.delete(ezY);
    try {
        ezY = new Easy(obj);
    } catch(err) {
        errorAlert(err);
        return;
    }
    newTargets();
    g.easies.add(ezY);
    return obj;
}
// newTargets() called by newEzY() and changeByElm()
function newTargets(loopByElm = elms.loopByElm.checked) {
    ezX.clearTargets();         // ezY guaranteed clear already
    if (g.targetX)              // not populated yet when page loading
        ezX.addTarget(g.targetX);

    for (var [ez, prop, cr, peri] of [[ezX, P.cx, chart],
                                      [ezY, P.cy, chart, update],
                                      [ezY, P.cy, range]])
        ez.newTarget({prop, elms:cr.active, peri, loopByElm});
}
// update() is the easy.peri() callback, filters arguments for updateFrame
function update(_, __, elm) { // not exported
    updateFrame(parseFloat(elm.style.cx), parseFloat(elm.style.cy), eGet(ezY));
}
//==============================================================================
// pointToString() converts x and y to a comma-separated pair of coordinates,
//                 called by drawEasing(), drawSteps().
function pointToString(x, y) {
    return `${x.toFixed(2)},${y.toFixed(2)}`;
}
//==============================================================================
// trip() sets round-trip properties, called by openNamed(), updateAll(),
//        changeCheck(target:#roundTrip)
function trip(isTrip = elms.roundTrip.checked) {
    const isAuto = isTrip && elms.autoTrip.checked;
    elms.roundTrip.label = "Round trip" + (isTrip ? ":" : "");
    P.visible(elms.flipTrip, isTrip);
    P.visible(elms.autoTrip, isTrip);
    P.visible(elms.tripWait.parentNode, isAuto);
}
//==============================================================================
// Boolean functions:
// twoLegs() <= easingFromForm(), updateTypeIO(), redraw()
function twoLegs(val = g.io) {
    return val > E.out; // > E.out = two legs
}
// isBezier() <= easingFromLocal(), easingFromForm(), updateTypeIO(),
//               redraw(), objFromForm(), setSplitGap().
function isBezier(val = g.type) {
    return val == E.bezier;
}
// bezierArray() converts the 4 <input>s' values into an array of 4 numbers,
//               <= easingFromForm(), redraw(), isOutOfBounds().
function bezierArray() {
    return elms.beziers.map(elm => elm.valueAsNumber);
}