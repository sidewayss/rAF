// #mid, #split, #gap are all <input type="number">
// export everything but LOCK, LOCKED, handlers, changeMSG
export {loadMSG, updateMidSplit, midSplitGap, updateSplitGap, setSplitGap};

import {Is, Ez, P} from "../../raf.js";

import {msecs, secs} from "../load.js";
import {MILLI, CLICK, INPUT, CHANGE, elms, g, addEventToElms, addEventsByElm,
        addEventByClass, formatInputNumber, changeNumber, toggleClass,
        initialCap, twoToCamel, toFunc} from "../common.js";

import {redraw}          from "./_update.js";
import {chart}           from "./chart.js";
import {isSteps}         from "./steps.js";
import {OTHER, isBezier} from "./index.js";

const LOCK   = "lock";
const LOCKED = "locked"
//==============================================================================
// loadMSG() is called by easings.loadIt(), once per session
function loadMSG() {
    let arr, elm, elm2, prop;
    const CLEAR = "clear";
    const MSG   = [elms.mid, elms.split, elms.gap]

    Ez.readOnly(g, "locks", ["lock_open", LOCK]); // boolean acts as index

    for ([prop, arr] of [[CLEAR, MSG], [LOCK, MSG.slice(1)]]) {
        for (elm of arr) {
            elm2 = elms[twoToCamel(prop, elm.id)];
            Ez.readOnly(elm,  prop,  elm2);
            Ez.readOnly(elm2, OTHER, elm); // lock.other is unused!!
        }
    }
    elms.mid  .default = () => MILLI  / 2; // constant
    elms.split.default = () => secs / 2; // variable
    elms.gap  .default = () => 0;          // constant

    addEventByClass(CLICK,  CLEAR, null,      handlers);
    addEventByClass(CLICK,  LOCK,  null,      handlers);
    addEventsByElm (INPUT,  MSG.slice(0, -1), handlers);
    addEventToElms (CHANGE, MSG, changeMSG);
}
const handlers = {
//  inputMid()   input event handler for #mid, <= updateMidSplit()
    inputMid() {
        const val = elms.mid.valueAsNumber;
        P.y1.setIt(chart.dashY, val);
        P.y2.setIt(chart.dashY, val);
    },
//  inputSplit() input event handler for #split, <= updateMidSplit()
    inputSplit() {
        const val = elms.split.valueAsNumber / secs * MILLI;
        P.x1.setIt(chart.dashX, val);
        P.x2.setIt(chart.dashX, val);
    },
//  clickClear() click event handler for #clearMid, #clearSplit, #clearGap
    clickClear(evt) {
        const elm = evt.target.other; // #mid, #split, or #gap
        const id  = elm.id;
        const n   = elm.default();
        formatInputNumber(elm, n);    // toFunc() = inputMid() or inputSplit()
        toFunc(INPUT, initialCap(id), handlers)?.();
        midSplitGap(elm, n, false, id);
        redraw(elm, 0, true);
    },
//  clickLock()  click event handler for #lockSplit, #lockGap
    clickLock(evt) {
        const tar = evt.target;
        const b   = isUnlocked(tar);
        toggleClass(tar, LOCKED, b);
        tar.textContent = g.locks[Number(b)];
    }
};
// changeMSG()  change event handler for #mid, #split, #gap
function changeMSG(evt) {   // outside of handlers for convenience
    const tar = evt.target;
    const n   = changeNumber(tar);
    if (n !== null) {
        midSplitGap(tar, n, true, tar.id);
        redraw(tar, 0, true);
    }
}
//==============================================================================
// updateMidSplit() makes exporting these two easier, called by updateAll()
function updateMidSplit() {
    handlers.inputMid();
    handlers.inputSplit();
}
// midSplitGap() helps changeMSG() and clickClear(), also called by
//               easingFromLocal(), returns a factor/divisor.
function midSplitGap(elm, n, isDef, id) {
    elm.clear.disabled = !isDef || n == elm.default();
    elm.clear.enabled  = !elm.clear.disabled;
    return id.endsWith("d") ? 1 : MILLI;    // "mid" ends with "d"
}
// updateSplitGap() is called by updateAll() and changeTime()
function updateSplitGap() {
    elms.split.max = Math.max(secs - 0.1, 0);
    elms.gap  .max = Math.max(secs - elms.split.valueAsNumber - 0.1, 0);

    for (const elm  of [elms.split, elms.gap])
        if (elm.valueAsNumber > elm.max)
            formatInputNumber(elm, elm.max);
}
// setSplitGap() calculates and sets the automated values for #split and #gap,
//               based on time and secs, if necessary, called by updateTypeIO()
//               and inputTime().
function setSplitGap(time = msecs) {
    if (!isBezier() && !isSteps())
        for (const elm of [elms.split, elms.gap])
            if (isUnlocked(elm.lock))
                if (!elm.clear.disabled) {
                    if (time != msecs)       // scale value by time
                        formatInputNumber(elm, elm.valueAsNumber * (msecs / time));
                }
                else if (elm === elms.split) // split = 50% of time
                    formatInputNumber(elms.split, secs / 2);
}
// isUnlocked() helps clickLock() and setSplitGap();
function isUnlocked(elm) {  // not exported
    return elm.textContent.length > LOCK.length;
}