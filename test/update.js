export {loadUpdate, inputX, timeFrames, prePlay, updateTime, updateCounters,
        formatNumber, updateDuration, setFrames, eGet, callbacks, updateFrame,
        pseudoFrame, pseudoAnimate, newEasies};
export let
    msecs, secs,  // alternate versions of time, both integers
    targetInputX, // only imported by easings/_update.js
    frameIndex,   // the current frame
    playZero      // for measuring time between changePlay() and first frame
;
export const
    D = 3,        // D for decimals: .toFixed(D) = milliseconds, etc.
    frames = [],  // time, x, y, and eKey values by frame
    pad    = {    // string.pad() values for formatting numbers
        frame:5,
        milli:MILLI.toString().length,
        secs: D + 3,
        value:D + 5,  // overriden in loadUpdate() if (isMulti)
        unit: D + 2,
        comp: D + 2
    }
;

import {E, Is, P, Easies} from "../raf.js";

import {FPS, ezX, raf}        from "./load.js";
import {loadPlay, changeStop} from "./play.js";
import {MILLI, COUNT, INPUT, elms, g, errorAlert}
                              from "./common.js";
/*
import(_update.js): formatDuration, formatFrames, getFrame, getMsecs,
                    initPseudo, isInitZero, setCounters, updateX;
                    postPlay and loopFrames for easings only.
*/
let ns,           // _update.js namespace
    lastFrame,    // frames.length - 1
    prevLast,     // previous lastFrame for scaling #x.value
    isContinuing; // isLooping || isAutoTripping during animation
//==============================================================================
// loadUpdate() is called by loadCommon()
async function loadUpdate(isMulti, dir) {
    if (isMulti) {                        // can't do: () => {}
        frames[0] = {t:0, x:Array.from({length:COUNT}, () => new Object)};
        pad.value = pad.milli;
    }
    Object.freeze(pad);

    isContinuing = false;                 // not strictly necessary
    elms.x.addEventListener(INPUT, inputX, false);
    return import(`${dir}_update.js`).then(namespace => {
        ns = namespace;
        loadPlay(ns);
        return ns; //!!why not return undefined??return value not used
    }); // .catch(errorAlert) in Promise.all() in loadCommon()
}
//==============================================================================
// inputX() handles input events for #x, called by easings refresh() w/o evt
function inputX(evt) {
    const i   = elms.x.valueAsNumber;
    const frm = frames[i];
    updateCounters(i, frm);
    ns.updateX(frm, !Is.def(evt)); // 2nd arg easings only
}
// timeFrames() helps input.time() for easings and color, called without evt
//              by loadFinally() as a fallback when elms.time is undefined.
//              time arg defined by easings/steps.js/inputLastTime().
function timeFrames(time = ns.getMsecs()) {
    msecs = time;           // milliseconds are primary
    secs  = msecs / MILLI;  // seconds are for display purposes only
    setFrames();
    updateDuration(secs);
}
// prePlay() helps changePlay(), exports can't be set outside the module
function prePlay() {
    playZero   = performance.now();
    frameIndex = 0;
}
//==============================================================================
// updateTime() is called by change.time(), changeStop(), and updateAll().
//              !addIt is easings page, doesn't add targetInputX to ezX.targets
//              because next run is pseudoAnimate() and a different target.
function updateTime() {
    const f  = prevLast ? elms.x.valueAsNumber / prevLast : 0;
    prevLast = lastFrame; // for next time

    elms.x.value = Math.round(f * lastFrame);
    ezX.time     = msecs;
    const addIt  = !ns.drawLine;
    if (addIt)                       // changing factor requires new target
        ezX.cutTarget(targetInputX); // see newTargets()

    targetInputX = ezX.newTarget(    // for factor: eKey defaults to E.unit
        {elm:elms.x, prop:P.value, factor:lastFrame},
        addIt
    );
}
// updateCounters() is called by inputX(), updateFrame(), and changeStop()
function updateCounters(i = 0, frm = frames[i]) {
    formatNumber(i,             pad.frame, 0, elms.frame);
    formatNumber(frm.t / MILLI, pad.secs,  D, elms.elapsed);
    ns.setCounters(frm, D, pad);
}
// formatNumber() formats numbers for non-<input type="number"> elements,
//                called by formFromObj(), loadFinally(), updateCounters(),
//                          setCounters()s, multi refresh().
function formatNumber(n, digits, decimals, elm) {
    if (n < 0 && n >= -Number.EPSILON)  // unfortunately, it happens regularly
        n = 0;
    const txt = n.toFixed(decimals).padStart(digits);
    if (elm)
        elm.textContent = txt;
    else
        return txt;
}
//------------------------------------------------------------------------------
// setFrames() and updateDuration() are called in combination
// updateDuration() is called by timeFrames(), changePlay(), changeStop()
function updateDuration(val = secs) {
    return (elms.duration.textContent = ns.formatDuration(val, D));
}
// setFrames() is called by timeFrames(), changePlay()
function setFrames(val = Math.ceil(secs * FPS)) {
    elms.x.max    = val;
    lastFrame     = val;
    frames.length = val + 1;
    elms.frames.textContent = val.toString() + (ns.formatFrames ? "f" : "");
}
//==============================================================================
// eGet() chooses ez.e or ez.e2, called by multi.getFrame(), easings.update();
//        multi defines notLW, notTW args; returns e2 when:
//          unit is a whole number && (looping w/o wait || tripping w/o wait)
function eGet(ezs) {
    if (isContinuing) {             // isLooping || isTripping
        isContinuing = false;
        return ezs.map(ez => ez.e.status == E.waiting ? ez.e : ez.e2);
//!!    return ezs.map(ez => {
//!!        e = ez.e;
//!!        if (e.status == E.waiting) {
//!!            console.log("eGet e:", ez.e2, ez.e)
//!!            return e;
//!!        }
//!!        else {
//!!            console.log("eGet e2:", ez.e2, ez.e)
//!!            return ez.e2
//!!        }
//!!    });
    }
    else
        return ezs.map(ez => ez.e);
}
// centralized callbacks that affect eGet() and easings/drawLine().
const callbacks = {
    onAutoTrip ()   { isContinuing = true;       },
    onLoopByElm(ez) { loopIt(ez, "onLoopByElm"); },
    onLoop(ez) {
        loopIt(ez, "onLoop");
        if (elms.loopByElm?.checked)
            ez
    }
}
// loopIt does the work for the loop callbacks
function loopIt(ez, txt) {      // loopFrames is easings only, for drawLine()
    isContinuing = true;        // + 1 because it's prior to ++frameIndex
    ns.loopFrames?.push(frameIndex + 1 + Number(ez.e.status == E.waiting));
    console.log(txt, ns.loopFrames?.at(-1), ns.loopFrames?.length);
}
//==============================================================================
// updateFrame() consolidates .peri() code: get t, increment frameIndex, set the
//               current frame's value, and call updateCounters().
//         NOTE: Chrome pre-v120 currentTime can be > first frame's timeStamp.
function updateFrame(...args) {
    const t = raf.elapsed;
    if (t <= 0) //!!
        console.log(`updateFrame(): ${t} <= 0`); //!!
//!!if (t > 0 || ns.isInitZero?.()) {
    const frm = ns.getFrame(t, ...args);
    frames[++frameIndex] = frm;       // frames[0] isn't modified by animation
    updateCounters(frameIndex, frm);
//!!}
//##updateCounters(
//##  ++frameIndex,
//##  frames[frameIndex] = ns.getFrame(raf.elapsed, ...args));
}
// pseudoFrame() is the pseudoAnimation version of updateFrame()
function pseudoFrame(...args) {     // 0 is dummy time
    frames[++frameIndex] = ns.getFrame(0, ...args);
}
//==============================================================================
// pseudoAnimate() populates the frames array via the .peri() callbacks, does
//                 not apply values or update counters, called by refresh().
function pseudoAnimate() {
    let i, l, t;
    const ezs = g.easies;

    changeStop(null);               // resets stuff if pausing or arrived
    ns.initPseudo();                // page-specific init, calls newTargets()
    ezs._zero();                    // zeros-out everything under ezs
    frameIndex = 0;                 // frames[frameIndex] in updateFrame()
    i = ns.isInitZero?.() ?  0 : MILLI;

    for (l = lastFrame * MILLI; i <= l; i += MILLI) {
        t = i / FPS;                // derive t and execute the next frame
        ezs._next(t);
        frames[frameIndex].t = t;   // EBase.proto.peri() doesn't have time
    }
    raf.init();                     // reset properties set by final frame
}                                   //!!must it be E.original for jump:start??
//==============================================================================
// newEasies() helps all the initEasies(), encapsulates try/catch into boolean
function newEasies(...args)  {
    try {
        g.easies    = new Easies(...args);
        raf.targets = g.easies;
    } catch (err) {
        errorAlert(err, "new Easies() failed");
        return false;
    }
    return true;
}