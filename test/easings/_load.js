export {loadIt, getEasies, initEasies, updateAll, resizeWindow};

import {E, U, P, Pn, Ease, Ez, Easy} from "../../raf.js";

import {ezX}      from "../load.js";
import {getLocal} from "../local-storage.js";
import {pad, newEasies, updateTime, updateCounters} from "../update.js";
import {COUNT, CHANGE, INPUT, elms, g, is, isTag, dummyEvent}
                  from "../common.js";

import {chart, range, refresh}                          from "./_update.js";
import {initEzXY, updateTrip}                           from "./index.js";
import {loadTIOPow, updateTypeIO}                       from "./tio-pow.js";
import {loadMSG, updateMidSplit, updateSplitGap}        from "./msg.js";
import {loadSteps, loadTV, initSteps, maxTime, isSteps} from "./steps.js";
import {loadEvents}                                     from "./events.js";

// a constant, some pseudo-constants, and a variable for resizeWindow()
const sizes = [
    {w:855, h:941, factor:1, size:"100%"  },  // 16px
    {w:806, h:896, factor:1, size:"93.75%"},  // 15px
    {w:759, h:841, factor:1, size:"87.5%" },  // 14px
    {w:720, h:799, factor:0, size:"81.25%"},  // 13px - factor set in loadIt()
    {w:675, h:749, factor:0, size:"75%"   }   // 12px - ditto
];
let borderW, boxStyle, checkH, checkW, factorW, iSize, lefties, leftW, minW,
    oobRatio, padLeft, subtraH, subtraW, topBott;
//==============================================================================
// loadIt() is called by loadCommon()
function loadIt(byTag, hasVisited) {
    let clone, cr, elm, i;
    ++pad.unit;                         // an extra leading space for -0.123
    ++pad.comp;                         // ditto

    Ez.readOnly(chart, "svg", document.getElementById("chart"));
    Ez.readOnly(range, "svg", document.getElementById("y"));
    Ez.readOnly(chart, Pn.vB, P.viewBox.getn(chart.svg));
    Ez.readOnly(range, Pn.vB, P.viewBox.getn(range.svg));

    for (cr of [chart, range])
        for (elm of cr.svg.children)    // they all have ids
            Ez.readOnly(cr, elm.id, elm);

    const LENGTH = {length:COUNT};
    Ez.readOnly(chart, "dots", Array.from(LENGTH, (_, i) => chart["dot"  + i]));
    Ez.readOnly(range, "dots", Array.from(LENGTH, (_, i) => range["dotY" + i]));
    Ez.readOnly(chart, "active", []);   // visible dots determined by loopByElm
    Ez.readOnly(range, "active", []);   // ditto
//!!Ez.readOnly(chart, "styles",        // all dot styles in one place
//!!            [...chart.dots, ...range.dots].map(dot => dot.style));

    Ez.readOnly(g, "sideElms", []);     // for sidebar formatting re: playback
    Ez.readOnly(g, "sideLbls", []);
    for (elm of document.getElementsByClassName(elms.sidebar.id))
        (isTag(elm, "p") ? g.sideLbls : g.sideElms).push(elm);

    elm = elms.loopWait;                // I prefer to populate it here vs HTML
    for (i = 0; i <= 5; i++)
        elm.add(new Option((i / 10).toFixed(1) + U.seconds, i * 100));

    const
    id  = "tripWait",                   // tripWait is a clone of loopWait
    div = elms.autoTrip.nextElementSibling;

    clone = elm.labels[0].cloneNode(true);
    clone.htmlFor = id;
    clone.textContent = "|" + clone.textContent;
    div.appendChild(clone);             // <label>

    clone = elm.cloneNode(true);
    clone.id = id;
    clone.className = "";
    div.appendChild(clone);             // <select>
    elms[id] = clone;                   // elms.tripWait

    const checks = byTag.at(-1);        // <check-box>s
    Ez.readOnly(g, "trips", checks.filter(e => e.id.endsWith("Trip")));
    g.trips.push(clone);

    const
    shadow = checks[0].shadowRoot,
    check  = shadow.getElementById("check"),
    box    = shadow.getElementById("box");
    checkW = P.w.getn(check);           // pseudo-constants for resizeWindow()
    checkH = P.h.getn(check);
    minW   = P.minWidth.getn(chart.svg);
    i = P.w.getn(box);                  // scaling factor for small checkboxes
    i = (i - 1) / i;                    // 12/13
    sizes.filter(sz => !sz.factor).forEach(obj => obj.factor = i);

    loadEvents(checks);
    loadSteps();                	    // type == E.steps
    loadMSG();                  	    // mid, split, gap
    if (hasVisited)                     // return visitor to this page
        for (elm of [elms.reset, elms.zero, elms.drawAsSteps])
            elm.checked = getLocal(elm);
    return is();
}
//==============================================================================
// getEasies() is called exclusively by loadJSON()
function getEasies() {
    let i,    // all but i and elm are consts, but this reads better
    size = 4,
    id   = Easy.type[E.bezier],
    div  = elms[id],
    elm  = div.firstElementChild,          // sub-<div> wrapper
    divs = [elm],
    lpar = elm.removeChild(elm.firstElementChild),
    rpar = elm.removeChild(elm.lastElementChild),
    ease = Ease.ease[0][id];               // default CSS "ease" as bezier array

    for (i = 1; i < size; i++)             // clone sub-<div>
        divs.push(div.appendChild(elm.cloneNode(true)));

    elms.beziers = new Array(ease.length); // the 4 <input>s
    for (i = 0; i < size; i++) {
        elm = divs[i].getElementsByTagName(INPUT)[0];
        elm.value = ease[i];
        elm.id    = id + i;                // "bezier0" to "bezier3"
        if (i % 2) {                       // y values can be out of bounds
            elm.dataset.min ="-0.9";
            elm.dataset.max = "1.9";
        }
        else {
            elm.dataset.min = "0";
            elm.dataset.max = "1";
        }
        elms.beziers[i] = elm;
    }
    elm = divs[0];
    elm.removeChild(elm.firstElementChild);        // leading comma
    elm.insertBefore(lpar, elm.firstElementChild); // leading parenthesis
    divs[3].appendChild(rpar);                     // trailing parenthesis

    loadTIOPow();   // type, io, pow, calls loadChart() for input handler order
    loadTV();       // steps.js
}
// initEasies() inits the Easies and sets set-once variables for resizeWindow(),
//              called once per session by loadFinally().
function initEasies(obj, hasVisited) {
    let b = newEasies(ezX);
    if (b) {
        const evt = dummyEvent(CHANGE, "isInitEasies");
        for (const elm of [elms.reset, elms.zero])
            elm.dispatchEvent(evt);

        initSteps(obj, hasVisited);
        updateTrip();
        b = initEzXY(obj);
        if (b) {                                      // pseudo-constants:
            const cw = chart.viewBox[E.w];
            factorW  = cw / (cw + range.viewBox[E.w]);
            oobRatio = cw / 1403;                     // 1403 = E.elastic height
            lefties  = document.getElementsByClassName("lefty");
            boxStyle = document.styleSheets[1].cssRules[0].style;
    	}
    }
    return b;
}
//==============================================================================
function updateAll() {  // called by loadFinally(), openNamed()
    const evt = dummyEvent(CHANGE, "isUpdateAll");
    for (const elm of [elms.loopByElm, elms.plays])
        elm.dispatchEvent(evt);

    updateTime();       // creates targetInputX, does not assign it to ezX
    updateSplitGap();
    updateMidSplit();
    updateTypeIO();
    refresh();
    updateCounters();   // must follow refresh()
    maxTime();          // for E.steps
}
//==============================================================================
// resizeWindow() handles resize events for window, here instead of events.js
//                so that load.js can use it in addEventListener for all pages,
//                assumes no zooming by the user post page-load because of all
//                the set-once pseudo-constants set in initEasy(). Zooming was
//                weird anyway...
//                Safari doesn't auto-size <svg> within <div>, gotta do it here.
//                Resizing is stuttering in my tests. I should throttle it...
function resizeWindow() {
    const
    innerW = window.innerWidth,
    innerH = window.innerHeight;

    let i = sizes.findIndex(obj => innerW >= obj.w && innerH >= obj.h);
    if (i < 0)
        i = sizes.length - 1;
    if (i != iSize) {                   // change root font-size and friends
        const sz = sizes[i];
        boxStyle.width  = (checkW * sz.factor) + U.px;
        boxStyle.height = (checkH * sz.factor) + U.px;
        document.documentElement.style.fontSize = sz.size;
        iSize   = i;                    // pseudo-consts for resizeWindow():
        padLeft = P.pL.getn(lefties[0]);
        leftW   = elms.sidebar.getBoundingClientRect().width
                - P.mR.getn(elms.left);     // lefties[0] width
        borderW = P.top.getn(elms.shadow);  // border width
        topBott = P.pT.getn(document.body)  // top + bottom padding
                + P.pB.getn(document.body);
        subtraW = (borderW * 2)             // width  subtrahend
                + padLeft
                + lefties[1].offsetWidth;
        subtraH = topBott                   // height subtrahend
                + borderW
                + elms.diptych.offsetHeight
                + elms.x.offsetHeight;
        if (isSteps())                      // remove E.steps's extra row height
                subtraH -= elms.divValues.offsetHeight;
    }
    let elm,
    n = Ez.clamp(
        minW,                           // absolute minimum width
        factorW  * (innerW - subtraW),  // available width - range.svg width
        oobRatio * (innerH - subtraH)   // width of available height for oob
    );
    P.w.set(chart.svg, n);              // set chart width, range height
    P.h.set(range.svg, P.h.get(chart.svg));

    elm = lefties[0];                   // set diptych left's width for better
    P.w.set(elm, (n / 2) + leftW);      // vertical alignment with triptych.

    const                               // size box-shadow background element
    l = elm.getBoundingClientRect().left, // must follow P.w.set(elm, )
    r = innerW
      - Math.round(range.svg.getBoundingClientRect().right)
      - padLeft;
    elm = elms.shadow.style;
    elm.left   = l + U.px;
    elm.width  = innerW - r - l + U.px;
    elm.height = document.body.clientHeight - borderW + U.px;

    // Center the #copied notification element in the available space
    n  = elms.code.offsetLeft + elms.code.offsetWidth;
    n += ((chart.svg.parentNode.offsetLeft - n ) / 2)
       - (elms.copied.offsetWidth / 2);
    elms.copied.style.left = n + U.px;
}