export {loadChart, isOutOfBounds};
export const
chart = {},  // SVG chart elements and viewBox array
range = {};  // SVG vertical pseudo-range element

import {E, Is, Ez} from "../../raf.js";

import {msecs, updateTime} from "../update.js";
import {CHANGE, INPUT, elms, g, addEventsByElm, listenInputNumber, isInvalid}
                           from "../common.js";

import {refresh}        from "./_update.js";
import {updateTypeIO}   from "./tio-pow.js";
import {updateSplitGap, isUnlocked}     from "./msg.js";
import {isSteps, maxTime, vtFromElm}    from "./steps.js";
import {twoLegs, isBezier, bezierArray} from "./index.js";
//==============================================================================
function loadChart() {
    let elements = document.getElementsByClassName("chart");
    addEventsByElm(CHANGE, elements, change, true);

    elements = document.getElementsByClassName("chart-number");
    listenInputNumber(elements);                      // must go first
    addEventsByElm(INPUT, elms.beziers, input,  true);
}
//==============================================================================
// Event handlers all call refresh().
// >> input event handlers:
const input = {
//    pow(evt) {    // #pow, #pow2
//        refresh(evt.target, 0, undefined, false);
//        inputOne(evt, [, false]);
//    },
    bezier(evt) { // #bezier0-3
        if (!isInvalid(evt.target))
            refresh(evt.target, 0, false, true, isOutOfBounds());
//        inputOne(evt, [false, true, isOutOfBounds()]);
    }
};
//function inputOne(evt, args) {
//    if (changeNumber(evt.target) !== null)
//        refresh(evt.target, 0, ...args);
//}
//--------------------------
// >> change event handlers:
const change = {
    time(evt) {
        let oldEzY;
        updateTime();
        if (isSteps()) {
            maxTime();          // userTiming[i].max = secs
            oldEzY = true;      // set ezY.time, don't call newEzY()
        }
        else {
            updateSplitGap();   // setSplitGap() already called by inputTime()
            oldEzY = isUnlocked(elms.split)
                 && (isUnlocked(elms.gap) || elms.gap.clear.disabled);
        }
        refresh(evt.target, oldEzY ? msecs : 0);
    },
    direction(evt) {
        const txt = elms.end.textContent;
        elms.end  .textContent = elms.start.textContent;
        elms.start.textContent = txt;
        refresh(evt.target);
    },
    io(evt) {
        g.io = Number(evt.target.value);
        refresh(evt.target, 0, updateTypeIO(true), false);
    },
    type(evt) {   // #type, #type2
        let n, has2, isBS, oobOld, wasBS;
        const tar    = evt.target;
        const isType = (tar === elms.type);

        oobOld = isOutOfBounds();
        n      = Number(tar.value);
        isBS   = isBezier() || isSteps();
        if (isType) {       // versus #type2
            g.type = n;
            wasBS  = isBS;  // stash previous state
            isBS   = isBezier() || isSteps();
        }
        else if (elms.linkType.value)
            g.type = n;     // user changed #type2 and type is linked

        has2 = twoLegs();
        if (has2 && isBS)   // modify variable, not <select>
            g.io = E.in;
        else if (wasBS)     // restore variable to match <select>
            g.io = Number(elms.io.value);

        has2 = updateTypeIO(false);
        if (has2)           // has2 depends on g.io
            oobOld |= isOutOfBounds(Number(elms.type2.value));

        refresh(tar, 0, has2, isBS, oobOld);
    }
};
//===========================================================================
// isOutOfBounds() returns a boolean indicating if any points are outside of
//                   the 0-1000 range,
function isOutOfBounds(val = g.type) { // <= change.type(), change.bezier()
    let arr;
    switch (val) {
    case E.bezier:
        arr = bezierArray();                // Array
        break;
    case E.steps:
        arr = vtFromElm(elms.values, true); // Array, String or undefined
        break;
    case E.back: case E.elastic:
        return true;
    default:
        return false;
    }
    return Is.A(arr) ? Ez.unitOutOfBounds(arr)
                     : Boolean(arr);
}