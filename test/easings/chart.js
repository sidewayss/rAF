export {loadChart, flipIt};

import {E} from "../../raf.js";

import {msecs, timeFrames, updateTime} from "../update.js";
import {listenInputNumber, isInvalid}  from "../input-number.js";
import {CHANGE, INPUT, CLICK, elms, g, boolToString,
        addEventsByElm, dummyEvent}    from "../common.js";

import {twoLegs}                                 from "./index.js";
import {wasStp, refresh}                                 from "./_update.js";
import {updateTypeIO, isBezierOrSteps}           from "./tio-pow.js";
import {updateSplitGap, setSplitGap, isUnlocked} from "./msg.js";
import {isSteps, wasIsSteps, isUserTV, infoZero} from "./steps.js";
//==============================================================================
function loadChart() { // called by loadTIOPow() so cloning is finished prior
    let elements = document.getElementsByClassName("chart");
    addEventsByElm(CHANGE, elements, change, true);

    elements = document.getElementsByClassName("chart-number");
    listenInputNumber(elements);  // must precede next line
    addEventsByElm(INPUT, [elms.time, ...elms.beziers], input, true);

    elms.flip.addEventListener(CLICK, clickFlip);
}
//==============================================================================
// Event handlers, all call refresh() except input.time():
function clickFlip(evt) {
    const tar = evt.target,
    isFlipped = !tar.value;     // it's a toggle

    flipIt(isFlipped)
    elms.start.textContent = isFlipped ? MILLI : 0;
    if (!isUserTV(elms.values))
        elms.end.textContent = isFlipped ? 0 : MILLI;

    refresh(tar);
}
function flipIt(b) { // true means flipped: start > end
    elms.flip.value = boolToString(b);
    elms.flip.style.transform = b ? "none" : "";
}
//==============================================================================
// input event handlers
const input = {
    bezier(evt) { // #bezier0-3
        if (!isInvalid(evt.target))
            refresh(evt.target);
    },
    time(evt) { // called indirectly by formFromObj(), evt always defined
        const prev = msecs;
        timeFrames(evt);
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
            if (not2) {         // user changed #type
                wasBS = isBS;
                [isBez, isStp, isBS] = isBezierOrSteps();
                if (wasStp || isStp) {        // null ignored because of false
                    const isUT = isUserTV(elms.timing);
                    wasIsSteps(isStp, [isUT, isUserTV(elms.values)]);
                    infoZero  (isStp && isUT);
                    if (isUT)
                        updateTime();
                    elms.initZero.dispatchEvent(dummyEvent(CHANGE, "changeType"));
                }
            }
        }
        has2 = twoLegs();
        if (has2 && isBS)       // modify variable, not <select>
            g.io = E.in;
        else if (wasBS)         // restore variable to match <select>
            g.io = Number(elms.io.value);

        has2 = updateTypeIO(false, [isBez, isStp, isBS]);
        refresh(tar, 0, has2);
    }
};
// for lastUserTime input, see steps.js:
export const changeTime = change.time; // export {change.time} not allowed