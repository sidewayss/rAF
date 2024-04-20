// export: everything via dynamic import(), static import: objFromForm
export {formFromObj, objFromForm, updateNamed, ok};
export let objEz;

import {E, Is} from "../../raf.js"

import {msecs, pad}   from "../update.js";
import {DEFAULT_NAME} from "../named.js";
import {MILLI, INPUT, elms, g, formatNumber, orUndefined, elseUndefined}
                      from "../common.js";

import {setNoWaits}                             from "./events.js";
import {easingFromObj, easingFromForm}          from "./not-steps.js";
import {stepsFromObj,  stepsFromForm, isSteps}  from "./steps.js";
import {initEzXY,      updateTrip,    isBezier} from "./index.js";
//==============================================================================
// formFromObj() populates the form, sets globals, <= loadFinally(), openNamed()
function formFromObj(obj) {
    let elm, val;
    const legs  = obj.legs;
    const start = obj.start ?? obj.legs?.[0].start ?? 0;
    const end   = obj.end   ?? obj.legs?.[1].end   ?? MILLI;

    formatNumber(start, pad.milli, 0, elms.start);
    formatNumber(end,   pad.milli, 0, elms.end);

    g.type = obj.type ?? obj.legs?.[0].type ?? E.linear;
    if (Is.def(obj.io))
        g.io = obj.io;
    else if (legs)
        g.io = legs[0].io ? (legs[1].io ? E.outOut : E.outIn)
                          : (legs[1].io ? E.inOut  : E.inIn);
    else
        g.io = E.linear;    // Easy.prototype's default value

    elms.io       .value = g.io;
    elms.type     .value = g.type;
    elms.time     .value = obj.time;
    elms.plays    .value = obj.plays    ?? 1;
    elms.loopWait .value = obj.loopWait ?? 0;
    elms.direction.value = start < end ? DEFAULT_NAME : 1;
    for (elm of g.trips) {  // roundTrip and related elements
        val = obj[elm.id];
        if (elm.isCheckBox) // <check-box>
            elm.checked = Is.def(val) || elm === elms.roundTrip
                        ? val     // roundTrip default = false
                        : true;   // autoTrip, flipTrip default = true
        else                // <select>
            elm.value = val ?? 0; // tripWait default = 0
    }
    elms.loopByElm.checked = obj.loopByElm;
    elms.time.dispatchEvent(new Event(INPUT));
    setNoWaits();
    (isSteps(obj.type) ? stepsFromObj : easingFromObj)(obj, legs);
    objEz = obj;
}
// objFromForm() creates an object from form element values,
//               called by loadFinally(), clickCode().
function objFromForm(hasVisited = true) {
    let autoTrip, flipTrip, loopWait, plays, tripWait;
    const start = Number(elms.start.textContent);
    const end   = Number(elms.end  .textContent);
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

    if (!hasVisited) { // g.type, g.io referenced in easingFromForm()
        g.type = Number(elms.type.value);
        g.io   = isBezier() || isSteps() ? E.in : Number(elms.io.value);
    }
    const func = isSteps() ? stepsFromForm : easingFromForm;
    const obj  = {time:msecs, type:orUndefined(g.type), io:orUndefined(g.io),
                  start, end, plays, loopWait, loopByElm,
                  roundTrip, autoTrip, flipTrip, tripWait};

    objEz = func(obj, true);
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
}