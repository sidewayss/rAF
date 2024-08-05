export {refresh, drawLine, newTargets, initPseudo, getFrame, syncZero,
        isInitZero, getMsecs, calcDuration, formatDuration, setCounters,
        updateX, postPlay, theStart, theEnd};

export let wasStp = false; // see wasOob below
export const
chart = {},      // SVG chart elements and viewBox array
range = {},      // SVG vertical pseudo-range element
loopFrames = [];

import {E, U, P, Pn, Is, Ez, Easy} from "../../raf.js";

//!!import {create} from "../../easy/efactory.js";
//!!const targetPseudoX = create({peri:pseudoUpdate});
//!!const targetPseudoY = create({peri:()=>{}});    // noop, requires a function...

import {ezX, raf}              from "../load.js";
import {MILLI, COUNT, elms, g} from "../common.js";
import {frames, playZero, targetInputX, inputX, eGet, callbacks, updateFrame,
        pseudoFrame, pseudoAnimate, formatNumber} from "../update.js";

import {objEz, objFromForm}                  from "./_named.js";
import {storeIt}                             from "./events.js";
import {ezY, initEzXY, twoLegs, bezierArray} from "./index.js";
import {tvFromElm, setInfo, isSteps}         from "./steps.js";

let
wasOob; // persistent variable for refresh()
//==============================================================================
// refresh() <= updateAll(), change.initZero(), changeStop(), inputTypePow(),
//              event handlers in chart.js, msg.js, steps.js, tio-pow.js.
function refresh(tar, n, has2 = twoLegs()) {
    if (!tar)                    // updateAll(), change.initZero(), changeStop()
        ezY.init();              // reuse existing ezY, for multi-leg, E.steps
    else {
        let obj;
        if (n) {
            objEz.time = n;      // the one property that doesn't use newEzY()
            ezY  .time = n;
        }
        else {
            obj = objFromForm(); // less code to read the whole form here than
            initEzXY(obj);       // to change each property in every event.
            if (!obj) {
                switch (tar) {   // newEzY() failed, try to recover the form:
                case elms.timing: case elms.timing.other[0]:
                    elms.easyTiming.selectedIndex = 0; // time only goes up
                    break;
                case elms.steps: case elms.jump:       // {steps:1, jump:E.none}
                    tar.selectedIndex = 1;             // results in zero steps
                default:
                }
                return;
            } //-------------
            if (ezX.e.status)    // not E.arrived
                ezX.init();      // required for Easy.proto._zero()
        }
        storeIt(obj);            // save obj to localStorage
    }
    const isStp = isSteps();
    pseudoAnimate(true);         // update frames
    drawLine(isStp);             // draw the line
    inputX();                    // move the dot(s), uses updated frames
    if (isStp) {                 // E.steps needs cleanup post-pseudo-animation
        setInfo(ezY.duration / MILLI);
        if (elms.jump.value < E.end && elms.roundTrip.checked)
            frames.at(-1).y = theEnd();
    }

    const   // Handle out-of-bounds y coordinates in chart and range:
    isOob = isOutOfBounds() || (has2 ? isOutOfBounds(Number(elms.type2.value))
                                     : false),
    oobChanged = isOob || wasOob,
    stpChanged = isStp !== wasStp;
    if (oobChanged || stpChanged) {
        if (oobChanged) {            // adjust the vertical size of chart, range
            let cr, maxY, minY;
            const x = chart.viewBox[E.x];
            if (isOob) {             // set new boundaries
                const y = frames.map(frm => frm.y);
                minY = Math.min(...y, 0);
                maxY = Math.max(...y, MILLI);
            }
            else {                   // restore standard boundaries
                minY = 0;
                maxY = MILLI;
            }
            for (cr of [chart, range]) {
                cr.viewBox[E.y] = Math.ceil(minY + x);
                cr.viewBox[E.h] = Math.ceil(maxY - x - x - minY);
                P.vB.setIt(cr.svg, cr.viewBox.join());
            }
            range.svg.style.height = chart.svg.clientHeight + U.px;
            range.trackY.setAttribute(Pn.y1, minY);
            range.trackY.setAttribute(Pn.y2, maxY);
            wasOob = isOob;
        }
        if (stpChanged)              // changed to|from E.steps
            wasStp = isStp;

        elms.shadow.style.height = document.body.clientHeight + U.px;
    }
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
// drawLine() called by refresh(), postPlay(), change.drawAsSteps()
function drawLine(isStp = isSteps()) {
    let   i, index, l, map, slice;
    const str   = [],
    loopIndexes = [0],
    drawAsLine  = !isStp && !elms.drawAsSteps.checked,
    hasWaiting  =  isStp || ezY.loopWait || ezY.tripWait;
    if (loopFrames.length)
        loopIndexes.push(...loopFrames);

    // loopIndexes.length maxes out at 9, so looped ifs are no big deal
    for (i = 0, l = loopIndexes.length; i < l; i++) {
        index = loopIndexes[i];         // slice off this iteration's frames
        slice = frames.slice(index + Number(Boolean(i)), loopIndexes[i + 1])
                      .filter((frm, j, arr) => frm.value != arr[j - 1]?.value);
                                        // remove duplicate, consecutive frames
        if (hasWaiting && i)
            slice = slice.slice(1);     // first frame duplicates previous
                                        // iteration's final frame.
        str.push(`M${frameToString(slice[0])}L`);
        if (drawAsLine)
            map = slice.map(frm => frameToString(frm));
        else {                          // j is offset by -1 relative to slice
            map = slice.slice(1).map((frm, j) =>
                      pointToString(frm.x, slice[j].y)
                    + frameToString(frm));
            if (isStp)
                str.push(frameToString(slice[0]));
        }
        str.push(...map);
    }
    P.d.set(chart.line, str.join("").trimEnd());
}
// frameToString() helps drawLine() encapsulate a common call to pointToString()
function frameToString(frm) {
    return pointToString(frm.x, frm.y);
}
// pointToString() helps drawLine() convert x and y to comma-separated pair
function pointToString(x, y) {
    return `${x.toFixed(2)},${y.toFixed(2)} `;
}
//==============================================================================
// newTargets() calls Easy.proto.newTarget() as needed, with and without .prop
//              and .elms, called by changePlay(), initPseudo(true).
function newTargets(isPseudo) {
    let cb;
    if (isPseudo) {
        g.easies.peri = pseudoUpdate;   // outside if(.size) for page load
        if (ezY.targets.size) {         // ezX.oneShot = true, see initEasies()
            ezY.clearTargets();
            for (cb of ["onAutoTrip","onLoop"])
                ezY[cb] = undefined;
        }
    }
    else {                              // refresh() runs between every playback
        let arr, cr, ez, prop;          // cr for chart|range
        const loopByElm = elms.loopByElm.checked;

        g.easies.peri  = update;        // test Easies.proto.peri()
        ezY.post       = postY;         // test Easy.proto.post()
        ezY.onAutoTrip = callbacks.onAutoTrip;

        ezY.clearTargets();             // not always necessary
        ezX.clearTargets();             // ditto
        ezX.addTarget(targetInputX);    // test Easy.proto.addTarget()
        if (loopByElm) {                // test single-element targets
            let tar;
            arr = [[ezX, P.cx, chart],
                   [ezY, P.cy, chart],
                   [ezY, P.cy, range]];
            for ([ez, prop, cr] of arr)
                tar = ez.newTarget({prop, loopByElm, elms:cr.dots});
                                        // callbacks for one target only
            tar.onLoopByElm = callbacks.onLoopByElm;
            tar.onLoop      = callbacks.onLoop;
            ezY.onLoop      = undefined;
        }
        else {                          // test single and multi-element targets
            ezY.onLoop = callbacks.onLoop;
            arr = [[ezX, P.cx, [chart]],
                   [ezY, P.cy, [chart, range]]];
            for ([ez, prop, cr] of arr)
                ez.newTarget({prop, elms:cr.map(v => v.dots[0])});
        }
    }
}
//==============================================================================
// initPseudo() sets frames[0], calls newTargets(true)
function initPseudo() {
    const
    y = theStart(),         // y = 0 or 1000
    u = y ? 1 : 0;          // u for e.unit
    frames[0] = vucFrame(0, 0, y, y, u, 1 - u);
    loopFrames.length = 0;  // for loopByElm post-play pre-stop
    newTargets(true);
}
//==============================================================================
// postY() is the ezY.post() callback
function postY() {
    setInfo(raf.elapsed / MILLI);
}
// update() is the g.easies.peri() callback
function update() {
    updateFrame(...eGet([ezX, ezY]));
}
// pseudoUpdate() is the pseudo-animation callback, ezX.target.peri() only. For
//                E.steps w/jump:E.start|E.none, ezY ends before ezX, but ezY.e
//                remains intact for drawing the rest of the line.
function pseudoUpdate() {
    pseudoFrame(ezX.e, ezY.e);  // avoids eGet() and always uses e, not e2
}
// getFrame() converts arguments to a frame object, called by syncZero(),
//            updateFrame(), pseudoFrame()
function getFrame(t, ex, ey) {
    const frm = {t, x:ex.value, y:ey.value};  // .y is an alias for .value

    for (var key of ["status", ...Easy.eKey])
        frm[key] = ey[key];

    return frm;
}
// vucFrame() creates a frame object based on value, unit, comp, called by
//            initPseudo(), postPlay(), it's a convenience, for easings only.
function vucFrame(t, x, y, value, unit, comp) { // value, unit, comp versus e
    return {t, x, y, value, unit, comp};
}
//==============================================================================
// syncZero() is the raf.syncZero callback, not called by pseudo,
//            initPseudo() resets frames[0] between every playback.
function syncZero() {
    if (isInitZero())
        frames[0] = getFrame(0, 0, ezY.e);
    frames[0].t = Math.round(playZero - performance.now());
}
// isInitZero() determines if raf.initZero should apply to playback frames, it
//              doesn't apply to pseudo frames.
function isInitZero() {
    const  elm = elms.initZero;
    return elm.checked && !elm.disabled;
}
//==============================================================================
// getMsecs() returns the duration of 1 play, including steps leftovers
//            called only by timeFrames(), ezY and objEz not updated yet.
function getMsecs() {
    return elms.time.valueAsNumber; // never called when steps has user timing
}
// calcDuration() is called exclusively by setDuration()
function calcDuration(t) {
    if (elms.roundTrip.checked && elms.autoTrip.checked)
        t += t + (Number(elms.tripWait.value) / MILLI);
    return t;
}
// formatDuration() is called exclusively by setDuration()
function formatDuration(val, d) {
    return val.toFixed(d) + (val < 10 ? U.seconds : "");
}
//==============================================================================
// setCounters() is called exclusively by updateCounters()
function setCounters(frm, d, pad) {
    for (var key of Easy.eKey)
        formatNumber(frm[key], pad[key], d, elms[key]);
}
//==============================================================================
// updateX() is called exclusively by inputX(), the user can click anywhere on
//           #x, so for loopByElm set all 3 dots every time.
function updateX(frm, i) {
    const
    x = frm.x + U.px,
    y = frm.y + U.px;           // !loopFrames == isPseudo
    if (!elms.loopByElm.checked || !loopFrames.length)
        setDot(0, x, y);
    else  {                     // loopByElm && !isPseudo
        const iElm = (loopFrames.findLastIndex(n => n < i) + 1) % COUNT;
        for (let j = 0; j < COUNT; j++)
            if (j == iElm)
                setDot(j, x, y);
            else if (j > iElm || elms.roundTrip.checked)
                setDot(j, 0, theStart());
            else
                setDot(j, MILLI, theEnd());
    }
}
// setDot() helps updateX() set the position of one dot in both chart and range
function setDot(i, x, y) {
    chart.dots[i].style.cx = x;
    chart.dots[i].style.cy = y;
    range.dots[i].style.cy = y; // y only, it's a vertical line, 1D
}
//==============================================================================
// postPlay() flips frames[0] after non-autoTrip return trip, easings only
function postPlay() {
    if (elms.roundTrip.checked                    // roundTrip
     && !elms.autoTrip.checked                    // && !autoTrip
     && ezX.e.status != E.tripped) {              // && end of return trip
        const
        v = theEnd() * Number(!elms.flip.value),  // E.steps can end anywhere
        u = Math.ceil(v) / MILLI;                 // unit is 0 or 1
        frames[0] = vucFrame(0, MILLI, v, v, u, Ez.comp(u));
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
function theStart() {
    return Number(elms.start.textContent);
}
function theEnd() {
    return Number(elms.end.textContent);
}