export {multiFromObj};

import {P, Is} from "../../raf.js";

import {updateFrame, pseudoFrame}                   from "../update.js";
import {COUNT, elms, g, orUndefined, elseUndefined} from "../common.js";

import {clipEnd, clipStart} from "./_load.js";
import {MASK_X}             from "./_update.js";
import {objEz}              from "./_named.js";

let data;
//==============================================================================
// multiFromObj() creates/returns the object passed to Easies.proto.newTarget().
//                Converts 3 Easys to 3 pairs of Easys for the masked args:
//                    [0, 1, 2] becomes [0, 0, 1, 1, 2, 2]
//                MEBase.#easies is an Array of Easy. Illustrates an (obscure?)
//                inefficiency: every masked value is calculated even if it's
//                the same as another one. Called by newTargets(), clickCode(),
//                which passes an array of strings (local storage keys) as ezs,
function multiFromObj(ezs, isPseudo) {          // and does not define isPseudo.
    if (isPseudo)
        g.easies.peri = pseudoUpdate;
    else {
        g.easies.peri = update;                 // spread 3 to 6:
        ezs = Array.from({length:COUNT * 2}, (_, i) => ezs[Math.floor(i / 2)]);
    }
    const me = {easies:ezs, eKey:objEz.eKey,
                addend:clipStart,
                factor:clipEnd - clipStart};
    if (isPseudo)                               // initPseudo()
        Object.assign(me, {peri:pseudoMe, pseudo:true});
    else {
        Object.assign(me, Is.def(isPseudo)      // ? changePlay()
                        ? {elm:elms.clip, prop:P.clipPath, peri:updateMe}
                        : {elm:"myElm",   prop:"P.clipPath"}
        );                                      // : clickCode()<=multiToText()
        me.mask = MASK_X;
    }
    if (objEz.plays?.some(v => v))          // convert to Number or undefined
        me.plays    = objEz.plays.map(v => orUndefined(Number(v)));
    if (objEz.trip?. some(v => v !== null)) // convert null to undefined
        me.autoTrip = objEz.trip .map(v => elseUndefined(v !== null, v));

    return me;
}
//==============================================================================
// update() and pseudoUpdate are the g.easies.peri() callbacks
function update() {
    updateFrame(data);
}
function pseudoUpdate() {
    pseudoFrame(data);
}
// updateMe() and pseudoMe() are the MEaser.peri() callbacks. They don't execute
// every frame for E.steps, so they store the data for g.easies.peri().
function updateMe(oneD) {
    data = oneD.filter((_, i) => i % 2);
}
function pseudoMe(oneD) {
    data = oneD;
}