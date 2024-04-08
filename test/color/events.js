export {isMulti, loadEvents, getCase};
let isMulti;

import Color from "https://colorjs.io/dist/color.js";

import {E, P} from "../../raf.js";

import {setPrefix}                      from "../named.js";
import {setLocal, setLocalBool}         from "../local-storage.js";
import {CHANGE, CLICK, INPUT, MEASER_, elms, g, is, toggleClass, boolToString,
        addEventToElms, addEventsByElm} from "../common.js";

import {collapsibleHeight, refRange, resizeWindow} from "./_load.js";
import {refresh, oneCounter}                       from "./_update.js";

const symBtn = { // textContent: boolean as number is index into each array
    compare:  ["switch_left", "switch_right"    ],
    roundTrip:["repeat",      "repeat_on"       ],
    collapse: ["expand_less", "expand_more"     ],
    fullbody: ["fullscreen",  "close_fullscreen"]
};
//==============================================================================
// loadEvents() is called exclusively by loadIt(), helps keep stuff private
function loadEvents() {
    change.type(); // sets isMulti
    addEventToElms(INPUT,  [elms.startInput, elms.endInput], input.color);
    addEventToElms(CHANGE, elms.spaces, change.space);
    addEventsByElm(CHANGE, [elms.time, elms.type], change, false, true);
    addEventsByElm(CLICK,  document.getElementsByClassName(CLICK), click, false, true);
    return is({multi:isMulti});
}
//==============================================================================
const input = {
 // color() handles input events for #startInput, #endInput, validates that text
 //         is a CSS color, updates start | end for both left & right.
    color(evt) {
        const tar = evt.target;
        const se  = g[getCamel(tar)];  // g.start or g.end

        try { se.color = new Color(tar.value); }
        catch {
            input.invalid(tar, true);
            return;     // only saves valid values to localStorage
        }
        //------------------------
        input.invalid(tar, false);
        se.canvas.style.backgroundColor = se.color.display();
        for (const lr of [g.left, g.right])
            updateOne(se, lr);
        setLocal(tar, tar.value);
        if (!evt.isLoading)
            refresh();
    },
 // invalid() helps color()
    invalid(elm, b) {
        toggleClass(elm, "invalid", b);
        elms.x   .disabled = b;
        elms.play.disabled = b;
    }
};
//==============================================================================
// updateOne() helps input.color() and change.space(), updates one of the
//             4 pairs of coordinates & text: start|end x left|right.
// arguments:  se = g.start|end, lr = g.left|right
// se[lr.id] = g.start|end.left|right = color coordinates, Array
// lr[se.id] = g.left|right.start|end = elms.left|rightStart|End, <span>
function updateOne(se, lr) {
    se[lr.id] = se.color[lr.color.spaceId.replace("-", "_")];
    oneCounter(se[lr.id], lr[se.id], lr.range);
}
//==============================================================================
//    change event handlers:
const change = {
 // space() updates start & end for one side left | right
    space(evt) {
        const tar = evt.target;
        const lr  = g[getCamel(tar)];      // g.left|right
        const id  = tar.selectedOptions[0].dataset.spaceId;

        lr.color = new Color(id, 0);
        lr.range = refRange[id];

        if (!evt.isLoading) {
            for (const se of [g.start, g.end])
                updateOne(se, lr);
            refresh();
        }
        let b = tar.selectedOptions[0].dataset.isCjs;
        if (b)
            lr.display.textContent = lr.color.display().split(E.func)[0];
        else {
            lr.display.textContent = tar.value;
            b = (tar === g.left ? g.right : g.left).spaces.selectedOptions[0]
                                                          .dataset.isCjs;
        }
        P.displayed(lr.display, b);
        setLocal(tar, tar.value);
    },
 // time() is incomplete...//!!
    time(evt) {
        const tar = evt.target;
        setLocal(tar, tar.value);
    },
 // type() swaps elms.named, indirectly calls openNamed().
    type(evt) {
        const val = elms.type.value;
        if (evt)                            // !evt = called by loadEvents()
            P.displayed(elms.named, false); // hide the old <select>

        isMulti = (val == MEASER_);
        elms.named = isMulti ? elms.multis : elms.easys;
        P.displayed(elms.named, true);      // show the new <select>
        setLocal(elms.type, val);
        if (evt) {
            setPrefix(val);                 // must precede openNamed()
            elms.named.dispatchEvent(new Event(CHANGE)); // calls openNamed()
        }
    }
};
//==============================================================================
//    click event handlers:
const click = {
 // compare() shows|hides the right side
    compare(evt) {
        const b = click.boolBtn(evt.target);
        const r = g.right;
        P.visible  ([r.display, r.start, r.value, r.end], b);
        P.displayed([r.spaces, r.canvas], b);
        P.displayed(elms.divCopy, !b);
    },
    roundTrip(evt) {
        const b = click.boolBtn(evt.target);
        //!!
    },
 // collapse() shows|hides inputs & counters
    collapse() {
        const b = click.boolBtn(evt.target);
        const h = [collapsibleHeight, 0];

        P.displayed(elms.collapsible, !b);
        resizeWindow(undefined, h[Number(b)]);
    },
    fullBody() {
        const b = click.boolBtn(evt.target);
        //!!
    },
 // boolBtn() helps these boolean buttons (symBtns as pseudo-checkboxes)
    boolBtn(tar) {
        const b   = !tar.value;
        tar.value = boolToString(b);
        tar.textContent = symBtn[tar.id][Number(b)];
        setLocalBool(tar, b);
        return b;
    }
};
function getCamel(elm) {
    return elm.id.slice(0, elm.id.search(/[A-Z]/));
}
function getCase(elm) {
    return elm.id.slice(elm.id.search(/[A-Z]/));
}