export {formFromObj, objFromForm, updateNamed, ok};
export let objEz;

import {E, Ez, Is}  from "../../src/raf.js"

import {formatNumber} from "../update.js";
import {INPUT, elms, g, orUndefined, elseUndefined} from "../common.js";

import {wasStp, theStart, theEnd}             from "./_update.js";
import {FORMAT_START, swapIt}                 from "./chart.js";
import {shallowClone}                         from "./events.js";
import {MSG, disableClear}                    from "./msg.js";
import {initEzXY, updateTrip}                 from "./index.js";
import {easingFromObj, easingFromForm, getDF} from "./not-steps.js";
import {FORMAT_END, stepsFromObj, stepsFromForm, wasIsSteps, isSteps, toggleUser}
                                              from "./steps.js";
//==============================================================================
// formFromObj() populates the form, sets globals, <= loadFinally(), openNamed()
function formFromObj(obj, hasVisited) {
    let elm, id, isDefN, n, val;
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

    const
    leg0 = obj.legs?.[0],
    leg1 = obj.legs?.[1],
    type = obj.type ?? leg0?.type ?? E.linear;

    g.type = type;
    g.io   = obj.io ?? (leg0 ? Ez.joinIO(leg0.io, leg1.io) : E.in);
    elms.type.value = g.type;
    elms.io  .value = g.io;

    val = obj.time || (leg0?.time + leg1?.time + leg1?.wait);
    if (val)                   // steps: user time doesn't use obj.time
        elms.time.value = val;
    elms.time.dispatchEvent(new Event(INPUT)); // input.time()=>timeFrames()

    const isStp = isSteps(type);
    if (!isStp || Is.def(hasVisited)) {        // if (isStp) legs are undefined:
        [leg0?.end, leg0?.time, leg1?.wait].forEach((v, i) => {
            id  = MSG[i];                      // #mid, #split, #gap
            elm = elms[id];
            n   = v ?? obj[id];                // leg falls back to obj...
            isDefN = Is.def(n)
            val    = isDefN ? n / getDF(id)
                            : elm.default();   // ...falls back to elm.default()
            elm.value = val;
            disableClear(elm, val, isDefN);    // must run if (Is.def(hasV))
        });
    }
    const
    start = obj.start ?? leg0?.start ?? 0,
    func  = isStp ? stepsFromObj : easingFromObj,
    [isUT, isUV, wasUT, wasUV] = func(obj, hasVisited, leg0, leg1);

    swapIt(Boolean(start));
    formatNumber(start, ...FORMAT_START);
    if (isStp != wasStp)
        wasIsSteps(isStp, [isUT, isUV]);       // if (isUT) 2nd timeFrames()
    else if (isStp) {
        if (isUT != wasUT)
            toggleUser(elms.timing, true, isUT, wasUT);  // 2nd timeFrames()
        // the else is simpler w/o if (isUV != wasUV)
        toggleUser(elms.values, false, isUV, wasUV);
    }
    else // timeFrames() already ran, so only end here
        formatNumber(obj.end ?? leg1.end, ...FORMAT_END);

    objEz = obj;
}
//==============================================================================
// objFromForm() creates an object from form element values
//               called by clickCode(), refresh()
function objFromForm() {
    let autoTrip, flipTrip, loopWait, plays, tripWait;
    const
    end       = theEnd(),
    start     = orUndefined(theStart()),
    loopByElm = orUndefined(elms.loopByElm.checked),
    roundTrip = orUndefined(elms.roundTrip.checked);

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
                        // obj.time deleted by stepsFromForm() if user timing
    const obj  = {      // object property order significant relative to presets
        time:elms.time.valueAsNumber, // stepsFromForm() can delete obj.time
        type:orUndefined(g.type),
        io  :orUndefined(g.io),
        start, end, plays, loopWait, loopByElm,
        roundTrip, autoTrip, flipTrip, tripWait
    };
    objEz = (isSteps() ? stepsFromForm : easingFromForm)(obj);
    return objEz;
}
//==============================================================================
// updateNamed is called exclusively by openNamed()
function updateNamed(obj) {
    if (!initEzXY(obj)) return false;
    //--------------
    updateTrip();   // updateAll() only calls it if (isLoading)
    return true;
}
//==============================================================================
// ok() is called exclusively by clickOk()
function ok(name) {
    const
    isStp = isSteps(),          // easyValues, easyTiming exclude E.steps
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