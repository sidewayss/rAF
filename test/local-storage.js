// export everything
export {getNamed, getNamedEasy, getLocalNamed, getLocal, setLocal, setNamed,
        storeCurrent, setLocalBool};

import {E, Is, Easy} from "../raf.js";

import {DEFAULT_NAME, ns, preClass, preDoc, presets, disableSave}
                                                  from "./named.js";
import {EASY_, elms, g, boolToString, errorAlert} from "./common.js";

import {isSteps} from "./easings/steps.js";
//==============================================================================
// getNamed() populates a <select> with names of stored objects, called only
//            during the load process by loadJSON(), getEasies().
function getNamed(sel = elms.named, isStp = isSteps(), pre = preClass) {
    let entries  = Object.entries(g.presets[pre]);
    const getAll = !Is.def(isStp);            // get values for all keys?
    if (!getAll)
        entries = entries.filter(obj => (obj.type == E.steps) == isStp);

    let i, key, val;
    const lenPre = pre.length;                // the prefix string length
    const names  = new Set(entries.map(v => v[0]));
    i = 0;
    while ((key = localStorage.key(i++))) {
        if (key.startsWith(pre)) {            // for a single prefix/document
            val = localStorage.getItem(key);
            if (getAll || val.includes("type:9") == isStp)
                names.add(key.slice(lenPre)); // all or (Easy: steps or easings)
        }
    }
    for (key of Array.from(names).sort())
        sel.add(new Option(key));

    const opt = sel.options[0];
    if (opt.value == DEFAULT_NAME) {
        opt.value = DEFAULT_NAME;
        opt.textContent     = "default";
        opt.style.fontStyle = "italic";
    }
    return sel;
}
// getNamedEasy() called by multi getEasies(), setEasy(), steps vtFromElm()
function getNamedEasy(name) {
    let ez
    try {
        ez = new Easy(g.presets[EASY_][name]
                   ?? JSON.parse(localStorage.getItem(EASY_ + name)));
    } catch(err) {
        errorAlert(err);
    }
    return ez;
}
// getLocalNamed() called by storeCurrent(), loadFinally(), easings initDoc()
function getLocalNamed(name) {
    return localStorage.getItem(preClass + name);
}
// getLocal() called easings initDoc(), multi.loadIt()
function getLocal(elm) {
    return localStorage.getItem(preDoc + elm.id);
}
//==============================================================================
// setLocal() called by setLocalBool(), multi changeColor()
function setLocal(elm, val = elm.value) {
    localStorage.setItem(preDoc + elm.id, val);
}
// setNamed() called by openNamed(), loadFinally()
function setNamed(name, item) {
    localStorage.setItem(g.keyName, name);
    localStorage.setItem(g.restore, item);
}
// storeCurrent() called by both redraw()s, changePlays(), changeWait(),
//                changeLoopByElm(), changeCheck(), changeTrip(), clickOk(),
//                only clickOK() passes in a key, "" is DEFAULT_NAME and is
//                the one read-only preset.
function storeCurrent(key, obj) {
    const str = JSON.stringify(obj ?? ns.objFromForm());
    localStorage.setItem(g.restore, str);
    if (key) {
        localStorage.setItem(key, str);
        disableSave(true);
    }
    else
        disableSave(str == (getLocalNamed(elms.named.value)
                         ?? JSON.stringify(presets[elms.named.value])));
    return str;
}
//==============================================================================
// setLocalBool() called by drawEasing(), changeCheck() (easings only)
function setLocalBool(elm, b = elm.checked) {
    setLocal(elm, boolToString(b));
}