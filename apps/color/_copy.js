export {copyCode, copyData};

import {U, Ez} from "../../src/raf.js";

import {frames}           from "../update.js";
import {MEASER_, elms, g} from "../common.js";
import {easyToText, multiToText, jsonToText, nameToJS, copyTime, newRaf}
                          from "../copy.js";

import {isCSSSpace} from "./_load.js";
import {newTar}     from "./_update.js";
//==============================================================================
function copyData(txt) {
    const TAB = '\t';
    txt += TAB + Object.keys(g.left.color.space.coords).join(TAB);
    for (const f of frames)
        txt += copyTime(f) + TAB + f.left.join(TAB);

    moveCopied(elms.data.getBoundingClientRect());
    return txt;
}
//==============================================================================
let id, isCSS; // shared by copyCode(), copyObj(), thus indirectly by multiObj()
function copyCode(obj) {
    let txt,
    name  = elms.named.value;
    id    = g.left.spaces.value;
    isCSS = isCSSSpace(id);
    txt   = isCSS ? ""
                  : `const color = new Color("${g.left.color.spaceId}", 0);\n`;

    if (elms.type.value == MEASER_)
        txt += multiToText(obj /*getNamedObj(name)*/, multiObj);
    else {
        txt += easyToText(name, null);
        name = nameToJS(name);
        txt += `${name}.newTarget(${jsonToText(copyObj(), 3)});\n`
            +  newRaf(name);
    }
    moveCopied(elms.code.getBoundingClientRect());
    return txt;
}
function copyObj() {
    const obj = newTar(g.left);
    obj.elm   = "document.body";
    obj.prop  = "P.bgColor";
    if (isCSS)
        obj.func = `F.${Ez.kebabToCamel(id)}`;
    else
        obj.colorjs = "color";

    return obj;
}
function multiObj(arr) {
    const obj  = copyObj();
    obj.easies = arr;
    return obj;
}
//==============================================================================
function moveCopied(tar) {  // tar is the event target's DOMRect
    const elm = elms.copied;
    const cop = elm.getBoundingClientRect();
    elm.style.left = tar.left + (tar.width  / 2) - (cop.width  / 2) + U.px;
    elm.style.top  = tar.top  - cop.height - 3 + U.px;
}