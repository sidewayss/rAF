export {formFromObj, objFromForm, updateNamed};
export let objEz;

import {timeFrames}   from "../update.js";
import {COUNT, elms}  from "../common.js";

import {initEasies}         from "./_load.js";
import {OVERRIDES, setEasy} from "./events.js";

import {EASY} from "../easings/steps.js";
//==============================================================================
// For multi, these 2 functions convert between localStorage JSON and the form,
// but the JSON does not convert directly to Easy, Easies, or MEaser, it uses
// the names of three previously stored objects, not the objects themselves.
// Thus index.js has multiFromObj() to create the MEaser object.
//==============================================================================
// formFromObj() updates the form based on obj, <= loadFinally(), openNamed()
function formFromObj(obj) {
    for (var i = 0; i < COUNT; i++)
        setEasy(i, (elms.easy[i].value = obj.easy[i]), obj);
    timeFrames();  // no #time, no input event
    objEz = obj;
}
// objFromForm() called loadFinally(), change.plays/eKey/trip/easy()
function objFromForm(hasVisited = true) {
    let elm, i, id, obj;
    const ids = [EASY, ...OVERRIDES];
    if (!hasVisited) {  // else always defined with the same structure
        objEz = {};
        for (id of ids)
            objEz[id] = new Array(COUNT);
    }
    for (id of ids) {   // assign the form values to objEz
        obj = objEz[id];
        elm = elms[id];
        for (i = 0; i < COUNT; i++)
            obj[i] = elm[i].value;
    }
    return objEz;
}
//==============================================================================
// updateNamed() helps openNamed()
function updateNamed(obj) {
    return initEasies(obj);
}