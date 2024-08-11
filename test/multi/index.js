export {multiFromObj};

import {P, Is} from "../../raf.js";

import {updateFrame, pseudoFrame}                from "../update.js";
import {COUNT, elms, orUndefined, elseUndefined} from "../common.js";

import {clipEnd, clipStart} from "./_load.js";
import {MASK_X}             from "./_update.js";
import {objEz}              from "./_named.js";
//==============================================================================
// multiFromObj() creates/returns the object passed to Easies.proto.newTarget().
//                Converts 3 Easys to 3 pairs of Easys for the masked args:
//                    [0, 1, 2] becomes [0, 0, 1, 1, 2, 2]
//                MEBase.#easies is an Array of Easy. Illustrates an (obscure?)
//                inefficiency: every masked value is calculated even if it's
//                the same as another one. Called by newTargets(), clickCode(),
//                which passes an array of strings (local storage keys) as ezs.
function multiFromObj(ezs, isPseudo) {
    if (!isPseudo)                          // spread 3 to 6
        ezs = Array.from({length:COUNT * 2}, (_, i) => ezs[Math.floor(i / 2)]);

    const me = {easies:ezs, eKey:objEz.eKey,
                addend:clipStart,
                factor:clipEnd - clipStart};
    if (isPseudo)                           // initPseudo()
        Object.assign(me, {peri:pseudoUpdate, pseudo:true});
    else {
        Object.assign(me, Is.def(isPseudo)  // ? changePlay()
                        ? {elm:elms.clip, prop:P.clipPath, peri:update}
                        : {elm:"myElm",   prop:"P.clipPath"}
        );                                  // : clickCode()<=multiToText()
        me.mask = MASK_X;
        if (objEz.plays.some(v => v))       // convert "" to undefined
            me.plays    = objEz.plays.map(v => orUndefined(v));
        if (objEz.trip .some(v => v))       //convert "number" to number
            me.autoTrip = objEz.trip .map(v => elseUndefined(v, Number(v)));
    }
    return me;
}
//==============================================================================
// update() is the animation .peri() callback
function update(oneD) {
    updateFrame(oneD);
}
// pseudoUpdate() is the pseudo-animation .peri() callback. EBase.proto.peri()
//                doesn't know time, pseudo-animation doesn't update counters.
function pseudoUpdate(oneD) {
    pseudoFrame(oneD, false);
}