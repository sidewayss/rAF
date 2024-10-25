// export everything
export {getNamed, getNamedEasy, getNamedObj, getNamedString, getNamedBoth,
        getLocalNamed, getLocalByElm, getLocal, setLocal, setNamed,
        storeCurrent, setLocalBool};

import {E, Is, Ez, Easy} from "../src/raf.js";

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
function getNamed(sel = elms.named, prefix = preClass, defText = DEFAULT,
                  getAll = true) { // !getAll = exclude E.steps
    let i, key, opt, val;
    const   // sel.fontStyle is "italic" for modified objects
    fontSty = (sel === elms.named && elms.save) ? "normal" : "",
    lenPre  = prefix.length,
    local   = [],
    presets = getAll ? Object.keys(g.presets[prefix])
                     : Object.entries(g.presets[prefix])
                             .filter(([_, obj]) => obj.type != E.steps)
                             .map(pair => pair[0]);
    i = 0;
    while ((key = localStorage.key(i++))) { // collect the local names:
        if (key.startsWith(prefix)) {         // localStorage has no querying
            val = localStorage.getItem(key);  // for a single prefix/document.
            if (getAll || !val.includes('"type":9'))
                local.push(key.slice(lenPre));
        }
    }
    // <option> order: default, local, non-default presets. Local includes
    // user-modified presets, and Set weeds out those duplicate names.
    for (key of new Set([presets.splice(0, 1), ...local, ...presets])) {
        opt = new Option(key)
        opt.style.fontStyle = fontSty;
        sel.add(opt);
    }
    opt = sel[0];
//!!if (opt.value == DEFAULT_NAME) {        // value implied from text
    opt.value = DEFAULT_NAME;   // must be set explicitly
    opt.text  = defText;        // DEFAULT or LINEAR
//!!}
    return sel;
}
//==============================================================================
// getNamedEasy() returns an Easy instance for a named item. Multi/color pages
//                get Easys for the timing and easy properties, thus recursion.
function getNamedEasy(name, isMulti) {
    const obj = getNamedObj(name, EASY_);
    if (isMulti) {
        for (const prop of ["timing","easy"])        // for E.steps only
            if (Is.String(obj[prop]))                // can be array, undefined
                obj[prop] = getNamedEasy(obj[prop]); // one level of recursion
    }
    try         { return new Easy(obj); }
    catch (err) { errorAlert(err); }
}
// getNamedObj() returns a JSON object from localStorage or presets, in that
//                order, localStorage can override a preset of the same name.
function getNamedObj(name, pre = preClass) {
    return JSON.parse(getLocalNamed(name, pre))
                   ?? clonePreset(g.presets[pre][name]);
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
        obj = clonePreset(presets[name]);
        str = JSON.stringify(obj);
    }
    return [str, obj];
}
// getLocalNamed() gets the string for a named item from localStorage
function getLocalNamed(name, pre = preClass) {
    return localStorage.getItem(pre + name);
}
// getLocal() called by load()
function getLocal(elm) {
    return localStorage.getItem(preDoc + elm.id);
}
// getLocalByElm() wraps getLocal() by element
function getLocalByElm(elms) {
    let elm, val;
    for (elm of elms) {
        val = getLocal(elm)
        if (val !== null)
            elm.value = val;
    }
}
function clonePreset(obj) {
    const clone = Ez.shallowClone(obj);
    if (clone.legs)
        clone.legs = clone.legs.map(leg => Ez.shallowClone(leg));
    return clone;
}
//==============================================================================
// setLocal() called by setLocalBool(), multi changeColor()
function setLocal(elm, val = elm.value) {
    localStorage.setItem(preDoc + elm.id, val);
}
// setNamed() called by loadFinally(), openNamed()
function setNamed(name, item) {
    localStorage.setItem(g.keyName, name);
    if (item)
        localStorage.setItem(g.restore, item);
}
// setLocalBool() is for checkboxes and boolean buttons
function setLocalBool(elm, b = elm.checked) {
    setLocal(elm, boolToString(b));
}
//==============================================================================
// storeCurrent() stores a named object as JSON in localStorage
function storeCurrent(obj = ns.objEz, key = "") {
    const str = JSON.stringify(obj);
    localStorage.setItem(g.restore, str);
    if (key) {                          // only clickOK() passes in a key.
        localStorage.setItem(key, str); // DEFAULT_NAME = "", making it the
        disableSave(true);              // only read-only preset.
    }
    else             // == means same property order: presets == xxxFromForm()
        disableSave(str == getNamedString(elms.named.value)
                        ?? JSON.stringify(presets[elms.named.value]));
    return str;
}