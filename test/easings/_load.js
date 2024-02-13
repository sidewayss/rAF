// export everything
export {loadIt, getEasies, initEasies, updateAll, getMsecs, resizeWindow};

import {U, P, Pn, Ez, Easies} from "../../raf.js";

import {ezX, raf}           from "../load.js";
import {inputX, updateTime} from "../update.js";
import {getNamed, getLocal} from "../local-storage.js";
import {LENGTH, elms, g, twoToCamel, isTag, errorAlert}
                            from "../common.js";
import {redraw}                                          from "./_update.js";
import {OTHER, updateEzXY, trip}                         from "./index.js";
import {chart, range, loadChart}                         from "./chart.js";
import {loadTIOPow, setLink, updateTypeIO}               from "./tio-pow.js";
import {loadMSG, updateMidSplit, updateSplitGap}         from "./msg.js";
import {VALUES, TIMING, EASY, USER, loadSteps, updateVT} from "./steps.js";
import {loadEvents, inputTime, changePlays, changeLoopByElm, changeReset,
        changeZero}                                      from "./events.js";
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

    Ez.readOnly(chart, "dots", Array.from(LENGTH, (_, i) => chart["dot"  + i]));
    Ez.readOnly(range, "dots", Array.from(LENGTH, (_, i) => range["dotY" + i]));
    Ez.readOnly(chart, "active", []);   // visible dots determined by loopByElm
    Ez.readOnly(range, "active", []);   // ditto
    Ez.readOnly(chart, "byElm", chart.dots.slice(1)); // loopByElm dots
    Ez.readOnly(range, "byElm", range.dots.slice(1)); // ditto
//!!Ez.readOnly(chart, "styles",        // all dot styles in one place
//!!            [...chart.dots, ...range.dots].map(dot => dot.style));

    Ez.readOnly(g, "sideElms", []);     // for sidebar formatting re: playback
    Ez.readOnly(g, "sideLbls", []);
    for (elm of document.getElementsByClassName(elms.sidebar.id))
        (isTag(elm, "p") ? g.sideLbls : g.sideElms).push(elm);

    elm = elms.loopWait;                // I prefer to populate it here vs HTML
    for (i = 0; i <= 5; i++)
        elm.add(new Option((i / 10).toFixed(1) + U.seconds, i * 100));

    const id  = "tripWait";             // tripWait is a clone of loopWait
    const div = elms.autoTrip.nextElementSibling;

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
    loadTIOPow();       // type, io, pow, clones #type to create #type2
    loadSteps();        // type == E.steps
    loadMSG();          // mid, split, gap
    loadChart();        // events for class="chart", must follow cloning

    if (hasVisited) // return visitor to this page
        for (elm of [elms.reset, elms.zero, elms.drawSteps])
            elm.checked = getLocal(elm);
    else {          // user is new to this page
        elms.io.selectedIndex = 0;
        for (elm of [elms.linkType, elms.linkPow])
            setLink(elm, true);
    }
}
//==============================================================================
function getEasies() {
    const EV = twoToCamel(EASY, VALUES);
    const ET = twoToCamel(EASY, TIMING);
    getNamed(elms[EV], false);            // only non-steps Easys
    const sel = elms[EV].cloneNode(true);

    sel.id   = ET;
    elms[ET] = sel;
    elms[TIMING].parentNode.appendChild(sel);
    Ez.readOnly(elms[VALUES], OTHER, [elms[EV], elms[twoToCamel(USER, VALUES)]]);
    Ez.readOnly(elms[TIMING], OTHER, [elms[ET], elms[twoToCamel(USER, TIMING)]]);
}
function initEasies(obj) {
    try {
        g.easies    = new Easies(ezX);
        raf.targets = g.easies;
    } catch(err) {
        errorAlert(err);
        return false;
    }
    return updateEzXY(obj);
}
function updateAll(isLoading) { // called by loadFinally(), openNamed()
    if (isLoading) {
        changeReset(elms.reset);
        changeZero (elms.zero);
        trip();
        updateVT();     // E.steps
        inputTime(null, isLoading);
    }
    updateTime();
    updateSplitGap();
    updateTypeIO();
    changeLoopByElm();
    changePlays();      // calls setNoWaits()
    redraw();
    inputX();           // must follow redraw()
    updateMidSplit();
}
function getMsecs() {
    return elms.time.valueAsNumber;
}
//==============================================================================
// resizeWindow() handles resize events for window
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
    elms.left.firstElementChild.style.width = elms.sidebar.offsetWidth + U.px;

    // Center #copied in the available space
    n  = elms.code.offsetLeft + elms.code.offsetWidth;
    n += (chart.svg.parentNode.offsetLeft - n ) / 2;
    n -= elms.copied.offsetWidth / 2;
    elms.copied.style.left = n + U.px;

    // Set diptych left's width for better vertical alignment
    elms.left.firstElementChild.style.width =
        Math.round((chart.svg.clientWidth / 2)
                 + elms.sidebar.parentNode.clientWidth
                 - parseFloat(getComputedStyle(elms.left).paddingRight)
                  ) + U.px;
}