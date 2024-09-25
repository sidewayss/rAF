export {loadIt, getEasies, initEasies, updateAll, easeFinally, resizeWindow,
        isCSSSpace, Color};

export let ezColor;
export const
easys     = Array(COUNT),
refRange  = {},
START_END = ["start","end"];

import Color from "https://colorjs.io/dist/color.js";
//import Color from "./dist/color.js";

import {C, U, E, Fn, F, P, Is, Ez, Easy} from "../../src/raf.js";
import {CFunc} from "../../src/prop/func.js"; //!!need better way to access CFunc.A!!

import {LINEAR} from "../named.js";
import {msecs, pad, newEasies, updateTime, updateCounters}  from "../update.js";
import {getLocalByElm, getNamed, getNamedObj, getNamedEasy} from "../local-storage.js";
import {MILLI, COUNT, CHANGE, CLICK, INPUT, EASY_, MEASER_, elms, g,
        pairOfOthers, orUndefined, dummyEvent, errorAlert}  from "../common.js";

import {EASY, TIMING} from "../easings/steps.js";

import {refresh}                                  from "./_update.js";
import {isMulti, loadEvents, timeFactor, getCase} from "./events.js";

let collapsed, controlsWidth, expanded, padding;
const postIts = [];
//==============================================================================
// loadIt() is called by loadCommon(), sRGB255 is a custom color space for the
//          original rgb() range of 0-255.
function loadIt(_, hasVisited) {
    let bw, css, elm, id, max, min, obj, opt, rng, space, txt;
    const
    ColorSpace = Color.Space,           // the ColorSpace class
    registry   = Color.spaces,          // all the registered color spaces
    sRGBLinear = registry[Fn.srgbLinear],
    sRGB       = registry[Fn.srgb],
    sRGB255    = new ColorSpace({       // new custom space
        id:    "rgb255",
        name:  "sRGB (0-255)",
        base:   sRGBLinear,
        cssId:  Fn.rgb,
        coords: {},
        fromBase: rgb => sRGB.fromBase(rgb).map(n => n * 255 ),
        toBase:   rgb => sRGB.toBase(  rgb .map(n => n / 255)),
        formats: {
            rgb255: {
                type: "custom",
                coords:Array(3).fill("<number>[0, 255]"),
                parse: () => false,
                serialize: (coords, alpha) => {
                    coords = coords.map(n => n.toFixed(0)).join(E.sp);
                    if (Is.def(alpha))
                        coords += ` / ${alpha}`;

                    return `${Fn.rgb}(${coords})`;
                }
            }
        }
    }),
    coords = sRGB255.coords,
    range  = {range:[0, 255]};

    [...Fn.rgb].forEach(char => coords[char] = range);
    ColorSpace.register(sRGB255);       // now it's in registry, which we sort
                                        // alphabetically for the <select>s:
    const sorted = Object.entries(registry)
                         .filter(([key, sp]) => key == sp.id)   // no aliases
                         .map(([_, sp]) => sp)                  // spaces only
                         .sort((a, b) => a.id < b.id ? -1 : 1); // alpha sort
    elm = elms.leftSpaces;
    for (space of sorted) {             // populate leftSpaces <select>
        id  = space.id;
        txt = id;
        css = space.cssId;
        opt = new Option();
        if (isCSSSpace(css)) {
            opt.style.color = "black";  // Color.js spaces: var(--charcoal)
            txt = css;
        }
        opt.value = css;
        opt.text  = txt;
        opt.dataset.spaceId = id;
        elm.add(opt);
                                        // refRange is for formatting counters
        refRange[css] = Object.values(space.coords).map(v => {
            rng = v.range ?? v.refRange ?? [0, 1];
            [min, max] = rng;
            obj = {min, max};
            if (min)
                obj.func = (max < 1)    ? format.negativeThree
                         : (max < 10)   ? format.two
                                        : format.zero;
            else // min == 0
                obj.func = (max == 1)   ? format.positiveThree
                         : (max < 10)   ? format.three
                         : (max < 1000) ? format.one
                                        : format.zero;
            return obj;
        });
    }
    plugRange("--acescg",      format.positiveThree);
    plugRange("--xyz-abs-d65", format.one);

    const                   // clone leftSpaces to create rightSpaces
    sib   = elm.nextElementSibling,
    clone = elm.cloneNode(true),
    idx   = g.disables.indexOf(sib);
    clone.id = sib.id       // dummy element contains id and keeps the grid
    elms[sib.id] = clone;   // from reflowing via replaceWith().
    clone.style.marginLeft = sib.style.marginLeft;
    g.disables.splice(idx, 1, clone);
    sib.replaceWith(clone);
                            // initialize elms:
    [EASY_, MEASER_].forEach((v, i) => elms.type.options[i].value = v);

    const byClass = (v) => Array.from(document.getElementsByClassName(v));
    elms.collapsible = byClass("collapse");
    g.boolBtns       = byClass("boolBtn");
    if (hasVisited)
        getLocalByElm([elm, clone, ...g.boolBtns, elms.type, elms.startText,
                                                  elms.time, elms.endText]);
    else {
        elm.selectedIndex = 0;
        clone.value       = "jzczhz";
        elms.type.value   = EASY_;
    }                        // create and populate g.lbl/left/right/start/end...
    const elmsArray = Object.values(elms);
    for (id of ["lbl","left","right", ...START_END]) {
        obj = {id};
        for (elm of elmsArray.filter(e => e.id?.startsWith(id)))
            obj[getCase(elm).toLowerCase()] = elm;
        g[id] = obj;        // ...as properties of g for parsed-id access later
    }
    pairOfOthers(g.left, g.right);  //!!is g.left|right.other referenced anywhere??
    g.leftRight = [g.left,  g.right];
    g.startEnd  = [g.start, g.end];
    for (id of START_END) {
        css = g[id].color.style;                // <input type="color">:absolute
        elm = g[id].canvas;                     // <div>
        bw  = P.borderWidth.getn(elm);          // border-width offset
        obj = elm.getBoundingClientRect();      // move color to cover canvas
        css.width  = obj.width  + U.px;         // canvas always visible
        css.height = obj.height + U.px;         // color has opacity:0
        css.left   = obj.left + bw + U.px;      // except on :hover and :active
        css.top    = obj.top  + bw + bw + U.px; // bw x 2 for margin-top:-1px??
    }
    pad.frame = 4;
    return loadEvents();
}
// format = display formats by color space coordinate range (assigned above)
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
// isCSSSpace() separates CSS-supported spaces from Color.js
function isCSSSpace(val) { return val in F; }

// plugRange() is for non-conforming color spaces, special cases
function plugRange(id, func) {
    refRange[id].forEach((_, i, arr) => arr[i].func = func);
}
//==============================================================================
// getEasies() is called exclusively by loadJSON()
function getEasies(hasVisited) {
    let defText, sel;
    if (isMulti) {
        sel = elms.easys;
        defText = LINEAR;
    }
    else {
        sel = elms.multis;
        elms.easys[0].text = LINEAR;          // correct it to LINEAR
    }
    const
    div = elms.controls,
    pre = elms.type.options[Ez.comp(elms.type.selectedIndex)].value;
    getNamed(sel, pre, defText);              // populate the "other" <select>

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

//!!if (hasVisited)                           // call input.time()
    elms.time.dispatchEvent(new Event(INPUT));
}
//==============================================================================
// initEasies() is called by loadFinally(), updateNamed
function initEasies(obj, hasVisited) {  // event handlers populate the form and
    const LOADING = "isLoading";        // set g.left/right/start/end.
    let lrse, evt = dummyEvent(CHANGE, LOADING)

    for (lrse of g.leftRight)           // lr must precede se
        lrse.spaces.dispatchEvent(evt); // call change.space() for both

    evt = dummyEvent(INPUT, LOADING);
    for (lrse of g.startEnd)            // dispatchEvent() avoids im/exports
        lrse.text.dispatchEvent(evt);   // call input.color() for both

    const b = newEasies();              // instantiate a new, empty g.easies
    if (b) {                            // ezX added/deleted in newTargets()
        if (isMulti) {
            const json = obj.easy.map(name => getNamedObj(name, EASY_));
            const f    = timeFactor(json);
            for (const o of json)       // scale each easy.time by f
                g.easies.add(newEasy(o, f));
        }
        else {
            ezColor = newEasy(obj);     // just set ezColor.time = msecs;
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
// newEasy(obj) creates a new Easy(obj), resetting start and end to default.
// localStorage and presets have {start:0, end:1000} or vice-versa.
// Better for front-end and copyCode() to go with the default: {start:0, end:1}
// Two-legged objects require start, end, time to be scaled.
function newEasy(obj, f) {
    let key;
    const isDown = (obj.end != MILLI);

    // More than start and end need reset, but flipTrip, tripWait remain intact
    for (key of [...START_END,"plays","loopWait","roundTrip","autoTrip"])
        delete obj[key];

    // Scale obj.mid and leg.end|start to 0-1 range
    scaleOne(obj, "mid", isDown);
    if (obj.legs)
        for (const leg of obj.legs) {
            leg.time = scaleTime(leg, f);
            for (key of START_END)
                scaleOne(leg, key, isDown);
        }
    // Scale time to match elms.time and set roundTrip
    obj.time      = f ? Math.round(obj.time * f) : msecs;
    obj.roundTrip = orUndefined(elms.roundT.value);

    // Get timing/easy Easys for steps
    if (obj.type == E.steps)
        for (key of [EASY, TIMING])
            if (Is.String(obj[key]))
                obj[key] = getNamedEasy(obj[key]);

    try         { return new Easy(obj); }
    catch (err) { errorAlert(err);    }
}
function scaleTime(obj, f) {
    return f ? Math.round(obj.time * f) : msecs;
}
function scaleOne(obj, key, isDown) {     // helps newEasy()
    if (Is.def(obj[key])) {
        obj[key] /= MILLI;
        if (isDown)                       // convert 1-0 to 0-1
            obj[key] = Ez.comp(obj[key]);
    }
}
//==============================================================================
// updateAll() called by loadFinally(), openNamed()
function updateAll() { // identical to multi updateAll()
    updateTime();
    refresh();
    updateCounters();
}
//==============================================================================
//!!E.cV overlap (in)efficiency?? Maybe not "fix" it, but at least document it.
//!!units based on current value?? Good idea. Somewhat "unstructured"-like.
function easeFinally(af, ezs, ez, wait, is) {
    let end, ez2, ez3, mask, start, time,
    elm  = elms.controls,
    prop = P.filter;

    af.initZero = true;
    ez.newTarget({prop:P.o, elm});          // #controls opacity 0-1

    start = E.currentValue;                 // body filter
    time  = 400;
    ez    = new Easy({wait, time});
    ez.newTarget({start, end:1, prop, elm:document.body, set:E.net});
    ezs.add(ez);

    wait += 200;                           // everything return to original
    time  = 800;
    ez    = new Easy({wait, time, type:E.sine, io:E.out});

    wait += 400;
    time  = 1050
    ez2   = new Easy({wait, time, type:E.pow, pow:2.5});

    time += 100
    ez3   = new Easy({wait, time});
    ezs.add(ez);                            // contrast
    ezs.add(ez2);                           // saturation, blur
    ezs.add(ez3);                           // drop-shadow blur
    ezs.newTarget({end:[1, 0, 1, 0], start, prop, elm,
                  mask:[0, 1, 2, 8], easies:[ez2, ez2, ez, ez3], set:E.net});
    // drop-shadow blur moves from 5 to 8 via getComputedStyle(rgb(), ...)

    let   cjs   = g.left.color;             // cjs can be reset to undefined
    const space = cjs.space;
    start = Color.to(elms.startText.value, space).coords.slice();
    end   = E.cV;
//!!if (elms.leftSpaces.value == Fn.rgb)    // raison de slice():
//!!    start.forEach((_, i) => start[i] *= 255);

    time -= 50;
    elm = [elms.time, elms.x];              // test numeric strings with start:
    ez  = new Easy({wait, time, type:E.sine, io:E.inOut});
    ez.newTarget({start:elm.map(e => e.max), end, prop:P.value, elm});
    ezs.add(ez);
                                            // test animating CSSStyleRules
    const rules = Array.from(document.styleSheets[1].cssRules).slice(0, 5);
    wait += 400;
    time -=  40;
    ez = new Easy({wait, time, type:E.expo});
    ez.newTarget({cjs, start, end, prop:P.color,   elms:rules.splice(0, 3)});
    ez.newTarget({cjs, start, end, prop:P.fill,    elms:rules});
    ez.newTarget({cjs, start, end, prop:P.stroke,  elms:rules});

    time -= 150;
    ez2 = new Easy({wait, time, type:E.sine, io:E.out});
    ez2.newTarget({cjs, start, end, prop:P.bgColor, elms:endCanvas});

    prop = P.accentColor;                   // #time, #x again
    end  = Color.to(prop.getOne(elm[0]), space).coords;
    ez.newTarget({cjs, start, end, prop, elm});
    postIts.push(...elm.map(lm => [prop, lm]));

    prop = P.borderColor;                   // alpha = borderOpacity
    mask = C.alpha;                         // mask as bitmask integer
    elm  = Array.from(document.getElementsByClassName("border-gray"));
    end  = prop.getn(elm[0])[CFunc.A];      // --border-gray: #0002;
    elm.push(elms.named);
    ez.newTarget({end, prop, elm, mask});   // start:0
    postIts.push(...elm.map(lm => [prop, lm]));

    elm = [elms.controls, elms.startCanvas, elms.endCanvas];
    ez.newTarget({prop, elm, mask});        // start:0, end:1
    postIts.push(...elm.map(lm => [prop, lm]));

    ezs.add(ez);
    ezs.add(ez2);
    ezs.post = postFinally;
    return elms.canvas;
}
function postFinally() {
    for (const [prop, elm] of postIts)
        prop.cut(elm);
    postIts.length = 0;
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