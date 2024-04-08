export {multiFromObj};

import {P, Is} from "../../raf.js";

import {frames, updateFrame}                        from "../update.js";
import {COUNT, elms, g, orUndefined, elseUndefined} from "../common.js";

import {clipEnd, clipStart} from "./_load.js";
import {MASK_X,  getFrame}  from "./_update.js";
import {objEz}              from "./_named.js";
//==============================================================================
// multiFromObj() reduces 3 pairs of Easys to 3 Easys for easies.newTarget(),
//             MEBase.#easies is an Array: [Easy]. Illustrates an obscure
//             inefficiency: every masked value is calculated even if it's the
//             same as another one. Called by newTargets() and clickCode(),
//             which passes in an array of string Easy names as arr.
function multiFromObj(arr, isPseudo) {
    const me = {start:clipStart, end:clipEnd, mask:MASK_X, eKey:objEz.eKey,
               easies:Array.from({length:COUNT * 2}, // [0, 0, 1, 1, 2, 2]
                                 (_, i) => arr[Math.floor(i / 2)])};
    if (isPseudo)
        me.peri = pseudoUpdate;                              // pseudoAnimate()
    else {
        Object.assign(me, Is.def(isPseudo)                   // changePlay()
                        ? {elm:elms.clip, prop:P.clipPath, peri:update}
                        : {elm:"myElm",   prop:"P.clipPath"} // clickCode()
        );
        if (objEz.plays.some(v => v)) // convert "" to undefined
            me.plays    = objEz.plays.map(v => orUndefined(v));
        if (objEz.trip .some(v => v)) // ...and convert "n" to n
            me.autoTrip = objEz.trip .map(v => elseUndefined(v, Number(v)));
    }
    return me;
}
//==============================================================================
// update() is the animation .peri() callback
function update(oneD) { // not exported
    updateFrame(oneD);
}
// pseudoUpdate() is the pseudo-animation .peri() callback. EBase.proto.peri()
//                doesn't know time, pseudo-animation doesn't update counters.
function pseudoUpdate(oneD) {
    frames[++g.frameIndex] = getFrame(0, oneD); // 0 is dummy time
}