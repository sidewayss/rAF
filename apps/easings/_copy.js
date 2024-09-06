export {copyCode, copyData};

import {frames} from "../update.js";
import {easyToText, copyByKey, copyFrameByKey, copyTime}
                   from "../copy.js";

import {rafChecks}    from "./_load.js";
import {isInitZero}   from "./_update.js";
import {shallowClone} from "./events.js";
import {isSteps}      from "./steps.js";
//==============================================================================
function copyData(txt, keys) {
    txt += "\ty" + copyByKey(keys);
    for (const f of frames)
        txt += copyTime(f) + "\t" + f.y + copyFrameByKey(keys, f);
    return txt;
}
//==============================================================================
// copyCode() does extra work for the AFrame properties on this page
function copyCode(obj) {
    const
    name = "easy",                  // already a valid javascript variable name
    chks = isInitZero()
         ? rafChecks.slice()
         : rafChecks.slice(0, -1)   // initZero doesn't apply

    let txt = `const raf = new AFrame({targets:new Easies(${name})`;
    for (const id of chks)          // add comma-separated properties
        if (elms[id].checked)
            txt += ", " + id + ":true";
    txt += "});\n";                 // close the declaration

    return easyToText(name, shallowClone(obj), isSteps(obj.type), name)
         + txt;
}
