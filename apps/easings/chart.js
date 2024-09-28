export {loadChart, swapIt};
export let FORMAT_START;

import {E} from "../../src/raf.js";

import {msecs, pad, formatNumber, timeFrames, updateTime} from "../update.js";
import {listenInputNumber, isInvalid} from "../input-number.js";
import {CHANGE, INPUT, CLICK, MILLI, elms, g, boolToString,
        addEventsByElm, dummyEvent}   from "../common.js";

import {twoLegs}                                 from "./index.js";
import {wasStp, refresh}                         from "./_update.js";
import {updateTypeIO, isBezierOrSteps}           from "./tio-pow.js";
import {updateSplitGap, setSplitGap, isUnlocked} from "./msg.js";
import {FORMAT_END, isSteps, wasIsSteps, isUserTV, infoZero} from "./steps.js";
//==============================================================================
function loadChart() { // called by loadTIOPow() so cloning is finished prior
    let elements = document.getElementsByClassName("chart");
    addEventsByElm(CHANGE, elements, change, true);

    elements = document.getElementsByClassName("chart-number");
    listenInputNumber(elements);  // must precede next line
    addEventsByElm(INPUT, [elms.time, ...elms.beziers], input, true);

    elms.swap.addEventListener(CLICK, clickSwap);
    FORMAT_START = [pad.milli, 0, elms.start];
}
//==============================================================================
// Event handlers, all call refresh() except input.time():
function clickSwap(evt) {
    const tar = evt.target,
    isSwapped = !tar.value;     // it's a toggle

    swapIt(isSwapped)
    formatNumber(isSwapped ? MILLI : 0, ...FORMAT_START);
    if (!isSteps() || !isUserTV(elms.values))
        formatNumber(isSwapped ? 0 : MILLI, ...FORMAT_END);

    refresh(tar);
}
function swapIt(b) { // true means swapped: start > end
    elms.swap.value = boolToString(b);
    elms.swap.style.transform = b ? "none" : "";
}
//==============================================================================
// input event handlers
const input = {
    bezier(evt) { // #bezier0-3
        if (!isInvalid(evt.target))
            refresh(evt.target);
    },
    time() {      // called indirectly by formFromObj(), evt always defined
        const prev = msecs;
        timeFrames();
        setSplitGap(prev);
    }
};
//==============================================================================
// change event handlers
const change = {
    time(evt) {
        let oldEzY;
        updateTime();
        if (isSteps())
            oldEzY = true;      // set ezY.time, don't call newEzY()
        else {
            updateSplitGap();   // setSplitGap() already called by input.time()
            oldEzY = isUnlocked(elms.split)
                 && (isUnlocked(elms.gap) || elms.gap.clear.disabled);
        }
        refresh(evt.target, oldEzY ? msecs : 0);
    },
    io(evt) {
        g.io = Number(evt.target.value);
        refresh(evt.target, 0, updateTypeIO(true));
    },
    type(evt) {   // #type, #type2: isBS is #type only, #type2 excludes both
        let has2, wasBS, [isBez, isStp, isBS] = isBezierOrSteps();
        const
        tar  = evt.target,
        n    = Number(tar.value),
        not2 = (tar === elms.type);

        if (not2 || elms.linkType.value) {
            g.type = n;         // user changed #type or type is linked
            if (not2) {         // user changed #type (no bez|steps for linked)
                wasBS = isBS;
                [isBez, isStp, isBS] = isBezierOrSteps();
            }
        }
        has2 = twoLegs();
        if (has2 && isBS)       // modify variable, not <select>
            g.io = E.in;
        else if (wasBS)         // restore variable to match <select>
            g.io = Number(elms.io.value);

        has2 = updateTypeIO(false, [isBez, isStp, isBS]);

        if (not2 && (wasStp || isStp)) {
            const isUT = isUserTV(elms.timing);
            wasIsSteps(isStp, [isUT, isUserTV(elms.values)]);
            infoZero  (isStp && isUT); // infoZero() must follow updateTypeIO()
            if (isUT)
                updateTime();
            elms.initZero.dispatchEvent(dummyEvent(CHANGE, "changeType"));
        }
        refresh(tar, 0, has2);
    }
};
// for lastUserTime input, see steps.js:
export const changeTime = change.time; // export {change.time} not allowed