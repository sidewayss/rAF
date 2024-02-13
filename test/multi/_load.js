// export everything but changeColor, all functions
export {clipDist, clipEnd, clipStart,
        loadIt, getEasies, initEasies, updateAll, getMsecs, resizeWindow};
let clipDist, clipEnd, clipStart;

import {E, U, Is, P, Easies} from "../../raf.js";

import {setTime}                      from "../load.js";
import {updateTime, setDuration}      from "../update.js";
import {DEFAULT_NAME}                 from "../named.js";
import {ezCopy}                       from "../copy.js";
import {getNamed, getNamedEasy, getLocal, setLocal}
                                      from "../local-storage.js";
import {COUNT, ZERO, CHANGE, elms, g} from "../common.js";

import {redraw}                          from "./_update.js";
import {loadEvents}                      from "./events.js";
import {MASK_X, clip, easys, meFromForm} from "./index.js";
//==============================================================================
// loadIt() is called by loadCommon()
function loadIt() {
    let elm, opt, val;

    g.notLoopWait = new Array(COUNT);
    g.notTripWait = new Array(COUNT);

    opt = new Option(DEFAULT_NAME, DEFAULT_NAME, true, true);
    opt.innerHTML = "&mdash;";   // must be set this way
    elms.play0.add(opt, elms.play0.firstElementChild);

    for (elm of [elms.color0, elms.color1]) {
        elm.addEventListener(CHANGE, changeColor, false);
        val = getLocal(elm);
        if (val)
            elm.value = val;
    }
    elms.copy = elms.data.previousElementSibling; // Copy: label
    elms.clip.opacity = [getComputedStyle(elms.clip).opacity, 1]; // unauthorized
    elms.ucvDivs = [];
    changeColor();

    ezCopy.newTarget({elm:elms.copy, prop:P.o, eKey:E.comp});
    for (const m of [0, 30, 1, 3])  // x-axis = even, y-axis = odd
        clip[m] = 0;                // the zero values in clip never change
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
    const TAGS = ["select","button","use","span"];
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
    getNamed(elms.easy0, undefined, EASY_); // easy0 is inside #template
    elms.ucvDivs.push(src.lastElementChild);
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
        for (elm of clone.getElementsByTagName("label"))
            elm.htmlFor = elm.htmlFor.replace(ZERO, i);
    }
    loadEvents();                    // must wait until after cloning

    if (!hasVisited)                 // default to the first three presets, in
        for (i = 0; i < COUNT; i++) {// order, better than all three the same.
            elm = elms.easy[i];
            elm.selectedIndex = i;
            easys[i] = getNamedEasy(elm.value);
        }
}
// initEasies() is called by loadFinally(), redraw(), updateNamed()
function initEasies() {
    try {
        g.easies    = new Easies([...easys, ezX]);
        raf.targets = g.easies;
        measer      = g.easies.newTarget(meFromForm());
        return true;
    } catch(err) {
        errorAlert(err);
        return false;
    }
}
//==============================================================================
// updateAll() called by loadFinally(), openNamed()
function updateAll(isLoading) {
    if (isLoading)
        changeStop();
    else
        setTime();  // load.js:setTime() calls getMsecs() below

    updateTime();
    setDuration();
    redraw();
}
// getMsecs() returns the current duration in milliseconds
function getMsecs() {
    return Math.max(...easys.map(ez =>
                        ez.firstTime + (ez.loopTime * (ez.plays - 1))
                   ));
}//==============================================================================
// resizeWindow() resizes the polygon: y-values and all stationary x-values
function resizeWindow(evt) {
    let elm, i, m, mask, val;

    elm = elms.bgWhite;
    const bw     = parseFloat(getComputedStyle(elm).borderTopWidth);
    const top    = elm.offsetTop;
    const height = elm.offsetHeight;
    elms.filler.style.height = (height - bw - bw) + U.px;
    i = elms.filler.offsetWidth + bw + 1; // some viewport scales require the +1

    const style  = elms.clip.style;
    style.top    = top    + U.px;
    style.height = height + U.px;
    style.left   = elm.offsetLeft + U.px;

    elm = elms.template;
    clipEnd = elm.firstElementChild.offsetWidth
            + elm.lastElementChild.clientWidth  // exclude the right border
            - elm.lastElementChild.lastElementChild.offsetWidth;

           style.width = clipEnd + U.px;
//!!elms.x.style.width = clipEnd + 8 + U.px;
    elms.copied.style.left = elms.copy.offsetLeft
                           - (elms.copied.offsetWidth - elms.copy.offsetWidth)
                           - 2 + U.px;
    const sizes = [                       // 16 x,y pairs: 0-31
        [i, [2,4, 10,12, 18,20, 26,28]],  // x-axis: even numbers
        [height, [29, 31]]                // y-axis: odd  numbers
    ];
    if (clipStart != i) {
        clipStart = i;
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
        clip[mask[i++]] = val;           // pair 0
        clip[mask[i++]] = val;

        val += elm.offsetHeight;
        clip[mask[i++]] = val;           // pair 1
        clip[mask[i++]] = val;
    }
    elms.clip.style.clipPath = F.joinCSSpolygon(clip);
}