export {copyCode, copyData};

import {frames}   from "../update.js";
import {COUNT, g} from "../common.js";
import {jsonToText, easyToText, copyByKey, copyPointByKey, copyTime}
                  from "../copy.js";

import {meFromObj} from "./index.js";
//==============================================================================
function copyCode(obj) {
    const set  = new Set;
    const vars = obj.easy.map(name => {
        if (!name)          // DEFAULT_NAME = ""
            name = "easy";  // the variable must have a name
        i   = 2;
        txt = name;         // user can select the same name in every <select>
        while (set.has(name))
            name = txt + i++;
        set.add(name);
        return name;
    });
    let txt = "";           // insert Easy x COUNT, one Easies, one MEaserByElm
    obj.easy.forEach((name, i) => txt += easyToText(name, vars[i]));
    txt += `const easies = new Easies([${vars.join()}]);\n`
            + "const measer = easies.newTarget("
            + jsonToText(JSON.stringify(meFromObj(vars)))
            + ");\nconst raf = new AFrame(easies);\n";
    return txt;
}
//==============================================================================
function copyData(txt, keys) {
    let i, f;
    for (i = 0; i < COUNT; i++)
        txt += copyByKey(keys, i);
    for (f of frames.slice(0, g.frameCount + 1)) {
        txt += copyTime(f);
        for (i = 0; i < COUNT; i++)
            txt += copyPointByKey(keys, f.x[i]);
    }
}