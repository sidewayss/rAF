export {copyCode, copyData, moveCopied};

import {U} from "../../raf.js";

import {elms} from "../common.js";
//==============================================================================
function copyCode(obj) {
    let txt;
    moveCopied(elms.code.getBoundingClientRect());
    return txt;
}
//==============================================================================
function copyData(txt, keys) {
    moveCopied(elms.data.getBoundingClientRect());
    return txt;
}
function moveCopied(tar) {  // tar is the event target's DOMRect
    const elm = elms.copied;
    const cop = elm.getBoundingClientRect();
    elm.style.left = tar.left + (tar.width  / 2) - (cop.width  / 2) + U.px;
    elm.style.top  = tar.top  - cop.height - 3 + U.px;
}
