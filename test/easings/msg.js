// #mid, #split, #gap are all <input type="number">
// export everything but LOCK, LOCKED, handlers, changeMSG
export {MSG, loadMSG, updateMidSplit, disableClear, updateSplitGap, setSplitGap};
const MSG = ["mid","split","gap"];

import {Ez, P, U} from "../../raf.js";

import {msecs, secs} from "../load.js";
import {MILLI, CLICK, INPUT, CHANGE, elms, g, addEventToElms, addEventsByElm,
        addEventByClass, formatInputNumber, changeNumber, toggleClass,
        initialCap, toCamel, toFunc, isTag} from "../common.js";

import {redraw}          from "./_update.js";
import {chart}           from "./chart.js";
import {isSteps}         from "./steps.js";
import {OTHER, isBezier} from "./index.js";

let sgInputs;
const LOCK   = "lock";
const LOCKED = "locked"
const locks  = ["lock_open", LOCK]; // boolean acts as index
//==============================================================================
// loadMSG() is called by easings.loadIt(), once per session
function loadMSG() {
    let elm, id, key, obj, val;
    const CLEAR = "clear";

    elm = elms.clearMid;
    Ez.readOnly(elm, OTHER, elms.mid);
    Ez.readOnly(elms.mid, CLEAR, elm);

    const div    = elms.divSplit;
    const divGap = toCamel("div", MSG[2]);
    div.id = "";
    elms[divGap] = div.cloneNode(true);
    elms.divGap.style.marginTop = "1" + U.px;

    for (id of MSG.slice(1)) {  // split, gap
        obj = {};
        for (elm of elms[toCamel("div", id)].children) {
            if (isTag(elm, INPUT)) {
                elm.id   = id;
                elms[id] = elm;
                Ez.readOnly(obj[CLEAR], OTHER, elm);
                for ([key, val] of Object.entries(obj))
                    Ez.readOnly(elm, key, val);
            }
            else if (isTag(elm, "label")) {
                elm.htmlFor = id;
                if (!elm.textContent)                    // 5 = "split".length
                    elm.innerHTML = initialCap(id).padStart(5) + ":";
            }
            else    // <button>s precede <input> in html, so they're saved here
                obj[elm.className] = elm;
        }
    }
    formatInputNumber(elms.split, elms.time.valueAsNumber / 2);
    formatInputNumber(elms.gap, 0);
    div.parentNode.insertBefore(elms[divGap], div.nextElementSibling);

    elms.mid  .default = () => MILLI / 2;   // constant
    elms.split.default = () => secs  / 2;   // variable
    elms.gap  .default = () => 0;           // constant

    const msgInputs = MSG.map(v => elms[v]);
    sgInputs = msgInputs.slice(1);
    addEventByClass(CLICK,  CLEAR, null, handlers);
    addEventByClass(CLICK,  LOCK,  null, handlers);
    addEventsByElm (INPUT,  msgInputs.slice(0, -1), handlers); // mid, split
    addEventToElms (CHANGE, msgInputs, changeMSG);
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
        const elm = evt.target[OTHER]; // #mid, #split, or #gap
        const n   = elm.default();
        formatInputNumber(elm, n);     // toFunc() = inputMid() or inputSplit()
        toFunc(INPUT, initialCap(elm.id), handlers)?.();
        disableClear(elm, n, false);
        redraw(elm, 0, true);
    },
//  clickLock()  click event handler for #lockSplit, #lockGap
    clickLock(evt) {
        const tar = evt.target;
        const b   = isUnlocked(tar);
        toggleClass(tar, LOCKED, b);
        tar.textContent = locks[Number(b)];
    }
};
// changeMSG()  change event handler for #mid, #split, #gap
function changeMSG(evt) {   // outside of handlers for convenience
    const tar = evt.target;
    const n   = changeNumber(tar);
    if (n !== null) {
        disableClear(tar, n, true);
        redraw(tar, 0, true);
    }
}
//==============================================================================
// updateMidSplit() makes exporting this pair easier, called by updateAll()
function updateMidSplit() {
    handlers.inputMid();
    handlers.inputSplit();
}
// disableClear() helps changeMSG() and clickClear(), also called by
//               easingFromLocal(), returns a factor/divisor.
function disableClear(elm, n, isDef) {
    elm.clear.disabled = !isDef || n == elm.default();
    elm.clear.enabled  = !elm.clear.disabled;
}
// updateSplitGap() is called by updateAll() and changeTime()
function updateSplitGap() {
    elms.split.max = Math.max(secs - 0.1, 0);
    elms.gap  .max = Math.max(secs - elms.split.valueAsNumber - 0.1, 0);

    for (const elm of sgInputs)
        if (elm.valueAsNumber > elm.max)
            formatInputNumber(elm, elm.max);
}
// setSplitGap() calculates and sets the automated values for #split and #gap,
//               based on time and secs, if necessary, called by updateTypeIO()
//               and inputTime().
function setSplitGap(time = msecs) {
    if (!isBezier() && !isSteps())
        for (const elm of sgInputs)
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