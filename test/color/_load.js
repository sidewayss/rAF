export {loadIt, getEasies, initEasies, updateAll, easeFinally, resizeWindow};
export let ezColor;
export const
    easys    = new Array(COUNT),
    refRange = {}
;

import {spaces} from "https://colorjs.io/src/spaces/index.js";

import {C, U, E, Fn, F, P, Ez, Easy} from "../../raf.js";
import {CFunc} from "../../prop/func.js"; //!!need better way to access CFunc.A!!

import {msecs, pad, newEasies, updateTime, updateCounters} from "../update.js";
import {getLocal, getNamed, getNamedEasy} from "../local-storage.js";
import {COUNT, CHANGE, CLICK, INPUT, EASY_, MEASER_, elms, g, pairOfOthers,
        dummyEvent} from "../common.js";

import {refresh} from "./_update.js";
import {isMulti, loadEvents, timeFactor, getCase} from "./events.js";

let collapsed, controlsWidth, expanded, padding;
const LOADING = "isLoading";
//==============================================================================
// loadIt() is called by loadCommon()
function loadIt(byTag, hasVisited, params) {
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
            txt = css;                  // yet new Color("rgb") fails.
        }
        opt.value = css;
        opt.text  = txt;
        opt.dataset.spaceId = id;
        elm.add(opt);
                                        // refRange is for formatting counters
        refRange[css] = Object.values(space.coords).map(v => {
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
    }
    refRange[Fn.rgb] = new Array(COUNT).fill(format.zero);

    const                   // clone leftSpaces to create rightSpaces
    sib   = elm.nextElementSibling,
    clone = elm.cloneNode(true);
    clone.id = sib.id       // dummy element contains id and keeps the grid
    elms[sib.id] = clone;   // from reflowing via replaceWith().
    clone.style.marginLeft = sib.style.marginLeft;
    sib.replaceWith(clone);
                            // initialize elms.type
    [EASY_, MEASER_].forEach((v, i) => elms.type.options[i].value = v);

                            // (re)set control values, except elms.named
    const byClass    = (v) => Array.from(document.getElementsByClassName(v));
    elms.collapsible = byClass("collapse");
    g.boolBtns       = byClass("boolBtn");

    g.searchElms = [elms.type, elm, clone, ...byTag[0]];
    const search = new Map(g.searchElms.map(se => [se.id, se]));
    if (params) {
        for ([id, txt] of params) {
            if (search.has(id)) {
                elms[id].value = txt;
                search.delete(id);
            }
            else
                console.info(`Invalid URLSearchParam: ${id}=${txt}`);
        }
    }
    if (search.size) {
        if (hasVisited)
            for (elm of [...g.boolBtns, ...search.values()])
                elm.value = getLocal(elm);
        else {
            if (search.has(elm.id))
                elm.selectedIndex = 0;
            if (search.has(clone.id))
                clone.value = "jzczhz";
            if (search.has(elms.type.id))
                elms.type.value = EASY_;
        }
    }
                            // create and populate g.left/right/start/end...
    const elmsArray = Object.values(elms);
    for (id of ["left","right","start","end"]) {
        obj = {id};
        for (elm of elmsArray.filter(e => e.id?.startsWith(id)))
            obj[getCase(elm).toLowerCase()] = elm;
        g[id] = obj;        // ...as properties of g for parsed-id access later
    }
    pairOfOthers(g.left, g.right);  //!!is g.left|right.other referenced anywhere??
    g.leftRight = [g.left,  g.right];
    g.startEnd  = [g.start, g.end];

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
            for (const elm of g.boolBtns)
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
//!!E.cV overlap (in)efficiency?? Maybe not, but at last document it.
//!!units based on current value?? Good idea. Somewhat "unstructured"-like.
function easeFinally(af, ezs, wait, is) {
    let blacks, cjs, end, ez, grays, mask, prop, timex;
    const
    ctrls = elms.controls,
    rules = Array.from(document.styleSheets[1].cssRules).slice(0, 5),
    start = g.start.color.coords;
    wait += 400;
                                                    // colors post fade-in:
    ez  = new Easy({wait, time:1500, type:E.sineOut}),
    end = E.currentValue;
    switch (elms.leftSpaces.value) {
        case Fn.rgb:
            start.forEach((_, i) => start[i] *= 255);
        case Fn.hsl: case Fn.hwb:
            break;
        default:
            cjs = g.left.color // for conversions, not just animation
    }
    ez.newTarget({cjs, start, end, prop:P.color,  elms:rules.splice(0, 3)});
    ez.newTarget({cjs, start, end, prop:P.fill,   elms:rules});
    ez.newTarget({cjs, start, end, prop:P.stroke, elms:rules});
    prop  = P.bgColor;
    ez.newTarget({cjs, start,     end, prop, elms:endCanvas});
    ez.newTarget({cjs, start:255, end, prop, elms:ctrls});

    timex = [elms.time, elms.x];
    ez.newTarget({cjs, start:timex.map(elm => elm.max), end, prop:P.value, elms:timex});
    prop = P.accentColor;
    end  = prop.getn(timex[0]);
    ez.newTarget({cjs, start, end, prop, elms:timex});

    blacks = [ctrls, elms.startCanvas, elms.endCanvas];
    grays  = Array.from(document.getElementsByClassName("border-gray"));
    grays.push(is.multi ? elms.multis : elms.easys);

    prop = P.borderColor;                           // alpha = borderOpacity
    end  = prop.getn(grays[0])[CFunc.A];            // --border-gray: #0002;
    mask = C.alpha;                                 // mask as bitmask integer
    ez.newTarget({end, prop, mask, elms:grays });   // start:0
    ez.newTarget({     prop, mask, elms:blacks});   // start:0, end:1
    ezs.add(ez);
                                                    // ctrls opacity:
    ez = new Easy({time:wait, type:E.expo, io:E.in});
    ez.newTarget({prop:P.o, elm:ctrls});
    ezs.add(ez);
                                                    // ctrls blur:
//    ez = new Easy({time:2500, type:E.sineOut}),
//    obj = {elms:ctrls, prop:P.filter, func:F.blur, start:0.0625, mid:0.5, end:0, units:E.rem};
//    ez.newTarget({elm:tar, prop:P.filter, func:F.blur, start:0.0625, end:0.5, units:E.rem});
//    ezs.add(ez);

    af.preInit = true;
    return elms.canvas;
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