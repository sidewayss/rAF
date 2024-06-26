export {refresh, storeIt, initPseudo, newTargets, getMsecs, getFrame, updateX,
        setCounters, formatDuration, formatPlayback, drawLine, flipZero};
export const
chart = {},  // SVG chart elements and viewBox array
range = {};  // SVG vertical pseudo-range element

import {E, U, P, Pn, Is, Ez, Easy} from "../../raf.js";

import {create} from "../../easy/efactory.js";
const targetPseudoX = create({peri:pseudoUpdate});
const targetPseudoY = create({peri:()=>{}}); // noop: it requires a func...!!

import {ezX, raf} from "../load.js";
import {frames, targetInputX, inputX, updateFrame, pseudoFrame, pseudoAnimate,
        eGet, formatNumber}                       from "../update.js";
import {MILLI, COUNT, LITE, elms, g, toggleClass} from "../common.js";

import {objFromForm}                       from "./_named.js";
import {ezY, newEzY, twoLegs, bezierArray} from "./index.js";
import {storeIt}                           from "./events.js";
import {drawEasing}                        from "./not-steps.js";
import {drawSteps, tvFromElm, postRefresh, setInfo, isSteps} from "./steps.js";
//==============================================================================
// refresh() <= updateAll(), changeStop(), inputTypePow(evt), event handlers in
//              chart.js, msg.js, steps.js, tio-pow.js.
function refresh(tar, n, has2 = twoLegs()) {
    if (tar) {                   // !tar = called by updateAll()
        let obj;
        if (n)
            ezY.time = n;        // the one property that doesn't use newEzY()
        else {
            obj = objFromForm(); // less code to read the whole form here than
            newEzY(obj);         // to change each property in every event.
            if (!obj) {
                switch (tar) {   // newEzY() failed, try to recover the form:
                case elms.values: case elms.values.other[0]:
                case elms.timing: case elms.timing.other[0]:
                    elms.easyTiming.selectedIndex = 0; // time only goes up
                    break;
                case elms.steps: case elms.jump:       // {steps:1, jump:E.none}
                    tar.selectedIndex = 1;             // results in zero steps
                default:
                }
                return;
            }//--------
        }
        storeIt(obj);            // save obj to localStorage
    }
    let isStp = isSteps();
    pseudoAnimate();             // update frames
    drawLine(isStp);             // draw the line
    inputX();                    // move the dot(s), uses updated frames
    ezY.clearTargets();          // clear pseudo-targets, ezX uses .oneShot
    postRefresh(ezY.firstTime);  // E.steps needs cleanup post-pseudo-animation

    let isOob = isOutOfBounds(); // handle out-of-bounds y coordinates in chart:
    if (!isOob && has2)
        isOob |= isOutOfBounds(Number(elms.type2.value));

    if (isOob || g.isOob) {      // adjust the vertical size of chart and range
        let cr, maxY, minY;
        if (isOob) {             // set new boundaries
            const y = frames.map(frm => frm.y);
            minY = Math.min(...y, 0);
            maxY = Math.max(...y, MILLI);
        }
        else {                   // restore standard boundaries
            minY = 0;
            maxY = MILLI;
        }
        const x = chart.viewBox[E.x];
        for (cr of [chart, range]) {
            cr.viewBox[E.y] = Math.ceil(minY + x);
            cr.viewBox[E.h] = Math.ceil(maxY - x - x - minY);
            P.vB.setIt(cr.svg, cr.viewBox.join());
        }
        range.svg.style.height = chart.svg.clientHeight + U.px;
        range.trackY.setAttribute(Pn.y1, minY);
        range.trackY.setAttribute(Pn.y2, maxY);
    }
    if (g.isStp === isStp)       // undefined !== false here
        isStp = false;
    else {                       // steps adds a row to diptych
        g.isStp = isStp;
        isStp = true;            // = changed to or from E.steps
    }
    if (isStp || isOob || g.isOob)
        elms.shadow.style.height = document.body.clientHeight + U.px;

    g.isOob = isOob;
}
// isOutOfBounds() helps refresh(), returns true if any points are outside (or might
//                 be outside) the 0-1000 range, which only occurs for four types.
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
                     : Is.def(arr);         // true here may or may not be oob,
}                                           // refresh() will run the numbers.
//==============================================================================
// drawLine() routes the job to drawSteps() or drawEasing(),
//            called by refresh(), flipZero(), change.drawAsSteps()
function drawLine(isStp = isSteps()) {
    isStp ? drawSteps() : drawEasing();
}
// initPseudo() sets frames[0], calls newTargets(true)
function initPseudo() {
    const y   = Number(elms.start.textContent); // y = 0 or 1000
    const u   = y ? 1 : 0;                      // u for e.unit
    frames[0] = vucFrame(0, 0, y, y, u, 1 - u);
    newTargets(true);
}
//==============================================================================
// newTargets() calls Easy.proto.newTarget() as needed, with and without .prop
//              and .elms, called by changePlay(), initPseudo(true).
function newTargets(isPseudo) {
    ezX.oneShot = isPseudo;          // test Easy.prototype.oneShot
    if (isPseudo) {
        ezX.targets = targetPseudoX; // replace the targets, tests set targets()
        ezY.targets = targetPseudoY; // refresh() clears them after use
        g.easies.peri = undefined;
    }
    else if (!ezX.targets.size) {    // add targets on first play only
        ezX.addTarget(targetInputX); // test Easy.prototype.addTarget()
        ezY.post = postY;            // test Easy.prototype.post()
        g.easies.peri = update;      // test Easies.prototype.peri()

        let arr, cr, ez, prop;       // cr for chart|range
        const loopByElm = elms.loopByElm.checked;
        if (loopByElm) {             // test single-element targets
            arr = [[ezX, P.cx, chart],
                   [ezY, P.cy, chart],
                   [ezY, P.cy, range]];
            for ([  ez,  prop, cr] of arr)
                ez.newTarget({prop, loopByElm, elms:cr.dots});
        }
        else {                       // test single and multi-element targets
            arr = [[ezX, P.cx, [chart]],
                   [ezY, P.cy, [chart, range]]];
            for ([  ez,  prop, cr] of arr)
                ez.newTarget({prop, elms:cr.map(v => v.dots[0])});
        }
    }
}
//==============================================================================
// postY() is the ezY.post() callback
function postY() {
    setInfo(raf.elapsed / MILLI);
}
// update() is the g.easies.peri() callback
function update() {
    updateFrame(ezX.e.value, eGet(ezY));
}
// pseudoUpdate() is the pseudo-animation callback, ezX.target.peri() only. For
//                E.steps w/jump:E.start|E.none, ezY ends before ezX, but ezY.e
//                remains intact for drawing the rest of the line.
function pseudoUpdate(_, e) {
    pseudoFrame(e.value, ezY.e); //!!does this ever need eGet()?? test it!!
}
//==============================================================================
function getMsecs() {
    return elms.time.valueAsNumber;
}
// getFrame() creates a frame object, <= update.js: update(), pseudoAnimate()
function getFrame(t, x, e) {
    const frm = {t, x, y:e.value};  // frm.y = frm.value, for convenience
    for (var key of Easy.eKey)
        frm[key] = e[key];
    return frm;
}
// vucFrame() creates a frame object based on value, unit, comp, called by
//            initPseudo(), flipZero(), a convenience for easings only.
function vucFrame(t, x, y, value, unit, comp) { // value, unit, comp versus e
    return {t, x, y, value, unit, comp};
}
//==============================================================================
// updateX() called exclusively by inputX(), isReset = refresh(), not #x.oninput
function updateX(frm, isReset) {
    const l = isReset ? COUNT : 1;
    const x = frm.x + U.px;
    const y = frm.y + U.px;
    for (var i = 0; i < l; i++) {   // loopByElm should separate them...
        chart.dots[i].style.cx = x;
        chart.dots[i].style.cy = y;
        range.dots[i].style.cy = y;
    }
}
//==============================================================================
// setCounters() is called exclusively by updateCounters()
function setCounters(frm, d, pad) {
    for (var key of Easy.eKey)
        formatNumber(frm[key], pad[key], d, elms[key]);
}
// formatDuration() is called exclusively by updateDuration()
function formatDuration(val, d) {
    return val.toFixed(val < 10 ? d : d - 1) + U.seconds;
}
// formatPlayback() helps changeStop(), formatPlay()
function formatPlayback(isPlaying) {
    let arr, elm, lite;
    for ([arr, lite] of [[g.sideElms, LITE[0]], [g.sideLbls, LITE[1]]])
        for (elm of arr)
            toggleClass(elm, lite, isPlaying);
}
//==============================================================================
// flipZero() flips frames[0] after non-autoTrip return trip, easings only
function flipZero() {
    if (elms.roundTrip.checked        // roundTrip
     && !elms.autoTrip.checked        // && !autoTrip
     && ezX.e.status != E.tripped) {  // && end of return trip
        const                         // E.steps can end at non-MILLI value
        n = P.isVisible(elms.direction.parentNode)
          ? Ez.flip(elms.direction.selectedIndex)
          : 1,                        // and steps userValues forces Flow:Up
        y = n * Number(elms.end.textContent),
        u = y / MILLI;
        frames[0] = vucFrame(0, MILLI, y, y, u, Ez.flip(u));
    }
    drawLine();
//!!const
//!!isTripping = elms.roundTrip.checked                     // roundTrip
//!!          && !elms.autoTrip.checked                     // && !autoTrip
//!!          && ezX.e.status != E.tripped,                 // && return trip
//!!u = Number(isTripping),                                 // unit = 1 or 0
//!!x = MILLI * u,                                          // x = 0 or 1000
//!!y = MILLI * Number(u != elms.direction.selectedIndex);  // y = ditto
//!!
//!!frames[0] = vucFrame(0, x, y, y, u, 1 - u);
}