export {loadCopy, jsonToText, easyToText, copyByKey, copyPointByKey, copyTime};

import {E, P, Easy, Easies, AFrame} from "../raf.js";

import {CLICK, EASY_, elms, addEventsByElm, errorAlert, errorLog}
                from "./common.js";

let ezCopy, isMulti, ns, ns_named, rafCopy;
//==============================================================================
function loadCopy(b, dir, _named) { // imported by named.js
    isMulti = b;
    ns_named = _named;        // clickCode, clickData
    addEventsByElm(CLICK, [elms.code, elms.data], handlers);
    ezCopy = new Easy({ // "Copied!" notification fades in/out
                time:1000,      type:E.sine,   io:E.out,
                roundTrip:true, autoTrip:true, tripWait:250
            });
    ezCopy.newTarget({elm:elms.copied, prop:P.o});
    if (isMulti)        // for multi/index.html only, not color multi
        ezCopy.newTarget({elm:elms.copy, prop:P.o, eKey:E.comp});

    rafCopy = new AFrame(new Easies([ezCopy]));

    return import(`${dir}_copy.js`).then(namespace => {
        ns = namespace;
        return ns; //!!can it return undefined?? caller doesn't use it!!
    }); // .catch(errorAlert) in Promise.all() in loadCommon()

}
//==============================================================================
//  clickCode() copies JavaScript code that creates the current animation
//  clickData() copies frames data for tabular validation elsewhere
 const handlers = {      // not exported
    clickCode() {
        copyText(ns.copyCode(ns_named.objEz));
    },
    clickData() {
        copyText(ns.copyData("time (ms)", Easy.eKey));
    }
};
//==============================================================================
// ns.copyCode(), ns.copyData() helpers:
function copyText(txt) { // not exported
    navigator.clipboard.writeText(txt)
      .then (() => rafCopy.play().catch(errorLog))
      .catch(errorAlert);
}
//====================
// copyCode() helpers, imported by _copy.js
function jsonToText(json) { // I wanted to prettify more, but not worth it
    return json.replaceAll('"', '')
               .replaceAll(',', ', ');
}
function easyToText(name, varName = name) { // has trailing newline built-in
    const txt = jsonToText(localStorage.getItem(EASY_ + name));
    return `const ${varName} = new Easy(${txt});\n`;
}
//====================
// copyData() helpers, imported by _copy.js
function copyTime(p, hasY) {
    return `\n${p.t}` + (hasY ? `\t${p.y}` : "");
}
function copyByKey(keys, i = "") {
    let key, txt = "";
    for (key of keys)
        txt += `\t${key}${i}`;
    return txt;
}
function copyPointByKey(keys, p) {
    let key, txt = "";
    for (key of keys)
        txt += `\t${p[key]}`;
    return txt;
}