export {TIMING, EASY, loadSteps, loadVT, stepsFromObj, stepsFromForm,
        updateVT, vtFromElm, drawSteps, isSteps};

import {E, Is, Ez, P, Easy} from "../../raf.js";

import {frames}                 from "../update.js";
import {getNamed, getNamedEasy} from "../local-storage.js";
import {SELECT, MILLI, COUNT, CHANGE, elms, g, addEventToElms,
        formatInputNumber}      from "../common.js";

import {refresh}              from "./_update.js";
import {chart, isOutOfBounds} from "./chart.js";
import {OTHER, pointToString} from "./index.js";

let STEPS;
const VALUES = "values";
const TIMING = "timing";
const EASY   = "easy";
const USER   = "user";
const DIV    = "div";


const IDX_LINEAR = 0;
const IDX_EASY   = 1;
const IDX_USER   = 2;
//==============================================================================
// loadSteps() called by easings.loadIt()
function loadSteps() {
    let i, sel, str;
    STEPS = Easy.type[E.steps]; // must wait for PFactory.init() to run

    const divs = document.getElementsByClassName(`${DIV}-${STEPS}`);
    Ez.readOnly(elms, Ez.toCamel(`${DIV}s`, STEPS), divs);

    sel = elms.steps;
    for (i = 1; i <= 30; i++)
        sel.add(new Option(i));

    sel = elms.jump;
    for (str of Easy.jump)
        sel.add(new Option(str, E[str]));
}
function loadVT() { // called exclusively by getEasies() during page load
    let arr, clone, div, elm, i, isT, lbl, sel, selNamed;
    let divUser = elms[Ez.toCamel(USER, STEPS)].firstElementChild;

    const cfg = [[VALUES, 0 - 100,  MILLI + 100,  MILLI / COUNT, "1"],
                 [TIMING, 0, 2, elms.time.valueAsNumber / COUNT, ".001"]];

    for (let [id, min, max, val, step] of cfg) {
        div = elms[Ez.toCamel(DIV, id)];     // divValues, divTiming
        lbl = document.createElement("label");
        lbl.htmlFor = id;
        lbl.textContent = `${Ez.initialCap(id)}:`;

        sel = document.createElement(SELECT);
        sel.className = STEPS;
        sel.add(new Option("linear"));
        sel.add(new Option("easing"));
        sel.id   = id;
        elms[id] = sel;

        isT = (id == TIMING);
        if (isT)
            id = divUser.firstElementChild.textContent.slice(0, -1); //strip ':'
        sel.add(new Option(id));

        selNamed = selNamed?.cloneNode(true) // false = only non-steps Easys
                ?? getNamed(document.createElement(SELECT), undefined, false);

        selNamed.className = `${STEPS} named ml1-2`;

        div.appendChild(lbl);
        div.appendChild(sel);
        div.appendChild(selNamed);
        Ez.readOnly(sel, OTHER, [selNamed, divUser]);

        elm = divUser.lastElementChild;      // userValues, userTiming
        arr = [elm];
        for (i = 1; i < COUNT; i++) {
            clone = elm.cloneNode(true);
            divUser.appendChild(clone);
            arr.push(clone);
        }
        if (isT)
            arr = arr.map(e => e.firstElementChild);

        i = 1;
        for (elm of arr) {                   // arr = [<input type="number">]
            elm.min   = min;
            elm.max   = max;
            elm.step  = step;
            elm.value = (val * i++).toFixed(step.length - 1);
        }
        elms[Ez.toCamel(USER, id)] = arr;
        divUser = divUser.nextElementSibling;
    }
    addEventToElms(CHANGE, document.getElementsByClassName(STEPS), changeSteps);
}
function changeSteps(evt) { // #steps, #jump, #values, #timing,
    const tar = evt.target; // #values/timing.other[0], elms.userValues/Timing
    if (tar === elms.values || tar === elms.timing)
        updateVT();
    refresh(tar, 0, false, true, isOutOfBounds());
}
//==============================================================================
// stepsFromObj() called exclusively by formFromObj()
function stepsFromObj(obj) {
    let val, sel;
    elms[STEPS].value = obj[STEPS];

    for (const [s, vt, e] of [[STEPS, VALUES, EASY],[TIMING, TIMING, TIMING]]) {
        val = obj[s];
        sel = elms[vt];
        if (Is.A(val)) {
            const inputs  = elms[Ez.toCamel(USER, sel.id)];
            const divisor = getDF(sel);
            for (var i = 0; i < COUNT; i++)
                formatInputNumber(inputs[i], val[i] / divisor);
            sel.selectedIndex = IDX_USER;
        }
        else if (obj[e]) {
            sel[OTHER][0].value = val;
            sel.selectedIndex = IDX_EASY;
        }
        else
            sel.selectedIndex = IDX_LINEAR;
    }
    if (Is.def(obj.jump))
        elms.jump.value = obj.jump;

    updateVT();
    g.type = E.steps;
    g.io   = E.in;
}
// stepsFromForm() called exclusively objFromForm()
function stepsFromForm(obj) {
    let easy, jump, steps;
    const values = vtFromElm(elms[VALUES], true);
    const timing = vtFromElm(elms[TIMING], true);
    if (Is.A(values))                   // steps is an array of values
        steps = values;
    else {                              //steps is a number
        steps = Is.A(timing) ? COUNT : Number(elms.steps.value);
        if (values)
            easy = values;
    }
    if (timing && !Is.A(timing))        // timing is an Easy
        jump = Number(elms.jump.value);

    return Object.assign(obj, {steps, jump, easy, timing});
}
//==============================================================================
// updateVT() called by stepsFromObj(), refresh(), updateAll()
function updateVT() {
    const notT  = !isUserVT(elms[TIMING]);
    const notVT = notT && !isUserVT(elms[VALUES]);

    P.displayed(elms.steps,  notVT);
    P.displayed(elms.count, !notVT);
    P.visible  ([elms.steps, elms.jump.parentNode], notT);

    if (notVT && !elms.steps.selectedIndex && !elms.jump.selectedIndex)
        elms.steps.selectedIndex = 1; // {steps:1, jump:E.none} is not valid

    let id, idx, sel;
    for (id of [VALUES, TIMING]) {
        sel = elms[id];
        idx = sel.selectedIndex - 1;
        sel[OTHER].forEach((elm, i) => P.visible(elm, i == idx));
    }
}
// isUserVT() called by updateVT(), vtFromElm()
function isUserVT(sel) {
    return sel.selectedIndex = IDX_USER;
}
// vtFromElm() called by stepsFromForm(), isOutOfBounds()
function vtFromElm(sel, useName) {
    let vt;
    if (isUserVT(sel)) { // userValues or userTiming
        const inputs = elms[Ez.toCamel(USER, sel.id)];
        const factor = getDF(sel);
        vt = new Array(COUNT);
        for (let i = 0; i < COUNT; i++)
            vt[i] = inputs[i].valueAsNumber * factor;
    }
    else if (sel.selectedIndex == IDX_EASY) { // easyValues or easyTiming
        const name = sel[OTHER][0].value;
        if (name)        // in case .selectedIndex == -1
            vt = useName ? name : getNamedEasy(name);
        else
            ;            //!!
    }
    return vt;            // else linear: vt is undefined
}
function getDF(sel) { // divisor or factor
    return (sel.id == VALUES) ? 1 : MILLI;
}
//==============================================================================
// drawSteps() helps drawLine()
function drawSteps() {
    const str = new Array(frames.length);
    const max = frames.length - 1;
    frames.forEach((frm, i) => {
        str[i] = `${pointToString(frm.x, frm.y)}`;
        if (i < max && frm.y != frames[i + 1].y) {
            str[i] += !i ? ` ${pointToString(frm.x, frames[i + 1].y)}`
                         : ` ${pointToString(frames[i + 1].x, frm.y)}`;
        }
    });
    P.points.set(chart.line, str.join(E.sp));
}
// isSteps() works for modules in "../" because multi g.type is undefined
function isSteps(val = g.type) { // val only defined by formFromObj()
    return val == E.steps;
}