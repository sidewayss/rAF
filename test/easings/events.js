// export everything but changeWait, all functions
export {loadEvents, inputTime, changePlays, changeLoopByElm, changeCheck,
        changeReset, changeZero, drawLine, setNoWaits};

import {E, P} from "../../raf.js";

import {ezX, raf, msecs, setTime}   from "../load.js";
import {setDuration}                from "../update.js";
import {changeStop}                 from "../play.js";
import {storeCurrent, setLocalBool} from "../local-storage.js";
import {CHANGE, INPUT, elms, g, addEventToElms, elseUndefined}
                                    from "../common.js";

import {drawSteps, isSteps}    from "./steps.js";
import {drawEasing}            from "./not-steps.js";
import {chart, range}          from "./chart.js";
import {setSplitGap}           from "./msg.js";
import {ezY, trip, newTargets} from "./index.js";
//==============================================================================
function loadEvents(checks) {
    elms.time     .addEventListener(INPUT,  inputTime, false);
    elms.plays    .addEventListener(CHANGE, changePlays, false);
    elms.loopByElm.addEventListener(CHANGE, changeLoopByElm, false);
    addEventToElms(CHANGE, checks, changeCheck);
    addEventToElms(CHANGE, [elms.loopWait, elms.tripWait], changeWait);
}
// inputTime() is the input event for #time, called prior to change event
//             also called by formFromObj(), openNamed()
function inputTime(_, isLoading) { // _ = event object, unused
    let prev;
    if (!isLoading) {
        prev = msecs;
        setTime();   // sets msecs and secs
    }
    elms.time.nextElementSibling.textContent = setDuration();
    setSplitGap(prev);
}
// changePlays(), not to be confused with changePlay(), handles the change event
//                for #plays <select>, called by updateAll().
function changePlays(evt) {
    const plays = Number(elms.plays.value);
    const b     = plays > 1;
    P.visible(elms.loopWait, b);
    P.visible(elms.loopWait.labels[0], b);
    if (evt) {
        ezX.plays = plays;
        if (ezY)
            ezY.plays = plays;
        else                  //!!
            alert("No ezY!"); //!!
        storeCurrent();
    }
    setNoWaits();
}
// changeLoopByElm() handles the change event for #loopByElm, <= updateAll()
function changeLoopByElm(evt) {
    const lbe = elms.loopByElm.checked;
    for (var cr of [chart, range]) {
        cr.byElm.forEach(elm => P.visible(elm, lbe));
        cr.active.length = 0;
        cr.active.push(cr.dots[0]);
        if (lbe)
            cr.active.push(...cr.byElm)
    }
    ezY.clearTargets();
    newTargets(lbe);
    if (evt) {      // reset stuff, store the current state
        changeStop();
        storeCurrent();
    }
}
// changeCheck() handles the change event for #roundTrip, #autoTrip, #flipTrip,
//               #reset, #zero, and #drawSteps.
function changeCheck(evt) { //!!imported by _load.js, but I'd like to delete that
    const tar = evt.currentTarget;
    switch (tar) {
    case elms.roundTrip:
        trip();
    case elms.autoTrip:
    case elms.flipTrip:
        changeStop();
        setNoWaits();
        storeCurrent();
        ezX[tar.id] = tar.checked;
        if (ezY)
            ezY[tar.id] = tar.checked;
        else                  //!!
            alert("No ezY!"); //!!
        if (tar === elms.autoTrip)
            P.visible(elms.tripWait.parentNode, tar.checked);
        return;
    //--------------
    case elms.reset:
        changeReset(tar); break;
    case elms.zero:
        changeZero(tar);  break;
    case elms.drawSteps:
        drawLine();
    }
    setLocalBool(tar);
}
// changeReset() called by changeCheck(), updateAll()
function changeReset(tar) {
    raf.onArrival = elseUndefined(tar.checked, E.initial);
}
// changeZero() called by changeCheck(), updateAll()
function changeZero(tar) {
    raf.frameZero = tar.checked;
}
// changeWait() handles change event for #loopWait and #tripWait
function changeWait(evt) {
    const tar  = evt.target;
    const wait = Number(tar.value);
    ezX[tar.id] = wait;
    if (ezY)
        ezY[tar.id] = wait;
    else                  //!!
        alert("No ezY!"); //!!
    storeCurrent();
    setNoWaits();
}
//==============================================================================
// drawLine() routes the job to drawSteps() or drawEasing(),
//            <= changeCheck(), flipZero(), redraw().
function drawLine() {
    isSteps() ? drawSteps() : drawEasing();
}
// setNoWaits() sets the g.not_Wait properties, which are used by eGet(),
//            <= changePlays(), changeWait(), changeCheck(), formFromObj().
function setNoWaits() {
    g.notLoopWait = Number(elms.plays.value) > 1
                && !Number(elms.loopWait.value);
    g.notTripWait = elms.roundTrip.checked && elms.autoTrip.checked
                && !Number(elms.tripWait.value);
}