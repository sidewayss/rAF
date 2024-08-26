export {formFromObj, objFromForm, updateNamed};
export let objEz;

export const
idsPerEasy  = [EASY,         "plays","eKey", "trip"],
defsPerEasy = [DEFAULT_NAME, "",      E.unit, false];

import {E} from "../../raf.js";

import {timeFrames}   from "../update.js";
import {DEFAULT_NAME} from "../named.js";
import {COUNT, elms}  from "../common.js";

import {initEasies} from "./_load.js";
import {set}        from "./events.js";

import {EASY} from "../easings/steps.js";
//==============================================================================
// For multi, these 2 functions convert between localStorage JSON and the form,
// but the JSON does not convert directly to Easy, Easies, or MEaser, it uses
// the names of three previously stored objects, not the objects themselves.
// Thus index.js has multiFromObj() to create the MEaser object.
//==============================================================================
// formFromObj() updates the form based on obj, <= loadFinally(), openNamed()
function formFromObj(obj) {
    let i, id;
    for (id of idsPerEasy)
        for (i = 0; i < COUNT; i++)
            elms[id][i].value = set[id](i, obj[id]?.[i]);

    timeFrames(); // no #time, no input event
    objEz = obj;
}
// objFromForm() is called by change.plays/eKey/trip/easy()
function objFromForm() {
    let arr, def;
    objEz = {};
    idsPerEasy.forEach((id, i) => {
        arr = elms[id];
        def = defsPerEasy[i];
        if (arr.some(elm => elm.value != def))
            objEz[id] = arr.map(elm => elm.value);
    });
    return objEz;
}
//==============================================================================
// updateNamed() helps openNamed()
function updateNamed(obj) {
    return initEasies(obj);
}