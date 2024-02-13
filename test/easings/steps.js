export {VALUES, TIMING, EASY, USER, loadSteps, stepsFromLocal, stepsFromForm,
        updateVT, vtFromElm, drawSteps, isSteps};

import {E, Is, Ez, P, Easy} from "../../raf.js";

import {points}       from "../update.js";
import {getNamedEasy} from "../local-storage.js";
import {MILLI, COUNT, CHANGE, elms, g, addEventToElms, formatInputNumber,
        twoToCamel}   from "../common.js";

import {redraw}               from "./_update.js";
import {chart, isOutOfBounds} from "./chart.js";
import {pointToString}        from "./index.js";

const VALUES = "values";
const TIMING = "timing";
const EASY   = "easy";
const USER   = "user";
//==============================================================================
// loadSteps() called by easings.loadIt()
function loadSteps() {
    let elm, i, str;
    Ez.readOnly(elms, "divsSteps", document.getElementsByClassName("div-steps"));
    addEventToElms(CHANGE, document.getElementsByClassName("steps"), changeSteps);

    elm = elms.steps;
    for (i = 1; i <= 30; i++)
        elm.add(new Option(i));

    elm = elms.jump;
    for (str of Easy.jump)
        elm.add(new Option(str, E[str]));
}
function changeSteps(evt) { // #steps, #jump, #values, #timing, #v0-3, #t0-3,
    const tar = evt.target; // #easeValues, #easeTiming
    if (tar === elms.values || tar === elms.timing)
        updateVT();
    redraw(tar, 0, false, true, isOutOfBounds());
}
//==============================================================================
// stepsFromLocal() called exclusively by formFromObj()
function stepsFromLocal(obj) {
    let val = obj.steps;
    if (Is.A(val))
        vtArray(val, elms[VALUES]);
    else if (val)
        elms.steps.value = val;
    else // if (obj.easy)
        vtEasy(val, elms[VALUES]);

    val = obj[TIMING];
    if (Is.A(val))
        vtArray(val, elms[TIMING]);
    else if (val)
        vtEasy(val, elms[TIMING]);

    if (Is.def(obj.jump))
        elms.jump.value = obj.jump;

    updateVT();
    g.type = E.steps;
    g.io   = E.in;
    return obj;
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
// updateVT() called by stepsFromLocal(), redraw(), updateAll()
function updateVT() {
    let elm, sel;
    const notT  = !isUserVT(elms[TIMING].value);
    const notVT = notT && !isUserVT(elms[VALUES].value);

    P.displayed(elms.steps,  notVT);
    P.displayed(elms.count, !notVT);
    P.visible  (elms.steps,           notT);
    P.visible  (elms.jump.parentNode, notT);

    if (notVT && !elms.steps.selectedIndex && !elms.jump.selectedIndex)
        elms.steps.selectedIndex = 1; // {steps:1, jump:E.none} is not valid

    for (sel of [elms[VALUES], elms[TIMING]])
        for (elm of sel.other)
            P.visible(elm, elm.id == sel.value);
}
// isUserVT() called by updateVT(), vtFromElm()
function isUserVT(val) {
    return val.startsWith("u");
}
// vtArray() helps stepsFromLocal()
function vtArray(val, elm) {
    const char    = elm.id[0]
    const divisor = (char == "t") ? MILLI : 1;

    elm.value = twoToCamel(USER, elm.id);
    for (var i = 0; i < COUNT; i++)
        formatInputNumber(elms[char + i], val[i] / divisor);
}
// vtEasy() helps stepsFromLocal()
function vtEasy(val, elm) {
    const name = twoToCamel(EASY, elm.id);
    elm.value  = name;
    elms[name].value = val;
}
// vtFromElm() called by stepsFromForm(), isOutOfBounds()
function vtFromElm(elm, useName) {
    let v;
    const val    = elm.value;
    const char   = elm.id[0];
    const factor = (char == "t") ? MILLI : 1;

    if (isUserVT(val)) { // userValues or userTiming
        v = [];
        for (let i = 0; i < COUNT; i++)
            v.push(elms[char + i].valueAsNumber * factor);
    }
    else if (val) {      // easyValues or easyTiming
        const name = elm.other[0].value;
        if (name)        // in case .selectedIndex == -1
            v = useName ? name : getNamedEasy(name);
    }
    return v;            // else linear: v is undefined
}
//==============================================================================
// drawSteps() helps drawLine()
function drawSteps() {
    const str = new Array(points.length);
    const max = points.length - 1;
    points.forEach((p, i) => {
        str[i] = `${pointToString(p.x, p.y)}`;
        if (i < max && p.y != points[i + 1].y) {
            str[i] += !i ? ` ${pointToString(p.x, points[i + 1].y)}`
                         : ` ${pointToString(points[i + 1].x, p.y)}`;
        }
    });
    P.points.set(chart.line, str.join(E.sp));
}
// isSteps() works for modules in "../" because multi g.type is undefined
function isSteps(val = g.type) {    // val only defined by formFromObj()
    return val == E.steps;
}