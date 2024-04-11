// export everything but changeColor, all functions
export {loadIt, getEasies, initEasies, updateAll, getMsecs, resizeWindow};
export const
    easys    = new Array(COUNT),
    refRange = {}
;
export let ezColor, collapsibleHeight, controlsHeight;

import {spaces} from "https://colorjs.io/src/spaces/index.js";

import {U, Fn, F, P, Ez, Easy, Easies} from "../../raf.js";

import {ezX, raf, msecs, setTime}         from "../load.js";
import {pad, updateTime}                  from "../update.js";
import {getLocal, getNamed, getNamedEasy} from "../local-storage.js";
import {COUNT, CHANGE, CLICK, INPUT, EASY_, MEASER_, elms, g, dummyEvent,
        errorAlert}                       from "../common.js";

import {refresh}                      from "./_update.js";
import {isMulti, loadEvents, getCase} from "./events.js";
let bodyMargin, canvasBorder, canvasMargin, controlsWidth;
//==============================================================================
// loadIt() is called by loadCommon()
function loadIt(byTag, hasVisited) {
    let css, elm, id, max, obj, opt, rng, space, txt;
    pad.frame = 4;         // prevents freezing of pad in loadUpdate() :(

    elm = elms.leftSpaces; // populate leftSpaces <select>
    const sorted = Object.values(spaces).sort((a, b) => a.id < b.id ? -1 : 1);
    for (space of sorted) {
        id  = space.id;
        txt = id;
        css = space.cssId;
        opt = new Option();
        if (!(css in F))   // no Func instance for this space = Color.js
            opt.className = "colorjs";
        else {
            opt.style.color = "black";  // Color.js spaces: var(--charcoal)
            if (id == "srgb")           // F.srgb exists as an alias
                css = Fn.rgb;           // even Color.js display() uses rgb(),
            txt = css;                  // yet new Color ("rgb") fails.
        }
        opt.value = css;
        opt.text  = txt;
        opt.dataset.spaceId = id;
        elm.add(opt);
                                      // refRange is for formatting counters
        refRange[id] = Object.values(space.coords).map(v => {
            rng = v.range ?? v.refRange ?? [0, 1];
            max = rng[1];
            if (!rng[0]) {
                if      (max == 1)   return format.positiveThree;
                else if (max < 10)   return format.three;
                else if (max < 1000) return format.one;
                else                 return format.zero;
            }
            else if (max < 1)        return format.negativeThree;
            else if (max < 10)       return format.two;
            else                     return format.zero;
        });
    }                       // clone leftSpaces to create rightSpaces:
    const sib    = elm.nextElementSibling;
    const clone  = elm.cloneNode(true);
    clone.id     = sib.id   // "rightSpaces"
    elms[sib.id] = clone;
    clone.style.marginLeft = sib.style.marginLeft;
    sib.replaceWith(clone); // dummy element keeps the grid from reflowing here

    g.clicks = document.getElementsByClassName(CLICK);
    if (hasVisited)//...<input>,  ...<button class="click">
        for (elm of [...byTag[0], ...g.clicks])
            elm.value = getLocal(elm);
    else {
        elm.selectedIndex = 0;
        clone.value = "jzczhz";
    }
    elm = elms.type;        // initialize elms.type <select>
    [EASY_, MEASER_].forEach((v, i) => elm.options[i].value = v);
    elm.value = hasVisited ? getLocal(elm) : EASY_;

    const elmsArray = Object.values(elms);
    for (id of ["left","right","start","end"]) {
        obj = {id};         // create and populate g.left/right/start/end
        for (elm of elmsArray.filter(e => e.id?.startsWith(id)))
            obj[getCase(elm).toLowerCase()] = elm;
        g[id] = obj;        // as properties of g for parsed-id access later
    }
    g.left .other = g.right;
    g.right.other = g.left;

    g.leftRight = [g.left,  g.right];
    g.startEnd  = [g.start, g.end];

    elm = elms.canvas;
    bodyMargin   = P.marginTop.getn(document.body);
    canvasMargin = P.marginTop.getn(elm);
    canvasBorder = P.borderWidth.getn(elm);
    controlsWidth  = elms.compare.offsetWidth
                   + elms.leftSpaces .offsetWidth + P.mL.getn(elms.leftSpaces)
                   + elms.rightSpaces.offsetWidth + P.mL.getn(elms.rightSpaces);
    controlsHeight = canvasMargin
                   + elms.x.parentNode.offsetHeight
                   + elms.playback    .offsetHeight;

    return loadEvents();
}
const format = {
    three(n) { return n.toFixed(3); },
    two  (n) { return n.toFixed(2); },
    one  (n) { return n.toFixed(1); },
    zero (n) { return n.toFixed(0); },
    negativeThree(n) {
        return n.toFixed(3).replace(/0(?=.)/, "");
    },
    positiveThree(n) {
        return n >= 0      ? format.three(n)
             : n > -0.0005 ? "0.000"                  // avoid "-0.000"
                           : format.negativeThree(n); // should never happen...
    }
}
//==============================================================================
// getEasies() populates the other, currently display:none, <select> and creates
//             some arrays as properties of elms.
function getEasies(hasVisited) {
    const arr = Array.from(document.getElementsByClassName("collapse"))
    elms.collapsible  = arr;                       // see click.collapse()
    collapsibleHeight = arr.reduce(                // marginTop + marginBottom
        (sum, elm) => sum + elm.offsetHeight + P.mT.getn(elm) + P.mB.getn(elm),
        0
    );
    let elm = isMulti ? elms.easys : elms.multis;  // the other <select>
    getNamed(elm, elms.type.options[Ez.flip(elms.type.selectedIndex)].value);
    if (hasVisited) {               // restore the previous form state
        setTime();                  // gotta call this prior to ezX = new Easy
        const evt = dummyEvent(CLICK, true);
        for (elm of g.clicks)       // loadIt() calls getLocal() for these
            elm.dispatchEvent(evt);

        for (elm of [elms.leftSpaces, elms.rightSpaces])
            elm.value = getLocal(elm);
    }
}
// initEasies() is called by loadFinally(), updateNamed
function initEasies(obj) {
    let lrse,                           // run the event handlers that populate
    evt = dummyEvent(CHANGE, true)      // g.left/right/start/end values.
    for (lrse of g.leftRight)           // lr must precede se
        lrse.spaces.dispatchEvent(evt); // call change.space() for both

    evt = dummyEvent(INPUT, true);
    for (lrse of g.startEnd)            // dispatchEvent() avoids exports
        lrse.input.dispatchEvent(evt);  // call input.color() for both

    elms.time.dispatchEvent(evt);       // run input.time()

    try {
        g.easies = new Easies(ezX);
        if (!isMulti) {
            ezColor = setEasy(new Easy(obj));
            g.easies.add(ezColor);
        }
        else {
            let i;
            for (i = 0; i < COUNT; i++) // get the three easys
                easys[i] = getNamedEasy(obj.easy[i]);

            const f = msecs / Math.max(...easys.map(ez => ez.firstTime));
            for (i = 0; i < COUNT; i++) // scale the time of each easy
                g.easies.add(setEasy(easys[i], f));
        }
    } catch (err) {
        errorAlert(err);
        return false;
    }
    raf.targets = g.easies;
    return true;
}
function setEasy(ez, f) {                 // f for factor
    ez.time  = f ? Math.round(ez.time * f) : msecs;
    ez.plays = 1;
    ez.roundTrip = elms.roundT.value;
    ez.autoTrip  = ez.roundTrip;          // excludes flipTrip
    return ez;
}
//==============================================================================
// updateAll() called by loadFinally(), openNamed()
function updateAll() {
    updateTime();
    refresh();
}
function getMsecs() { // same as easings getMsecs()
    return elms.time.valueAsNumber;
}
//==============================================================================
// resizeWindow() resizes the polygon: y-values and all stationary x-values
function resizeWindow(evt, topHeight = P.isDisplayed(elms.triptych)
                                     ? collapsibleHeight
                                     : 0)
{
    let border;
    const style  = elms.canvas.style;
    const isFull = window.innerWidth < 400

    toggleClass(elms.canvas, "fullWidth", isFull);
    border = isFull ? canvasBorder
                    : canvasBorder * 2;

    style.height = window.innerHeight
                 - bodyMargin
                 - topHeight
                 - controlsHeight
                 - canvasMargin
                 - border + U.px;
    if (evt)
        style.width = isFull ? window.innerWidth
                             : controlsWidth - border;
}