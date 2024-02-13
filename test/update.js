// export everything but ns, D
export {points, pad, loadUpdate, inputX, updateFrame, updateSidebar, updateTime,
        setDuration, setFrames, eGet, pseudoAnimate};

import {E, Is, Ez, P} from "../raf.js";

import {FPS, ezX, raf, secs}  from "./load.js";
import {loadPlay, changeStop} from "./play.js";
import {MILLI, LENGTH, INPUT, elms, g, formatNumber}
                              from "./common.js";

import {isSteps} from "./easings/steps.js";
/*
import(_update.js): getPoint, pointZero, updateX;
                    redraw, flipZero, formatClip pass through to play.js.
*/
let ns;       // _update.js namespace
const D = 3;  // D for decimals: .toFixed(D) = milliseconds, etc.

const points = [];  // time, x, y, and eKey values by frame
const pad    = {};  // string.pad() values by id

// loadUpdate() is called by loadCommon()
async function loadUpdate(isMulti, dir) {
    if (isMulti)
        points[0] = {t:0, x:Array.from(LENGTH, () => new Object)};

    pad.frame = 5;     // varies in multi
    pad.secs  = D + 3; // ditto when duration >= 10s
    Ez.readOnly(pad, "milli", MILLI.toString().length);
    Ez.readOnly(pad, "value", isMulti ? pad.milli : D + 5);
    Ez.readOnly(pad, "unit",  D + 2);
    Ez.readOnly(pad, "comp",  pad.unit);
    Object.seal(pad);

    elms.x.addEventListener(INPUT, inputX, false);
    return import(`${dir}_update.js`).then(namespace => {
        ns = namespace;
        loadPlay(ns);
        return ns;
    }); // .catch(errorAlert) in Promise.all() in loadCommon()
}
// inputX() handles input events for #x, called by easings redraw(), updateAll()
function inputX(evt) {
    const f = elms.x.valueAsNumber; // f for frame
    const p = points[f];            // p for point
    updateSidebar(f, p);
    ns.updateX(p, !Is.def(evt));    // 2nd arg easings only
}
// updateFrame() consolidates easy.peri() code, records points, updates textContent
function updateFrame(arg0, arg1, arg2) {
    const t = raf.elapsed;  // Chrome pre-v120 currentTime can be > first frame's timeStamp
    if (t <= 0) return;     // ignore frameZero and Chrome pre-v120 first frame
    //--------------------- // points[0] isn't modified by animation
    points[++g.frame] = ns.getPoint(t, ...arguments);
    updateSidebar(g.frame);
}
// updateSidebar() is called by updateFrame(), inputX(), and changeStop()
function updateSidebar(frame, p = points[frame]) {
    formatNumber(frame,       pad.frame, 0, elms.frame);
    formatNumber(p.t / MILLI, pad.secs,  D, elms.elapsed);
    ns.setSidebar(p, D, pad);
}
// updateTime() is called by changeTime(), changeStop(), and both updateAll()s
function updateTime() {
    const f = elms.x.valueAsNumber / g.frames;
    setFrames(Math.ceil(secs * FPS));       // updates g.frames
    elms.x.value = Math.round(f * g.frames);

    ezX.cutTarget(g.targetX);
    g.targetX = ezX.newTarget({
        elm: elms.x,
        prop: P.value,
        factor: g.frames / MILLI
    });
}
// setDuration() is called by changePlay(), changeStop(), multi updateAll(),
//               and easing inputTime()
function setDuration(val = secs) {
    const txt = ns.formatDuration(val, D);
    elms.duration.textContent = txt;
    return txt;
}
// setFrames() is called by updateTime() and changePlay()
function setFrames(val) {
    points.length = val + 1;
    elms.x.max = val;
    g.frames = val;
    let txt = val.toString();
    if (ns.formatFrames)        // multi only, not easings
        txt = ns.formatFrames(txt);
    elms.frames.textContent = txt;
}
// eGet() chooses ez.e or ez.e2, called by multi.getPoint() and
//                               easings.update()=>updateFrame()=>getPoint()
function eGet(ez) {
    let e = ez.e;
    if (!(e.unit % 1) && ((g.notLoopWait && e.status == E.outbound)
                       || (g.notTripWait && e.status == E.inbound)))
        return ez.e2;
    else
        return e;
}
// pseudoAnimate() does not apply values, intead it populates the points array,
//                 called by both redraw()s.
function pseudoAnimate() {
    let ez, i, j, l, t;
    const args = [];    //set points[0], args, ezs = easys or g.easies
    const ezs  = ns.pointZero(points, args);

    changeStop();       // resets stuff if necessary
    for (ez of ezs)     // zero-out the Easys
        ez._zero(0);
                        // the pseudo-animation:
   for (i = MILLI, j = 1, l = g.frames * MILLI; i <= l; i += MILLI, j++) {
        t = i / FPS;
        for (ez of ezs)
            ez._easeMe(t);
        points[j] = ns.getPoint(t, ...args);
    }
                        // E.steps needs cleanup (for pseudo-animation only)
    if (isSteps() && elms.roundTrip.checked && elms.jump.value < E.end)
        points.at(-1).y = Number(elms.end.textContent);

    raf.init(true);     // force initialize after the pseudo-animation run
}