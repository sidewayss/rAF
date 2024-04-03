export {refRange, newTargets, getCamel, getCase};
const refRange = {};

import {E, F, P, Ez} from "../../raf.js";

import {updateFrame}     from "../update.js";
import {COUNT, elms, g, toFunc} from "../common.js";

import {ezColor} from "./_load.js";
import {isMulti} from "./events.js";
//==============================================================================
// newTargets() clears ez.targets then adds oneLE or more new targets
function newTargets(ez = isMulti ? g.easies : ezColor) {
    const isComp = elms.compare.value;
    ez.clearTargets();
    ez.newTarget(newTar(g.left, isComp));
    if (isComp)
        ez.newTarget(newTar(g.right));
}
// newTar() helps newTargets()
function newTar(lr, isComp) {
    const
    mask = [],
    side = lr.id,
    o = {
        elm:   lr.canvas,
        prop:  P.bgColor,
        eKey:  E.unit,
        start: Ez.noneToZero(g.start[side]), // can't animate NaN
        end:   Ez.noneToZero(g.end[side]),
        peri:  toFunc("update", isComp ? side : "one", updaters),
        autoTrip: elms.roundTrip.value
    };
    o.currentValue = [o.start];     // array of numbers must be 2D byElmByArg
    if (isMulti)
        o.easies = easys;

    if (lr.spaces.selectedOptions[0].dataset.isCjs)
        o.cjs = lr.color;
    else
        o.func = F[lr.spaces.value];

    for (let i = 0; i < COUNT; i++) // create mask if any start[i] == end[i]
        if (o.start[i] != o.end[i])
            mask.push(i);

    if (mask.length < COUNT)
        o.mask = mask;

    return o;
}
//==============================================================================
// updaters() are the .peri() callbacks, there are three of them because there
//            are two targets, left and right, each with its own callback plus
//            updateOne(), for when elms.compare is off.
const LEFT  = "left",
      RIGHT = "right";
const data     = {[LEFT]:null, [RIGHT]:null};
const updaters = {
    updateOne(oneD) {   // only left side showing
        data[LEFT] = oneD;
        updateFrame(data, [LEFT]);
    },
    updateLeft(oneD) {  // runs first
        data[LEFT] = oneD;
    },
    updateRight(oneD) { // runs second
        data[RIGHT] = oneD;
        updateFrame(data, [LEFT, RIGHT]);
    }
}
//==============================================================================
function getCamel(elm) {
    return elm.id.slice(0, elm.id.search(/[A-Z]/));
}
function getCase(elm) {
    return elm.id.slice(elm.id.search(/[A-Z]/));
}