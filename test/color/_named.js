export {formFromObj, objFromForm, updateNamed};
export let objEz;

import {getNamedObj} from "../local-storage.js";
import {elms}         from "../common.js";

import {initEasies}   from "./_load.js";
//===============================================
function formFromObj(obj) {
    objEz = obj;
}
function objFromForm() {
    objEz = getNamedObj(elms.named.value);
    return objEz;
}
function updateNamed(obj) {
    return initEasies(obj);
}