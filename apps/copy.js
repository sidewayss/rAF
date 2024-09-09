export {loadCopy, easyToText, multiToText, jsonToText, nameToJS, newRaf,
        copyTime, copyByKey, copyFrameByKey, rgxPropertyValue};

import {E, Is, P, Easy, Easies, AFrame} from "../src/raf.js";

import {D}           from "./update.js";
import {getNamedObj} from "./local-storage.js";
import {MILLI, CLICK, EASY_, elms, addEventsByElm, errorAlert, errorLog}
                     from "./common.js";

import {TYPE, IO}     from "./easings/index.js";
import {EASY, TIMING, isSteps} from "./easings/steps.js";

let ezCopy, ns, ns_named, rafCopy;
const
EZ      = "ez",     // default variable name for Easys
IMPORT  = 'import {E, F, P, Easy, Easies, AFrame} from "[path]/raf.js";\n',
ezNames = new Set;  // shared across multi easyes
//==============================================================================
function loadCopy(dir, _named) {
    ns_named = _named;
    addEventsByElm(CLICK, [elms.code, elms.data], click);
    ezCopy = new Easy({         // "Copied!" notification fades in/out
        time:1000, type:E.sine, io:E.out, roundTrip:true, flipTrip:false,
        tripWait:300
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
// copyCode() helpers
function easyToText(name, obj, varName = nameToJS(name), isMulti = !Is.def(obj),
                    isStp) { // isStp only defined by recursive call below
    if (!obj) {
        obj = getNamedObj(name, EASY_);           // leaves intact roundTrip,
        delete obj.start;                         // plays, and other properties
        delete obj.end;                           // that color page deletes.
        if (obj.mid)
            obj.mid /= MILLI;                     // chart is MILLI x MILLI
        else if (obj.legs) {                      // default Easy is 0 to 1
            obj.legs[0].end /= MILLI;             // leg[1].start = leg[0].end
            const legs = obj.legs;                //!!to-be-deleted: 6 lines, top brace
            if (Is.def(legs[1].start)) {
                delete legs[1].start;
                console.log("leg start!");
            }
        }
    }
    let txt = jsonToText(obj);
    for (const p of [TYPE, IO, "jump"])           // replace numbers with E.name
        txt = txt.replace(rgxPropertyValue(p),    // e.g. "7" = "E.pow"
                          (m, v) => `${p}:${E.prefix}${Easy[p][v]}${m.at(-1)}`);

    txt = `const ${varName} = new Easy(${txt});\n`
    if (isStp ?? isSteps(obj.type)) {
        if (!isMulti)
            ezNames.clear();
        for (const p of [TIMING, EASY])           // recursion only once because
            if (txt.includes(p + ":")) {          // <select>s are steps-free:
                const val = txt.match(rgxPropertyValue(p))[1];
                if (!val.startsWith("[")) {       // timing can be an array
                    varName = nameToJS(val);
                    txt = txt.replace(val, varName);
                    if (!ezNames.has(varName)) {  //      isMulti, isStp
                        txt = easyToText(val, null, varName, true, false) + txt;
                        ezNames.add(varName);
                    }
                }
            }
    }
    return isMulti ? txt : IMPORT + txt;
}
function multiToText(obj, fromObj) {
    let   txt  = IMPORT;
    const vars = [];
    ezNames.clear();
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
        +  jsonToText(fromObj(vars), D)
        +  ");\nconst raf = new AFrame(easies);\n";
    return txt;
}
function rgxPropertyValue(p) {
    return new RegExp(`${p}:(.*?)[,|}]`);
}
function jsonToText(obj, precision) {  // precision is for targets, not easys
    const str = !Is.def(precision)
              ? JSON.stringify(obj)
              : JSON.stringify(obj, (_, v) =>
                    v.toFixed ? Number(v.toFixed(precision)): v
                );
    return str.replaceAll('"', '')
              .replaceAll(',', ', ');
}
// nameToJS() helps easyToText() convert a name to a JavaScript variable name
function nameToJS(name) {
    if (name) {
        name = name.replaceAll(/[^\w]/g, ""); // only [A-Za-z0-9_]
        if (/\d/.test(name[0]))               // can't start with a number
            name = name.slice(1);
        return name;
    }
    else
        return EZ;
}
// newRaf() consolidates these strings
function newRaf(name, flag) {
    const
    start = `const raf = new AFrame({targets:new Easies(${name})`,
      end = "});\n";

    return flag ? {start, end} : start + end;
}