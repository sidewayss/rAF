export {formFromObj, objFromForm, updateNamed, ok};
export let objEz;

import {E, Is, P} from "../../raf.js"

import {msecs, formatNumber}                        from "../update.js";
import {INPUT, elms, g, orUndefined, elseUndefined} from "../common.js";

import {wasStp}                        from "./_update.js";
import {shallowClone, setNoWaits}      from "./events.js";
import {initEzXY, updateTrip}          from "./index.js";
import {easingFromObj, easingFromForm} from "./not-steps.js";
import {FORMAT_END, FORMAT_START, stepsFromObj, stepsFromForm, wasIsSteps,
        isSteps}                       from "./steps.js";
const
funcFromObj  = [easingFromObj,  stepsFromObj],
funcFromForm = [easingFromForm, stepsFromForm];
//==============================================================================
// formFromObj() populates the form, sets globals, <= loadFinally(), openNamed()
function formFromObj(obj) {
    let elm, val;
    const
    leg0  = obj.legs?.[0],
    leg1  = obj.legs?.[1];
    g.type = obj.type ?? leg0?.type ?? E.linear;
    if (Is.def(obj.io))
        g.io = obj.io;
    else if (leg0)
        g.io = leg0.io ? (leg1.io ? E.outOut : E.outIn)
                       : (leg1.io ? E.inOut  : E.inIn);
    else
        g.io = E.in;           // Easy.prototype's default value

    elms.io  .value = g.io;
    elms.type.value = g.type;
    elms.time.value = obj.time ?? (leg0 ? leg0.time + leg1.time
                                        : elms.time.max / 2);
    elms.time.dispatchEvent(new Event(INPUT));

    const                       // funcFromObj[n]() must follow input.time()
    isStp = isSteps(),
    end   = funcFromObj[Number(isStp)](obj, leg0, leg1)
          ? elms.userValues.at(-1).valueAsNumber  // obj.steps is an array
          : obj.end   ?? leg1?.end   ?? MILLI,    // never falls back to MILLI
    start = obj.start ?? leg0?.start ?? 0;

    formatNumber(start, ...FORMAT_START);
    formatNumber(end,   ...FORMAT_END);
    elms.direction.selectedIndex = start > end;

    if (isStp !== wasStp)
        wasIsSteps(wasStp, isStp);

    for (elm of g.trips) {     // roundTrip and related elements
        val = obj[elm.id];
        if (elm.isCheckBox)    // <check-box>
            elm.checked = Is.def(val) || elm === elms.roundTrip
                        ? val     // roundTrip default = false
                        : true;   // autoTrip, flipTrip default = true
        else                   // <select>
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
//               called by loadFinally(), clickCode(), refresh().
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

    // type can only be changing when called by change.type()=>refresh()
    // loadFinally() only calls if !hasVisited and g.type == E.linear
    // so unless !hasVisited, g.type is already set previously
    if (!hasVisited) { // g.type, g.io referenced in easingFromForm()
        g.type = Number(elms.type.value);
        g.io   = Number(elms.io.value);
    }                  // obj.time deleted by stepsFromForm() if user timing
    const obj  = {time:msecs, type:orUndefined(g.type), io:orUndefined(g.io),
                  start, end, plays, loopWait, loopByElm,
                  roundTrip, autoTrip, flipTrip, tripWait};

    objEz = funcFromForm[Number(isSteps())](obj, hasVisited);
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
function ok(name) {             // called exclusively by clickOk(), easings only
    const                       // easyValues, easyTiming exclude E.steps
    isStp = isSteps(),
    vals  = Array.from(elms.easyValues.options)
                 .map (opt => opt.value);

    let i = vals.indexOf(name);
    if (i < 0) {                // new name
        if (!isStp) {           // maintain a-z sort order
            const opt = new Option(name);
            i = vals.findIndex(v => v > name);
            elms.easyValues.add(opt, i);
            elms.easyTiming.add(opt, i);
        }
    }
    else if (isStp) {           // existing name
        elms.easyValues.remove(i);
        elms.easyTiming.remove(i);
    }
    return shallowClone(objEz);
}