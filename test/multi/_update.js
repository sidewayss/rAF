export {refresh, initPseudo, newTargets, getMsecs, getFrame, status, updateX,
        setCounters, formatDuration, formatPlayback, setClipPair, setClipPath};
export let measer;
export const
    MASK_X = [6,8, 14,16, 22,24],  // polygon's animated x-value indexes
    clip   = new Array(32),        // there are 32 polygon numbers
    easys  = new Array(COUNT),     // easys = [Easy x 3], g.easies = Easies
    wait   = 400,                  // changePlay()=>raf.play(ns.wait);
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
    frames[0] = getFrame(0, MASK_X.map(v => clip[v]).filter((_, i) => i % 2));
//!!newTargets(true);
}
// newTargets() calls Easies.proto.newTarget(), with and w/o .prop and .elms,
//              called by changePlay(), formFromObj(), objFromForm().
function newTargets(isPseudo) {                 // isPseudo is always defined
    g.easies[isPseudo ? "delete" : "add"](ezX);
    g.easies.cutTarget(measer);                 // test Easies.proto.cutTarget()
    measer = g.easies.newTarget(multiFromObj(easys, isPseudo));
}
//==============================================================================
// getMsecs() returns the full run-time in milliseconds
function getMsecs() {
    return measer.duration;
//!!let first, t;
//!!const
//!!trips = elms.trip .map( elm => elm.checked && P.isVisible(elm)),
//!!plays = elms.plays.map((elm, i) => Number(elm.value
//!!                                       || elms.ez_plays[i].textContent));
//!!return Math.max(...easys.map((ez, i) => {
//!!    t = ez.time;
//!!    first = t + ez.wait;
//!!    if (trips[i])
//!!        first += t + ez.tripWait;
//!!    // _duration removes excess E.steps time, in first or last loop play
//!!    return ez._duration(first, trips[i])
//!!         + (first + ez.loopWait)         // * has precedence over +
//!!         * (plays[i] - 1);               // plays[i] has range of 1 to COUNT
//!!}));
}
// getFrame() is called by these three functions:
//            initPseudo()   t = 0,           oneD = MASK_X, isMask = true
//            pseudoUpdate() t = 0,           oneD = oneD
//            updateFrame()  t = raf.elapsed, oneD = oneD
function getFrame(t, oneD) {
    const
    e   = eGet(easys),
    frm = {t, x:new Array(COUNT)};

    for (var i = 0; i < COUNT; i++) // ?? 0 for steps && !(jump & E.start)
        frm.x[i] = {value:oneD[i] ?? 0, unit:e[i].unit, comp:e[i].comp};

    return frm;
}
// status() returns the highest status number, excluding E.tripped
// roundTrip && !autoTrip for multi only behaves sensibly if all the targets
// are set that way. Otherwise autoTrip and non-roundTrip targets start over
// from the beginning. Here it's just disabled to avoid confusion. !autoTrip
// is a way not to autoTrip when other mask indexes are autoTripping. It's
// too funky to make it work properly for the combo: autoTrip || !autoTrip.
function status() {
    let sts = g.easies.status;
    if (sts == E.tripped)
        sts = E.arrived;
    return sts;
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
    elms.clip.style.opacity = g.clipOpacity[Number(isPlaying)]; // see loadIt()
    P.visible(elms.easyDivs.map(div => div.firstElementChild), !isPlaying);

    if (isPlaying)                      // element visibility overrides parent
        P.visible(elms.trip, false);
    else {
        const ezs = g.easies.easies;    // g.easies as an Array (vs Set)
        elms.trip.forEach((elm, i) => P.visible(elm, ezs[i].roundTrip));
    }
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