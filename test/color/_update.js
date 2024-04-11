// export everything via import(), explicitly imported: redraw, all functions
export {refresh, getFrame, initPseudo, newTargets, updateX, setCounters,
        oneCounter, formatDuration, formatFrames};

import {E, U, F, P, Ez} from "../../raf.js";

import {ezX} from "../load.js";
import {frames, inputX, updateFrame, pseudoAnimate} from "../update.js";
import {COUNT, elms, g, elseUndefined}              from "../common.js";

import {ezColor} from "./_load.js";
import {objEz}   from "./_named.js";
import {isMulti} from "./events.js";
//==============================================================================
// redraw() called by updateAll(), changeStop(), input.color(), change.space()
function refresh() {
    pseudoAnimate();
    inputX();
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
//==============================================================================
// initPseudo() sets frames[0], called exclusively by pseudoAnimate()
function initPseudo() {
    frames[0] = {t:0, left:g.start.left};
    if (elms.compare.value)
        frames[0].right = g.start.right;
    newTargets(true);
}
// newTargets() clears ez.targets adds 1 or 2 new targets (left and/or right)
function newTargets(isPseudo) {
    const
    isComp = elms.compare.value,
    sides  = isComp  ? g.leftRight : [g.left],
    ez     = isMulti ? g.easies    : ezColor;

    ez.clearTargets();
    if (isPseudo && isComp)
        ez.newTarget(newTar(null, isPseudo, isComp));
    else
        for (const side of sides)
            ez.newTarget(newTar(side, isPseudo, isComp));

    g.easies[isPseudo ? "delete" : "add"](ezX);
}
// newTar() helps newTargets()
function newTar(lr, isPseudo, isComp) {
    let o, side;
    if (lr) {
        side = lr.id,
        o = {
            start:    Ez.noneToZero(g.start[side]),
            end:      Ez.noneToZero(g.end[side]),
            autoTrip: elseUndefined(!isPseudo, elms.roundT.value)
        };
        o.currentValue = [o.start]; // currentValue must be 2D byElmByArg
    }
    else {
        let arr, se;                // isPseudo && isComp
        o = {};
        for (se of g.startEnd) {
            arr = [];
            for (side of g.leftRight.map(obj => obj.id))
                arr.push(...Ez.noneToZero(se[side]));
            o[se.id] = arr;
        }
    }

    if (isPseudo)
        o.peri = updaters.pseudo;
    else {
        o.peri = updaters[isComp ? side : "one"];
        o.elm  = lr.canvas;
        o.prop = P.bgColor;
        if (lr.spaces.selectedOptions[0].className) // class="colorjs" or ""
            o.cjs = lr.color;
        else
            o.func = F[lr.spaces.value];
    }

    if (isMulti) {
        o.easies = easys;
        o.eKey = objEz.eKey;
    }
    else
        o.eKey = E.unit;

    const mask = [];
    for (let i = 0; i < COUNT; i++) // create mask if any start[i] == end[i]
        if (o.start[i] != o.end[i])
            mask.push(i);

    if (mask.length < COUNT)
        o.mask = mask;

    return o;
}
// updaters() are the .peri() callbacks, there are three of them because there
//            are two targets, left and right, each with its own callback plus
//            updateOne(), for when elms.compare is off.
const
LEFT  = "left",
RIGHT = "right",
data  = {[LEFT]:null, [RIGHT]:null},

updaters = {
    one(oneD) {             // only left side showing
        data[LEFT] = oneD;
        updateFrame(data, [LEFT]);
    },
    left(oneD) {            // runs first
        data[LEFT] = oneD;
    },
    right(oneD) {           // runs second
        data[RIGHT] = oneD;
        updateFrame(data, [LEFT, RIGHT]);
    },
    pseudo(oneD) {          // either or both sides concatenated in oneD
        frames[++g.frameIndex] = getFrame(0, oneD);
    }
};
//==============================================================================
// getFrame() <= update() and pseudoAnimate(), can be MEaser or Easy
function getFrame(t, data, keys) {
    const frm = {};
    if (keys) {
        frm.t = t;
        for (const key of keys)
            frm[key] = data[key];
    }
    else {          // pseudoAnimate()
        frm[LEFT]  = data.slice(0, COUNT);
        frm[RIGHT] = data.slice(COUNT);
    }
    return frm;
}
//==============================================================================
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