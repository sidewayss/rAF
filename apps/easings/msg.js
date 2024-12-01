// #mid, #split, #gap are all <input type="number">
export {loadMSG, updateMidSplit, disableClear, updateSplitGap, setSplitGap,
        isUnlocked};
export const MSG = ["mid","split","gap"];

import {Ez, P} from "../../src/raf.js";

import {msecs, secs} from "../update.js";
import {abled}       from "../named.js";
import {MILLI, BUTTON, DIV, CLICK, CHANGE, elms, addEventToElms,
        addEventsByElm, addEventByClass, boolToString}
                     from "../common.js";

import {chart, refresh}           from "./_update.js";
import {isSteps}                  from "./steps.js";
import {OTHER, twoLegs, isBezier} from "./index.js";

let sgInputs;
const
LOCK   = "lock",
LOCKED = "locked",
locks  = ["lock_open", LOCK]; // boolean acts as index
//==============================================================================
// loadMSG() is called by easings.load() once per session
function loadMSG() {
    let div, elm, id, key, obj, val;
    const
    CLEAR = "clear",
    divSplit = elms.divSplit;

    elm = elms.clearMid;
    Ez.readOnly(elm, OTHER, elms.mid);
    Ez.readOnly(elms.mid, CLEAR, elm);

    divSplit.id = "";
    elms.divGap = divSplit.cloneNode(true);
    elms.divGap.style.margin = "var(--16th) 0 var(--8th)";

    for (id of MSG.slice(1)) {      // split, gap:
        obj = {};
        div = elms[Ez.toCamel(DIV, id)];

        for (elm of div.getElementsByTagName(BUTTON))
            obj[elm.className] = elm;  // .clear and .lock

        elm = div.getElementsByTagName("input-num")[0];
        elm.id   = id;                 // must precede label.htmlFor
        elms[id] = elm;
        Ez.readOnly(obj[CLEAR], OTHER, elm);
        for ([key, val] of Object.entries(obj))
            Ez.readOnly(elm, key, val);

        elm = div.firstElementChild;   // <label>
        elm.htmlFor = id;
        if (!elm.textContent)          // "Split:".length == 6
            elm.innerHTML = (Ez.initialCap(id) + ":").padEnd(6);
    }
    elms.gap.min = 0;
    elms.gap.value = 0;
    elms.split.value = elms.time.valueAsNumber / 2;
    divSplit.parentNode.appendChild(elms.divGap);

    elms.mid  .default = () => MILLI / 2;  // constant
    elms.split.default = () => secs  / 2;  // variable
    elms.gap  .default = () => 0;          // constant

    addEventByClass(CLICK,  CLEAR, click);
    addEventByClass(CLICK,  LOCK,  click);

    const msg = MSG.map(v => elms[v]);
    sgInputs  = msg.slice(1);
    addEventToElms (CHANGE, msg, change.MSG);          // must go first
    addEventsByElm (CHANGE, msg.slice(0, -1), change); // mid, split only
}
//==============================================================================
const change = {
//  MSG()       #mid, #split, #gap: precedes mid(), split()
    MSG(evt) {
        disableClear(evt.target, evt.target.value, true);
        refresh(evt.target, 0, true);
    },
//  mid()       #mid, also called by updateMidSplit()
    mid() {
        const val = elms.mid.value;
        P.y1.setIt(chart.dashY, val);
        P.y2.setIt(chart.dashY, val);
    },
//  split()     #split, also called by updateMidSplit()
    split() {
        const val = elms.split.value / secs * MILLI;
        P.x1.setIt(chart.dashX, val);
        P.x2.setIt(chart.dashX, val);
    }
};
//==============================================================================
const click = {
 // clear()     #clearMid, #clearSplit, #clearGap
    clear(evt) {
        const elm = evt.target[OTHER];  // #mid, #split, or #gap
        elm.value = elm.default();
        change[elm.id]?.();             // change.mid() or change.split()
        disableClear(elm);              // clear disabled
        refresh(elm, 0, true);
    },
//  lock()      #lockSplit, #lockGap
    lock(evt) {
        const tar = evt.target;
        const b   = isUnlocked(tar);
        tar.classList.toggle(LOCKED, b);
        tar.textContent = locks[Number(b)];
    }
};
//==============================================================================
// updateMidSplit() makes exporting this pair easier, called by updateAll()
function updateMidSplit() {
    change.mid();
    change.split();
}
// updateSplitGap() is called by updateAll() and change.time()
function updateSplitGap() {
    let   elm = elms.split
    const min = elm.min,
          val = secs - min;

    elm.max      = Math.max(val, min);
    elms.gap.max = Math.max(val - elm.value, 0);

//!!    for (elm of sgInputs)
//!!        if (elm.value > elm.max)
//!!            elm.value = elm.max;
}
// setSplitGap() calculates and sets the automated values for #split and #gap,
//               based on time and msecs, if necessary, called by input.time()
//               and updateTypeIO().
function setSplitGap(time = msecs,
                     has2 = twoLegs() && !isBezier() && !isSteps()) {
    if (has2) {
        let elm, n
        for (elm of sgInputs) {
            if (isUnlocked(elm.lock))
                if (!elm.clear.disabled) {
                    if (time != msecs) {     // scale value by time
                        n = elm.value * (msecs / time);
                        elm.value = maxMin(elm, n);
                    }
                }
                else if (elm === elms.split) // split = 50% of time
                    elm.value = elm.default();
        }
    }
}
//==============================================================================
// disableClear() helps changeMSG() and clickClear(), also called by
//               easingFromObj(), returns a factor/divisor.
function disableClear(elm, n, isDefN) {
    abled(elm.clear, !isDefN || n == elm.default())
}
// isUnlocked() helps clickLock() and setSplitGap();
function isUnlocked(elm) {  // not exported
    return elm.textContent.length > LOCK.length;
}