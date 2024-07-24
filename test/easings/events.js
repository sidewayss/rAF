export {loadEvents, shallowClone, storeIt};

import {Ez, P} from "../../raf.js";

import {ezX, raf}                   from "../load.js";
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
function showLoopWait(
    isLoop = Number(elms.plays.value) != 1,
    byElm  = elms.loopByElm.checked)
{
    P.visible(elms.loopWait.parentNode, isLoop || byElm);
}
// setLoopWait() sets the plays, loopByElm, loopWait, tripWait properties on...
function setLoopWait(prop, val) {
    for (var obj of [ezX, ezY, objEz])  // ...the three relevant objects
        obj[prop] = val;
}
//==============================================================================
// >> change event handlers
const change = {
//  <select>: plays, wait only affect playback & storage, not pseudo-animation
    plays(evt) {  // also called by updateAll().
        const plays = Number(elms.plays.value);
        showLoopWait(plays > 1);
        if (!evt.isUpdateAll) {
            setLoopWait("plays", plays);
            changeStop();  // in case we're pausing or we've arrrived
            storeIt();
        }
    },
    wait(evt) {   // #loopWait and #tripWait
        const tar = evt.target;
        setLoopWait(tar.id, Number(tar.value));
        changeStop();
        storeIt();
    },
 //  <check-box>: requires evt.currentTarget
    loopByElm(evt) {  // also called by updateAll(), also no pseudo-animation
        const loopByElm = elms.loopByElm.checked;
        for (var cr of [chart, range])              // exclude one dot per cr
            P.visible(cr.dots.slice(1), loopByElm);
        if (!evt.isUpdateAll) {
            objEz.loopByElm = loopByElm;
            changeStop();
            storeIt();
        }
        showLoopWait(undefined, loopByElm);
    },
 // ----------------
    roundTrip(evt) {
        updateTrip();
        change.trip(evt);
    },
    flipTrip(evt) {
        change.trip(evt);
    },
    autoTrip(evt) {
        P.visible(elms.tripWait.parentNode, change.trip(evt).checked);
    },
 // trip() helps roundTrip(), flipTrip(), autoTrip()
    trip(evt) {
        const
        tar = evt.currentTarget,
        ckd = tar.checked,
        id  = tar.id;
        [ezX, ezY, objEz].forEach(obj => obj[id] = ckd);
        changeStop();
        storeIt();
        return tar;
    },
 // -------------
    useNow(evt) {
        change.rafBool(evt);
    },
    frameZero(evt) {
        change.rafBool(evt);
    },
    initZero(evt) {
        change.rafBool(evt);
        if (!evt.isInitEasies && !evt.changeType)
            refresh();
    },
 // rafBool() helps change.useNow(), frameZero(), initZero()
    rafBool(evt) {
        const
        tar = evt.currentTarget,
        ckd = tar.checked;
        raf[tar.id] = ckd;
        if (!evt.isInitEasies)
            setLocalBool(tar, ckd);
        return ckd;
    },
 // ------------------
    drawAsSteps(evt) {
        drawLine();
        setLocalBool(evt.currentTarget);
    }
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
    storeCurrent("", shallowClone(obj));
}