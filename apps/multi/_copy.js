export {copyCode, copyData};

import {frames} from "../update.js";
import {COUNT}  from "../common.js";
import {multiToText, copyByKey, copyFrameByKey, copyTime}
                from "../copy.js";

import {multiFromObj} from "./index.js";
//==============================================================================
function copyData(txt, keys) {
    let i, f;
    for (i = 0; i < COUNT; i++)
        txt += copyByKey(keys, i);
    for (f of frames) {
        txt += copyTime(f);
        for (i = 0; i < COUNT; i++)
            txt += copyFrameByKey(keys, f.x[i]);
    }
    return txt;
}
//==============================================================================
function copyCode(obj) {
    return multiToText(obj, multiFromObj);
}