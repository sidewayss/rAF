export {loadEvents, shallowClone, storeIt, setNoWaits};

import {Ez, P} from "../../raf.js";

import {ezX, raf}                   from "../load.js";
import {callbacks}                  from "../update.js";
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
// >> change event handlers
const change = {
//  <select>:
    plays(evt) {  // also called by updateAll().
        const plays = Number(elms.plays.value);
        const b     = plays > 1;
        ezY.onLoop  = b ? callbacks.onLoop : undefined;
        change.showLoopWait(b);
        setNoWaits();
        if (!evt.isUpdateAll) {
            ezX.plays = plays;
            if (ezY)
                ezY.plays = plays;
            else                  //!!
                alert("No ezY!"); //!!
            changeStop();       // in case we're pausing or we've arrrived
            storeIt();
        }
    },
    wait(evt) {   // #loopWait and #tripWait
        const tar  = evt.target;
        const wait = Number(tar.value);
        ezX[tar.id] = wait;
        if (ezY)
            ezY[tar.id] = wait;
        else                  //!!
            alert("No ezY!"); //!!
        setNoWaits();
        changeStop();
        storeIt();
    },
 // helper for plays(), loopByElm(): elms.wait visible if plays > 1 or loopByElm
 // both share Easy.prototype.loopWait
    showLoopWait(isLoop = Number(elms.plays.value) != 1,
                 byElm  = elms.loopByElm.checked)
    {
        P.visible([elms.loopWait, elms.loopWait.labels[0]], isLoop || byElm);
    },
//------------------------------------------
//  <check-box>:  requires evt.currentTarget
    loopByElm(evt) {  // also called by updateAll()
        const loopByElm = elms.loopByElm.checked;
        for (var cr of [chart, range])              // exclude one dot per cr
            P.visible(cr.dots.slice(1), loopByElm);
        if (!evt.isUpdateAll) {
            objEz.loopByElm = loopByElm;
            changeStop();
            storeIt();
        }
        change.showLoopWait(undefined, loopByElm);
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
        setNoWaits();
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
// storeIt() wraps storeCurrent() to use name instead of Easy
function storeIt(obj = objEz) {
    storeCurrent("", shallowClone(obj));
}
//==============================================================================
// setNoWaits() sets the g.not_Wait properties, which are used by eGet(),
//              <= change.plays(), change.wait(), change.trip(), formFromObj()
function setNoWaits() {
//!!g.notTripWait = !Number(elms.tripWait.value)
//!!             && elms.roundTrip.checked
//!!             && elms.autoTrip.checked;
//!!g.notLoopWait = !Number(elms.loopWait.value)
//!!             && (elms.loopByElm.checked || Number(elms.plays.value) > 1);
}