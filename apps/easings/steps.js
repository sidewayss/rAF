export {loadSteps, loadTV, stepsFromObj, stepsFromForm, initSteps, isSteps,
        wasIsSteps, toggleUser, isUserTV, updateTV, tvFromElm, setInfo,
        infoZero, displayJump};

export let FORMAT_END;
export const
EASY   = "easy",
TIMING = "timing";

import {E, Is, Ez, P} from "../../src/raf.js";

import {D, pad, secs, formatNumber, timeFrames, updateTime} from "../update.js";
import {getNamed, getNamedEasy}                             from "../local-storage.js";
import {MILLI, COUNT, SELECT, DIV, LABEL, CHANGE, elms, g, addEventByClass}
                                                            from "../common.js";

import {range, wasStp, refresh} from "./_update.js";
import {changeTime}             from "./chart.js"
import {OTHER}                  from "./index.js";

let STEPS, lastUserTime, wasUT;
const
VALUES = "values",
USER   = "user",
IDX_LINEAR = 0,
IDX_EASY   = 1,
IDX_USER   = 2;
//==============================================================================
// loadSteps() called by easings.load()
function loadSteps() {
    let i, sel, str;
    FORMAT_END = [pad.milli, 0, elms.end];

    STEPS = E.type[E.steps]; // must wait for PFactory.init() to run
    Ez.readOnly(elms,           // elms.divsSteps is for updateTypeIO()
                Ez.toCamel(`${DIV}s`, STEPS),
                document.getElementsByClassName(`${DIV}-${STEPS}`));

    sel = elms[STEPS];
    for (i = 1; i <= 30; i++)
        sel.add(new Option(i));

    sel = elms.jump;
    for (str of E.jump)
        sel.add(new Option(str, E[str]));

    sel.value = E.end;  // the CSS default jump value

//@@elms.info.addEventListener("click", (evt) => {
//@@    evt.stopImmediatePropagation();
//@@    evt.stopPropagation();
//@@    evt.preventDefault();
//@@    // none of those prevent the click, which prevents the hiding of the
//@@    // title/toolsip. Maybe I should pop up something like "Copied!". That
//@@    // would probably mean eliminating the title for hover.
//@@}, false);
}
function loadTV() { // called exclusively by getEasies() during page load
    let arr, clone, div, divUser, elm, func, i, id, isT, last, lbl, max, min,
        sel, selNamed, userTV;

    for ([id, min, max, isT] of
        [[TIMING,    0, elms.time.max / MILLI, true],
         [VALUES, -100, MILLI + 100, ]])
    {
        lbl = document.createElement(LABEL);
        lbl.htmlFor     = id;
        lbl.textContent = `${Ez.initialCap(id)}:`;

        sel = document.createElement(SELECT);
        sel.className = STEPS;
        sel.id   = id;
        elms[id] = sel;
        for (id of ["linear", "easing", id])   // id retains its value post-loop
            sel.add(new Option(id));

        selNamed = selNamed?.cloneNode(true)   // only non-steps Easys: false
                ?? getNamed(document.createElement(SELECT), ...[,,false]);

        selNamed.className = `${STEPS} named`;
        elms[Ez.toCamel(EASY, id)] = selNamed; // easyTiming, easyValues

        div  = elms[Ez.toCamel(DIV, id)];      // divTiming, divValues
        last = div.lastElementChild;
        div.insertBefore(lbl,      last);
        div.insertBefore(sel,      last);
        div.insertBefore(selNamed, last);

        userTV  = Ez.toCamel(USER, id);
        divUser = elms[Ez.toCamel(DIV, userTV)];
        arr  = [selNamed, divUser];
        Ez.readOnly(sel, OTHER, arr);

        elm = divUser.lastElementChild;        // userValues, userTiming
        arr = [elm];
        for (i = 1; i < COUNT; i++) {
            clone = elm.cloneNode(true);
            divUser.appendChild(clone);
            arr.push(clone);
        }
        if (isT)    	                       // switch from <div> to <input>
            arr = arr.map(e => e.firstElementChild);

        for (i = 0; i < COUNT; i++) {          // arr = [<input type="number">]
            elm      = arr[i];
            elm.id   = id[0] + i;              // "v0-2" or "t0-2"
            elm.min  = min;
            elm.max  = max;
        }
        elms[userTV] = arr;                    // elms.userTiming, .userValues
    }
    addEventByClass(CHANGE, STEPS, null, changeSteps);

    lastUserTime = elms.userTiming.at(-1);
    lastUserTime.addEventListener(CHANGE, changeLastTime);
    lastUserTime.addEventListener(CHANGE, changeTime);

    elms.userValues.at(-1).addEventListener(CHANGE, changeLastValue);
}
// tvShowHide() helps loadTV() and updateTV(). isT = isTiming vs Values
function tvShowHide(isT) { return isT ? P.visible : P.displayed; }
//==============================================================================
// changeLastTime() is the change event handler for lastUserTime
function changeLastTime(evt) {
    timeFrames(evt.target.value * MILLI);
}
// changeLastValue() is the change event handler for elms.userValues.at(-1)
function changeLastValue(evt) {
    formatNumber(evt.target.value, ...FORMAT_END);
}
// defUserInputs() populates elms.userValues|Timing with default values
function defUserInputs([key, val]) {
    elms[Ez.toCamel(USER, key)].forEach((elm, i) =>
        elm.value = val * (i + 1)
    );
}
// initSteps() is called exclusively by initEasies()
function initSteps(obj) {
    if (!Is.A(obj[STEPS])) // populate elms.userValues with default values
        defUserInputs([VALUES, MILLI / COUNT]);
//!!if (isSteps())        // display the right stuff
//!!    wasIsSteps(false, true);
}
//==============================================================================
// isSteps() works for modules in "../" because multi g.type is undefined
function isSteps(val = g.type) { // val only defined by formFromObj()
    return val == E.steps;
}
// wasIsSteps() helps fromFromObj(), change.type() switch to/from type:E.steps,
//              assumes was != is, callers ensure that one is always true.
function wasIsSteps(is, isU) {           // isU = [isUT, isUV], order critical
    P.visible  (elms.drawAsSteps, !is);
    P.displayed(elms.initZero,     is);
    [TIMING, VALUES].forEach((id, i) =>  // order is critical for !i below
        toggleUser(elms[id], !i, is && isU[i], wasStp && isU[i])
    );
}
// toggleUser() helps wasIsSteps(), changeSteps(), formFromObj() handle toggling
//              to/from user timing and values, is and was are independent.
//              was argument is wasSteps or wasUser, depending on the caller.
function toggleUser(sel, isT, is  = isUserTV(sel),
                              was = P.isDisplayed(sel[OTHER][1])) {
    let val;
    if (is)
        val = elms[Ez.toCamel(USER, sel.id)].at(-1).value;
    else if (was)
        val = isT ? undefined : (elms.swap.value ? 0 : MILLI);
    else
        return false;
    //----------------------------
    if (isT) {
        P.visible(elms.time, was); // undefined = getMsecs()
        timeFrames(is ? val * MILLI : undefined);
    }
    else
        formatNumber(val, ...FORMAT_END);

    return is;
}
//==============================================================================
// changeSteps() handles the change event for #steps, #jump, #values, #timing,
function changeSteps(evt) { // #values/timing.other[0], elms.userValues/Timing.
    let isUT, isUV;
    const tar  = evt.target;
    switch (tar) {
    case elms[TIMING]:
        isUT = isUserTV(tar);
        if (isUT && !lastUserTime.value) {
            defUserInputs([TIMING, secs / COUNT]);  // defaults for userTiming[]
            setInfo(lastUserTime.value);    // depend on variable secs.
        }
        toggleUser(tar, true, isUT);
        updateTV();
        if (isUT || wasUT)
            updateTime();
        wasUT = isUT;
        break;
    case elms[VALUES]:
        isUV = toggleUser(tar); // fall-through intentional
    case elms.jump:
        updateTV(isUT, isUV);
        break;
    case lastUserTime:
        setInfo(tar.value);
        infoZero(true, true);
        break;
    default:
    }
    refresh(tar);
}
//==============================================================================
// stepsFromObj() called exclusively by formFromObj()
function stepsFromObj(obj, hasVisited) {
    let j, sel, val;
    const
    isUser  = [false, false],
    wasUser = [wasStp && wasUT, wasStp && isUserTV(elms[VALUES])];

    [[TIMING, TIMING, TIMING],
     [STEPS,  VALUES, EASY]].forEach(([ts, tv, te], i) => {
        val = obj[ts];
        sel = elms[tv];
        if (Is.A(val)) {                     // user values or timing
            const inputs  = elms[Ez.toCamel(USER, sel.id)],
                  divisor = getDF(sel);
            for (j = 0; j < COUNT; j++)
                inputs[j].value = val[j] / divisor;
            sel.selectedIndex = IDX_USER;
            isUser[i] = true;
        }
        else if (Is.def(obj[te])) {          // empty string is valid
            sel.selectedIndex   = IDX_EASY;
            sel[OTHER][0].value = obj[te];
            obj[te] = getNamedEasy(obj[te]); // guaranteed not to be recursive!!
        }         //!!gNE can return undefined!!
        else
            sel.selectedIndex = IDX_LINEAR;
    });
    if (obj[STEPS] && !isUser.some(v=>v))    // user timing|values means
        elms[STEPS].value = obj[STEPS];      // obj.steps is ignored.
    if (Is.def(obj.jump))                    // user timing, eased values means
        elms.jump.value = obj.jump;          // obj.jump is ignored.

    updateTV(...isUser, hasVisited);         // relies on sel.selectedIndex
    wasUT = isUser[0];
//!!g.type = E.steps;
//!!g.io   = E.in;
    return [...isUser, ...wasUser];
}
// stepsFromForm() called exclusively objFromForm(), never called if !hasVisited
function stepsFromForm(obj) {
    let easy, jump, steps;
    const
    timing = tvFromElm(elms[TIMING]),
    values = tvFromElm(elms[VALUES]),
    isAT   = Is.A(timing),
    isAV   = Is.A(values);

    if (isAV) {                         // steps is an array of values
        steps = values;
        obj.end = values.at(-1);
        formatNumber(obj.end, ...FORMAT_END);
    }
    else {                              //steps is a number
        if (!isAT)
            steps = Number(elms[STEPS].value);
        if (values)
            easy = values;
    }
    if (isAT)                           // avoid a console.info() in override()
        delete obj.time;
    else if (elms.jump.value != E.end)  // E.end is the CSS default for jump
        jump = Number(elms.jump.value); // so leave jump undefined for E.end
                                        // property order must match presets
    return Object.assign(obj, {steps, jump, timing, easy});
}
//==============================================================================
// updateTV() called by stepsFromObj(), changeSteps()
function updateTV(isUT = isUserTV(elms[TIMING]),
                  isUV = isUserTV(elms[VALUES]),
                  hasVisited)
{
    let func, idx, sel;
    const isUTV = isUT || isUV;

    infoZero(isUT, false, hasVisited);
    P.visible(elms[STEPS], !isUTV);
    if (!isUTV && !elms[STEPS].selectedIndex && !elms.jump.selectedIndex)
        elms[STEPS].selectedIndex = 1;  // {steps:1, jump:E.none} is not valid

    [TIMING, VALUES].forEach((id, i) => {
        sel  = elms[id];
        idx  = sel.selectedIndex - 1;
        func = tvShowHide(!i);          // P.visible() or P.displayed()
        sel[OTHER].forEach((elm, j) => func(elm, j == idx));
    });
}
// isUserTV() returns true if sel has "timing" or "values" selected
function isUserTV(sel) {
    return sel.selectedIndex == IDX_USER;
}
// tvFromElm() returns an array of COUNT numbers, a name, an Easy, or undefined
//             called by stepsFromForm(), isOutOfBounds()
function tvFromElm(sel, useName) {
    let tv;
    if (isUserTV(sel)) {                      // userValues or userTiming:
        const
        inputs = elms[Ez.toCamel(USER, sel.id)],
        factor = getDF(sel);

        tv = Array(COUNT);                    // an array of numbers
        for (let i = 0; i < COUNT; i++)
            tv[i] = inputs[i].value * factor;
    }
    else if (sel.selectedIndex == IDX_EASY) { // easyValues or easyTiming:
        const name = sel[OTHER][0].value;
        tv = useName ? name                   // a string name
                     : getNamedEasy(name);    // an Easy instance or undefined
    }                                         // else linear = undefined
    return tv;
}
function getDF(sel) { // divisor or factor
    return (sel.id == VALUES) ? 1 : MILLI;
}
//==============================================================================
// setInfo() sets the text for the info button, displayed when jump < E.end
//           or last user time is less than ezY.time.
function setInfo(lastStep) {
    elms.info.title = `Actual animation duration is ${lastStep.toFixed(D)}s, `
                    + "when the last step occurs.";
}
// infoZero() displays elms.info, disables elms.initZero, which are steps-only
function infoZero(isUT, isLastTime, hasVisited) {
    const
    isEV = elms[VALUES].selectedIndex == IDX_EASY,
    not2 = !isUT && !isEV,
    jump = Number(elms.jump.value);

    P.displayed(elms.info, (not2 && jump < E.end)
                        || (isUT && lastUserTime.value < secs));

    if (!isLastTime) {     // isLastTime = changeSteps(lastUserTime)
        elms.initZero.disabled = isUT || !(jump & E.start);
        P.displayed(elms.jump.parentNode.children, not2);
        if (!Is.def(hasVisited))
            displayJump(not2);
    }                      // parentNode is in elms.divSteps, see updateTypeIO()
}
// displayJump() hides the "Jump:" label when the window is not wide enough
function displayJump(isDisplayed) {
    if (isDisplayed) {
        const
        j = elms.jump,
        y = range.svg,
        b = y.getBoundingClientRect().right
          - j.getBoundingClientRect().right
          > 0;
        P.displayed(j.labels[0], b);
    }
}