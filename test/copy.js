export {loadCopy, jsonToText, easyToText, multiToText, copyText, copyTime,
        copyByKey, copyFrameByKey, rgxPropertyValue};


import {E, Is, P, Easy, Easies, AFrame} from "../raf.js";

import {getNamedJSON, isNamedSteps} from "./local-storage.js";
import {MILLI, CLICK, EASY_, elms, addEventsByElm, errorAlert, errorLog}
        from "./common.js";

let ezCopy, ns, ns_named, rafCopy;
const
EZ     = "ez", // default variable name for Easys
IMPORT = 'import {E, F, P, Easy, Easies, AFrame} from "[path]/raf.js";\n';
//==============================================================================
function loadCopy(dir, _named) {
    ns_named = _named;
    addEventsByElm(CLICK, [elms.code, elms.data], click);
    ezCopy = new Easy({         // "Copied!" notification fades in/out
                time:1000,      type:E.sine,   io:E.out,
                roundTrip:true, autoTrip:true, tripWait:250
            });

    ezCopy.newTarget({elm:elms.copied, prop:P.o});
    if (elms.copy)              // for multi only, label underneath "Copied!"
        ezCopy.newTarget({elm:elms.copy, prop:P.o, eKey:E.comp});

    rafCopy = new AFrame(new Easies([ezCopy]));

    return import(`${dir}_copy.js`).then(namespace => {
        ns = namespace;
        return ns; //!!can it return undefined?? caller doesn't use it!!
    }); // .catch(errorAlert) in Promise.all() in loadCommon()

}
//==============================================================================
//  click.data() copies frames data for tabular validation elsewhere
//  click.code() copies JavaScript code that creates the current animation
const click = {
    data() { copyText(ns.copyData("time (ms)", Easy.eKey)); },
    code() { copyText(ns.copyCode(ns_named.objEz)); }
};
//==============================================================================
// ns.copyData(), ns.copyCode() helpers
function copyText(txt) {
    navigator.clipboard.writeText(txt)
      .then (() => rafCopy.play().catch(errorLog))
      .catch(errorAlert);
}
//==============================================================================
// copyData() helpers, imported by _copy.js
function copyTime(f) {
    return `\n${f.t}`;  // starts each row with \n
}
function copyByKey(keys, i = "") {
    let key, txt = "";
    for (key of keys)
        txt += `\t${key}${i}`;
    return txt;
}
function copyFrameByKey(keys, f) {
    let key, txt = "";
    for (key of keys)
        txt += `\t${f[key]}`;
    return txt;
}
//==============================================================================
// copyCode() helpers, imported by _copy.js, except nameToJS(), nameToText()
function jsonToText(obj) {
    return JSON.stringify(obj).replaceAll('"', '')
                              .replaceAll(',', ', ');
}
function easyToText(name, target, str, isSteps) {
    if (!Is.def(str)) {
        // Too funky to modify the JSON string, convert to object and back again.
        // Leaves plays, roundTrip, etc, that are deleted by color page, intact.
        const obj = getNamedJSON(name, EASY_);
        delete obj.start;
        delete obj.end;
        if (obj.mid)
            obj.mid /= MILLI;
        else if (obj.legs) {
            const mid = legs[0].end / MILLI;
            leg[0].end   = mid;
            leg[1].start = mid;
        }
        str = jsonToText(obj);
    }
    const addRaf  = (target === true),          // easings
          varName = nameToJS(name);
    let   txt     = nameToText(varName, str);
    if (Is.def(target)) {                       // easings, color
        txt = IMPORT + txt;
        if (!addRaf)                            // color
            `${name}.newTarget(${target});\n`
    }
    if (!Is.def(isSteps))                       // multi, color
        isSteps = isNamedSteps(txt);
    if (isSteps)
        for (const p of ["timing", "easy"])     //!!TIMING, EASY in steps.js!!
            if (txt.includes(p + ":")) {
                const val = txt.match(rgxPropertyValue(p))[1];
                if (!val.startsWith("["))       // timing can be an array
                    txt = nameToText(nameToJS(val)) + txt;
            }
    return addRaf                               // easings
         ? txt + `const raf = new AFrame(new Easies(${varName}));\n`
         : txt;                                 // multi, color
}
function multiToText(obj, fromObj) {
    let   txt  = IMPORT;
    const vars = [];
    obj.easy.forEach(name => {
        if (!name)                  // DEFAULT_NAME = ""
            name = EZ;              // the variable must have a name
        if (!vars.includes(name)) {
            vars.push(name);
            txt += easyToText(name);
        }
    });
    txt += `const easies = new Easies([${vars.join()}]);\n`
        +  "const measer = easies.newTarget("
        +  jsonToText(fromObj(vars))
        +  ");\nconst raf = new AFrame(easies);\n";
    return txt;
}
function rgxPropertyValue(p) {
    return new RegExp(`${p}:(.*?),`);
}
//===============================
function nameToJS(name) {        // helps easyToText()
    if (name) {
        name = name.replaceAll(/^\w/, "");  // only [A-Za-z0-9_] for JavaScript
        if (/\d/.test(name[0]))             // can't start with a number either
            name = name.slice(1);
        return name;
    }
    else
        return EZ;
}
function nameToText(name, str) { // ditto
    return `const ${name} = new Easy(${str});\n`;
}