export {loadEvents, shallowClone, storeIt};

import {Ez, P} from "../../raf.js";

import {ezX, raf}                   from "../load.js";
import {setDuration}                from "../update.js";
import {changeStop}                 from "../play.js";
import {storeCurrent, setLocalBool} from "../local-storage.js";
import {CHANGE, elms, addEventToElms, addEventsByElm,} from "../common.js";

import {chart, range, drawLine, refresh} from "./_update.js";
import {objEz}                           from "./_named.js";
import {ezY, updateTrip}                 from "./index.js";

//==============================================================================
function loadEvents(checks) {
    addEventsByElm(CHANGE, [...checks, elms.plays], change);
    addEventToElms(CHANGE, [elms.loopWait, elms.tripWait], change.wait);
}
//==============================================================================
// helpers for change.plays(), wait(), loopByElm():
// showLoopWait() sets elms.wait visibility: if (plays > 1 || loopByElm)
//                plays and loopByElm share Easy.prototype.loopWait because it's
//                an Easy property, not a [M]Easer property, and Easy doesn't
//                know why it's looping, only Easies and [M]Easer know that.
function showLoopWait(isLoop = Number(elms.plays.value) != 1,
                      byElm  = elms.loopByElm.checked) {
    const b = isLoop || byElm;
    P.visible(elms.loopWait, b);
    elms.autoTrip.disabled = b;
}
// setPlaysWaits() sets the plays, loopWait, tripWait properties on...
function setPlaysWaits(prop, val) {
    for (var obj of [ezX, ezY, objEz])  // ...the three relevant objects
        obj[prop] = val;
}
//==============================================================================
// >> change event handlers
const change = {
 // <select>: plays and wait only affect playback/storage, not pseudo-animation
    plays(evt) {  // also called by updateAll().
        const plays = Number(elms.plays.value);
        showLoopWait(plays > 1);
        if (!evt.isUpdateAll) {
            setPlaysWaits("plays", plays);
            changeStop();  // in case we're pausing or we've arrrived
            storeIt();
        }
    },
    wait(evt) {   // #loopWait and #tripWait
        const tar = evt.target;
        setPlaysWaits(tar.id, Number(tar.value));
        changeStop();
        storeIt();
        if (tar.id[0] == "t") { // #tripWait changes duration
            setDuration();      // duration is a single play, the first play
            refresh(tar);       // #loopWait is the start of 2nd+ play
        }
    },
 // <check-box>: requires evt.currentTarget
    loopByElm(evt) {  // also called by updateAll(), no pseudo-animation
        const loopByElm = elms.loopByElm.checked;
        for (var cr of [chart, range])
            P.visible(cr.dots.slice(1), loopByElm); // dots[0] is always visible
        if (!evt.isUpdateAll) {
            objEz.loopByElm = loopByElm;
            changeStop();
            storeIt();
        }
        showLoopWait(undefined, loopByElm);
    },
 // ----------------
    drawAsSteps(evt) {
        drawLine();
        setLocalBool(evt.currentTarget);
    },
 // ----------------
    roundTrip(evt) {
        updateTrip();
        setTrip(evt, true);
    },
    autoTrip(evt) { // HTMLLabelElement doesn't have .disabled property
        const func = setTrip(evt, true)
                   ? "removeAttribute"
                   : "setAttribute";
        for (const elm of [elms.loopByElm, elms.plays, elms.plays.labels[0]])
            elm[func]("disabled", "");
    },
    flipTrip(evt) { setTrip(evt); },
 // ----------------
    useNow(evt)    { rafBool(evt); },
    frameZero(evt) { rafBool(evt); },
    initZero(evt)  {
        rafBool(evt);
        if (!evt.changeType && !evt.isInitEasies && !evt.hasNotVisited)
            refresh();
    }
}
// setTrip() helps change.roundTrip(), flipTrip(), autoTrip()
function setTrip(evt, isTripping) {
    const tar = evt.currentTarget;
    //changeStop(); //!!pseudoAnimate()<=refresh() calls it
    if (!evt.isUpdateAll) {
        if (isTripping)
            setDuration();
        refresh(tar);
    }
    storeIt();
    return tar.checked;
}
// rafBool() helps change.useNow(), frameZero(), initZero()
function rafBool(evt) {
    const
    tar = evt.currentTarget,
    ckd = tar.checked;
    raf[tar.id] = ckd;
    if (!evt.isInitEasies)      // isInitEasies != hasNotVisited
        setLocalBool(tar, ckd);
    return ckd;
}
//==============================================================================
// shallowClone() wraps Ez.shallowClone() for E.steps and eased values, timing;
//                substitutes the names for the objects.
function shallowClone(obj) {
    if (obj.easy || obj.timing?.isEasy) {
        obj = Ez.shallowClone(obj);
        if (obj.easy)
            obj.easy   = elms.easyValues.value;
        if (obj.timing?.isEasy)
            obj.timing = elms.easyTiming.value;
    }
    return obj;
}
// storeIt() wraps storeCurrent() with a clone, refresh() defines obj
function storeIt(obj = objEz) {
    storeCurrent(shallowClone(obj));
}