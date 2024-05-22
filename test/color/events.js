export {loadEvents, timeFactor, getCase};
export let isMulti;

import Color from "https://colorjs.io/dist/color.js";

import {E, Ez, Fn, P} from "../../raf.js";

import {ezX}                            from "../load.js";
import {msecs, timeFrames, updateTime}  from "../update.js";
import {setPrefix}                      from "../named.js";
import {changeStop}                     from "../play.js";
import {copyText}                       from "../copy.js";
import {setLocal, setLocalBool}         from "../local-storage.js";
import {invalidInput}                   from "../input-number.js";
import {CHANGE, CLICK, INPUT, MEASER_, elms, g, is, boolToString,
        addEventToElms, addEventsByElm} from "../common.js";

import {ezColor, refRange, resizeWindow} from "./_load.js";
import {refresh, oneCounter}             from "./_update.js";
import {moveCopied}                      from "./_copy.js";

const btnText = { // textContent: boolean as number is index into each array
    compare: ["switch_left", "switch_right"],
    roundT:  ["repeat",      "repeat_on"   ],
    collapse:["expand_less", "expand_more" ]
};
//==============================================================================
// loadEvents() is called exclusively by loadIt(), helps keep stuff private
function loadEvents() {
    addEventsByElm(CLICK,  [elms.share, ...g.boolBtns], click);
    addEventsByElm(INPUT,  [elms.time],                 input);
    addEventsByElm(CHANGE, [elms.time, elms.type],      change);
    addEventToElms(INPUT,  [elms.startInput, elms.endInput],    input.color);
    addEventToElms(CHANGE, [elms.leftSpaces, elms.rightSpaces], change.space);
    change.type();              // sets isMulti
    return is({multi:isMulti});
}
//==============================================================================
//    input event handlers:
const input = {
 // color() handles input events for #startInput, #endInput, validates that text
 //         is a CSS color, updates start | end for both left & right.
    color(evt) {
        const tar = evt.target;
        const se  = g[getCamel(tar)];  // g.start or g.end

        try { se.color = new Color(tar.value); }
        catch {
            invalidInput(tar, true);
            return;     // only saves valid values to localStorage
        }
        //------------------------
        invalidInput(tar, false);
        se.canvas.style.backgroundColor = se.color.display();
        for (const lr of g.leftRight)
            updateOne(se, lr);
        setLocal(tar);
        if (!evt.isLoading)
            refresh();
    },
 // time() splits the work with change.time(), handles only the immediate tasks
    time(evt) {
        timeFrames(evt);
    }
};
//==============================================================================
//    change event handlers:
const change = {
 // time() handles the less-than-immediate tasks
    time(evt) {
        if (!isMulti)
            ezColor.time = msecs;
        else {
            const ezs = g.easies.easies;    // shallow copy as Array
            let   i   = ezs.indexOf(ezX);
            if (i >= 0)                     // for when #stop.value == RESET,
                ezs.splice(i, 1)            // because this precedes refresh().

            const f = timeFactor(ezs);
            for (const ez of ezs)
                ez.time = Math.round(ez.time * f);
        }
        updateTime();
        refresh();
        setLocal(evt.target);
    },
 // space() updates start & end for one side left | right
    space(evt) {
        const
        tar = evt.target,
        lr  = g[getCamel(tar)],       // g.left|right
        opt = tar.selectedOptions[0];

        lr.color = new Color(opt.dataset.spaceId, 0);
        lr.range = refRange[opt.value];
        if (!evt.isLoading) {
            for (const se of g.startEnd)
                updateOne(se, lr);
            refresh();
        }
        const display = lr.color.display().split(E.func);
        lr.display.textContent = (display[0] == Fn.color)
                               ? display[1].split(E.sp)[0]
                               : display[0];
        setLocal(tar);
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
//    click event handlers, in top-left to bottom-right screen order:
const click = {
 // compare() shows|hides the right side
    compare(evt) {
        const b = click.boolBtn(evt);
        const r = g.right;
        P.visible  ([r.display, r.start, r.value, r.end], b);
        P.displayed([r.spaces, r.canvas], b);
        P.displayed(elms.divCopy, !b);
        elms.leftCanvas.style.width = b ? "50%" : "100%";
        if (b && !evt.isLoading)
            refresh();
    },
 // roundT() elm.id distinguishes it from elms.roundTrip on other test pages
    roundT(evt) {
        const b = click.boolBtn(evt);
        changeStop();
        ezX.roundTrip = b;
        if (isMulti)
            for (const ezC of g.easies)
                ezC.roundTrip = b;
        else
            ezColor.roundTrip = b;
    },
 // share() is not a boolean button
    share() {
        let txt = `${location.href.split("?")[0]}?${g.keyName}=${elms.named.value}`;
        for (const elm of g.searchElms)
            txt += `&${elm.id}=${elm.value}`;

        moveCopied(elms.share.getBoundingClientRect());
        copyText(txt);
    },
 // collapse() shows|hides inputs & counters
    collapse(evt) {
        const b = click.boolBtn(evt);
        P.displayed(elms.collapsible, !b);
        if (!evt.isLoading)
            resizeWindow(null, b);
    },
 // boolBtn() helps the boolean buttons (symBtns as pseudo-checkboxes)
    boolBtn(evt) {
        const tar = evt.target;
        const b   = !tar.value;
        tar.value = boolToString(b);

        tar.textContent = btnText[tar.id][Number(b)];
        if (!evt.isLoading)
            setLocalBool(tar, !b);
        return b;
    }
};
//==============================================================================
// updateOne() helps input.color() and change.space(), updates one of the
//             4 pairs of coordinates & text: start|end x left|right.
// arguments:  se = g.start|end, lr = g.left|right
// se[lr.id] = g.start|end.left|right = color coordinates, Array
// lr[se.id] = g.left|right.start|end = elms.left|rightStart|End, <span>
function updateOne(se, lr) {
    let coords = se.color[Ez.kebabToSnake(lr.color.spaceId)].slice();
    if (lr.spaces.value == Fn.rgb)
        coords = coords.map(v => Math.round(Ez.clamp(0, v, 1)) * 255);

    oneCounter(coords, lr[se.id], lr.range);
    se[lr.id] = coords;
}
// timeFactor() helps change.time() and initEasies(), only if (isMulti)
function timeFactor(arr) {
    return msecs / Math.max(...arr.map(obj => obj.time));
}
//==============================================================================
function getCamel(elm) {
    return elm.id.slice(0, elm.id.search(/[A-Z]/));
}
function getCase(elm) {
    return elm.id.slice(elm.id.search(/[A-Z]/));
}