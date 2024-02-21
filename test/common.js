import {Is, Ez} from "../raf.js";

// export everything except errorMessage
export const MILLI  = 1000; // for milliseconds, and #chart is 1000 x 1000
export const COUNT  = 3;    // multi.js: easys.length, loopByElm: elms.length
export const LENGTH = {length:COUNT};

export const ZERO = "0", ONE = "1", TWO = "2";

export const PLAYS  = "plays";
export const CHANGE = "change"; // event names
export const CLICK  = "click";
export const INPUT  = "input";
export const SELECT = "select";
export const EASY_  = "Easy-";  // localStorage

export const LITE   = ["lo","hi"];

export const elms = {};  // the HTML elements of interest
export const dlg  = {};  // <dialog> sub-elements
export const g    = {    // g for global, these properties are read-write:
    frame:0, frames:1,   // current frame, frame count
    notLoopWait:null,    // notX = !isX, bools to help choose easy.e vs easy.e2
    notTripWait:null     // in multi.js they are arrays of bools
};
//====== wrappers for addEventListener() =======================================
export function addEventByClass(evt, name, func, obj) {
    if (!Is.def(func))
        func = toFunc(evt, camelCase(name), obj);
    for (var elm of document.getElementsByClassName(name))
        elm.addEventListener(evt, func, false);
}
export function addEventToElms(evt, elms, func) {
    for (var elm of elms)
        elm.addEventListener(evt, func, false);
}
export function addEventsByElm(evt, elms, obj, noDigits) {
    let elm;
    if (noDigits)
        for (elm of elms) // elm never undefined, same function for all digits
            elm .addEventListener(evt, toFunc(evt, elm.id.replace(/\d/, ""), obj), false);
    else
        for (elm of elms) // elm maybe undefined, e.g. elms.time in multi
            elm?.addEventListener(evt, toFunc(evt, elm.id, obj), false);
}
//====== string manipulation, conversion to/from ==============================
export function initialCap(str) {
    return str[0].toUpperCase() + str.slice(1)
}
export function toCamel(...strings) {
    return strings.reduce((acc, cur) => acc + initialCap(cur));
}
export function camelCase(str) {
    return str.replace(/-(.)/g, chars => chars[1].toUpperCase());
}
export function toFunc(prefix, name, obj = window) { // returns a function
    return obj[toCamel(prefix, name)];
}
export function boolToString(b) { // for localStorage and <button>.value
    return b ? "true" : "";
}
//====== number formatting, validation =========================================
// formatNumber() formats numbers for non-<input type="number"> elements,
//                called by formFromObj(), loadFinally(), updateSidebar(),
//                          both setSidebar()s, multi redraw().
export function formatNumber(n, digits, decimals, elm) {
    const str = n.toFixed(decimals).padStart(digits);
    if (elm)
        elm.textContent = str;
    else
        return str;
}
// formatInputNumber() sets decimal places for <input type="number"> by id,
//                     called by easingFromLocal(), vtArray(), inputTypePow(),
//                               clickClear(), updateSplitGap(), setSplitGap().
export function formatInputNumber(elm, n) {
    let decimals;
    switch (elm.id[0]) {
    case "m":
    case "v": decimals = 0; break; // mid, v0-3
    case "p": decimals = 1; break; // pow and pow2
    case "b": decimals = 2; break; // bezier0-3
    default:  decimals = 3;        // split, gap, t0-3
    }
    elm.value = Number(n).toFixed(decimals);
}
// changeNumber() validates then formats <input type="number"> as part of
//                handling the change event in changePow(), changeMSG()
export function changeNumber(tar)  {
    if (tar?.type == "number") {
        let n = tar.valueAsNumber;
        if (Number.isNaN(n)) {
            let lbl = tar.labels.length ? tar.labels[0].textContent.trimEnd()
                                        : tar.id;
            if (lbl.at(-1) == ":")
                lbl = lbl.substring(0, lbl.length - 1).trimEnd();
            alert(Ez._mustBe(lbl, "a number"));
            return null;
        } //---------------------------
        if (n > tar.max || n < tar.min)
            n = Math.max(Math.min(n, tar.max), tar.min);
        formatInputNumber(tar, n);
    }
}
//====== error messaging =======================================================
// errorAlert() normalizes alerts
export function errorAlert(err, msg) {
    alert(errorMessage(err, msg));
}
// errorLog() normalizes console.error() usage
export function errorLog(err, msg) {
    console.error(errorMessage(err, msg));
}
// errorMessage() consolidates code for errorAlert(), errorLog(), not exported
function errorMessage(err, msg) { // Error.prototype.stack not 100% supported
    return `${msg ? msg + ":\n" : ""}${err.stack ?? err}`;
}
//====== miscellaneous =========================================================
// toggleClass() adds or removes a class from classList, optionally toggling
export function toggleClass(elm, className, b = !elm.classList.contains(className)) {
    elm.classList[b ? "add" : "remove"](className);
}
// orUndefined() helps undefine default values for JSON/localStorage
export function orUndefined(val) {
    return val || undefined;
}
// elseUndefined() if (b) return val,
export function elseUndefined(b, val) {
    if (b) return val; // else return undefined.
}
// isTag() deals with the allegedly unreliable case of HTMLElement.tagName
export function isTag(elm, tag) { // only called by easings.loadIt()
    return elm.tagName.toLowerCase() == tag;
}