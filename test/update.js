// export everything but ns, D
export {loadUpdate, inputX, updateFrame, updateCounters, updateTime,
        setDuration, setFrames, getFrames, eGet, pseudoAnimate};
const D = 3;  // D for decimals: .toFixed(D) = milliseconds, etc. - not exported
export let targetInputX,    // only imported by easings/_update.js
           frameCount;      // ditto         by easings/non-steps.js
export const frames = [],   // time, x, y, and eKey values by frame
pad = {                     // string.pad() values for formatting numbers
    frame:5,
    milli:MILLI.toString().length,
    secs: D + 3,
    value:D + 5,    // overriden in loadUpdate() if (isMulti)
    unit: D + 2,
    comp: D + 2
};

import {E, Is, P} from "../raf.js";

import {FPS, ezX, raf, secs}  from "./load.js";
import {loadPlay, changeStop} from "./play.js";
import {MILLI, COUNT, INPUT, elms, g, formatNumber} from "./common.js";
/*
import(_update.js): getFrame, initPseudo, updateX;
                    refresh, flipZero, formatPlayback,
                    and formatFrames pass through to play.js.
*/
let ns; // _update.js namespace
//==============================================================================
// loadUpdate() is called by loadCommon()
async function loadUpdate(isMulti, dir) {
    if (isMulti) {                        // can't do: () => {}
        frames[0] = {t:0, x:Array.from({length:COUNT}, () => new Object)};
        pad.value = pad.milli;
    }
    //!!Object.freeze(pad); //!!it's color page's fault

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
//==============================================================================
// updateTime() is called by changeTime(), changeStop(), and updateAll().
//              !addIt is easings page, doesn't add targetInputX to ezX.targets
//              because next run is pseudoAnimate() and a different target.
function updateTime(addIt = !Is.def(ns.flipZero)) {
    const f = frameCount ? elms.x.valueAsNumber / frameCount : 0;
    setFrames(Math.ceil(secs * FPS));   // sets frameCount = secs * FPS
    elms.x.value = Math.round(f * frameCount);

    const obj = {elm:elms.x, prop:P.value, factor:frameCount / MILLI};
    if (addIt)                          // changing factor requires new target
        ezX.cutTarget(targetInputX);    // see newTargets()
    targetInputX = ezX.newTarget(obj, addIt);
}
// updateFrame() consolidates easy.peri() code, records frames, sets textContent
//         NOTE: Chrome pre-v120 currentTime can be > first frame's timeStamp.
function updateFrame(...args) {
    const t = raf.elapsed;      // frames[0] isn't modified by animation
    if (t > 0) {                // ignore frameZero & Chrome pre-v120 1st frame
        const frm = ns.getFrame(t, ...args)
        frames[++g.frameIndex] = frm;
        updateCounters(g.frameIndex, frm);
    }
}
// updateCounters() is called by inputX(), updateFrame(), and changeStop()
function updateCounters(i = 0, frm = frames[i]) {
    formatNumber(i,             pad.frame, 0, elms.frame);
    formatNumber(frm.t / MILLI, pad.secs,  D, elms.elapsed);
    ns.setCounters(frm, D, pad);
}
//==============================================================================
// setDuration() is called by changePlay(), changeStop(), multi updateAll(),
//               and easing inputTime()
function setDuration(val = secs) {
    return (elms.duration.textContent = ns.formatDuration(val, D));
}
// setFrames() is called by updateTime() and changePlay()
function setFrames(val) {
    elms.x.max    = val;
    frameCount    = val;
    frames.length = val + 1;
    let txt = val.toString();
    if (ns.formatFrames)            // multi and color only
        txt = ns.formatFrames(txt);
    elms.frames.textContent = txt;
}
// getFrames() gets the full set of current frames. The frames array grows but
//             doesn't shrink, frameCount makes it work, not to be confused with
//             _update.js/getFrame().
function getFrames() {
    return frames.slice(0, frameCount + 1);
}
//==============================================================================
// eGet() chooses ez.e or ez.e2, called by multi.getFrame() and
//                               easings.update()=>updateFrame()=>getFrame()
function eGet(ez) {
    const e = ez.e;
    return !(e.unit % 1) && ((g.notLoopWait && e.status == E.outbound)
                          || (g.notTripWait && e.status == E.inbound))
           ? ez.e2
           : e;
}
//==============================================================================
// pseudoAnimate() populates the frames array via the .peri() callbacks, does
//                 not apply values or update counters, called by refresh().
function pseudoAnimate() {
    let i, l, t;
    const ezs = g.easies;

    ns.initPseudo();    // page-specific initialization, calls newTargets()
    ezs._zero();        // zeros-out everything under ezs
    changeStop();       // resets stuff if pausing or arrived

    g.frameIndex = 0;   // incremented in .peri()
    for (i = MILLI, l = frameCount * MILLI; i <= l; i += MILLI) {
        t = i / FPS;    // more efficient to increment by MILLI/FPS, but I
        ezs._next(t);   // prefer not to += floating point if I can avoid it.
        frames[g.frameIndex].t = t; // EBase.proto.peri() doesn't have time
    }
    ns.postPseudo?.();  // easings page: E.steps has a pseudo-quirk
    raf.init();         //!!force initialize after the pseudo-animation run
}