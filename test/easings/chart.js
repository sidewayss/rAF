export {chart, range, loadChart, isOutOfBounds};
const chart = {};  // SVG chart elements and viewBox array
const range = {};  // SVG vertical pseudo-range element

import {E, Is, Ez} from "../../raf.js";

import {ezX, msecs, secs} from "../load.js";
import {updateTime}       from "../update.js";
import {COUNT, CHANGE, elms, g, addEventsByElm, changeNumber}
                          from "../common.js";

import {redraw}                         from "./_update.js";
import {updateSplitGap}                 from "./msg.js";
import {updateTypeIO}                   from "./tio-pow.js";
import {isSteps, vtFromElm}             from "./steps.js";
import {twoLegs, isBezier, bezierArray} from "./index.js";
//==============================================================================
function loadChart() {
    const byClass = document.getElementsByClassName("chart");
    addEventsByElm(CHANGE, byClass, handlers, true);
}
const handlers = { // event handlers: function name = toCamel(CHANGE, elm.id)
    changeTime(evt) {
        let oldEzY;
        updateTime();
        if (isSteps()) {        // crude, but viable, setting all three the same
            for (let i = 0; i < COUNT; i++)
                elms["t" + i].max = secs;
            oldEzY = true;      // set ezY.time, don't call newEzY()
        }
        else {
            updateSplitGap();   // setSplitGap() already called by inputTime()
            oldEzY = isUnlocked(elms.split)
                 && (isUnlocked(elms.gap) || elms.gap.clear.disabled);
        }
        ezX.time = msecs;
        redraw(evt.target, oldEzY ? msecs : 0);
    },
    changeDirection(evt) {
        const txt = elms.end.textContent;
        elms.end  .textContent = elms.start.textContent;
        elms.start.textContent = txt;
        redraw(evt.target);
    },
    changeIo(evt) {
        g.io = Number(evt.target.value);
        updateTypeIO(true);
        redraw(evt.target, 0, updateTypeIO(true), false);
    },
    changeType(evt) {   // #type, #type2
        let n, has2, isBS, oobOld, wasBS;
        const tar    = evt.target;
        const isType = (tar === elms.type);

        oobOld = isOutOfBounds();
        n      = Number(tar.value);
        isBS   = isBezier() || isSteps();
        if (isType) {
            g.type = n;
            wasBS  = isBS;
            isBS   = isBezier() || isSteps();
        }
        else if (elms.linkType.value)
            g.type = n;

        has2 = twoLegs();
        if (has2 && isBS)
            g.io = E.in;  // changes variable, not <select>
        else if (wasBS)
            g.io = Number(elms.io.value);

        has2 = updateTypeIO(false);
        if (has2)         // has2 depends on g.io
            oobOld |= isOutOfBounds(Number(elms.type2.value));

        redraw(tar, 0, has2, isBS, oobOld);
    },
    changePow(evt) {    // #pow, #pow2
        if (changeNumber(evt.target) !== null)
            redraw(tar, 0, undefined, false);
    },
    changeBezier(evt) { // #bezier0-3
        redraw(evt.target, 0, false, true, isOutOfBounds());
    }
};
//===========================================================================
// isOutOfBounds() returns a boolean indicating if any points are outside of
//                   the 0-1000 range,
function isOutOfBounds(val = g.type) { // <= changeType(), changeBezier()
    let arr;
    switch (val) {
    case E.bezier:
        arr = bezierArray();             // returns Array
        break;
    case E.steps:
        arr = vtFromElm(elms.values);    // returns Array, String or undefined
        break;
    case E.back: case E.elastic:
        return true;
    default:
        return false;
    }
    return Is.A(arr) ? Ez.unitOutOfBounds(arr)
                     : Boolean(arr);
}