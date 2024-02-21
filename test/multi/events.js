export {loadEvents, setEasy};

import {E, P} from "../../raf.js";

import {storeCurrent, getNamedEasy}   from "../local-storage.js";
import {COUNT, PLAYS, CHANGE, LITE,
        elms, g, orUndefined, toFunc} from "../common.js";

import {measer}           from "./_load.js";
import {redraw}           from "./_update.js";
import {OVERRIDES, easys} from "./index.js";

const EZ_ = "ez-";
//==============================================================================
// loadEvents() adds event listeners to source and cloned elements, as they are
//              not cloned, called by getEasies().
function loadEvents() {
    let func, i, id;
    for (id of ["easy", ...OVERRIDES]) {    // event listeners not cloned
        func = toFunc(CHANGE, id, handlers);
        for (i = 0; i < COUNT; i++)
            elms[id][i].addEventListener(CHANGE, func, false);
    }
}
const handlers = {     // change event handlers for easy, plays, eKey, and trip
    changePlays(evt) { // not to be confused with changePlay()
        const tar     = evt.target; // <select>.value = "1"|"2"|"3"|DEFAULT_NAME
        const [i, id] = i_id(tar);
        this.setPlays(i, id, orUndefined(tar.value), tar);
        multiNoWaits(i);
        storeCurrent();
    },
    changeEKey(evt) {
        const tar = evt.currentTarget; //!!or evt.target??
        this.setEKey(...i_id(tar), tar.value); // <button>.value is a string
        redraw();      // calls storeCurrent()
    },
    changeTrip(evt) {  // autoTrip
        const tar = evt.currentTarget; //!!or evt.target??
        const [i, _] = i_id(tar);
        this.setTrip(i, tar.checked); //!!2nd arg...
        multiNoWaits(i);
        storeCurrent();
    },
    changeEasy(evt) {
        const tar = evt.target;
        setEasy(Number(tar.id.at(-1)), tar.value);
        if (initEasies())
            redraw();
    },
 // "set" helpers for the event handlers, setEasy() is the only one exported.
 // Your editor will tell you that setPlays(), setEKey(), and setTrip() are only
 // referenced once, but they are also called near the beginning of setEasy()
 // via toFunc("set" + ...)().
    setPlays(i, id, val = null, sel = undefined) {
        measer?.mePlays(i, orUndefined(val));
        if (!sel) {             // not called by multiPlays()
            sel  = elms[id][i];
            sel.value = val;
        }
        const b = Boolean(val); // DEFAULT_NAME, "1", "2", or "3"
        swapTo  (sel, b);
        swapFrom(toElm(EZ_, id, i), b)
    },
    setEKey(i, id, val = E.unit, sel = undefined) {
        measer?.meEKey(i, val);
        if (!sel)                   // not called by changeEKey()
            elms[id][i].value = val;

        const elm = elms[val][i];
        const alt = elms[val == E.comp ? E.unit : E.comp][i];
        const par = elm.parentNode.parentNode;

        par.removeChild(alt.parentNode); // reorder them
        par.appendChild(alt.parentNode);
        [alt, elm].forEach((v, j) => {
            swapTo(v, j);                // <span>
            swapTo(v.parentNode, j);     // <p>
        })
    },
    setTrip(i, b) { // no third argument
        measer?.meTrip(i, b); //!!2nd argument!!
    }
};
// setEasy() is called by fromFromObj() with obj defined
function setEasy(i, name, obj) {
    for (var id of OVERRIDES)
        toFunc("set", id, handlers)(i, id, obj?.[id][i]);

    const ez = getNamedEasy(name);
    toElm(EZ_, PLAYS, i).textContent = ez.plays;
    P.visible(elms.trip[i].parentNode, ez.roundTrip);
    if (ez.roundTrip)
        setHref(toElm(EZ_, "trip",  i), ez.autoTrip);
    easys[i] = ez;
    multiNoWaits(i, ez);
}
//====== local helpers =========================================================
// swapClasses() is the same as classList.replace(), except it doesn't require
function swapClasses(elm, oldClass, newClass) { // oldClass to be in classList.
    elm.classList.remove(oldClass);
    elm.classList.add   (newClass);
}
function swapTo(elm, b) {
    const i = Number(b);
    swapClasses(elm, LITE[1 - i], LITE[i]);
}
function swapFrom(elm, b) {
    const i = Number(b);
    swapClasses(elm, LITE[i], LITE[1 - i]);
}
function toElm(prefix, id, i) {
    return elms[prefix + id]?.[i];
}
function setHref(elm, val, isInd) {
    elm.setAttribute(Pn.href, isInd ? "#ind"
                              : val ? "#chk"
                                    : "#box");
}
function multiNoWaits(i, ez = easys[i]) {
    const trip = elms.trip[i].value;
    g.notLoopWait[i] = !ez.loopWait && (Number(elms.plays[i].value) || ez.plays) > 1;
    g.notTripWait[i] = ez.roundTrip && !ez.tripWait && (trip || (!trip && ez.autoTrip));
}
// i_id() splits a numbered id, e.g. "id0", into number and string
function i_id(elm) {
    const id = elm.id.split("-").at(-1);
    return [Number(id.at(-1)), id.slice(0, -1)];
}