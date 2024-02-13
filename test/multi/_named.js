// export: everything via import(), explicit: objFromForm, all functions
export {formFromObj, objFromForm, updateNamed};

import {DEFAULT_NAME} from "../named.js";
import {COUNT, elms}  from "../common.js";

import {initEasies} from "./_load.js";
import {setEasy}    from "./events.js";
import {OVERRIDES}  from "./index.js";
//==============================================================================
// For multi, these 2 functions convert between localStorage JSON and the form,
// but the JSON does not convert directly to Easy, Easies, or MEaser, it uses
// the names of three previously stored objects, not the objects themselves.
// Thus index.js has meFromForm() to create the MEaser object.
//==============================================================================
// formFromObj() <= loadFinally(), openNamed()
function formFromObj(obj) {
    for (var i = 0; i < COUNT; i++)
        setEasy(i, obj.names[i], obj); // update the form controls, layout
    return obj;
}
// objFromForm() <= loadFinally(), storeCurrent(), clickCode(), meFromForm()
function objFromForm(hasVisited = true) {
    let i, id, iElm, name;
    const obj = {};

    for (name of ["names", ...OVERRIDES])
        obj[name] = new Array(COUNT);

    name = DEFAULT_NAME;
    iElm = 0;
    for (i = 0; i < COUNT; i++) {
        if (hasVisited) {
            name = elms.easy[i].value;
            iElm = i;
        }
        obj.names[i] = name;
        for (id of OVERRIDES)
            obj[id][i] = elms[id][iElm].value;
    }
    return obj;
}
//==============================================================================
// updateNamed() helps openNamed()
function updateNamed() {
    return initEasies();
}