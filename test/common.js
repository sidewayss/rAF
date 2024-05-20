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