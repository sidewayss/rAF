export {loadEvents, timeFactor, outOfGamut, getCase};
export let isMulti;

import {E, Ez, Fn, Is, P, Rx} from "../../src/raf.js";

import {ezX}                    from "../load.js";
import {setPrefix}              from "../named.js";
import {changeStop}             from "../play.js";
import {setLocal, setLocalBool} from "../local-storage.js";
import {msecs, frames, timeFrames, updateTime}       from "../update.js";
import {CHANGE, CLICK, INPUT, MEASER_, elms, dlg, g, is, boolToString,
        addEventToElms, addEventsByElm, orUndefined} from "../common.js";

import {Color, ezColor, refRange, resizeWindow} from "./_load.js";
import {refresh, oneCounter}                    from "./_update.js";

const
invalids = new Set,
btnText  = { // textContent: boolean as number is index into each array
    compare: ["switch_left", "switch_right"],
    roundT:  ["repeat",      "repeat_on"   ],
    collapse:["expand_less", "expand_more" ]
};
//==============================================================================
// loadEvents() is called exclusively by load(), helps keep stuff private
function loadEvents() {
    addEventsByElm(CLICK,  g.boolBtns,  click);
    addEventsByElm(INPUT,  [elms.time], input);
    addEventsByElm(CHANGE, [elms.time, elms.type, elms.gamut], change);

    addEventToElms(INPUT,  [elms.startText,   elms.endText],     input .text);
    addEventToElms(CLICK,  [elms.startButton, elms.endButton],   click.swatch);
    addEventToElms(CHANGE, [elms.leftSpaces,  elms.rightSpaces], change.space);
    addEventsByElm(CLICK,  [dlg.ok, dlg.cancel], click);
    dlg.spaces.addEventListener(CHANGE, change.dlgSpaces);

    change.type();       // sets isMulti
    return is({color:true, multi:isMulti});
}
//==============================================================================
//    input event handlers:
const input = {
 // text() handles input events for #startText, #endText, validates that its' a
 //        CSS color, updates start | end for both left & right.
    text(evt) {
        const
        tar = evt.target,
        id  = getCamel(tar),  // "start" or "end"
        se  = g[id];

        try { se.color = new Color(tar.value); }
        catch {
            invalidInput(tar, true);
            return;
        }
        //-----------------------
        invalidInput(tar, false);

        const color = se.color.display();
        se.button.style.backgroundColor = color;
        se.swatch.style.backgroundColor = color;
        g.lbl[id].style.color = color;

        if (Is.def(evt.type))          // else called by change.color()
            se.color.value = se.color.to("srgb").toString({format: "hex"});
                                       // <input>.value is in hex notation
        for (const lr of g.leftRight)
            updateOne(se, lr);

        setLocal(tar);                 // only save valid values to localStorage
        if (!evt.isLoading)
            refresh();
    },
 // time() splits the work with change.time(), handles only the immediate tasks
    time() {
        timeFrames();
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
        lr  = g[getCamel(tar)],         // g.left|right
        opt = tar.selectedOptions[0];

        lr.color = new Color(opt.dataset.spaceId, 0);
        lr.range = refRange[opt.value];
        if (!evt.isLoading) {
            for (const se of g.startEnd)
                updateOne(se, lr);
            refresh();
        }
        const                           // get the CSS func or space id
        display = lr.color.display().split(Rx.func),
        space   = (display[0] == Fn.color) ? display[1].split(E.sp)[0]
                                           : display[0];

        lr.display.textContent = (space == lr.color.space.cssId || space == Fn.rgb)
                               ? "~"    // Color.js srgb displays with rgb()
                               : space; // the one thing rgb255 cannot customize
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
    },
//$$color(evt) { // <input type="color"> g.startEnd.picker, value = hex notation
//$$    const
//$$    tar = evt.target,
//$$    txt = g[getCamel(tar)].text;
//$$    txt.value = tar.value;
//$$    input.text({target:txt});
//$$},
    gamut(evt) {  // <select id="gamut"> runs outOfGamut() for start, end, value
        const
        color = g.left.color,                 // Color instance
        gamut = elms.gamut.value,             // color space id
        inGamut = evt.inGamut;                // called by click.compare()
        for (const obj of g.startEnd) {
            color.coords = obj.left;          // cached by updateOne()
            outOfGamut(obj.id, color, gamut, inGamut);
        }
        color.coords = evt.isLoading ? g.start.left
                                     : frames[elms.x.value].left;
        outOfGamut(E.value, color, gamut, inGamut);
    },

    dlgSpaces() {
        dlg.picker.space = dlg.spaces.value;
    }
};
//==============================================================================
//    click event handlers, in top-left to bottom-right screen order:
const click = {
    swatch(evt) {        // g[start|end]
        dlg.picker.color  = g[getCamel(evt.target)].text.value;
        dlg.picker.target = evt.target; // can I use .dataset for objects??
        elms.picker.showModal();
    },
    ok() {
        const
        tar = dlg.picker.target,
        txt = g[getCamel(tar)].text;
        txt.value = dlg.picker.color;
        input.text({target:txt});
        elms.picker.close();
    },
    cancel() {
        elms.picker.close();
    },
 // compare() shows|hides the right side
    compare(evt) {
        const b = click.boolBtn(evt);
        const r = g.right;
        P.visible  ([r.display, r.start, r.value, r.end], b);
        P.displayed([r.spaces, r.canvas], b);
        P.displayed(elms.divNoCompare, !b);
        elms.leftCanvas.style.width = b ? "50%" : "100%";

        change.gamut({isLoading:evt.isLoading, inGamut:orUndefined(b)});
        if (b && !evt.isLoading) // only check inGamut when !b
            refresh();
    },
 // roundT() elm.id distinguishes it from elms.roundTrip on other test pages
    roundT(evt) {
        const b = click.boolBtn(evt);
        changeStop();
        ezX.roundTrip = b;
        if (isMulti)
            for (const ez of g.easies)
                ez.roundTrip = b;
        else
            ezColor.roundTrip = b;
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
        let b;
        const tar = evt.target;
        if (evt.isLoading)
            b = Boolean(tar.value);
        else {
            b = !tar.value;
            tar.value = boolToString(b);
            setLocalBool(tar, b);
        }
        tar.textContent = btnText[tar.id][Number(b)];
        return b;
    }
};
//==============================================================================
// invalidInput() helps input.text(), more than one input can be invalid,
//                #x and #play disabled if any are invalid.
function invalidInput(elm, b) {
    elm.classList.toggle("invalid", b);
    invalids[b ? "add" : "delete"](elm);

    b = Boolean(invalids.size);
    elms.x   .disabled = b;
    elms.play.disabled = b;
}
// updateOne() helps input.text() and change.space(), updates one of the
//             4 pairs of coordinates & text: start|end x left|right.
// arguments:  se = g.start|end, lr = g.left|right
// se[lr.id] = g.start|end.left|right = color coordinates, Array
// lr[se.id] = g.left|right.start|end = elms.left|rightStart|End, <span>
function updateOne(se, lr) {
    let coords = se.color[Ez.kebabToSnake(lr.color.spaceId)].slice();
    se[lr.id] = coords;
    oneCounter(coords, lr, se.id);
}
// timeFactor() helps change.time() and initEasies(), only if (isMulti)
function timeFactor(arr) {
    return msecs / Math.max(...arr.map(obj => obj.time));
}
// outOfGamut() helps change.gamut(), oneCounter() format out-of-gamut labels
function outOfGamut(id, color, gamut = elms.gamut.value,
                             inGamut = color.inGamut(gamut)) { // see collapse()
    const
    lbl = g.lbl[id],
    txt = g.left[id],
    arr = lbl.title.split(E.sp),
    was = (arr.length == 2);
    if (was != inGamut) {
        if (inGamut) {
            txt.style.color = "";
            lbl.title = arr.slice(0, 2).join(E.sp);
        }
        else {
            txt.style.color = "rgb(192 0 0)";  // 75% red
            lbl.title += " (out of gamut)";
        }
    }
}
//==============================================================================
function getCamel(elm) {
    return elm.id.slice(0, elm.id.search(/[A-Z]/));
}
function getCase(elm) {
    return elm.id.slice(elm.id.search(/[A-Z]/));
}