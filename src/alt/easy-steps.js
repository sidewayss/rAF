// Not exported by raf.js
export {stepsToLegs};

import {legUnit} from "./easy-construct.js"

import {E}    from "../globals.js";
import {Ez}   from "../ez.js";
import {Easy} from "../easy/easy.js";

//==============================================================================
//  stepsToLegs() helps _finishLegs() turn 1 leg into >1 legs for _calc()
function stepsToLegs(o, leg, legDist, dist, idx, last, keys) {
    let ends, waits;
    const t = "timing";         // not "time"
    if (leg.timingReady)        // leg.timing is an array of wait times
        waits = leg[t];
    else if (leg[t])            // leg.timing is an Easy instance
        waits = easeSteps(leg[t], leg.waits, 1, 0, leg.time, t, true);
    else                        // leg.timing is undefined
        waits = leg.waits.map(v => v * leg.time);
                                // leg.waits is 0-1, portion of time
    let l = waits.length;
    const LENGTH = {length:l};
    if (leg.stepsReady)         // leg.steps is already an array of step values
        ends = leg.steps;
    else if (leg.easy)          // generate eased steps
        ends = easeSteps(leg.easy, waits, leg.time, leg.start, legDist, "easy");
    else {
        const d = legDist / l;  // generate linear steps
        ends = Array.from(LENGTH, (_, i) => leg.start + (d * (i + 1)));
    }
                                // transform the steps into legs:
    const
    start = o.start,
    legs  = Array.from(LENGTH, () => new Object);
    legs.forEach((lg, i) => {
        lg.type = E.steps;
        lg.io   = E.in;         // must be defined
        lg.end  = ends[i];      // the step value
        legUnit(lg, start, dist, keys);
        lg.prev = legs[i - 1];
        lg.next = legs[i + 1];
        lg.time = 0;            // steps don't have a duration
        lg.wait = waits[i] - (i ? waits[i - 1] : 0);
    });
    if (leg.wait)
        legs[0].wait += leg.wait;

    const obj = {};
    if (idx == 0)               // _firstLeg
        obj.firstLeg = legs[0];
    else {                      // replace leg in the linked list
        legs[0].prev  = leg.prev;
        leg.prev.next = legs[0];
    }
    --l;
    const leftover   = leg.time - waits[l];
    legs[l].leftover = leftover;
    if (idx == last) {          // #lastLeg
        o.end   = legs[l].end;
    //!!o.time -= leftover;
        obj.lastLeg = legs[l];
    }
    else {                      // continue to replace leg in the list
        legs[l].next   = leg.next;
        leg.next.prev  = legs[l];
        leg.next.wait += leftover;
    }
    return obj;
}
//  easeSteps() helps stepsToLegs() use an Easy to set the timing or
//         values for E.steps. ez cannot be E.increment here because it has
//         either no end, or no duration; and its legs cannot be E.steps, to
//         avoid infinite easeSteps loops and because not-eased is linear or
//         fixed values, which is pointless.
//         For eased values, jump:E.start has no effect because time=0 produces
//         value=0. So E.start is the same as E.none, E.end same as E.both.
function easeSteps(ez, nows, time, start, dist, name, isTiming) {
    Easy._validate(ez, name);                   // phase 1 validation
    if (ez.isIncremental)                       // phase 2: can't be E.increment
        Ez._cantBeErr(name, "class Incremental");
    //------------------------------------------
    let leg = ez._firstLeg;
    const ezDown = ez.end < ez.start;
    do {                                        // for each leg:
        if (leg.type == E.steps)                   // phase 3: can't be E.steps
            Ez._cantBeErr(name, "type:E.steps");
        if (isTiming && (ezDown != leg.end < leg.start
                      || (leg.type >= E.back && leg.type <= E.bounce)
                      || (leg.type == E.bezier && Ez.unitOutOfBounds(leg.bezier.array))))
            Ez._cantBeErr(                      // phase 4: can't mix directions
                name,
                "an Easy that changes direction. Time only moves in one direction",
                {cause:"reverse time"}          // better *not* as string...
            );
    } while((leg = leg.next));
    //------------------------------------------// validation complete
    ez._zeroOut(0);                             // prep for pseudo-animation
    const d    = time / ez.time;                // d for divisor
    const prop = ezDown ? E.comp : E.unit;      // nows always ascends
    return nows.map(v => {
       ez._easeMe(v / d);
       return start + (ez.e[prop] * dist);
    });
}