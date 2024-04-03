// export everything via import(), explicitly imported: redraw, all functions
export {refresh, getFrame, initPseudo, updateX, setCounters, oneCounter,
        formatDuration, formatFrames};

import {E, U} from "../../raf.js";

import {frames, pseudoAnimate}  from "../update.js";
import {storeCurrent}           from "../local-storage.js";
import {elms, g}                from "../common.js";

import {isMulti} from "./events.js";
//==============================================================================
// redraw() called by updateAll(), changeEKey(), changeStop(), play.js needs the
//          function dynamically imported by update.js, easings vs multi.
function refresh() {
    pseudoAnimate();
    storeCurrent();
}
//==============================================================================
// getFrame() <= update() and pseudoAnimate(), can be MEaser or Easy
function getFrame(t, data, flag) {
    if (!flag)
        data.t = t;
    else { // pseudoAnimate()

    }
    return data;
}
// initPseudo() sets frames[0], called exclusively by pseudoAnimate()
function initPseudo() {
    frames[0] = {t:0, left:g.start.left};
    if (elms.compare.value)
        frames[0].right = g.start.right;
}
// updateX() is called exclusively by inputX()
function updateX(frm) {
    const arr = [g.left];
    if (elms.compare.value)
        arr.push(g.right)

    for (const lr of arr) {
        lr.color.coords = frm[lr.id];
        lr.canvas.style.backgroundColor = lr.color.display();
    }
}
// setCounters() is called exclusively by updateCounters()
function setCounters(frm) {
    oneCounter(frm.left, g.left.value, g.left.range);
    if (elms.compare.value)
        oneCounter(frm.right, g.right.value, g.right.range);
}
// oneCounter() sets one <span>'s textContent
function oneCounter(coords, span, range) {
    span.textContent = coords.map((n, i) => range[i](n).padStart(5, E.sp))
                             .join(E.sp);
}
// formatDuration() is called exclusively by setDuration()
function formatDuration(val, d) { // duplicate of multi
    return val.toFixed(d) + U.seconds;
}
// no need for formatPlayback()
// function formatPlayback(isPlaying, b = true) {
// }
//====== multi and color only ==================================================
function formatFrames(txt) { // duplicate of multi
    return txt + "f";
}