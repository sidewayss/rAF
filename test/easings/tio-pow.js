export {loadTIOPow, setLink, updateTypeIO, isPow, isBezierOrSteps};

import {E, Ez, P, Easy} from "../../raf.js";

import {formatInputNumber, isInvalid} from "../input-number.js";
import {TWO, CLICK, INPUT, elms, g, addEventByClass, pairOfOthers, toggleClass,
        boolToString}                 from "../common.js";

import {chart, refresh} from "./_update.js";
import {loadChart}      from "./chart.js";
import {setSplitGap}    from "./msg.js";
import {isSteps}        from "./steps.js";
import {LINK, TYPE, POW, twoLegs, isBezier} from "./index.js";
//==============================================================================
// loadTIOPow() is called by easings.loadIt(), once per session
function loadTIOPow() {
    let id, opt, sel;
    Ez.readOnly(g, "links", ["link_off", LINK]); // boolean acts as 0|1 index

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
    elms.divType2.appendChild(sel);
    g.disables.push(sel);

    for (id of [TYPE, POW])                // each one is the other's other
        pairOfOthers(elms[id], elms[id + TWO]);

    loadChart(); // chart events must follow cloning and precede addEvent(INPUT)
    addEventByClass(INPUT, `${TYPE}-${POW}`, null, inputTypePow);
    addEventByClass(CLICK, LINK,             null, inputTypePow);
}
//==============================================================================
// inputTypePow() is the input event handler for class="type-pow"
//               and the click event handler for class="link",
//               type and type2 have a change handler in chart.js
function inputTypePow(evt) {
    let refreshIt;
    const
    tar = evt.target,
    isP = tar.id.includes("ow");        // pow, pow2, linkPow
    if (isP && isInvalid(tar))
        return;
    //----------------------
    const
    id   = isP ? POW : TYPE,
    suff = tar.id.endsWith(TWO) ? [TWO,""] : ["",TWO],
    link = elms[Ez.toCamel(LINK, id)],
    val  = elms[id + suff[0]].value,
    two  = elms[id + suff[1]],
    isLink = (tar === link);                // is target a link button?
    if (isLink)
        setLink(tar);                       // toggles link.value, so that
    if (link.value && two.value != val) {   // if (isLink) two.value can == val.
        if (isP)
            formatInputNumber(two, val);
        else {                              // type, type2, linkType
            two.value = val;
            if (isLink) {
                updateTypeIO();
                refreshIt = true;
            }
        }
    }
    if (isP || refreshIt)
        refresh(tar);
}
// setLink() helps inputTypePow(), easingFromObj()
function setLink(btn, b = !btn.value) {
    btn.value       = boolToString(b);
    btn.textContent = g.links[Number(b)]; // symbol font characters
    toggleClass(btn, "linked", b);
}
//==============================================================================
// updateTypeIO() updates the form based on current values
//                called by change.io(), change.type(), updateAll()
function updateTypeIO(isIO, [isBez, isStp, isBS] = isBezierOrSteps()) {
    if (!isIO) {
        P.displayed(elms.divIo,    !isBS);
        P.displayed(elms.bezier,    isBez);
        P.displayed(elms.divsSteps, isStp); // an array of <div>s
    }
    const
    has2 = !isBS && twoLegs(),
    isP  = isPow(),
    isP2 = has2 && isPow(Number(elms.type2.value));

    P.displayed(elms.divPow,  isP || isP2);
    P.displayed(elms.pow,     isP);         // <label> always shows
    P.displayed(elms.divPow2, isP2);
    P.displayed(elms.linkPow, isP && isP2); // <input> always shows

    setSplitGap(undefined, has2);
    P.displayed(elms.placeholder, !has2);
    P.displayed([elms.divType2, elms.divMid, chart.dashX, chart.dashY], has2);
    P.visible  ([elms.divSplit, elms.divGap], has2);

    return has2;  // convenient for a couple of callers
}
//==============================================================================
// isPow() <= easingFromObj(), easingFromForm(), updateTypeIO(), refresh()
function isPow(val = g.type) {
    return val == E.pow;
}
function isBezierOrSteps() {
    const isBez = isBezier();
    const isStp = isSteps();
    return [isBez, isStp, isBez || isStp];
}