export {objFromForm, updateNamed};

import {getNamedJSON} from "../local-storage.js";
import {elms}         from "../common.js";

import {initEasies}   from "./_load.js";
//==============================================================================
function objFromForm() {
    return getNamedJSON(elms.named.value);
}
function updateNamed(obj) {
    return initEasies(obj);
}