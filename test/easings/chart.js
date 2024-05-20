export {loadChart, isOutOfBounds};

import {E, Is, P, Ez} from "../../raf.js";

import {msecs, timeFrames, updateTime}          from "../update.js";
import {listenInputNumber, isInvalid}           from "../input-number.js";
import {CHANGE, INPUT, elms, g, addEventsByElm} from "../common.js";

import {refresh}                                 from "./_update.js";
import {updateTypeIO, isBezierOrSteps}           from "./tio-pow.js";
import {updateSplitGap, setSplitGap, isUnlocked} from "./msg.js";
import {isSteps, maxTime, tvFromElm}             from "./steps.js";
import {twoLegs, bezierArray}                    from "./index.js";
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
            refresh(evt.target, 0, false, isOutOfBounds());
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
        let has2, isBez, isBS, isStp, oobOld, wasBS, wasStp;
        const
        tar  = evt.target,
        n    = Number(tar.value),
        not2 = (tar === elms.type);

        oobOld = isOutOfBounds();
        [isBez, isStp, isBS] = isBezierOrSteps();
        if (not2 || elms.linkType.value) {
            g.type = n;     // user changed #type or type is linked
            if (not2) {     // user changed #type
                wasStp = isStp;
                wasBS  = isBS;
                [isBez, isStp, isBS] = isBezierOrSteps();
                if ((wasStp || isStp) && elms.values.value == elms.values.id)
                    P.visible(elms.direction.parentNode, wasStp);
            }
        }
        has2 = twoLegs();
        if (has2 && isBS)   // modify variable, not <select>
            g.io = E.in;
        else if (wasBS)     // restore variable to match <select>
            g.io = Number(elms.io.value);

        has2 = updateTypeIO(false, [isBez, isStp, isBS]);
        if (has2)           // has2 depends on g.io
            oobOld |= isOutOfBounds(Number(elms.type2.value));

        refresh(tar, 0, has2, oobOld);
    }
};
//==============================================================================
// isOutOfBounds() returns bool = true if any points are outside (or might be
//                 outside) the 0-1000 range, which only occurs for four types.
function isOutOfBounds(val = g.type) {
    let arr;
    switch (val) {
    case E.bezier:
        arr = bezierArray();                // Array
        break;
    case E.steps:
        arr = tvFromElm(elms.values, true); // Array, String or undefined
        break;
    case E.back: case E.elastic:            // these two are always oob, and
        return true;                        // the only way type2 can be oob,
    default:                                // 'cuz bezier/steps is 1 leg only.
        return false;
    }
    return Is.A(arr) ? Ez.unitOutOfBounds(arr)
                     : Boolean(arr);        // true here may or may not be oob,
}                                           // refresh() will run the numbers.