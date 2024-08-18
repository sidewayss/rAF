export {refresh, initPseudo, newTargets, newTar, getMsecs, getFrame, updateX,
        setCounters, formatDuration, oneCounter};
//!!export let   initZero; // is raf.initZero applicable now? cached for animation
export const formatFrames = true;   // see setDuration()

import {E, U, Is, F, Fn, P, Ez} from "../../raf.js";

import {ezX}            from "../load.js";
import {COUNT, elms, g} from "../common.js";
import {frames, inputX, updateFrame, pseudoFrame, pseudoAnimate}
                        from "../update.js";

import {ezColor, isCSSSpace} from "./_load.js";
import {isMulti}             from "./events.js";

let keys;
const
LEFT  = "left",
RIGHT = "right",
data  = {[LEFT]:null, [RIGHT]:null};
//==============================================================================
// redraw() called by updateAll(), changeStop(), input.color(), change.space()
function refresh() {
    pseudoAnimate();
    inputX();
}
// initPseudo() sets frames[0], called exclusively by pseudoAnimate()
function initPseudo() {
    frames[0] = {t:0, left:g.start.left};
    if (elms.compare.value)
        frames[0].right = g.start.right;
    newTargets(true);
}
//==============================================================================
// newTargets() clears ez.targets adds 1 or 2 new targets (left and/or right)
function newTargets(isPseudo) {
    const
    ez = isMulti ? g.easies : ezColor,
    isComp = elms.compare.value,
    sides  = isComp ? g.leftRight : [g.left]; // [Object]

    keys = isComp ? [LEFT, RIGHT] : [LEFT];   // [String]
    ez.clearTargets();
    for (const side of sides)
        ez.newTarget(newTar(side, isPseudo, isComp));

    if (isPseudo) {
        g.easies.delete(ezX);
        g.easies.peri = updaters.pseudo;      // runs every frame
    }
    else {
        g.easies.add(ezX);
        g.easies.peri = updaters.update;      // ditto
    }
}
// newTar() helps newTargets()
function newTar(lr, isPseudo, isComp) { // isComp not defined by copyObj()
    let i, side;
    const o = {},
    hasComp = Is.def(isComp);

    if (hasComp && isMulti)             // slice out ezX: //!!delete|add(ezX) above!!
        o.easies = isPseudo ? g.easies : g.easies.slice(1);

    side = lr.id,
    o.start = Ez.noneToZero(g.start[side]);
    o.end   = Ez.noneToZero(g.end  [side]);
//!!o.currentValue = [o.start];         // currentValue must be 2D byElmByArg
    if (hasComp)                        // else copyCode()
        o.peri = updaters[side];        // runs in frames that apply values,
                                        // i.e. where e.status != E.waiting.
    if (isPseudo)
        o.pseudo = true;
    else if (hasComp) {
        o.elm  = lr.canvas;
        o.prop = P.bgColor;
        if (isCSSSpace(lr.spaces.value))
            o.func = F[lr.spaces.value];
        else
            o.cjs  = lr.color;
    }
    const mask = [];                    // create mask if any start[i] == end[i]
    for (i = 0; i < COUNT; i++)
        if (o.start[i] != o.end[i])
            mask.push(i);

    if (mask.length < COUNT)            // else default = mask all
        o.mask = mask;
    return o;
}
// updaters() are the .peri() callbacks, there are four of them because there
//            are two targets (left and right), plus updateOne() for when
//            elms.compare is off, plus pseudo().
const updaters = {
    left (oneD) { data[LEFT]  = oneD.slice(); },    // [M]Easer.proto.peri
    right(oneD) { data[RIGHT] = oneD.slice(); },

    update() { updateFrame(data, keys); },          // Easies.proto.peri
    pseudo() { pseudoFrame(data, keys); }
};
//==============================================================================
// getMsecs() is as simple as it gets, elms.time overrides everything else
function getMsecs() {
    return elms.time.valueAsNumber;
}
// getFrame() <= update() and pseudoAnimate(), can be MEaser or Easy
function getFrame(t, data) {
    const frm = {t};
    for (const key of keys)
        frm[key] = data[key];
    return frm;
}
//==============================================================================
// updateX() is called exclusively by inputX()
function updateX(frm) {
    let coords, space;
    const arr = [g.left];
    if (elms.compare.value)
        arr.push(g.right)

    for (const lr of arr) {
        space  = lr.spaces.value;
        coords = frm[lr.id];
        lr.color.coords = (space == Fn.rgb) ? coords.map(v => v / 255)
                                            : coords;
        if (isCSSSpace(space))
            P.bgColor.setOne(lr.canvas, coords, F[space]);
        else
            P.bgColor.setIt(lr.canvas, lr.color.display());
    }
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