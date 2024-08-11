export {refresh, initPseudo, newTargets, getMsecs, getFrame, updateX,
        setCounters, formatDuration, formatPlayback, setClipPair, setClipPath};
export const
    MASK_X = [6,8, 14,16, 22,24],  // polygon's animated x-value indexes
    clip   = new Array(32),        // there are 32 polygon numbers
    easys  = new Array(COUNT),     // easys = [Easy x 3], g.easies = Easies
    formatFrames = true
;
import {E, U, F, P, Easy} from "../../raf.js";

import {ezX}            from "../load.js";
import {storeCurrent}   from "../local-storage.js";
import {COUNT, elms, g} from "../common.js";
import {frames, pad, formatNumber, eGet, pseudoAnimate}
                        from "../update.js";

import {clipEnd, clipStart} from "./_load.js";
import {multiFromObj}       from "./index.js";
//==============================================================================
// refresh() called by updateAll(), changeEKey(), changeEasy(), changeStop(),
//           play.js gets it via dynamic import by update.js.
function refresh() {
    let down, flip, i, j, l, val;
    for (i = 0, j = 0, l = COUNT; j < l; j++) {
        down = easys[j].start > easys[j].end;
        flip = (elms.eKey[j].value == E.comp);
        val  = (down == flip) ? clipStart : clipEnd;
        i = setClipPair(val, i);  // i += 2
        formatNumber(val, pad.value, 0, elms.value[j]);
    }
    setClipPath();
    pseudoAnimate();
    storeCurrent();
}
//==============================================================================
// initPseudo() sets frames[0], creates targets w/o elements, assumes that
//              clip-path is set at elapsed = 0, called by pseudoAnimate().
function initPseudo() {
    frames[0] = getFrame(0, MASK_X, true, true);
    newTargets(true);
}
// newTargets() calls Easies.proto.newTarget(), with and w/o .prop and .elms,
//              always calls g.easies.newTarget() 'cuz g.easies.oneShot = true,
//              called by changePlay(), initPseudo(true).
function newTargets(isPseudo = false) { // multiFromObj() checks false vs undef
    g.easies[isPseudo ? "delete" : "add"](ezX);
    g.easies.clearTargets();
    g.easies.newTarget(multiFromObj(easys, isPseudo));
}
//==============================================================================
// getMsecs() returns the current duration in milliseconds
function getMsecs() {
    const me = g.easies?.targets[0];
    if (me)
        return Math.max(...easys.map((ez, i) =>
                            (me.autoTrip[i] ? ez.firstTime : ez.duration)
                          + (ez.loopTime * ((me.plays[i] ?? ez.plays) - 1))));
    else {
        console.log("multi getMsecs(): no g.easies or g.easies has no targets.");
        return Math.max(...easys.map((ez, i) =>
                            (elms.trip[i].checked ? ez.firstTime : ez.duration)
                          + (ez.loopTime * ((elms.plays[i].value || elms["ez-plays"][i].textContent) - 1))));
    }
}
// getFrame() is called by these three functions:
//            initPseudo()   t = 0,           oneD = MASK_X, isMask = true
//            pseudoUpdate() t = 0,           oneD = oneD
//            updateFrame()  t = raf.elapsed, oneD = oneD
function getFrame(t, oneD, everyOther = true, isMask = false) {
    const
    e   = eGet(easys),
    frm = {t, x:new Array(COUNT)};

    if (everyOther)
        oneD = oneD.filter((_, j) => j % 2);
    if (isMask)
        oneD = oneD.map(v => clip[v]);

    for (var i = 0; i < COUNT; i++) // ?? 0 for steps && !(jump & E.start)
        frm.x[i] = {value:oneD[i] ?? 0, unit:e[i].unit, comp:e[i].comp};

    return frm;
}
//==============================================================================
// updateX() is called exclusively by inputX()
function updateX(frm) {
    for (var i = 0, j = 0, l = COUNT; j < l; j++)
        i = setClipPair(frm.x[j].value, i); // i += 2
    setClipPath();
}
// setCounters() is called exclusively by updateCounters()
function setCounters(frm, defD) {
    let decimals, digits, elements, i, isValue, key, n, txt;
    for (key of Easy.eKey) {
        isValue  = (key[0] == "v");
        digits   = pad[key];
        decimals = isValue ? 0 : defD;
        elements = elms[key];
        if (isValue)
            for (i = 0; i < COUNT; i++)
                formatNumber(frm.x[i][key], digits, decimals, elements[i]);
        else
            for (i = 0; i < COUNT; i++) { // convert "-0.123" to "-.123"
                n   = frm.x[i][key];      // formatNumber rounds -Number.EPSILON
                txt = formatNumber(n, digits, decimals);
                elements[i].textContent = n + Number.EPSILON < 0
                                        ? txt[0] + txt.slice(2)
                                        : txt;
            }
    }
}
// formatDuration() is called exclusively by setDuration()
function formatDuration(val, d) {
    return val.toFixed(d) + U.seconds;
}
// formatPlayback() helps changePlay(), changeStop()
function formatPlayback(isPlaying) {
    elms.clip.style.opacity = g.clipOpacity[Number(isPlaying)]; // see multi.loadIt()
    P.visible(elms.ucvDivs.map(div => div.firstElementChild), !isPlaying); //!!if this can be elms.value[i], then ucvDivs is a local var for _load!!
}
//==============================================================================
// setClipPair() populates clip, pair by pair, mask by mask.
function setClipPair(val, i, mask = MASK_X) {
    clip[mask[i++]] = val;
    clip[mask[i++]] = val;
    return i;
}
// setClipPath() summarizes one line of code.
function setClipPath() {
    elms.clip.style.clipPath = F.joinCSSpolygon(clip);
}