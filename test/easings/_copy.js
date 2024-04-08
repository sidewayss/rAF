export {copyCode, copyData};

import {E, Easy} from "../../raf.js";

import {getFrames} from "../update.js";
import {jsonToText, easyToText, copyByKey, copyPointByKey, copyTime}
                   from "../copy.js";

import {TYPE, IO}              from "./tio-pow.js";
import {TIMING, EASY, isSteps} from "./steps.js";
//==============================================================================
function copyCode(obj) {
    let p, txt;             // p for prop(erty)
    const rex = ":(.*?),";
    txt = jsonToText(JSON.stringify(obj));
    for (p of [TYPE, IO, "jump"])           // replace numbers with "E."
        txt = txt.replace(                  // e.g. "0" = "E.linear"
                new RegExp(`${p}${rex}`),
                (_, v) => `${p}:${E.prefix}${Easy[p][v]},`
            );

    txt = `const ${EASY} = new Easy(${txt});\n`;
    if (isSteps())
        for (p of [TIMING, EASY])
            if (txt.includes(p))
                txt = easyToText(txt.match(new RegExp(`${p}${rex}`))[1])
                    + txt;
    return txt;
}
//==============================================================================
function copyData(txt, keys) {
    txt += "\ty";
    txt += copyByKey(keys);
    for (const f of getFrames) {
        txt += copyTime (f, true);
        txt += copyPointByKey(keys, f);
    }
    return txt;
}
