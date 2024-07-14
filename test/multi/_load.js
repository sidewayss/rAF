export {loadIt, getEasies, initEasies, updateAll, resizeWindow};
export let clipDist, clipEnd, clipStart;

import {U, Is} from "../../raf.js";

import {DEFAULT_NAME}                               from "../named.js";
import {newEasies, updateTime, updateCounters}      from "../update.js";
import {getNamed, getNamedEasy, getLocal, setLocal} from "../local-storage.js";
import {COUNT, BUTTON, SELECT, LABEL, CHANGE, EASY_, elms, g, is}
                                                    from"../common.js";
import {loadEvents} from "./events.js";
import {MASK_X, clip, easys, refresh, setClipPair, setClipPath}
                    from "./_update.js";
//==============================================================================
// loadIt() is called by loadCommon()
function loadIt() {
    let elm, opt, val;
    g.notLoopWait = new Array(COUNT);
    g.notTripWait = new Array(COUNT);

    opt = new Option(DEFAULT_NAME, DEFAULT_NAME, true, true);
    opt.innerHTML = "&mdash;";   // must be set this way
    elms.plays0.add(opt, elms.plays0.firstElementChild);

    for (elm of [elms.color0, elms.color1]) {
        elm.addEventListener(CHANGE, changeColor, false);
        val = getLocal(elm);
        if (val)
            elm.value = val;
    }
    elms.copy     = elms.data.previousElementSibling; // Copy: label
    g.clipOpacity = [getComputedStyle(elms.clip).opacity, 1];
    changeColor();

    for (const m of [0, 30, 1, 3])  // x-axis = even, y-axis = odd
        clip[m] = 0;                // the zero values in clip never change

    return is();
}
function changeColor(evt) { // not exported, helps loadIt()
    const val = "linear-gradient(to bottom right, "
              + `${elms.color0.value}, ${elms.color1.value})`;
    elms.clip.style.backgroundImage = val;
    if (evt)
        setLocal(evt.target, evt.target.value);
}
//==============================================================================
// getEasies() populates easy0 <select> and clones its <div>, <= loadJSON()
function getEasies(hasVisited) {
    let clone, elm, i, id, j, tag;
    const TAGS = [SELECT, BUTTON,"span","check-tri"];
    const src = elms.template;          // source container element for cloning
    const sib = src.nextElementSibling; // second arg to insertBefore()
    const par = src.parentNode;         // for par.insertBefore(clone, sib)
    const ids = [];

    src.removeAttribute("id");          // don't clone the id
    for (tag of TAGS) {
        for (elm of src.getElementsByTagName(tag)) {
            id = elm.id.slice(0, -1);
            ids.push(id);
            elms[id] = [elm,,];         // e.g. elms.easy[i] vs elms[`easy${i}`]
        }
    }
    getNamed(elms.easy0, EASY_);        // easy0 is inside #template
    elms.ucvDivs = [src.lastElementChild];
    for (i = 1; i < COUNT; i++) {       // clone 'em
        clone = par.insertBefore(src.cloneNode(true), sib);
        elms.ucvDivs.push(clone.lastElementChild);
        j = 0;
        for (tag of TAGS) {
            for (elm of clone.getElementsByTagName(tag)) {
                id = ids[j++];
                elm.id = id + i;
                elms[id][i] = elm;
            }
        }
        for (elm of clone.getElementsByTagName(LABEL))
            elm.htmlFor = elm.htmlFor.slice(0, -1) + i;
    }
    loadEvents();                    // must wait until after cloning

    if (!hasVisited)                 // default to the first three presets, in
        for (i = 0; i < COUNT; i++) {// order, better than all three the same.
            elm = elms.easy[i];
            elm.selectedIndex = i;
            easys[i] = getNamedEasy(elm.value); // default easys not recursive!!returns undefined if failure
        }
}
//==============================================================================
// initEasies() is called by loadFinally(), updateNamed(), changeEasy()
function initEasies() {
    const b = newEasies(easys);
    if (b)
        g.easies.oneShot = true;  // test Easies.proto.oneShot, see newTargets()
    return b;
}
//==============================================================================
// updateAll() called by loadFinally(), openNamed()
function updateAll() {
    updateTime();     // creates targetInputX, assigns it to ezX
    refresh();
    updateCounters();
}
//==============================================================================
// resizeWindow() resizes the polygon: y-values and all stationary x-values
function resizeWindow() {
    let i, m, mask, tmp, val,
    elm = elms.bgWhite;
    const
    bw     = parseFloat(getComputedStyle(elm).borderTopWidth),
    top    = elm.offsetTop,
    height = elm.offsetHeight,
    width  = elms.filler.offsetWidth + bw + 1, // some viewport scales require the +1
    style  = elms.clip.style;

    elms.filler.style.height = (height - bw - bw) + U.px;

    style.top    = top    + U.px;
    style.height = height + U.px;
    style.left   = elm.offsetLeft + U.px;

    tmp = elms.template;
    elm = tmp.lastElementChild;
    val = elm.lastElementChild.offsetWidth;
    clipEnd = tmp.firstElementChild.offsetWidth
            + elm.clientWidth             // exclude the right border
            - val;

    style.width = clipEnd + val + U.px;   // allows for out-of-bounds values
    elms.copied.style.left = elms.copy.offsetLeft
                           - (elms.copied.offsetWidth - elms.copy.offsetWidth)
                           - 2 + U.px;
    const sizes = [                       // 16 x,y pairs: 0-31
        [width, [2,4, 10,12, 18,20, 26,28]], // x-axis: even numbers
        [height, [29, 31]]                   // y-axis: odd  numbers
    ];
    if (clipStart != width) {
        clipStart = width;
        if (!Is.def(clip[MASK_X[0]]) || clip[MASK_X[0]] == clipStart)
            sizes.push([clipStart, MASK_X]);
        else
            ; //!!doesn't adjust paused or elms.x non-zero clip-path!!
    }
    clipDist = clipEnd - clipStart;

    for ([val, mask] of sizes)
        for (m of mask)
            clip[m] = val;

         // div 0     div 1        div 2         3 ucvDivs by (pair * 2)
    mask = [5,7,9,11, 13,15,17,19, 21,23,25,27];
    i = 0;
    for (elm of elms.ucvDivs) {
        val = elm.offsetTop - top;
        i = setClipPair(val, i, mask);   // pair 0
        val += elm.offsetHeight;
        i = setClipPair(val, i, mask);   // pair 1
    }
    setClipPath();
}