export {load, getEasies, initEasies, updateAll, resizeWindow};
export let clipEnd, clipStart;

import {U, Is} from "../../src/raf.js";

import {raf}                                   from "../load.js";
import {DEFAULT_NAME, LINEAR}                  from "../named.js";
import {newEasies, updateTime, updateCounters} from "../update.js";
import {changeStop}                            from "../play.js";
import {getNamed}                              from "../local-storage.js";
import {COUNT, BUTTON, SELECT, LABEL, EASY_, elms, g, is}
                                               from"../common.js";
import {loadEvents} from "./events.js";
import {MASK_X, clip, easys, refresh, setClipPair, setClipPath, newTargets}
                    from "./_update.js";
//==============================================================================
// load() is called by loadCommon()
function load() {
    let opt, val;
    opt = new Option(DEFAULT_NAME, DEFAULT_NAME, true, true);
    opt.innerHTML = "&mdash;";  // must be set this way
    elms.plays0.add(opt, elms.plays0.firstElementChild);

    elms.copy     = elms.data.previousElementSibling; // Copy: label
    g.clipOpacity = [getComputedStyle(elms.clip).opacity, 1];

    for (val of [0, 30, 1, 3])  // x-axis = even, y-axis = odd
        clip[val] = 0;          // the zero values in clip never change

    return is();
}
//==============================================================================
// getEasies() populates easy0 <select> and clones its <div>, <= loadJSON()
function getEasies(hasVisited) {
    let clone, elm, i, id, j, tag;
    const
    TAGS = [SELECT, BUTTON,"span","check-tri"],
    src  = elms.template,                // source container element for cloning
    sib  = src.nextElementSibling,       // second arg to insertBefore()
    par  = src.parentNode,               // for par.insertBefore(clone, sib)
    ids  = [];

    src.removeAttribute("id");           // don't clone the id
    for (tag of TAGS) {
        for (elm of src.getElementsByTagName(tag)) {
            id = elm.id.slice(0, -1);
            ids.push(id);
            elms[id] = [elm,,];          // e.g. elms.easy[i] vs elms[`easy${i}`]
        }
    }
    getNamed(elms.easy0, EASY_, LINEAR); // easy0 is inside #template
    elms.easyDivs = [src.lastElementChild];
    for (i = 1; i < COUNT; i++) {        // clone 'em
        clone = par.insertBefore(src.cloneNode(true), sib);
        elms.easyDivs.push(clone.lastElementChild);
        j = 0;
        for (tag of TAGS) {
            for (elm of clone.getElementsByTagName(tag)) {
                id = ids[j++];
                elm.id = id + i;
                elms[id][i] = elm;
                elms[elm.id] = elm;
            }
        }
        for (elm of clone.getElementsByTagName(LABEL))
            elm.htmlFor = elm.htmlFor.slice(0, -1) + i;
    }
    loadEvents();                        // must wait until after cloning
}
//==============================================================================
// initEasies() is called by loadFinally(), formFromObj(), objFromForm()
function initEasies(_, hasVisited) {
    if (Is.def(hasVisited)) {    // called by loadFinally() once per session
        raf.initZero = true;
        return true;
    }
    else                         // called prior to loadFinally by formFromObj()
        return newEasies(easys);
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
function resizeWindow(evt) {
    changeStop();                       // in case playback is in progress
                                        // changes to clipStart/End = refresh()
    let i, m, mask, val,
    elm = elms.bgWhite;
    const                               // all four border widths are the same
    bw     = parseFloat(getComputedStyle(elm).borderTopWidth),
    height = elm.offsetHeight,
    top    = elm.offsetTop,
    left   = elm.offsetLeft,
    style  = elms.clip.style,
    plate  = elms.template;

    style.width  = elm.offsetWidth + U.px; // allows slightly out-of-bounds values
    style.height = height  + U.px;
    style.top    = top     + U.px;
    style.left   = left    + U.px;

    elms.copied.style.left = elms.copy.offsetLeft
                           - (elms.copied.offsetWidth - elms.copy.offsetWidth)
                           - 2 + U.px;
    const
    width = elms.filler.offsetWidth + bw + 1, // some viewport scales require +1
    sizes = [                                 // 0-31 = 16 x,y pairs
        [width, [2,4, 10,12, 18,20, 26,28]],  // x-axis: even numbers
        [height, [29, 31]]                    // y-axis: odd  numbers
    ];
    elms.filler.style.height = (height - bw - bw) + U.px;
    if (clipStart != width) {
        clipStart = width;
        if (!Is.def(clip[MASK_X[0]]) || clip[MASK_X[0]] == clipStart)
            sizes.push([clipStart, MASK_X]);
        else
            ; //!!doesn't adjust paused or elms.x non-zero clip-path!!
    }
    elm      = plate.lastElementChild;
    clipEnd  = plate.firstElementChild.offsetWidth
             + elm.clientWidth;         // exclude the right border

    for ([val, mask] of sizes)
        for (m of mask)
            clip[m] = val;

    i = 3;                              // y-axis: otherwise static values
    mask = Array.from({length:COUNT * 4}, () => i += 2);
    i = 0;                              // [5,7,9,11, 13,15,17,19, 21,23,25,27]
    for (elm of elms.easyDivs) {        // 3 easyDivs by (pair * 2)
        val = elm.offsetTop - top;
        i = setClipPair(val, i, mask);  // pair 0, i += 2
        val += elm.offsetHeight;
        i = setClipPair(val, i, mask);  // pair 1, ditto
    }
    if (evt.isLoading)
        setClipPath();
    else {
        newTargets(true);
        refresh();                      // calls setClipPath()
    }
}