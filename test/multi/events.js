export {loadEvents, set};

import {E, P} from "../../raf.js";

import {timeFrames} from "../update.js";
import {storeCurrent, setLocal, getLocalByElm, getNamedEasy}
                    from "../local-storage.js";
import {COUNT, PLAYS, CHANGE, LITE, elms, addEventsByElm, toggleClass}
                    from "../common.js";

import {initEasies}     from "./_load.js";
import {easys, refresh} from "./_update.js";
import {idsPerEasy, defsPerEasy, objFromForm} from "./_named.js";

const
LO  = LITE[0],
EZ_ = "ez-",
L_G = "linear-gradient(to bottom right, ";
//==============================================================================
// loadEvents() adds event listeners to source and cloned elements, as they are
//              not cloned, called by getEasies().
function loadEvents() {
    let func, i, id;
    for (id of idsPerEasy) {  // event listeners are not cloned
        func = change[id];
        for (i = 0; i < COUNT; i++)
            elms[id][i].addEventListener(CHANGE, func, false);
    }
    const colors = [elms.color0, elms.color1];
    addEventsByElm(CHANGE, colors, change, true);
    getLocalByElm(colors);
    change.color();
}
//==============================================================================
const change = {
    easy(evt) {
        helpChange(evt);
        timeFrames();   	           // each Easy has its own duration
        if (initEasies(objFromForm()))
            refresh();
    },
    plays(evt) {
        helpChange(evt);
        storeCurrent(objFromForm());
    },
    trip() {
        storeCurrent(objFromForm());
    },
    eKey(evt) {
        helpChange(evt);
        objFromForm();
        refresh();     // calls storeCurrent()
    },
    color(evt) {
        const val = `${L_G}${elms.color0.value}, ${elms.color1.value})`;
        elms.clip.style.backgroundImage = val;
        if (evt)
            setLocal(evt.target, evt.target.value);
    }
};
function helpChange(evt) {
    const
    tar = evt.currentTarget,
    id  = tar.id.slice(0, -1),
    i   = Number(tar.id.at(-1));
    set[id](i, tar.value);
}
//==============================================================================
 // "set" helpers for the change event handlers, exported for formFromObj()
 // It would be nice to be able to get the current function's name instead of
 // using literals for the index into  defsPerEasy...
 const set = {
    easy(i, name = defsPerEasy[0]) {
        const ez = getNamedEasy(name, true); // returns undefined if it fails!!
        easys[i] = ez;
        toElm(EZ_, PLAYS, i).textContent = ez.plays;

        elms.trip[i].default = ez.autoTrip;  // only necessary if (ez.roundTrip)
        P.visible(elms.trip[i], ez.roundTrip);
        return name;
    },
    plays(i, val = defsPerEasy[1]) {  // val = "", "1", "2", or "3"
        toggleClass(toElm(EZ_, PLAYS, i), LO, Boolean(val))
        return val;
    },
    eKey(i, val = defsPerEasy[2]) {
        const
        selected = elms[val][i],                  // selected key's <span>
        parent   = selected.parentNode.parentNode,
        other    = elms[val == E.comp ? E.unit : E.comp][i];

        parent.removeChild(other.parentNode);     // reorder by moving
        parent.appendChild(other.parentNode);     // other to the bottom.
        [selected, other].forEach((span, j) => {  // j acts as a boolean
            toggleClass(span, LO, j);             // <span> has content
            toggleClass(span.parentNode, LO, j);  // <p>    is the label
        });
        return val;
    },
    trip() {} //!!no longer has anything to do, called exclusively by set.easy()
}
//====== local helpers =========================================================
function toElm(prefix, id, i) {
    return elms[prefix + id]?.[i];
}