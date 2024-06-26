export {loadChart};

import {E, P} from "../../raf.js";

import {msecs, timeFrames, updateTime}          from "../update.js";
import {listenInputNumber, isInvalid}           from "../input-number.js";
import {CHANGE, INPUT, elms, g, addEventsByElm} from "../common.js";

import {refresh}                                 from "./_update.js";
import {updateTypeIO, isBezierOrSteps}           from "./tio-pow.js";
import {updateSplitGap, setSplitGap, isUnlocked} from "./msg.js";
import {isSteps, maxTime, userValues}            from "./steps.js";
import {twoLegs}                                 from "./index.js";
//==============================================================================
function loadChart() { // called by loadTIOPow() so cloning is finished prior
    let elements = document.getElementsByClassName("chart");
    addEventsByElm(CHANGE, elements, change, true);
    elms.type2.addEventListener(CHANGE, change.type);  // listeners don't clone

    elements = document.getElementsByClassName("chart-number");
    listenInputNumber(elements);                       // must go first
    addEventsByElm(INPUT, elms.beziers, input, true);  // true = numbered ids
    addEventsByElm(INPUT, [elms.time],  input);
}
//==============================================================================
// Event handlers, all call refresh():
// >> input event handlers
const input = {
    bezier(evt) { // #bezier0-3
        if (!isInvalid(evt.target))
            refresh(evt.target);
    },
    time(evt) { // called indirectly by formFromObj()
        const prev = msecs;
        timeFrames(evt);
        setSplitGap(prev);
    }
};
// >> change event handlers
const change = {
    time(evt) {
        let oldEzY;
        updateTime();
        if (isSteps()) {
            maxTime();          // userTiming[i].dataset.max = secs
            oldEzY = true;      // set ezY.time, don't call newEzY()
        }
        else {
            updateSplitGap();   // setSplitGap() already called by input.time()
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
        refresh(evt.target, 0, updateTypeIO(true));
    },
    type(evt) {   // #type, #type2
        let has2, isBez, isBS, isStp, wasBS, wasStp;
        const
        tar  = evt.target,
        n    = Number(tar.value),
        not2 = (tar === elms.type);

        [isBez, isStp, isBS] = isBezierOrSteps();
        if (not2 || elms.linkType.value) {
            g.type = n;         // user changed #type or type is linked
            if (not2) {         // user changed #type
                wasStp = isStp;
                wasBS  = isBS;
                [isBez, isStp, isBS] = isBezierOrSteps();
                if (wasStp || isStp) {
                    userValues(...(isStp ? [] : [null, false]));
                    P.visible(elms.drawAsSteps, wasStp);
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