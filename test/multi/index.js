// export everything but update()
export {OVERRIDES, MASK_X, clip, easys, measer, meFromForm};

import {P} from "../../raf.js";

import {updateFrame} from "../update.js";
import {COUNT, elms, orUndefined, elseUndefined} from "../common.js";

import {clipEnd, clipStart} from "./_load.js";
import {objFromForm}        from "./_named.js";

let measer;
const OVERRIDES = ["plays","eKey","trip"];

const MASK_X = [6,8, 14,16, 22,24]; // polygon's animated x-value indexes
const clip   = new Array(32);       // there are 32 polygon numbers
const easys  = new Array(COUNT);    // easys = [Easy x 3], g.easies = Easies
//==============================================================================
// meFromForm() reduces 3 pairs of Easys to 3 Easys via easies.newTarget(),
//              illustrates an obscure inefficiency: every masked value is
//              calculated even if it's the same as another one; called by
//              initEasies(), clickCode(), MEBase.#easies is an Array: [Easy].
function meFromForm(arr = easys) { // arr can be an array of string Easy names
    let autoTrip, me, obj, plays;
    obj = objFromForm();
    if (obj.plays.some(v => v))     // if defined, converted to Number
        plays = obj.plays.map(v => orUndefined(v));
    if (obj.trip.some(v => v))      // if defined, converted to Bool
        autoTrip = obj.trip.map(v => elseUndefined(v, Number(v)));

    me = {mask:MASK_X,   start:clipStart, end:clipEnd,
          eKey:obj.eKey, plays, autoTrip,
        easies:Array.from({length:COUNT * 2},
                          (_, i) => arr[Math.floor(i / 2)])};

    obj = (arr === easys)
        ? {elm:elms.clip, prop: P.clipPath, peri:update }
        : {elm:"myElm",   prop:"P.clipPath"}

    return Object.assign(obj, me);
}
// update() is the .peri() callback, filters arguments for updateFrame
function update(oneD) { // not exported
    updateFrame(oneD);
}