export {copyCode, copyData};

import {getFrames} from "../update.js";
import {easyToText, copyByKey, copyFrameByKey, copyTime,} from "../copy.js";

import {shallowClone} from "./events.js";
import {isSteps}      from "./steps.js";
//==============================================================================
function copyData(txt, keys) {
    txt += "\ty";
    txt += copyByKey(keys);
    for (const f of getFrames())
        txt += copyTime(f) + `\t${f.y}` + copyFrameByKey(keys, f);
    return txt;
}
//==============================================================================
function copyCode(obj) {
    return easyToText("easy", shallowClone(obj), isSteps());
}                  // "easy" here, "ez" there...
