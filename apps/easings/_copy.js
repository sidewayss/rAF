export {copyCode, copyData};

import {frames} from "../update.js";
import {elms}   from "../common.js";
import {easyToText, newRaf, copyByKey, copyFrameByKey, copyTime}
                   from "../copy.js";

import {rafChecks}    from "./_load.js";
import {isInitZero}   from "./_update.js";
import {shallowClone} from "./events.js";

const rafDefaults = [false, true, false]; // see rafChecks() and copyCode()
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
    let chkd, txt;
    const
    name = "easy",                  // already a valid javascript variable name
    raf  = newRaf(name, true),
    ids  = isInitZero()
         ? rafChecks.slice()
         : rafChecks.slice(0, -1)   // initZero doesn't apply

    txt = raf.start;
    ids.forEach((id, i) => {        // add comma-separated properties
        chkd = elms[id].checked;
        if (chkd != rafDefaults[i])
            txt += `, ${id}:${chkd.toString()}`;
    });
    txt += raf.end;                 // close the declaration

    return easyToText(name, shallowClone(obj), name, false) + txt;
}
