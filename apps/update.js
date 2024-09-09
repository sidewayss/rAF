export {loadUpdate, inputX, timeFrames, prePlay, updateTime, updateCounters,
        formatNumber, setDuration, eGet, callbacks, updateFrame, pseudoFrame,
        pseudoAnimate, newEasies, newTargetX};

export let
msecs, secs,    // alternate versions of time, both integers
frameIndex,     // the current frame
playZero;       // for measuring time between changePlay() and first frame

export const
D = 3,          // D for decimals: .toFixed(D) = milliseconds, etc.
frames = [],    // time, x, y, and eKey values by frame
pad    = {      // string.pad() values for formatting numbers
    frame:5,
    milli:MILLI.toString().length,
    secs: D + 3,
    value:D + 5,  // overriden in loadUpdate() if (isMulti)
    unit: D + 2,
    comp: D + 2
};

import {E, P, Easies} from "../src/raf.js";

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
    targetInputX, // for .cutTarget()
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
function inputX() {
    const i   = elms.x.valueAsNumber;
    const frm = frames[i];
    updateCounters(i, frm);
    ns.updateX(frm, i); // 2nd arg easings only
}
//==============================================================================
// timeFrames() helps input.time() for color and easings (and thus indirectly
//              formFromObj() for easings); input.roundTrip/autoTrip and steps
//              user timing for easings; and loadFinally(), fromFromObj(), and
//              change.easy() for multi. time arg defined by steps.js/setTime().
function timeFrames(time = ns.getMsecs()) {
    msecs = time;           // milliseconds are primary
    secs  = msecs / MILLI;  // seconds are for display purposes only
    setDuration(secs);
    return time;
}
// setDuration() is where the duration and frames separate from msecs/secs/time,
//               called by timeFrames(t), changePlay(t, last), changeStop().
function setDuration(t = secs, last) {
    let dur = t;
    if (!last) {
        if (ns.calcDuration)
            dur = ns.calcDuration(t);
        last = Math.ceil(dur * FPS);
    }
    elms.duration.textContent = ns.formatDuration(dur, D);
    elms.x.max    = last;
    lastFrame     = last;
    frames.length = last + 1; //!!necessary??
    elms.frames.textContent = last.toString() + (ns.formatFrames ? "f" : "");
}
// prePlay() helps changePlay(), exports can't be set outside the module
function prePlay() {
    playZero   = performance.now();
    frameIndex = 0;
}
//==============================================================================
// newTargetX() creates a new Easer and adds it to ezX.targets
function newTargetX() { // for factor: eKey defaults to E.unit
    targetInputX = ezX.newTarget({elm:elms.x, prop:P.value, factor:lastFrame});
}
// updateTime() is called by change.time(), changeStop(), and updateAll().
//              !addIt is easings page that clears all targets prior.
function updateTime() {
    const f  = prevLast ? elms.x.valueAsNumber / prevLast : 0;
    prevLast = lastFrame; // for next time

    elms.x.value = Math.round(f * lastFrame);
    ezX.time     = msecs;
    const addIt  = !ns.drawLine;     // !easings page
    if (addIt)                       // changing factor requires new target
        ezX.cutTarget(targetInputX); // see newTargets()

    newTargetX();
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
//==============================================================================
// eGet() chooses ez.e or ez.e2, called by multi.getFrame(), easings.update();
//        multi defines notLW, notTW args; returns e2 when:
//          unit is a whole number && (looping w/o wait || tripping w/o wait)
function eGet(ezs) {
    if (isContinuing) {             // isLooping || isTripping
        isContinuing = false;
        return ezs.map(ez => ez.e.status == E.waiting ? ez.e : ez.e2);
    }
    else
        return ezs.map(ez => ez.e);
}
// centralized callbacks that affect eGet() and easings/drawLine().
const callbacks = {
    onAutoTrip ()   { isContinuing = true; },
    onLoopByElm(ez) { loopIt(ez, "onLoopByElm"); },
    onLoop(ez)      { loopIt(ez, "onLoop");      }
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
    if (t < 0)                                  //!!
        console.log(`updateFrame(): ${t} < 0`); //!!
    const frm = ns.getFrame(t, ...args);
    frames[++frameIndex] = frm;       // frames[0] isn't modified by animation
    updateCounters(frameIndex, frm);
}
// pseudoFrame() is the pseudoAnimation version of updateFrame()
function pseudoFrame(...args) {     // 0 is dummy time
    frames[++frameIndex] = ns.getFrame(0, ...args);
}
//==============================================================================
// pseudoAnimate() populates the frames array via the .peri() callbacks, does
//                 not apply values or update counters, called by refresh().
function pseudoAnimate(noTargets) { // Easies.proto.#noTargets = noTargets
    let i, s, t;
    const ezs = g.easies;

    changeStop(null);               // resets stuff if pausing or arrived
    ns.initPseudo();                // page-specific init, calls newTargets()
    ezs._zero(0, noTargets);        // pre-play initialization
    frameIndex = 0;                 // see frames[++frameIndex] above

    i = ns.isInitZero?.() ? 0       // steps && (jump & E.start)
                          : MILLI;  // everything else
//!!if (isEasies)
    do {
        t = i / FPS;                // time in milliseconds
        s = ezs._next(t);           // ezs.#active.size()
        frames[frameIndex].t = t;   // the one common property across pages
        i += MILLI;                 // unnecessary in last iteration
    } while(s);
//!!else
//!!    for (l = lastFrame * MILLI; i <= l; i += MILLI) {
//!!        t = i / FPS;              // derive t and execute the next frame
//!!        ezs._next(t);
//!!        frames[frameIndex].t = t; // EBase.proto.peri() doesn't have time
//!!    }
    raf.init();                       // reset properties set by final frame
}                                     //!!must it be E.original for jump:start??
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