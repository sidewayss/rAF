// export everything via import(), explicitly imported: redraw, all functions
export {redraw, getPoint, pointZero, updateX, setSidebar, formatDuration,
        formatFrames, formatClip};

import {E, U, Is, P, Easy} from "../../raf.js";

import {pad, eGet, pseudoAnimate}  from "../update.js";
import {storeCurrent}              from "../local-storage.js";
import {COUNT, elms, formatNumber} from "../common.js";

import {clipDist, clipEnd, clipStart, initEasies} from "./_load.js";
import {MASK_X, clip, easys, measer}              from "./index.js";
import {setEasy}                                  from "./events.js";
//==============================================================================
// redraw() called by updateAll(), changeEKey(), changeStop(), play.js needs the
//          function dynamically imported by update.js, easings vs multi.
function redraw(evt) {
    let down, flip, i, j, l, val;
    const tar = evt?.target;
    if (elms.easy.includes(tar)) {
        setEasy(Number(tar.id.at(-1)), tar.value);
        if (!initEasies())
            return;
    }
    for (i = 0, j = 0, l = MASK_X.length; i < l; j++) {
        down = easys[j].start > easys[j].end;
        flip = (elms.eKey[j].value == E.comp);
        val  = (down == flip) ? clipStart : clipEnd;
        clip[MASK_X[i++]] = val;
        clip[MASK_X[i++]] = val;
        formatNumber(val, pad.value, 0, elms.value[j]);
    }
    elms.clip.style.clipPath = F.joinCSSpolygon(clip);
    pseudoAnimate();
    storeCurrent();
}
//==============================================================================
// getPoint() <= update() and pseudoAnimate(), which can't use easies._next()
//            because it applies values, but _easeMe() doesn't have the
//            factor/addend/max/min calcs, so that's extra work here.
function getPoint(t, val, flag) {
    let e, i, keys, value;
    const p = {t, x:new Array(COUNT)};

    if (flag)                        // flag can be true, false, or undefined
        keys = measer.eKey;
    for (i = 0; i < COUNT; i++) {
        e = eGet(easys[i]);
        if (flag)                    // pseudo-animation, val = clipDist
            value = e[keys[i]] * val + clipStart;
        else {
            value = val[i * 2]       // animation, val = measer.#oneD
            if (Is.def(flag))
                value = clip[value]; // or setting points[0], val = MASK_X
        }
        p.x[i] = {value, unit:e.unit, comp:e.comp};
    }
    return p;
}
// pointZero() sets points[0] and returns easys vs g.easies
function pointZero(pts, args) { // assumes that clip-path is set at elapsed=0
    pts[0] = getPoint(0, MASK_X, false);
    args.push(clipDist, true);
    return easys;
}
// updateX() is called exclusively by inputX()
function updateX(p) {
    let i, j, l, v;
    for (i = 0, j = 0, l = MASK_X.length; i < l; j++) {
        v = p.x[j].value;
        clip[MASK_X[i++]] = v;
        clip[MASK_X[i++]] = v;
    }
    elms.clip.style.clipPath = F.joinCSSpolygon(clip);
}
function setSidebar(p, defD) {
    let d, i, k, key;
    for (key of Easy.eKey) {
        d = (key[0] == "v") ? 0 : defD; // d for decimals, "v" = "value"
        k = pad[key];
        for (i = 0; i < COUNT; i++)
            elms[key][i].textContent = formatNumber(p.x[i][key], k, d);
    }
}
function formatDuration(val, d) {
    const txt = val.toFixed(d) + U.seconds;
    pad.secs  = txt.length - 1;
    return txt;
}
//====== multi-only ============================================================
function formatFrames(txt) {
    pad.frame = txt.length;
    return txt + "f";
}
function formatClip(b, isStopping) {
    if (b) {
        elms.clip.style.opacity = elms.clip.opacity[Number(isStopping)]; // see multi.loadIt()
        for (var i = 0; i < COUNT; i++) //!!if this can be elms.value[i], then ucvDivs is a local var for _load!!
            P.visible(elms.ucvDivs[i].firstElementChild, isStopping);
    }
    return true;
}