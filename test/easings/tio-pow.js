export {TIME, TYPE, IO, POW, loadTIOPow, setLink, updateTypeIO, isPow};

import {E, Ez, P, Easy} from "../../raf.js";

import {TWO, CLICK, INPUT, elms, g, addEventByClass, formatInputNumber,
        toggleClass, boolToString} from "../common.js";

import {refresh}     from "./_update.js";
import {chart}       from "./chart.js";
import {setSplitGap} from "./msg.js";
import {isSteps}     from "./steps.js";
import {LINK, OTHER, twoLegs, isBezier} from "./index.js";

const TIME = "time";
const TYPE = "type";
const IO   = "io";
const POW  = "pow";
//==============================================================================
// loadTIOPow() is called by easings.loadIt(), once per session
function loadTIOPow() {
    let args, id, opt, sel;

    Ez.readOnly(g, "links", ["link_off",  LINK]); // boolean acts as 0|1 index

    for (sel of [elms.type, elms.io])      // populate the <select>s: #type, #io
        for (opt of Easy[sel.id].slice(0, E.increment))
            sel.add(new Option(opt, E[opt]));

    opt = elms.io.options;                 // sort io in a user-friendly order
    elms.io.insertBefore(opt[E.inOut], opt[E.outIn ]);
    elms.io.insertBefore(opt[E.inIn ], opt[E.outOut]);

    sel = elms.type.cloneNode(true);       // clone elms.type for 2nd leg
    sel.removeChild(sel.lastElementChild); // no steps multi-leg here
    sel.removeChild(sel.lastElementChild); // ditto bezier
    sel.id += TWO;
    elms[sel.id] = sel;
    elms.div2.appendChild(sel);
    g.disables.push(sel);

    for (id of [TYPE, POW]) {               // .other avoids evaluating later
        args = [elms[id], elms[id + TWO]];  // each one is the other's other
        Ez.readOnly(args[0], OTHER, args[1]);
        Ez.readOnly(args[1], OTHER, args[0]);
    }
    addEventByClass(INPUT, `${TYPE}-${POW}`, inputTypePow);
    addEventByClass(CLICK, LINK,             inputTypePow);
}
// inputTypePow() is input event handler for class="type-pow"
function inputTypePow(evt) {
    const tar  = evt.target;
    const isP  = tar.id.includes("ow");
    const id   = isP ? POW : TYPE;
    const suff = tar.id.endsWith(TWO) ? [TWO,""] : ["",TWO];
    const link = elms[Ez.toCamel(LINK, id)];
    const src  = elms[id + suff[0]];
    const copy = elms[id + suff[1]];

    const isLink = (tar === link);
    if (isLink)
        setLink(tar);
    if (link.value) {                   // even if type2 is hidden
        const old = copy.value;
        if (isP)                        // pow, pow2, linkPow
            formatInputNumber(copy, src.value);
        else                            // type, type2, linkType
            copy.value = src.value;

        if (isLink && old != src.value)
            refresh(copy);              //*03
    }
}
// setLink() helps inputTypePow(), loadIt(), easingFromLocal()
function setLink(btn, b = !btn.value) {
    btn.value       = boolToString(b);
    btn.textContent = g.links[Number(b)]; // symbol font characters
    toggleClass(btn, "linked", b);
}
//==============================================================================
// updateTypeIO() updates the form based on current values
//                called by changeIo(), changeType(), updateAll()
function updateTypeIO(isIO) {
    const isP     = isPow();
    const isBez   = isBezier();
    const isStp   = isSteps();
    const has2    = !isBez && !isStp && twoLegs();
    const isP2    = has2 && isPow(Number(elms.type2.value));
    const bothPs  = isP && isP2;
    const eitherP = isP || isP2;

    P.displayed(elms.pow,     isP);
    P.displayed(elms.linkPow, bothPs);
    P.displayed(elms.lblPow,  bothPs);
    P.displayed([elms.pow2, elms.divPow2], isP2);
    P.displayed([elms.div2, elms.divMid, chart.dashX, chart.dashY], has2);

    P.visible([elms.divSplit, elms.divGap], has2);
    P.displayed(elms.placeholder, !has2);
    if (has2)
        setSplitGap();  // only necessary when showing #mid/#split/#gap...
    if (!isIO) {        // false || undefined
        P.displayed(elms.io,       !isBez && !isStp);
        P.displayed(elms.bezier,    isBez);
        P.displayed(elms.divsSteps, isStp);
    }
    if (eitherP) {
        toggleClass(elms.divPow2, "end", bothPs);
        if (isP2)
            toggleClass(elms.pow2, "ml1-2", !bothPs);
    }
    return has2;        // convenient for a couple of callers
}
//==============================================================================
// isPow() <= easingFromLocal(), easingFromForm(), updateTypeIO(), refresh()
function isPow(val = g.type) {
    return val == E.pow;
}