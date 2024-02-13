// export everything, all functions
export {redraw, getPoint, vucPoint, pointZero, flipZero, updateX, setSidebar,
        formatDuration};

import {E, U, P, Easy} from "../../raf.js";

import {ezX}                                 from "../load.js";
import {points, inputX, pseudoAnimate}       from "../update.js";
import {storeCurrent}                        from "../local-storage.js";
import {MILLI, COUNT, elms, g, formatNumber} from "../common.js";

import {drawLine}                       from "./events.js";
import {isSteps}                        from "./steps.js";
import {chart, range, isOutOfBounds}    from "./chart.js";
import {ezY, newEzY, twoLegs, isBezier} from "./index.js";
//==============================================================================
// redraw() <= updateAll(), changeStop(), inputTypePow(evt), some event handlers
function redraw(tar, n, has2 = twoLegs(),
                        isBS = !has2 && (isBezier() || isSteps()),
                        oobOld = false) {
    if (tar) {  // direct user event or inputTypePow(evt)
        let obj;
        if (n)
            ezY.time = n;       // the one property that doesn't use newEzY()
        else {
            obj = newEzY();
            if (!obj) {
                switch (tar) {  // newEzY() failed:
                case elms.values: case elms.easyValues: // easy type = E.steps or
                case elms.timing: case elms.easyTiming: // easy changes direction
                    elms.easyTiming.selectedIndex = 0;  // time only goes up
                    break;
                case elms.steps: case elms.jump:        // {steps:1, jump:E.none}
                    tar.selectedIndex = 1;              // results in zero steps
                default:
                }
                return;
            } //-------
        }
        inputX();               //*01
        storeCurrent("", obj);  // if (n) obj is undefined
    }
    pseudoAnimate();            // update points
    drawLine();                 // draw the line

    let oob = isOutOfBounds();
    if (has2 && !isBS)
        oob |= isOutOfBounds(Number(elms.type2.value));
    if (oob || oobOld) {    // adjust the vertical size of chart and range
        let cr, maxY, minY;
        if (oob) {          // minY and x are negative numbers
            const y = points.map(p => p.y);
            minY = Math.min(...y, 0);
            maxY = Math.max(...y, MILLI);
        }
        else {              // oobOld
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
// getPoint() creates a point object, <= update.js: update(), pseudoAnimate()
function getPoint(t, x = ezX.e.value, y = ezY.e.value, e = ezY.e) {
    const p = {t, x, y};
    for (var key of Easy.eKey)
        p[key] = e[key];
    return p;
}
// vucPoint() creates a point object based on value, unit, comp, called by
//            changePlay(), pseudoAnimate(), a convenience, easings only.
function vucPoint(t, x, y, value, unit, comp) { // value, unit, comp versus e
    return {t, x, y, value, unit, comp};
}
//==============================================================================
// pointZero() sets points[0] and returns g.easies vs multi easys
function pointZero(pts, _) {
    const y = Number(elms.start.textContent);   // y = 0 or 1000
    const u = y ? 1 : 0;
    pts[0]  = vucPoint(0, 0, y, y, u, 1 - u);
    return g.easies;
}
// flipZero() flips points[0] after non-autoTrip return trip, easings only
function flipZero() {
    const isTripping = elms.roundTrip.checked     // roundTrip
                    && !elms.autoTrip.checked     // !autoTrip
                    && ezX.e.status != E.tripped; // return trip
    const u = Number(isTripping); // unit = 1 or 0
    const x = u * MILLI;
    const y = isTripping != Boolean(elms.direction.value)
            ? MILLI
            : 0;
    points[0] = vucPoint(0, x, y, y, u, 1 - u);
    drawLine();
}
//==============================================================================
// updateX() is called exclusively by inputX(), !isReset = #x.oninput
function updateX(p, isReset) {     // range.active.length is the same value
    const l = isReset ? COUNT : 1; // chart.active.length;
    const x = p.x + U.px;
    const y = p.y + U.px;
    for (var i = 0; i < l; i++) {
        chart.dots[i].style.cx = x;
        chart.dots[i].style.cy = y;
        range.dots[i].style.cy = y;
    }
}
function setSidebar(p, d, pad) {
    for (var key of Easy.eKey)
        elms[key].textContent = formatNumber(p[key], pad[key], d);
}
function formatDuration(val, d) {
    return val.toFixed(val < 10 ? d : d - 1) + U.seconds;
}