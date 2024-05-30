export {loadSteps, loadTV, userValues, stepsFromObj, stepsFromForm, initSteps,
        maxTime, updateTV, tvFromElm, drawSteps, postRefresh, setInfo, isSteps};
export const
    FORMAT_END   = [pad.milli, 0, elms.end],
    FORMAT_START = [pad.milli, 0, elms.start]
;

import {E, Is, Ez, P, Easy} from "../../raf.js";

import {D, pad, frames, secs, formatNumber} from "../update.js";
import {getNamed, getNamedEasy}             from "../local-storage.js";
import {listenInputNumber, formatInputNumber,
        isInvalid}                          from "../input-number.js";
import {SELECT, MILLI, COUNT, CHANGE, INPUT,
        elms, g, addEventByClass}           from "../common.js";

import {chart, refresh}                     from "./_update.js";
import {OTHER, TIMING, EASY, pointToString} from "./index.js";

let STEPS;
const
    VALUES = "values",
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
    Ez.readOnly(elms,           // elms.divsSteps is for updateTypeIO()
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
        // none of those prevent the click, which prevents the hiding of the
        // title/toolsip. Maybe I should pop up something like "Copied!". That
        // would probably mean eliminating the title for hover.
    }, false);
}
function loadTV() { // called exclusively by getEasies() during page load
    let arr, clone, div, elm, i, id, isT, last, lbl, min, sel, selNamed, step,
    divUser = elms[Ez.toCamel(USER, STEPS)].firstElementChild;

    for ([id, min, step, isT] of [[TIMING,  0,   ".001", true],
                                  [VALUES, -100, "1", ]]) {
        div = elms[Ez.toCamel(DIV, id)];      // divTiming, divValues
        lbl = document.createElement("label");
        lbl.htmlFor     = id;
        lbl.textContent = `${Ez.initialCap(id)}:`;

        sel = document.createElement(SELECT);
        sel.className = STEPS;
        sel.id   = id;
        elms[id] = sel;
        for (id of ["linear", "easing", id])  // id retains its value after loop
            sel.add(new Option(id));

        selNamed = selNamed?.cloneNode(true)  // only non-steps Easys: false
                ?? getNamed(document.createElement(SELECT), undefined, false);

        selNamed.className = `${STEPS} named`;
        last = div.lastElementChild;          // divTiming has elms.info
        div.insertBefore(lbl,      last);
        div.insertBefore(sel,      last);
        div.insertBefore(selNamed, last);
        elms[Ez.toCamel(EASY, id)] = selNamed;

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
        if (isT)    	                      // switch from <div> to <input>
            arr = arr.map(e => e.firstElementChild);

        for (i = 0; i < COUNT; i++) {         // arr = [<input type="number">]
            elm      = arr[i];
            elm.id   = id[0] + i;             // "v0-2" or "t0-2"
            elm.min  = min;                   // listenInputNumber() converts
            elm.step = step;                  // .min to .dataset.min
            if (isT)
                elm.nextElementSibling.htmlFor = elm.id
        }
        listenInputNumber(arr);
        elms[Ez.toCamel(USER, id)] = arr;
        divUser = divUser.nextElementSibling;
    }
    elms.userValues.forEach(inp => inp.dataset.max = MILLI + 100);
    addEventByClass(CHANGE, STEPS, null, changeSteps);
    elms.userTiming.at(-1).addEventListener(INPUT, inputLastTime);
}
// inputLastTime() is the input event handler for elms.userTiming.at(-1)
function inputLastTime(evt) {
    if (!isInvalid(evt.target))
        formatNumber(evt.target.valueAsNumber, ...FORMAT_END);
}
// initSteps() is called exclusively by initEasies()
function initSteps(obj) {
    if (!Is.A(obj.steps)) // populate elms.userValues with default values
        defUserInputs([VALUES, MILLI / COUNT]);
}
// maxTime() sets the max attribute for the 3 userTiming inputs. It sets all
//           3 the same, which is crude, but viable because it tests rAF's
//           handling of non-ascending timing values. All 3 have .min = 0;
function maxTime() {
    elms.userTiming.forEach(elm => elm.dataset.max = secs);
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
    switch (tar) {
    case elms.timing: // defaults for userTiming[] depend on variable secs
        if (tar.value == TIMING && !elms.userTiming[0].value)
            defUserInputs([TIMING, secs / COUNT]);
    case elms.values:
        userValues();
    case elms.jump:
        updateTV();
        break;
    case elms.userTiming.at(-1):
        setInfo(tar.valueAsNumber);
        displayInfo(true);
        break;
    default:
        if (isInvalid(tar))
            return;
    }
    refresh(tar);
}
// userValues() helps changeSteps(), stepsFromObj(), change.type()
function userValues(values, isUV = (elms.values.value == VALUES)) {
    const elm = elms.direction;
    if (isUV) {
        const end = Is.def(values)
                  ? values.at(-1)
                  : Number(elms.userValues.at(-1).value);
        formatNumber(0, ...FORMAT_START);
        formatNumber(end, ...FORMAT_END);
        if (elm.selectedIndex)                  // harsh, but straightforward
            elm.selectedIndex = 0;              // the alternatives are messy
        P.visible(elm.parentNode, false);
    }
    else {
        P.visible(elm.parentNode, true);
        formatNumber(elm.selectedIndex? 0 : MILLI, ...FORMAT_END);
    }
}
//==============================================================================
// stepsFromObj() called exclusively by formFromObj()
function stepsFromObj(obj) {
    let isAV, val, sel;
    elms[STEPS].value = obj[STEPS];

    [[TIMING, TIMING, TIMING],
     [STEPS,  VALUES, EASY]].forEach(([ts, tv, te], i) => {
        sel = elms[tv];
        val = obj[ts];
        if (Is.A(val)) {                     // user values or timing
            const inputs  = elms[Ez.toCamel(USER, sel.id)];
            const divisor = getDF(sel);
            for (var i = 0; i < COUNT; i++)
                formatInputNumber(inputs[i], val[i] / divisor);
            sel.selectedIndex = IDX_USER;
            if (i) {                         // values not timing
                userValues(val);
                isAV = true;
            }
        }
        else if (Is.def(obj[te])) {          // empty string is valid
            sel.selectedIndex   = IDX_EASY;
            sel[OTHER][0].value = obj[te];
            obj[te] = getNamedEasy(obj[te]); // guaranteed not to be recursive!!
        } //!!gNE can return undefined!!
        else
            sel.selectedIndex = IDX_LINEAR;
    });
    if (Is.def(obj.jump))
        elms.jump.value = obj.jump;

    updateTV();         // relies on sel.selectedIndex
    g.type = E.steps;
    g.io   = E.in;
    return isAV;        // helps formFromObj() handle start, end, direction
}
// stepsFromForm() called exclusively objFromForm()
function stepsFromForm(obj) {
    let easy, jump, steps;
    const timing = tvFromElm(elms[TIMING]);
    const values = tvFromElm(elms[VALUES]);
    if (Is.A(values)) {                 // steps is an array of values
        steps = values;
        delete obj.start;               // the steps array supercedes these
        delete obj.end;
    }
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
// updateTV() called by stepsFromObj(), refresh(), initEasies()
function updateTV() {
    const
    isUT  = isUserTV(elms[TIMING]),
    isUTV = isUT || isUserTV(elms[VALUES]);

    displayInfo(isUT);
    P.displayed(elms.count,  isUTV);  // the disabled <select>, fixed at 3
    P.displayed(elms.steps, !isUTV);
    P.displayed(elms.jump.parentNode, !isUT);

    if (!isUTV && !elms.steps.selectedIndex && !elms.jump.selectedIndex)
        elms.steps.selectedIndex = 1; // {steps:1, jump:E.none} is not valid

    let id, idx, sel;
    for (id of [TIMING, VALUES]) {
        sel = elms[id];
        idx = sel.selectedIndex - 1;
        sel[OTHER].forEach((elm, i) => P.visible(elm, i == idx));
    }
}
// isUserTV() called by updateTV(), tvFromElm()
function isUserTV(sel) {
    return sel.selectedIndex == IDX_USER;
}
// tvFromElm() called by stepsFromForm(), isOutOfBounds()
function tvFromElm(sel, useName) {
    let tv;
    if (isUserTV(sel)) { // userValues or userTiming
        const inputs = elms[Ez.toCamel(USER, sel.id)];
        const factor = getDF(sel);
        tv = new Array(COUNT);
        for (let i = 0; i < COUNT; i++)
            tv[i] = inputs[i].valueAsNumber * factor;
    }
    else if (sel.selectedIndex == IDX_EASY) { // easyValues or easyTiming
        const name = sel[OTHER][0].value;
//!!        if (name)        // in case .selectedIndex == -1
        tv = useName ? name : getNamedEasy(name); // guaranteed not recursive!!//!!gNE can return undefined!!
//!!        else
//!!            ;            //!!
    }
    return tv;            // else linear: tv is undefined
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
function displayInfo(isUT) {
    P.displayed(elms.info, (isUT && elms.info.dataset.lastStep < secs)
                       || (!isUT && elms.jump.value < E.end));
}
// isSteps() works for modules in "../" because multi g.type is undefined
function isSteps(val = g.type) { // val only defined by formFromObj()
    return val == E.steps;
}