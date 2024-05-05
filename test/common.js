import {Ez} from "../raf.js";

// export everything except errorMessage
export const ZERO = "0", ONE = "1", TWO = "2";

export const MILLI = 1000; // for milliseconds, and #chart is 1000 x 1000
export const COUNT = 3;    // multi.js: easys.length, loopByElm: elms.length

export const PLAYS   = "plays";
export const CHANGE  = "change"; // event names
export const CLICK   = "click";
export const INPUT   = "input";
export const SELECT  = "select";
export const EASY_   = "Easy-";  // localStorage
export const MEASER_ = "MEaser-";

export const LITE   = ["lo","hi"];

export const elms = {};  // the HTML elements of interest
export const dlg  = {};  // <dialog> sub-elements
export const g    = {    // g for global, these properties are read-write:
    notLoopWait:null,    // notX = !isX, bools to help choose easy.e vs easy.e2
    notTripWait:null     // in multi.js they are arrays of bools
};
//====== wrappers for addEventListener() =======================================
export function addEventByClass(type, name, obj, func) {
    if (obj)
        func = obj[Ez.kebabToCamel(name)];
    for (const elm of document.getElementsByClassName(name))
        elm.addEventListener(type, func, false);
}
export function addEventToElms(type, elms, func) {
    for (var elm of elms)
        elm.addEventListener(type, func, false);
}
export function addEventsByElm(type, elms, obj, noDigits, noPrefix = true) {
    let elm;
    if (noDigits)
        for (elm of elms) // elm never undefined, same function for all digits
            elm.addEventListener(type, obj[elm.id.replace(/\d/, "")]);
    else if (noPrefix)
        for (elm of elms)
            elm.addEventListener(type, obj[elm.id]);
    else
        for (elm of elms) // elm maybe undefined, e.g. elms.time in multi
            elm?.addEventListener(type, obj[Ez.toCamel(type, elm.id)]);
}
//====== string conversion to/from =============================================
export function boolToString(b) { // for localStorage and <button>.value
    return b ? "true" : "";
}
//====== number formatting, validation, limitation =============================
// inputNumber() is the first event handler registered for the input event on
//               <input type="number">, uses g.invalids to cancel downstream
//               events because preventDefault() and stopPropagation() do zilch.
function inputNumber(evt) {
    const
    tar = evt.target,
    n   = tar.valueAsNumber,
    b   = Number.isNaN(n);
    invalidInput(tar, b);
    if (!b)
        formatInputNumber(tar, maxMin(tar, n));
}
// listenInputNumber() is the only public access to inputNumber()
export function listenInputNumber(elements) {
    for (const elm of elements)
        elm.addEventListener(INPUT, inputNumber);
}
// invalidInput() helps inputNumber(), input.color(), click.clear(), more than
//                one input can be invalid, #x and #play only enabled if none.
export function invalidInput(elm, b) {
    toggleClass(elm, "invalid", b);
    g.invalids[b ? "add" : "delete"](elm);
    b = Boolean(g.invalids.size);
    elms.x   .disabled = b;
    elms.play.disabled = b;
}
// isInvalid() returns true for inputs with class="invalid"
export function isInvalid(elm) {
    return g.invalids.has(elm);
}
// formatInputNumber() sets decimal places for <input type="number"> by id,
//                     called by easingFromObj(), vtArray(), inputTypePow(),
//                               clickClear(), updateSplitGap(), setSplitGap().
export function formatInputNumber(elm, n) {
    let decimals;
    switch (elm.id[0]) {
    case "m":
    case "v": decimals = 0; break; // mid, v0-2
    case "p": decimals = 1; break; // pow and pow2
    case "b": decimals = 2; break; // bezier0-3
    default:  decimals = 3;        // split, gap, t0-2
    }
    elm.value = Number(n).toFixed(decimals);
}
// formatNumber() formats numbers for non-<input type="number"> elements,
//                called by formFromObj(), loadFinally(), updateCounters(),
//                          both setCounters()s, multi refresh().
export function formatNumber(n, digits, decimals, elm) {
    const str = n.toFixed(decimals).padStart(digits);
    if (elm)
        elm.textContent = str;
    else
        return str;
}
// maxMin() enforces the max and min properties for numeric inputs
export function maxMin(elm, n = elm.valueAsNumber) {
    return Math.max(Math.min(n, elm.max), elm.min);
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
export function pairOfOthers(...pair) {
    for (var i = 0; i < 2; i++)
        pair[i].other = pair[Ez.flip(i)];
}
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
export function is(obj = {}) {
    obj[document.documentElement.id] = true;
    return Object.freeze(obj);
}
export function dummyEvent(type, name, value = true) {
    const evt = new Event(type);
    evt[name] = value;
    return evt;
}