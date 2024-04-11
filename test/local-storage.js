// export everything
export {getNamed, getNamedEasy, getNamedJSON, getNamedString, getNamedBoth,
        getLocalNamed, getLocal, setLocal, setNamed, storeCurrent, setLocalBool};

import {E, Easy} from "../raf.js";

import {preDoc} from "./load.js";
import {DEFAULT_NAME, ns, preClass, presets, disableSave} from "./named.js";
import {EASY_, elms, g, boolToString, errorAlert}         from "./common.js";
//==============================================================================
// getNamed() populates a <select> with names of stored objects, called only
//            during the load process by loadJSON(), getEasies().
//            The list of named objects contains both presets and user items
//            from localStorage. Those names can overlap, in which case the
//            user item overrides the preset. pre is for prefix, not preset.
function getNamed(sel = elms.named, pre = preClass, getAll = true) {
    let entries = Object.entries(g.presets[pre]);
    if (!getAll)                              // !getAll = exclude E.steps
        entries = entries.filter(obj => obj.type != E.steps);

    let i, key, val;
    const lenPre = pre.length;                // the prefix string length
    const names  = new Set(entries.map(v => v[0]));
    i = 0;
    while ((key = localStorage.key(i++))) {   // localStorage has no querying
        if (key.startsWith(pre)) {            // for a single prefix/document
            val = localStorage.getItem(key);  // !getAll = exclude E.steps
            if (getAll || !val.includes("type:9"))
                names.add(key.slice(lenPre)); // shame it has to check here, but
        }                                     // names and opt don't have type.
    }
    for (key of Array.from(names).sort())
        sel.add(new Option(key));

    const opt = sel.options[0];
    if (opt.value == DEFAULT_NAME) {          // value implied from textContent
        opt.value = DEFAULT_NAME;             // must be set explicitly
        opt.textContent     = "default";
        opt.style.fontStyle = "italic";
    }
    return sel;
}
//==============================================================================
// getNamedEasy() returns an Easy instance for a named item
function getNamedEasy(name) {
    try         { return new Easy(getNamedJSON(name, EASY_)); }
    catch (err) { errorAlert(err); }
}
// getNamedJSON() returns a JSON object from localStorage or presets, in that
//                order, localStorage can override a preset of the same name.
function getNamedJSON(name, pre = preClass) {
    return JSON.parse(getLocalNamed(name, pre)) ?? g.presets[pre][name];
}
// getNamedString() returns a stringified JSON object, called by storeCurrent(),
//                  loadFinally(), openNamed()
function getNamedString(name, pre = preClass) {
    return getLocalNamed(name, pre) ?? JSON.stringify(g.presets[pre][name]);
}
function getNamedBoth(name) {
    let obj, str;
    str = getLocalNamed(name);  // localStorage overrides presets
    if (str)
        obj = JSON.parse(str);
    else {
        obj = presets[name];
        str = JSON.stringify(obj);
    }
    return [str, obj];
}
// getLocalNamed() gets the string for a named item from localStorage
function getLocalNamed(name, pre = preClass) {
    return localStorage.getItem(pre + name);
}
// getLocal() called by loadIt()
function getLocal(elm) {
    return localStorage.getItem(preDoc + elm.id);
}
//==============================================================================
// setLocal() called by setLocalBool(), multi changeColor()
function setLocal(elm, val = elm.value) {
    localStorage.setItem(preDoc + elm.id, val);
}
// setNamed() called by loadFinally(), openNamed()
function setNamed(name, item) {
    localStorage.setItem(g.keyName, name);
    if (elms.save)
        localStorage.setItem(g.restore, item);
}
// setLocalBool() is for checkboxes and boolean buttons
function setLocalBool(elm, b = elm.checked) {
    setLocal(elm, boolToString(b));
}
//==============================================================================
// storeCurrent() is called by both refresh()s, changePlays(), changeWait(),
//                changeLoopByElm(), changeCheck(), changeTrip(), clickOk(),
//                only clickOK() passes in a key, "" is DEFAULT_NAME and is
//                the one read-only preset.
function storeCurrent(key, obj = ns.objEz) {
    const str = JSON.stringify(obj);
    localStorage.setItem(g.restore, str);
    if (key) {
        localStorage.setItem(key, str);
        disableSave(true);
    }
    else
        disableSave(str == (getNamedString(elms.named.value)
                         ?? JSON.stringify(presets[elms.named.value])));
    return str;
}