export {formFromObj, objFromForm, updateNamed, ok};
export let objEz;

import {E, Is, P} from "../../raf.js"

import {msecs}        from "../update.js";
import {DEFAULT_NAME} from "../named.js";
import {INPUT, elms, g, formatNumber, orUndefined, elseUndefined}
                      from "../common.js";

import {shallowClone, setNoWaits}      from "./events.js";
import {isBezierOrSteps}               from "./tio-pow.js";
import {initEzXY, updateTrip}          from "./index.js";
import {easingFromObj, easingFromForm} from "./not-steps.js";
import {FORMAT_END, FORMAT_START, stepsFromObj, stepsFromForm, updateTV,
        isSteps}                       from "./steps.js";
//==============================================================================
// formFromObj() populates the form, sets globals, <= loadFinally(), openNamed()
function formFromObj(obj) {
    let elm, end, start, val;
    const
    legs = obj.legs,
    func = isSteps(obj.type) ? stepsFromObj : easingFromObj,
    notA = !func(obj, legs); // if Is.A(obj.steps) stepsFromObj() returns true

    P.visible(elms.direction.parentNode, notA);
    if (notA) {
        start = obj.start ?? legs?.[0].start ?? 0;
        end   = obj.end   ?? legs?.[1].end;
        formatNumber(start, ...FORMAT_START);
        formatNumber(end,   ...FORMAT_END);

        elms.direction.value = start < end ? DEFAULT_NAME : 1;
    }

    g.type = obj.type ?? legs?.[0].type ?? E.linear;
    if (Is.def(obj.io))
        g.io = obj.io;
    else if (legs)
        g.io = legs[0].io ? (legs[1].io ? E.outOut : E.outIn)
                          : (legs[1].io ? E.inOut  : E.inIn);
    else
        g.io = E.in;         // Easy.prototype's default value

    elms.io  .value = g.io;
    elms.type.value = g.type;
    elms.time.value = obj.time;
    elms.time.dispatchEvent(new Event(INPUT));

    for (elm of g.trips) {   // roundTrip and related elements
        val = obj[elm.id];
        if (elm.isCheckBox)  // <check-box>
            elm.checked = Is.def(val) || elm === elms.roundTrip
                        ? val     // roundTrip default = false
                        : true;   // autoTrip, flipTrip default = true
        else                 // <select>
            elm.value = val ?? 0; // tripWait default = 0
    }
    elms.plays   .value    = obj.plays    ?? 1;
    elms.loopWait.value    = obj.loopWait ?? 0;
    elms.loopByElm.checked = obj.loopByElm;
    setNoWaits();
    objEz = obj;
}
//==============================================================================
// objFromForm() creates an object from form element values,
//               called by loadFinally(), clickCode().
function objFromForm(hasVisited = true) {
    let autoTrip, flipTrip, loopWait, plays, tripWait;
    const end   = Number(elms.end.textContent);
    const start = orUndefined(Number(elms.start.textContent));
    const loopByElm = orUndefined(elms.loopByElm.checked);
    const roundTrip = orUndefined(elms.roundTrip.checked);

    if (roundTrip) {   // autoTrip and flipTrip default to true
        autoTrip = elseUndefined(!elms.autoTrip.checked, false);
        flipTrip = elseUndefined(!elms.flipTrip.checked, false);
        tripWait = orUndefined(Number(elms.tripWait.value));
    }

    plays = Number(elms.plays.value);
    if (plays > 1)
        loopWait = orUndefined(Number(elms.loopWait.value));
    else
        plays = undefined;

    const [_, isStp, isBS] = isBezierOrSteps();
    if (!hasVisited) { // g.type, g.io referenced in easingFromForm()
        g.type = Number(elms.type.value);
        g.io   = isBS ? E.in : Number(elms.io.value);
        if (isStp)
            updateTV();
    }
    const obj  = {time:msecs, type:orUndefined(g.type), io:orUndefined(g.io),
                  start, end, plays, loopWait, loopByElm,
                  roundTrip, autoTrip, flipTrip, tripWait};

    objEz = (isStp ? stepsFromForm : easingFromForm)(obj);
    return objEz;
}
//==============================================================================
function updateNamed(obj) {
    if (!initEzXY(obj)) return false;
    //----------------
    updateTrip();   // updateAll() only calls it if (isLoading)
    return true;
}
//==============================================================================
function ok(name) {            // called exclusively by clickOk(), easings only
    const isStp = isSteps();   // easeValues, easeTiming exclude E.steps
    const vals  = Array.from(elms.easeValues.options)
                       .map (opt => opt.value);
    i = vals.indexOf(name);
    if (i < 0) {               // new name
        if (!isStp) {          // maintain a-z sort order
            const opt = new Option(name);
            i = vals.findIndex(v => v > name);
            elms.easeValues.add(opt, i);
            elms.easeTiming.add(opt, i);
        }
    }
    else if (isStp) {          // existing name
        elms.easeValues.remove(i);
        elms.easeTiming.remove(i);
    }
    return shallowClone(objEz);
}