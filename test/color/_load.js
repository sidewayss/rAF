// export everything but changeColor, all functions
export {easys, ezColor, canvasMargin, collapsibleHeight, controlsHeight,
        windowHeight, windowWidth, loadIt, getEasies, initEasies, updateAll,
        getMsecs, resizeWindow};
const easys = new Array(COUNT);
let ezColor, canvasMargin, collapsibleHeight, controlsHeight, windowHeight,
    windowWidth;

import {spaces} from "https://colorjs.io/src/spaces/index.js";

import {Fn, F, P, U, Ez, Easy, Easies} from "../../raf.js";
import {ColorFunc}                     from "../../prop/func.js";

import {ezX, raf, msecs, setTime} from "../load.js";
import {pad}                      from "../update.js";
import {getLocal, getNamed, getNamedEasy} from "../local-storage.js";
import {COUNT, CHANGE, INPUT, EASY_, MEASER_, elms, g, errorAlert, boolToString}
                                  from "../common.js";

import {refresh}                       from "./_update.js";
import {isMulti, loadEvents}           from "./events.js";
import {refRange, newTargets, getCase} from "./index.js";
//==============================================================================
// loadIt() is called by loadCommon()
function loadIt(byTag, hasVisited) {
    let elm, id, max, obj, opt, prop, rng, space;
    pad.frame = 4;         // prevents freezing of pad in loadUpdate() :(

    elm = elms.leftSpaces; // populate leftSpaces <select>
    for (space of Object.values(spaces)) {
        id  = space.id;
        opt = new Option();
        opt.value = space.cssId;
        opt.dataset.spaceId = id;
        if (!(id in F))    // no Func instance for this space
            opt.dataset.isCjs = boolToString(true);
        else {
            opt.style.color = "black"; // Color.js spaces: var(--charcoal)
            if (id == "srgb")
                id = Fn.rgb;           // even Color.js display() uses rgb()
            if (!ColorFunc.spaces.includes(opt.value))
                id += "()";
        }
        opt.text = id;
        elm.add(opt);
                                      // refRange is for formatting counters
        refRange[id] = Object.values(space.coords).map(v => {
            rng = v.refRange ?? [0, 1];
            max = rng[1];
            if (!rng[0]) {
                if      (max < 10)   return format.three;
                else if (max < 1000) return format.one;
                else                 return format.zero;
            }
            else if (max < 1)        return format.negativeZero;
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

    elms.spaces = [elm, clone];
                           // restore previous form values:
    if (hasVisited) {      // <input>              <button>
        for (elm of elms.spaces)
            elm.value = getLocal(elm);
        for ([elm, prop] of [[byTag[0], "value"], [byTag[2], "textContent"]])
            elm[prop] = getLocal(elm);
        setTime();         // elms.time restored in previous line
    }
    else {
        elm  .selectedIndex = 0;
        clone.selectedIndex = 1;
    }
    elm = elms.type;       // initialize elms.type <select>
    [EASY_, MEASER_].forEach((v, i) => elm.options[i].value = v);
    elm.value = hasVisited ? getLocal(elm) : EASY_;

    const elmsArray = Object.values(elms);
    for (id of ["left","right","start","end"]) {
        obj = {id};        // create and populate g.left/right/start/end
        for (elm of elmsArray.filter(e => e.id?.startsWith(id)))
            obj[getCase(elm).toLowerCase()] = elm;
        g[id] = obj;       // as properties of g for parsed-id access later
    }
                           // stash a few things for later:
    elms.display = [elms.leftDisplay, elms.rightDisplay,
                    elms.leftDisplay.previousElementSibling];

    elms.collapsible  = Array.from(document.getElementsByClassName("collapse"));
    collapsibleHeight = elms.collapsible.reduce(
                            (sum, elm) => sum + elm.offsetHeight, 0);

    controlsHeight = elms.x.parentNode.offsetHeight
                   + elms.playback    .offsetHeight
                   + parseInt(elms.canvas.style.marginTop);

    return loadEvents();
}
//==============================================================================
// getEasies() populates the other, currently display:none, <select>
function getEasies() {
    const pre = elms.type.options[Ez.flip(elms.type.selectedIndex)].value;
    getNamed(isMulti ? elms.easys : elms.multis, pre);
}
const format = { // if not for negativeZero() could be Numbers, not Functions
    three(n) { return n.toFixed(3); },
    two  (n) { return n.toFixed(2); },
    one  (n) { return n.toFixed(1); },
    zero (n) { return n.toFixed(0); },
    negativeZero(n) { return n.toFixed(3).replace(/0(?=.)/, ""); }
}
// initEasies() is called by loadFinally()
function initEasies(obj) {
    let lrse,                           // run the event handlers that populate
    evt = new Event(CHANGE);            // g.left/right/start/end values.
    evt.isLoading = true;
    for (lrse of [g.left, g.right])     // lr must precede se
        lrse.spaces.dispatchEvent(evt); // calls changeSpace()

    evt = new Event(INPUT);
    evt.isLoading = true;
    for (lrse of [g.start, g.end])      // dispatchEvent() avoids exports
        lrse.input.dispatchEvent(evt);  // calls inputColor()

    try {
        g.easies = new Easies(ezX);
        if (!isMulti) {
            ezColor = setEasy(new Easy(obj));
            g.easies.add(ezColor);
            newTargets(ezColor);
        }
        else {
            let i;
            for (i = 0; i < COUNT; i++) // get the three easys
                easys[i] = getNamedEasy(obj.easy[i]);

            const f = msecs / Math.max(...easys.map(ez => ez.firstTime));
            for (i = 0; i < COUNT; i++) // scale the time of each easy
                g.easies.add(setEasy(easys[i], f));

            newTargets(g.easies);
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
    ez.roundTrip = elms.roundTrip.value;
    ez.autoTrip  = ez.roundTrip;          // excludes flipTrip
    return ez;
}
//==============================================================================
// updateAll() called by loadFinally(), openNamed()
function updateAll(isLoading) {
    refresh();
}
function getMsecs() { // same as easings getMsecs()
    return elms.time.valueAsNumber;
}
//==============================================================================
// resizeWindow() resizes the polygon: y-values and all stationary x-values
function resizeWindow(_, lapseHeight = P.isDisplayed(elms.triptych)
                                     ? collapsibleHeight
                                     : 0) {
    windowHeight = window.innerHeight;
    windowWidth  = window.innerWidth;
    elms.canvas.style.height = Math.max(673, windowHeight)
                             - controlsHeight - lapseHeight + U.px;
}