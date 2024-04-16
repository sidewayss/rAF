export {loadCopy, jsonToText, easyToText, copyByKey, copyPointByKey, copyTime};

import {E, P, Easy, Easies, AFrame} from "../raf.js";

import {CLICK, EASY_, elms, addEventsByElm, errorAlert, errorLog}
                from "./common.js";

let ezCopy, ns, ns_named, rafCopy;
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
//  click.code() copies JavaScript code that creates the current animation
//  click.data() copies frames data for tabular validation elsewhere
 const click = {
    code() { copyText(ns.copyCode(ns_named.objEz)); },

    data() { copyText(ns.copyData("time (ms)", Easy.eKey)); }
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