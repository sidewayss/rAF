export {loadEvents, setEasy};

export const OVERRIDES = ["plays","eKey","trip"];

import {E, P} from "../../raf.js";

import {timeFrames}                 from "../update.js";
import {storeCurrent, getNamedEasy} from "../local-storage.js";
import {COUNT, PLAYS, CHANGE, LITE, elms, g, orUndefined} from "../common.js";

import {initEasies}     from "./_load.js";
import {easys, refresh} from "./_update.js";
import {objFromForm}    from "./_named.js";

import {EASY} from "../easings/steps.js";

const EZ_ = "ez-";
//==============================================================================
// loadEvents() adds event listeners to source and cloned elements, as they are
//              not cloned, called by getEasies().
function loadEvents() {
    let func, i, id;
    for (id of [EASY, ...OVERRIDES]) {  // event listeners are not cloned
        func = change[id];
        for (i = 0; i < COUNT; i++)
            elms[id][i].addEventListener(CHANGE, func, false);
    }
}
//==============================================================================
const change = {
    plays(evt) {                // <select>.value = "1"|"2"|"3"|DEFAULT_NAME
        const [tar, i, id] = change.pt(evt);
        set.plays(i, id, orUndefined(tar.value), tar);
    },
    eKey(evt) {
        const tar = evt.currentTarget; //!!or evt.target??
        set.eKey(...i_id(tar), tar.value); // <button>.value is a string
        objFromForm();
        refresh();
    },
    trip(evt) {
        change.pt(evt);
    },
    easy(evt) {
        const tar = evt.target;
        setEasy(Number(tar.id.at(-1)), tar.value);
        timeFrames();   	           // each Easy has its own duration
        if (initEasies(objFromForm()))
            refresh();
    },
 // pt() helps plays(), trip()
    pt(evt) {
        storeCurrent(objFromForm());
        const tar = evt.currentTarget; //!!or evt.target??
        return [tar, ...i_id(tar)];
    }
};
//==============================================================================
 // "set" helpers for the event handlers, setEasy() is the only one exported.
 const set = {
    plays(i, id, val = "", sel) {
        if (!sel) {                      // called by setEasy()
            sel = elms[id][i];
            sel.value = val;
        }
        const b = Boolean(val);          // val = "", "1", "2", or "3"
        swapTo  (sel, b);
        swapFrom(toElm(EZ_, id, i), b)
    },
    eKey(i, id, val = E.unit, sel) {
        if (!sel)                        // called by setEasy()
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
    trip() { //!!no longer has anything to do...
    }        //!!called exclusively by setEasy()...
}
// setEasy() is called by change.easy(), fromFromObj()
function setEasy(i, name, obj) {     // formFromObj() defines obj
    for (const id of OVERRIDES)      // call set.plays(), set.eKey(), set.trip()
        set[id](i, id, obj?.[id][i]);

    const ez = getNamedEasy(name, true); // returns undefined if it fails!!
    easys[i] = ez;
    toElm(EZ_, PLAYS, i).textContent = ez.plays;
    setCheck(toElm(EZ_, "trip",  i),
             ez.roundTrip ?  ez.autoTrip : null);
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
function setCheck(elm, val) {
    elm.setAttribute(Pn.href, val === null ? "#ind"   // indeterminate
                            : val === true ? "#chk"   // checked
                                           : "#box"); // unchecked
}
// i_id() splits a numbered id, e.g. "id0", into number and string
function i_id(elm) {
    const id = elm.id.split("-").at(-1);
    return [Number(id.at(-1)), id.slice(0, -1)];
}