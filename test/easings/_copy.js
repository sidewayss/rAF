export {copyCode, copyData};

import {E, Easy} from "../../raf.js";

import {getFrames}        from "../update.js";
import {jsonToText, easyToText, copyByKey, copyFrameByKey, copyTime,
        rgxPropertyValue} from "../copy.js";

import {TYPE, IO} from "./tio-pow.js";
import {isSteps}  from "./steps.js";
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
    let p, txt;                     // p for property
    txt = jsonToText(obj);
    for (p of [TYPE, IO, "jump"])   // replace numbers with "E." //!!for other pages too!!
        txt = txt.replace(          // e.g. "0" = "E.linear"
                rgxPropertyValue(p),
                (_, v) => `${p}:${E.prefix}${Easy[p][v]},`
            );
    return easyToText("easy", true, txt, isSteps()); // "easy" here, "ez" th
}
