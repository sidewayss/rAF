import {Ez} from "../src/raf.js";

export const          // export everything:
MILLI = 1000,         // for milliseconds, and #chart is 1000 x 1000
COUNT = 3,            // multi.js: easys.length, loopByElm: elms.length
ZERO  = "0", ONE = "1", TWO = "2",
CHANGE  = "change",   // event names
CLICK   = "click",
INPUT   = "input",    // event & tag name
BUTTON  = "button",   // tag names
SELECT  = "select",
LABEL   = "label",
DIV     = "div",
EASY_   = "Easy-",    // localStorage
MEASER_ = "MEaser-",
LITE = ["lo","hi"],   // playback formatting
elms = {},            // the HTML elements of interest
dlg  = {},            // <dialog> sub-elements
g    = {};           // g for global
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
export function dummyEvent(type, name, value = true) {
    const evt = new Event(type);
    evt[name] = value;
    return evt;
}
//====== string conversion to/from =============================================
export function boolToString(b) { // for localStorage and <button>.value
    return b ? "true" : "";
}
//====== error messaging =======================================================
// messageBox() configures and displays an error|warning|info dialog box
export function messageBox(type, title = "", msg = "") {
    dlg.icon.src = `/icons/${type}.svg`; // "error"|"warning"|"info"
    dlg.title.textContent = title
    dlg.msg  .innerHTML   = msg;
    elms.msgBox.showModal();
}
// errorAlert() displays an error dialog, Error.proto.stack not 100% supported.
//              Generally msgBox.title = err.message and msgBox.msg = err.stack,
//              but there are a few other configurations to handle.
export function errorAlert(err, title) { // err = err.toString()
    let msg, stackMsg,
    stack = err.stack ?? "";
    if (stack) {
        stackMsg = stack.startsWith("Error: " + err.message);
        if (!title && stackMsg) // Chrome: err.stack starts with err.message\n
            stack = stack.slice(err.message.length + 8); // +1 for newline
    }
    if (title)
        msg   = stackMsg ? stack : err.message + stack;
    else {
        title = err.message;
        msg   = stack;
    }
    messageBox("error", title, msg);
}
// errorLog() normalizes console.error() usage
export function errorLog(err, title = "") {
    console.error(title, err.stack ?? err);
}
//====== miscellaneous =========================================================
export function pairOfOthers(...pair) {
    for (var i = 0; i < 2; i++)
        pair[i].other = pair[Ez.comp(i)];
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
export function isTag(elm, tag) { // only called by easings.load()
    return elm.tagName.toLowerCase() == tag;
}
export function is(obj = {}) {
    obj[document.documentElement.id] = true;
    return obj;
//##return Object.freeze(obj); // commented out for pre-await is.promise
}