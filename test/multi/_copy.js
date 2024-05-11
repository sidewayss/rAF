export {copyCode, copyData};

import {getFrames} from "../update.js";
import {COUNT}     from "../common.js";
import {multiToText, copyByKey, copyFrameByKey, copyTime}
                   from "../copy.js";

import {multiFromObj} from "./index.js";
//==============================================================================
function copyData(txt, keys) {
    let i, f;
    for (i = 0; i < COUNT; i++)
        txt += copyByKey(keys, i);
    for (f of getFrames()) {
        txt += copyTime(f);
        for (i = 0; i < COUNT; i++)
            txt += copyFrameByKey(keys, f.x[i]);
    }
}
//==============================================================================
function copyCode(obj) {
    return multiToText(obj, multiFromObj);
}