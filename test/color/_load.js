// export everything but changeColor, all functions
export {loadIt, getEasies, initEasies, updateAll, resizeWindow};
export const
    easys    = new Array(COUNT),
    refRange = {}
;
export let ezColor;

import {spaces} from "https://colorjs.io/src/spaces/index.js";

import {U, Fn, F, P, Ez, Easy} from "../../raf.js";

import {msecs, pad, newEasies, updateTime, updateCounters} from "../update.js";
import {getLocal, getNamed, getNamedEasy} from "../local-storage.js";
import {COUNT, CHANGE, CLICK, INPUT, EASY_, MEASER_, elms, g, dummyEvent}
                                          from "../common.js";

import {refresh} from "./_update.js";
import {isMulti, loadEvents, timeFactor, getCase} from "./events.js";

let collapsed, controlsWidth, expanded, padding;
const LOADING = "isLoading";
//==============================================================================
// loadIt() is called by loadCommon()
function loadIt(byTag, hasVisited) {
    let css, elm, id, max, obj, opt, rng, space, txt;
    pad.frame = 4;         // prevents freezing of pad in loadUpdate() :(

    elm = elms.leftSpaces; // populate leftSpaces <select>:
    const sorted = Object.values(spaces).sort((a, b) => a.id < b.id ? -1 : 1);
    for (space of sorted) {
        id  = space.id;
        txt = id;
        css = space.cssId;
        opt = new Option();
        if (!(css in F))                // no Func for this space = Color.js
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
            else {
                if      (max < 1)    return format.negativeThree;
                else if (max < 10)   return format.two;
                else                 return format.zero;
            }
        });
    }                       // clone leftSpaces to create rightSpaces
    const sib    = elm.nextElementSibling;
    const clone  = elm.cloneNode(true);
    clone.id     = sib.id   // dummy element contains id and keeps the grid
    elms[sib.id] = clone;   // from reflowing via replaceWith().
    clone.style.marginLeft = sib.style.marginLeft;
    sib.replaceWith(clone);

    const byClass    = (v) => Array.from(document.getElementsByClassName(v));
    g.clicks         = byClass(CLICK);
    elms.collapsible = byClass("collapse");

    if (hasVisited)         // , ...<input> , ...<button class="click">
        for (elm of [elm, clone, ...byTag[0], ...g.clicks])
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

    g.leftRight   = [g.left,  g.right];
    g.startEnd    = [g.start, g.end];

    return loadEvents();
}
const format = {
    zero (n) { return n.toFixed(0); },
    one  (n) { return n.toFixed(1); },
    two  (n) { return n.toFixed(2); },
    three(n) { return n.toFixed(3); },
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
// getEasies() is called exclusively by loadJSON()
function getEasies(hasVisited) {
    getNamed(                                 // populate the "other" <select>
        isMulti ? elms.easys : elms.multis,
        elms.type.options[Ez.flip(elms.type.selectedIndex)].value
    );

    const div = elms.controls;
    padding   = P.paddingTop.getn(div);       // 0.5rem, same for all four sides
    expanded  = elms.collapsible.reduce(      // expanded height
        (sum, elm) => sum + elm.offsetHeight + P.mT.getn(elm) + P.mB.getn(elm),
        0                                     // marginTop        marginBottom
    );
    collapsed = padding                       // collapsed height
              + padding
              + elms.x.parentNode.offsetHeight
              + elms.playback    .offsetHeight;

    controlsWidth   = Math.round(P.width.getn(div));
    div.style.width = controlsWidth + U.px;   // hard set for collapse()

    if (hasVisited)                           // call input.time()
        elms.time.dispatchEvent(new Event(INPUT));
}
//==============================================================================
// initEasies() is called by loadFinally(), updateNamed
function initEasies(obj, hasVisited) {
    let lrse,                           // run the event handlers that populate
    evt = dummyEvent(CHANGE, LOADING)   // g.left/right/start/end values:
    for (lrse of g.leftRight)           // lr must precede se
        lrse.spaces.dispatchEvent(evt); // call change.space() for both

    evt = dummyEvent(INPUT, LOADING);
    for (lrse of g.startEnd)            // dispatchEvent() avoids exports
        lrse.input.dispatchEvent(evt);  // call input.color() for both

    const b = newEasies();
    if (b) {                            // ezX added/deleted in newTargets()
        if (isMulti) {
            let i;
            const easys = new Array(COUNT);

            for (i = 0; i < COUNT; i++) // get the three easys
                easys[i] = getNamedEasy(obj.easy[i]);

            const f = timeFactor(easys);
            for (i = 0; i < COUNT; i++) // scale the time of each easy
                g.easies.add(setEasy(easys[i], f));
        }
        else {
            ezColor = setEasy(new Easy(obj));
            g.easies.add(ezColor);
        }

        if (hasVisited) {               // only when called by loadFinally()
            const evt = dummyEvent(CLICK, LOADING);
            for (const elm of g.clicks)
                elm.dispatchEvent(evt); // loadIt()=>getLocal() previously
        }
    }
    return b;
}
// setEasyTime() helps setEasy() and change.time()
function setEasyTime(ez, f) {        // f for factor
    ez.time = f ? Math.round(ez.time * f) : msecs;
}
// setEasy() helps initEasies()
function setEasy(ez, f) {            // f for factor
    setEasyTime(ez, f);
    ez.plays = 1;
    ez.roundTrip = elms.roundT.value;
    return ez;
}
//==============================================================================
// updateAll() called by loadFinally(), openNamed()
function updateAll() { // identical to multi updateAll()
    updateTime();
    refresh();
    updateCounters();
}
//==============================================================================
// resizeWindow() additionally called by click.collapse()
function resizeWindow(_, isCollapsed) {
    let prop;
    const
        div    = elms.controls,
        canvas = elms.canvas.style,
        BORDER = "1px solid black"
    ;
    if (window.innerWidth > controlsWidth + padding + padding + 2) {
        canvas.top = "";
        div.style.border = BORDER;
        for (prop of [P.pL, P.pR])  // padding-left, right
            prop.set(div, padding);

    }
    else {
        let top     = collapsed;
        isCollapsed = isCollapsed ?? elms.collapse.value;
        if (!isCollapsed)
            top += expanded;
        canvas.top = top + U.px;
        canvas.height = window.innerHeight - top - 1 + U.px;
        canvas.borderTop = BORDER;              // 1 for border width
        for (prop of [P.pL, P.pR, P.border])
            prop.set(div, "");
    }
}