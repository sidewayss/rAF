export {loadEvents, shallowClone, storeIt, setNoWaits};

import {E, Ez, P} from "../../raf.js";

import {ezX, raf}                   from "../load.js";
import {changeStop}                 from "../play.js";
import {storeCurrent, setLocalBool} from "../local-storage.js";
import {CHANGE, elms, g, addEventToElms, addEventsByElm, elseUndefined}
                                    from "../common.js";

import {chart, range, drawLine} from "./_update.js";
import {objEz}                  from "./_named.js";
import {ezY, updateTrip}        from "./index.js";
//==============================================================================
function loadEvents(checks) {
    addEventsByElm(CHANGE, [...checks, elms.plays], change);
    addEventToElms(CHANGE, [elms.loopWait, elms.tripWait], change.wait);
}
//==============================================================================
// >> change event handlers
const change = {
 // <select>
    plays(evt) {  // also called by updateAll().
        const plays = Number(elms.plays.value);
        const b     = plays > 1;
        P.visible([elms.loopWait, elms.loopWait.labels[0]], b);
        if (!evt.isUpdateAll) {
            changeStop();       // in case we're pausing or we've arrrived
            ezX.plays = plays;
            if (ezY)
                ezY.plays = plays;
            else                  //!!
                alert("No ezY!"); //!!
            storeIt();
        }
        setNoWaits();
    },
    wait(evt) {   // #loopWait and #tripWait
        const tar  = evt.target;
        const wait = Number(tar.value);
        changeStop();
        ezX[tar.id] = wait;
        if (ezY)
            ezY[tar.id] = wait;
        else                  //!!
            alert("No ezY!"); //!!

        setNoWaits();
        storeIt();
    },
 // <check-box> (requires evt.currentTarget)
    loopByElm(evt) {  // also called by updateAll()
        const loopByElm = elms.loopByElm.checked;
        for (var cr of [chart, range])              // exclude one dot per cr
            P.visible(cr.dots.slice(1), loopByElm);
        if (!evt.isUpdateAll) {
            changeStop();
            objEz.loopByElm = loopByElm;
            storeIt();
        }
    },
    reset(evt) {
        const tar = evt.currentTarget;
        raf.onArrival = elseUndefined(tar.checked, E.initial);
        if (!evt.isInitEasies)
            setLocalBool(tar);
    },
    zero(evt) {
        const tar = evt.currentTarget;
        raf.frameZero = tar.checked;
        if (!evt.isInitEasies)
            setLocalBool(tar);
    },
    drawAsSteps() {
        drawLine();
        setLocalBool(evt.currentTarget);
    },
    roundTrip(evt) {
        updateTrip();
        change.trip(evt);
    },
    autoTrip(evt) {
        const tar = change.trip(evt);
        P.visible(elms.tripWait.parentNode, tar.checked);
    },
    flipTrip(evt) {
        change.trip(evt);
    },
 // trip() helps roundTrip(), autoTrip(), flipTrip()
    trip(evt) {
        const tar = evt.currentTarget;
        changeStop();
        setNoWaits();
        storeIt();
        ezX[tar.id] = tar.checked;
        if (ezY)
            ezY[tar.id] = tar.checked;
        else                  //!!
            alert("No ezY!"); //!!

        return tar;
    }
}
//==============================================================================
function shallowClone(obj) {
    if (obj.easy || obj.timing?.isEasy) {
        obj = Ez.shallowClone(obj);
        if (obj.easy)
            obj.easy   = elms.easyValues.value;
        else
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
    g.notLoopWait = Number(elms.plays.value) > 1
                && !Number(elms.loopWait.value);
    g.notTripWait = elms.roundTrip.checked && elms.autoTrip.checked
                && !Number(elms.tripWait.value);
}