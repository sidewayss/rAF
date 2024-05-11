export {refresh, storeIt, initPseudo, newTargets, getMsecs, getFrame, updateX,
        setCounters, formatDuration, formatPlayback, drawLine, flipZero};

import {E, U, P, Pn, Easy} from "../../raf.js";

import {create} from "../../easy/efactory.js";
const targetPseudoX = create({peri:pseudoUpdate});
const targetPseudoY = create({peri:()=>{}}); // noop: it requires a func...!!

import {ezX, raf}      from "../load.js";
import {frames, targetInputX, inputX, updateFrame, pseudoFrame,
        pseudoAnimate} from "../update.js";
import {MILLI, COUNT, LITE, elms, g, formatNumber, toggleClass}
                       from "../common.js";

import {objFromForm}                              from "./_named.js";
import {storeIt}                                  from "./events.js";
import {drawSteps, postRefresh, setInfo, isSteps} from "./steps.js";
import {drawEasing}                               from "./not-steps.js";
import {chart, range, isOutOfBounds}              from "./chart.js";
import {ezY, newEzY, twoLegs, isBezier}           from "./index.js";
//==============================================================================
// refresh() <= updateAll(), changeStop(), inputTypePow(evt), event handlers in
//              chart.js, msg.js, steps.js, tio-pow.js.
function refresh(tar, n, has2   = twoLegs(),
                         isBS   = isBezier() || isSteps(),
                         oobOld = false)
{
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
    pseudoAnimate();             // update frames
    drawLine();                  // draw the line
    inputX();                    // move the dot(s), uses updated frames
    ezY.clearTargets();          // clear pseudo-targets, ezX uses .oneShot
    postRefresh(ezY.firstTime);  // E.steps needs cleanup post-pseudo-animation

    let oob = isOutOfBounds();   // handle out-of-bounds y coordinates in chart:
    if (has2 && !isBS)
        oob |= isOutOfBounds(Number(elms.type2.value));
    if (oob || oobOld) {         // adjust the vertical size of chart and range
        let cr, maxY, minY;
        if (oob) {               // minY and x are negative numbers
            const y = frames.map(frm => frm.y);
            minY = Math.min(...y, 0);
            maxY = Math.max(...y, MILLI);
        }
        else {                   // oobOld
            minY = 0;
            maxY = MILLI;
        }
        const x = chart.viewBox[E.x];
        const h = maxY - x - x - minY
        for (cr of [chart, range]) {
            cr.viewBox[E.y] = Math.ceil(minY + x);
            cr.viewBox[E.h] = Math.ceil(h);
            P.vB.setIt(cr.svg, cr.viewBox.join());
        }
        range.svg.style.height = chart.svg.clientHeight + U.px;
        range.trackY.setAttribute(Pn.y1, minY);
        range.trackY.setAttribute(Pn.y2, maxY);
    }
}
//==============================================================================
// drawLine() routes the job to drawSteps() or drawEasing(),
//            called by refresh(), flipZero(), change.drawAsSteps()
function drawLine() {
    isSteps() ? drawSteps() : drawEasing();
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
    updateFrame(ezX.e.value, ezY.e);
}
// pseudoUpdate() is the pseudo-animation callback, ezX.target.peri() only. For
//                E.steps w/jump:E.start|E.none, ezY ends before ezX, but ezY.e
//                remains intact for drawing the rest of the line.
function pseudoUpdate(_, e) {
    pseudoFrame(e.value, ezY.e);
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
        elms[key].textContent = formatNumber(frm[key], pad[key], d);
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
    const isTripping = elms.roundTrip.checked     // roundTrip
                    && !elms.autoTrip.checked     // !autoTrip
                    && ezX.e.status != E.tripped; // return trip
    const u = Number(isTripping); // unit = 1 or 0
    const x = u * MILLI;
    const y = isTripping != Boolean(elms.direction.value)
            ? MILLI
            : 0;
    frames[0] = vucFrame(0, x, y, y, u, 1 - u);
    drawLine();
}