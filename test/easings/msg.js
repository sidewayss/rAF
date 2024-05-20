// #mid, #split, #gap are all <input type="number">
export {loadMSG, updateMidSplit, disableClear, updateSplitGap, setSplitGap,
        isUnlocked};
export const MSG = ["mid","split","gap"];

import {Ez, P, U} from "../../raf.js";

import {msecs, secs} from "../update.js";
import {listenInputNumber, formatInputNumber, isInvalid, invalidInput, maxMin}
                     from "../input-number.js";
import {MILLI, CLICK, INPUT, CHANGE, elms, addEventToElms, addEventsByElm,
        addEventByClass, toggleClass, isTag, boolToString}
                     from "../common.js";

import {chart, refresh}  from "./_update.js";
import {isSteps}         from "./steps.js";
import {OTHER, isBezier} from "./index.js";

let sgInputs;
const LOCK   = "lock";
const LOCKED = "locked"
const locks  = ["lock_open", LOCK]; // boolean acts as index
//==============================================================================
// loadMSG() is called by easings.loadIt() once per session
function loadMSG() {
    let elm, id, key, obj, val;
    const CLEAR = "clear";

    elm = elms.clearMid;
    Ez.readOnly(elm, OTHER, elms.mid);
    Ez.readOnly(elms.mid, CLEAR, elm);

    const div    = elms.divSplit;
    const divGap = Ez.toCamel("div", MSG[2]);
    div.id = "";
    elms[divGap] = div.cloneNode(true);
    elms.divGap.style.marginTop = "1" + U.px;

    for (id of MSG.slice(1)) {  // split, gap
        obj = {};
        for (elm of elms[Ez.toCamel("div", id)].children) {
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
                    elm.innerHTML = Ez.initialCap(id).padStart(5) + ":";
            }
            else    // <button>s precede <input> in html, so they're saved here
                obj[elm.className] = elm;
        }
    }
    elms.gap.dataset.min = 0;
    formatInputNumber(elms.split, elms.time.valueAsNumber / 2);
    formatInputNumber(elms.gap, 0);
    div.parentNode.insertBefore(elms[divGap], div.nextElementSibling);

    elms.mid  .default = () => MILLI / 2;   // constant
    elms.split.default = () => secs  / 2;   // variable
    elms.gap  .default = () => 0;           // constant

    const msg = MSG.map(v => elms[v]);
    sgInputs  = msg.slice(1);
    addEventByClass(CLICK,  CLEAR, click);
    addEventByClass(CLICK,  LOCK,  click);
    listenInputNumber(msg);                           // must go first
    addEventToElms (INPUT,  msg, input.MSG);          // must go second
    addEventToElms (CHANGE, msg, changeMSG);          // must go second too
    addEventsByElm (INPUT,  msg.slice(0, -1), input); // mid, split only
}
//==============================================================================
const input = {
//  MSG()       #mid, #split, #gap: precedes mid(), split()
    MSG(evt) {
        disableClear(evt.target, evt.target.valueAsNumber, true);
    },
//  mid()       #mid, also called by updateMidSplit()
    mid() {
        if (!isInvalid(elms.mid)) {
            const val = elms.mid.valueAsNumber;
            P.y1.setIt(chart.dashY, val);
            P.y2.setIt(chart.dashY, val);
        }
    },
//  split()     #split, also called by updateMidSplit()
    split() {
        if (!isInvalid(elms.split)) {
            const val = elms.split.valueAsNumber / secs * MILLI;
            P.x1.setIt(chart.dashX, val);
            P.x2.setIt(chart.dashX, val);
        }
    }
};
//==============================================================================
const click = {
 // clear()     #clearMid, #clearSplit, #clearGap
    clear(evt) {
        const elm = evt.target[OTHER];  // #mid, #split, or #gap
        formatInputNumber(elm, elm.default());
        input[elm.id]?.();              // input.mid() or input.split()
        disableClear(elm);              // clear disabled
        invalidInput(elm, false);       // input valid
        refresh(elm, 0, true);
    },
//  lock()      #lockSplit, #lockGap
    lock(evt) {
        const tar = evt.target;
        const b   = isUnlocked(tar);
        toggleClass(tar, LOCKED, b);
        tar.textContent = locks[Number(b)];
    }
};
//==============================================================================
// changeMSG() is the change event handler for #mid, #split, #gap
function changeMSG(evt) {
    if (!isInvalid(evt.target))
        refresh(evt.target, 0, true);
}
//==============================================================================
// updateMidSplit() makes exporting this pair easier, called by updateAll()
function updateMidSplit() {
    input.mid();
    input.split();
}
// updateSplitGap() is called by updateAll() and change.time()
function updateSplitGap() {
    let   elm = elms.split
    const min = Number(elm.dataset.min),
          val = secs - min;

    elm.dataset.max      = Math.max(val, min);
    elms.gap.dataset.max = Math.max(val - elm.valueAsNumber, 0);

    for (elm of sgInputs)
        if (elm.valueAsNumber > elm.dataset.max)
            formatInputNumber(elm, elm.dataset.max);
}
// setSplitGap() calculates and sets the automated values for #split and #gap,
//               based on time and msecs, if necessary, called by input.time()
//               and updateTypeIO().
function setSplitGap(time = msecs) {
    if (!isBezier() && !isSteps()) {
        let elm, n
        for (elm of sgInputs) {
            if (isUnlocked(elm.lock))
                if (!elm.clear.disabled) {
                    if (time != msecs) {     // scale value by time
                        n = elm.valueAsNumber * (msecs / time);
                        formatInputNumber(elm, maxMin(elm, n));
                    }
                }
                else if (elm === elms.split) // split = 50% of time
                    formatInputNumber(elms.split, secs / 2);
        }
    }
}
//==============================================================================
// disableClear() helps changeMSG() and clickClear(), also called by
//               easingFromObj(), returns a factor/divisor.
function disableClear(elm, n, isDefN) {
    elm.clear.disabled = !isDefN || n == elm.default();
    elm.clear.dataset.enabled = boolToString(!elm.clear.disabled);
}
// isUnlocked() helps clickLock() and setSplitGap();
function isUnlocked(elm) {  // not exported
    return elm.textContent.length > LOCK.length;
}