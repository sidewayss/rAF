export {loadIt, getEasies, initEasies, updateAll, resizeWindow};

import {E, U, P, Pn, Ez, Ease, Easy} from "../../raf.js";

import {ezX}      from "../load.js";
import {getLocal} from "../local-storage.js";
import {newEasies, updateTime, updateCounters} from "../update.js";
import {COUNT, CHANGE, INPUT, elms, g, is, isTag, dummyEvent}
                  from "../common.js";

import {refresh}                                  from "./_update.js";
import {initEzXY, updateTrip}                     from "./index.js";
import {chart, range, loadChart}                  from "./chart.js";
import {loadTIOPow, setLink, updateTypeIO}        from "./tio-pow.js";
import {loadMSG, updateMidSplit, updateSplitGap}  from "./msg.js";
import {loadSteps, loadVT, initSteps, maxTime}    from "./steps.js";
import {loadEvents}                               from "./events.js";
//==============================================================================
// loadIt() is called by loadCommon()
function loadIt(byTag, hasVisited) {
    let clone, cr, elm, i;

    Ez.readOnly(chart, "svg", document.getElementById("chart"));
    Ez.readOnly(range, "svg", document.getElementById("y"));
    Ez.readOnly(chart, Pn.vB, P.viewBox.getn(chart.svg));
    Ez.readOnly(range, Pn.vB, P.viewBox.getn(range.svg));
//!!chart.rectY = P.x .getn(chart.canvas);

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
    elms[id] = clone;
    div.appendChild(clone);             // <input>

    const checks = byTag.at(-1);        // <check-box>s
    Ez.readOnly(g, "trips", checks.filter(e => e.id.endsWith("Trip")));
    g.trips.push(clone);                // <select> = tripWait = clone

    loadEvents(checks);
    loadSteps();        // type == E.steps
    loadMSG();          // mid, split, gap

    if (hasVisited) // return visitor to this page
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
            elm.min ="-0.9";
            elm.max = "1.9";
        }
        else {
            elm.min = "0";
            elm.max = "1";
        }
        elms.beziers[i] = elm;
    }
    elm = divs[0];
    elm.removeChild(elm.firstElementChild);        // leading comma
    elm.insertBefore(lpar, elm.firstElementChild); // leading parenthesis
    divs[3].appendChild(rpar);                     // trailing parenthesis

    loadChart();    // events for class="chart", must follow cloning
    loadTIOPow();   // type, io, pow, follows loadChart() for input handler order
    loadVT();       // steps.js
}
// initEasies() called once per session by loadFinally()
function initEasies(obj, hasVisited) {
    const b = newEasies(ezX);
    if (b) {
        const evt = dummyEvent(CHANGE, "isInitEasies");
        for (const elm of [elms.reset, elms.zero])
            elm.dispatchEvent(evt);

        initSteps(obj, hasVisited);
        updateTrip();
        return initEzXY(obj);
    }
    else
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
//                so that load.js can use it in addEventListener for all pages.
function resizeWindow() {                 // margin changes w/zoom
    const margin = parseFloat(getComputedStyle(document.body).margin);
    const divX   = elms.x.parentNode;

    const availableH = window.innerHeight
                     - margin - margin    //-top-bottom margins
                     - elms.triptych.previousElementSibling.offsetHeight
                     - divX.offsetHeight;

    const availableW = window.innerWidth
                     - margin - margin;   //-left-right margins
                     - elms.sidebar.offsetWidth
                     - range.svg.offsetWidth;

    // Safari doesn't auto-size svg within a <div>, so must be done this way
    let n = availableW > availableH ? divX.offsetWidth
                                    : Math.floor(availableW); //*02
    chart.svg.style.width  = n + U.px;
    range.svg.style.height = n + U.px;

    // Center #copied in the available space
    n  = elms.code.offsetLeft + elms.code.offsetWidth;
    n += (chart.svg.parentNode.offsetLeft - n ) / 2;
    n -= elms.copied.offsetWidth / 2;
    elms.copied.style.left = n + U.px;

    // Set diptych left's width for better vertical alignment
    elms.left.firstElementChild.style.width =
        Math.round(
            (chart.svg.clientWidth / 2)
          + elms.sidebar.offsetWidth
          - parseFloat(getComputedStyle(elms.left).marginRight)
        ) + U.px;
}