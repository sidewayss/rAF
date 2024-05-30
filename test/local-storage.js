// export everything
export {getNamed, getNamedEasy, getNamedObj, getNamedString, getNamedBoth,
        getLocalNamed, getLocal, setLocal, setNamed, storeCurrent, setLocalBool,
        isNamedSteps};

import {E, Is, Ez, Easy} from "../raf.js";

import {preDoc} from "./load.js";
import {DEFAULT_NAME, DEFAULT, ns, preClass, presets, disableSave}
                from "./named.js";
import {EASY_, elms, g, boolToString, errorAlert} from "./common.js";
//==============================================================================
// getNamed() populates a <select> with names of stored objects, called only
//            during the load process by loadJSON(), getEasies().
//            The list of named objects contains both presets and user items
//            from localStorage. Those names can overlap, in which case the
//            user item overrides the preset.
function getNamed(sel = elms.named, prefix = preClass, getAll = true) {
    let i, key, opt, val;
    const                                       // !getAll = exclude E.steps
    keys   = getAll ? Object.keys(g.presets[prefix])
                    : Object.entries(g.presets[prefix])
                            .filter(([_, obj]) => obj.type != E.steps)
                            .map(pair => pair[0]),
    names  = new Set(keys),                     // start with presets
    lenPre = prefix.length;
    i = 0;
    while ((key = localStorage.key(i++))) {     // then add the local names:
        if (key.startsWith(prefix)) {           // localStorage has no querying
            val = localStorage.getItem(key);    // for a single prefix/document.
            if (getAll || !isNamedSteps(val))
                names.add(key.slice(lenPre));
        }
    }
    for (key of names) {
        opt = new Option(key)
        opt.style.fontStyle = "normal";         // sel is sometimes "italic"
        sel.add(opt);
    }
    opt = sel[0];
    if (opt.value == DEFAULT_NAME) {            // value implied from text
        opt.value = DEFAULT_NAME;               // must be set explicitly
        opt.text  = DEFAULT;
    }
    return sel;
}
// isNamedSteps() searches a JSON or modified-JSON string for type:E.steps
function isNamedSteps(str, isCopy) {
    return str.includes(isCopy ? "type: 9" : '"type":9');
}
//==============================================================================
// getNamedEasy() returns an Easy instance for a named item
function getNamedEasy(name, recurseIt) {
    const obj = getNamedObj(name, EASY_);
    if (recurseIt) {
        for (const prop of ["timing","easy"])        // for E.steps only
            if (Is.String(obj[prop]))                // can be array, undefined
                obj[prop] = getNamedEasy(obj[prop]); // recurse only one level
    }
    try         { return new Easy(obj); }
    catch (err) { errorAlert(err); }
}
// getNamedObj() returns a JSON object from localStorage or presets, in that
//                order, localStorage can override a preset of the same name.
function getNamedObj(name, pre = preClass) {
    return JSON.parse(getLocalNamed(name, pre))
                   ?? Ez.shallowClone(g.presets[pre][name]);
}
// getNamedString() returns a stringified JSON object, called by storeCurrent(),
//                  loadFinally(), openNamed(), easyToText()
function getNamedString(name, pre = preClass) {
    return getLocalNamed(name, pre) ?? JSON.stringify(g.presets[pre][name]);
}
function getNamedBoth(name) {
    let obj, str;
    str = getLocalNamed(name);  // localStorage overrides presets
    if (str)
        obj = JSON.parse(str);
    else {                      // presets = g.presets[preClass]
        obj = Ez.shallowClone(presets[name]);
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
// storeCurrent() stores a named object as JSON in localStorage
function storeCurrent(key, obj = ns.objEz) {
    const str = JSON.stringify(obj);
    localStorage.setItem(g.restore, str);
    if (key) {                          // only clickOK() passes in a key.
        localStorage.setItem(key, str); // DEFAULT_NAME = "", making it the
        disableSave(true);              // only read-only preset.
    }
    else
        disableSave(str == getNamedString(elms.named.value)
                        ?? JSON.stringify(presets[elms.named.value]));
    return str;
}