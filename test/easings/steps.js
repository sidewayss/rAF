export {TIMING, EASY, loadSteps, loadVT, stepsFromObj, stepsFromForm, initSteps,
        maxTime, vtFromElm, drawSteps, postRefresh, setInfo, isSteps};

import {E, Is, Ez, P, Easy} from "../../raf.js";

import {D, frames, secs}        from "../update.js";
import {getNamed, getNamedEasy} from "../local-storage.js";
import {SELECT, MILLI, COUNT, CHANGE, elms, g, addEventByClass, isInvalid,
        listenInputNumber, formatInputNumber} from "../common.js";

import {refresh}              from "./_update.js";
import {chart, isOutOfBounds} from "./chart.js";
import {OTHER, pointToString} from "./index.js";

let STEPS;
const
    VALUES = "values",
    TIMING = "timing",
    EASY   = "easy",
    USER   = "user",
    DIV    = "div",
    IDX_LINEAR = 0,
    IDX_EASY   = 1,
    IDX_USER   = 2
;
//==============================================================================
// loadSteps() called by easings.loadIt()
function loadSteps() {
    let i, sel, str;
    STEPS = Easy.type[E.steps]; // must wait for PFactory.init() to run
    Ez.readOnly(elms,
                Ez.toCamel(`${DIV}s`, STEPS),
                document.getElementsByClassName(`${DIV}-${STEPS}`));

    sel = elms.steps;
    for (i = 1; i <= 30; i++)
        sel.add(new Option(i));

    sel = elms.jump;
    for (str of Easy.jump)
        sel.add(new Option(str, E[str]));

    sel.value = E.end;  // the CSS default jump value

    elms.info.addEventListener("click", (evt) => {
        evt.stopImmediatePropagation();
        evt.stopPropagation();
        evt.preventDefault();
    }, true);
}
function loadVT() { // called exclusively by getEasies() during page load
    let arr, clone, div, elm, i, id, lastKid, lbl, min, sel, selNamed, step,
    divUser = elms[Ez.toCamel(USER, STEPS)].firstElementChild;

    for ([id, min, step] of [[VALUES, -100, "1"   ],
                             [TIMING,  0,   ".001"]]) {
        div = elms[Ez.toCamel(DIV, id)];      // divValues, divTiming
        lbl = document.createElement("label");
        lbl.htmlFor     = id;
        lbl.textContent = `${Ez.initialCap(id)}:`;

        sel = document.createElement(SELECT);
        sel.className = STEPS;
        sel.add(new Option("linear"));
        sel.add(new Option("easing"));
        sel.id   = id;
        elms[id] = sel;
        sel.add(new Option(id));

        selNamed = selNamed?.cloneNode(true)  // only non-steps Easys: false
                ?? getNamed(document.createElement(SELECT), undefined, false);

        selNamed.className = `${STEPS} named`;
        lastKid = div.lastElementChild;       // divValues has elms.info
        div.insertBefore(lbl,      lastKid);
        div.insertBefore(sel,      lastKid);
        div.insertBefore(selNamed, lastKid);
        arr = [selNamed, divUser];
        Ez.readOnly(sel, OTHER, arr);
        for (elm of arr)                      // initial state is hidden
            P.visible(elm, false);

        elm = divUser.lastElementChild;       // userValues, userTiming
        arr = [elm];
        for (i = 1; i < COUNT; i++) {
            clone = elm.cloneNode(true);
            divUser.appendChild(clone);
            arr.push(clone);
        }
        if (id == TIMING)   	              // switch from <div> to <input>
            arr = arr.map(e => e.firstElementChild);

        for (i = 0; i < COUNT; i++) {         // arr = [<input type="number">]
            elm      = arr[i];
            elm.id   = id[0] + i;             // "v0-2" or "t0-2"
            elm.min  = min;
            elm.step = step;
        }
        listenInputNumber(arr);
        elms[Ez.toCamel(USER, id)] = arr;
        divUser = divUser.nextElementSibling;
    }
    elms.userValues.forEach(inp => inp.max = MILLI + 100);
    addEventByClass(CHANGE, STEPS, null, changeSteps);
}
function initSteps(obj) {   // called exclusively by initEasies()
    if (!Is.A(obj.values))  // populate elms.userValues with default values
        defUserInputs([VALUES, MILLI / COUNT]);
}
// maxTime() sets the max attribute for the 3 userTiming inputs. It sets all
//           3 the same, which is crude, but viable because it tests rAF's
//           handling of non-ascending timing values. All 3 have .min = 0;
function maxTime() {
    elms.userTiming.forEach(elm => elm.max = secs);
}
// defUserInputs() populates elms.userValues|Timing with default values
function defUserInputs([key, val]) {
    elms[Ez.toCamel(USER, key)].forEach((elm, i) =>
        formatInputNumber(elm, val * (i + 1))
    );
}
//==============================================================================
// changeSteps() handles the change event for #steps, #jump, #values, #timing,
function changeSteps(evt) { // #values/timing.other[0], elms.userValues/Timing.
    const tar = evt.target;
    if (tar === elms.jump || tar === elms.values || tar === elms.timing) {
        const val = tar.value;
        updateVT();
        if (val == TIMING) {
            if (!elms.userTiming[0].value)      // defaults for userTiming[]
                defUserInputs([TIMING, secs / COUNT]);
            //!!else
        }
    }
    else if (isInvalid(tar))    // only applies to userValues/Timing
        return;
    //----------------------------------------
    else if (tar === elms.userTiming.at(-1)) {
        setInfo(tar.valueAsNumber);
        displayInfo(true);
    }

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
    const values = vtFromElm(elms[VALUES]);
    const timing = vtFromElm(elms[TIMING]);
    if (Is.A(values))                   // steps is an array of values
        steps = values;
    else {                              //steps is a number
        steps = Is.A(timing) ? COUNT : Number(elms.steps.value);
        if (values)
            easy = values;
    }
    if ((!timing || !Is.A(timing)) && elms.jump.value != E.end)
        jump = Number(elms.jump.value); // E.end is the CSS default for jump

    return Object.assign(obj, {steps, jump, easy, timing});
}
//==============================================================================
// updateVT() called by stepsFromObj(), refresh(), initEasies()
function updateVT() {
    const isUT  = isUserVT(elms[TIMING]);
    const isUVT = isUT || isUserVT(elms[VALUES]);

    P.displayed(elms.steps, !isUVT);
    P.displayed(elms.count,  isUVT);
    P.visible  (elms.jump.parentNode, !isUT);
    displayInfo(isUT);

    if (!isUVT && !elms.steps.selectedIndex && !elms.jump.selectedIndex)
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
    return sel.selectedIndex == IDX_USER;
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
// postRefresh() cleans up E.steps after pseudoAnimate() runs
function postRefresh(time) {
    if (isSteps()) {
        setInfo(time / MILLI);
        if (elms.jump.value < E.end && elms.roundTrip.checked)
            frames.at(-1).y = Number(elms.end.textContent);
    }
}
// setInfo() sets the text for the info button, displayed when jump < E.end
//           or last user time is less than ezY.time.
function setInfo(lastStep) {
    elms.info.dataset.lastStep = lastStep;
    elms.info.title = `Actual animation duration is ${lastStep.toFixed(D)}s, `
                    + "when the last step occurs.";
}
function displayInfo(isUT = isUserVT(elms[TIMING])) {
    P.displayed(elms.info, (isUT && elms.info.dataset.lastStep < secs)
                       || (!isUT && elms.jump.value < E.end));
}
// isSteps() works for modules in "../" because multi g.type is undefined
function isSteps(val = g.type) { // val only defined by formFromObj()
    return val == E.steps;
}