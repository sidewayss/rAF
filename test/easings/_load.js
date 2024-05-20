export {loadIt, getEasies, initEasies, updateAll, resizeWindow};

import {E, U, P, Pn, Is, Ease, Ez, Easy} from "../../raf.js";

import {ezX}      from "../load.js";
import {getLocal} from "../local-storage.js";
import {pad, newEasies, updateTime, updateCounters} from "../update.js";
import {COUNT, CHANGE, INPUT, elms, g, is, isTag, dummyEvent}
                  from "../common.js";

import {chart, range, refresh}                   from "./_update.js";
import {initEzXY, updateTrip}                    from "./index.js";
import {loadTIOPow, updateTypeIO}                from "./tio-pow.js";
import {loadMSG, updateMidSplit, updateSplitGap} from "./msg.js";
import {loadSteps, loadTV, initSteps, maxTime}   from "./steps.js";
import {loadEvents}                              from "./events.js";

let borderW, lefty, padLeft, ratio, subtraH, subtraW, topBott; // resizeWindow()
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

    loadEvents(checks);
    loadSteps();                	    // type == E.steps
    loadMSG();                  	    // mid, split, gap

    if (hasVisited)                     // return visitor to this page
        for (elm of [elms.reset, elms.zero, elms.drawAsSteps])
            elm.checked = getLocal(elm);
//!!else            // user is new to this page
//!!    elms.io.selectedIndex = 0; //!!necessary??

    return is();
}
//==============================================================================
// getEasies() is called exclusively by loadJSON()
function getEasies() {
    let i,              // all but i and elm are consts, but this reads better
    size = 4,
    id   = Easy.type[E.bezier],
    div  = elms[id],
    elm  = div.firstElementChild,       // sub-<div> wrapper
    divs = [elm],
    lpar = elm.removeChild(elm.firstElementChild),
    rpar = elm.removeChild(elm.lastElementChild),
    ease = Ease.ease[0][id];            // default CSS "ease" as bezier array

    for (i = 1; i < size; i++)          // clone sub-<div>
        divs.push(div.appendChild(elm.cloneNode(true)));

    elms.beziers = new Array(ease.length);  // the 4 <input>s
    for (i = 0; i < size; i++) {
        elm = divs[i].getElementsByTagName(INPUT)[0];
        elm.value = ease[i];
        elm.id    = id + i;             // "bezier0" to "bezier3"
        if (i % 2) {                    // y values can be out of bounds
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
        if (b) {                                // pseudo-constants:
            ratio = chart.viewBox[E.w] / 1403;  // 1403 = E.elastic height
            lefty = document.getElementsByClassName("lefty");
            padLeft = P.pL.getn(lefty[0]);
            topBott = P.pT.getn(document.body) + P.pB.getn(document.body);
            borderW = P.top.getn(elms.shadow);
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
//                weird anyway... subtrahends must wait until after updateAll().
//                Resizing is stuttering in my tests. Should I throttle it??
function resizeWindow() {
    if (!Is.def(subtraH)) {
        subtraH = topBott                   // height subtrahend
                + borderW
                + elms.diptych.offsetHeight
                + elms.x.offsetHeight;
        subtraW = (borderW * 2)             // width  subtrahend
                + padLeft
                + lefty[1].offsetWidth
                + range.svg.clientWidth;
    }
    // Safari doesn't auto-size svg within a <div>, must be done explicitly
    // 600 is the minimum chart width, below that the browser applies scrollbars
    const
    innerW = window.innerWidth,
    w = innerW - subtraW,                   // available width
    h = window.innerHeight - subtraH;       // available height

    let n = Math.max(608, Math.min(w, h * ratio));
    P.w.set(chart.svg, n);
    P.h.set(range.svg, P.h.get(chart.svg)); // clientHeight is integer

    // Set diptych left's width for better vertical alignment with triptych
    let elm = lefty[0];
    P.w.set(elm, Math.round((n / 2)
                          + elms.sidebar.offsetWidth
                          - P.mR.getn(elms.left)));

    // Size the box-shadow background element
    const
    l = elm.getBoundingClientRect().left,   // P.w.set() changes it
    r = innerW
      - Math.round(y.getBoundingClientRect().right)
      - padLeft;
    elm = elms.shadow.style;
    elm.left   = l + U.px;
    elm.width  = innerW - r - l + U.px;
    elm.height = document.body.clientHeight - borderW + U.px;

    // Center #copied in the available space
    n  = elms.code.offsetLeft + elms.code.offsetWidth;
    n += ((chart.svg.parentNode.offsetLeft - n ) / 2)
       - (elms.copied.offsetWidth / 2);
    elms.copied.style.left = n + U.px;
}