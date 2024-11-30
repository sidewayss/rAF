// Not exported by raf.js
// export everything
export {prepLegs, override, spreadToEmpties, legText, legNumber, legUnit,
        getType, getIO, toBezier, toNumberArray};

import {EBezier} from "./ebezier.js";

import {E, Is} from "../globals.js";
import {Ez}    from "../ez.js";
//==============================================================================
// prepLegs() collects legsTotal and o.emptyLegs for spreading #time or #count
//            across legs, and sets #wait, #legsWait, and #time or #count.
function prepLegs(o, type, s, e, w, tc, isInc) { // tc is "time" or "count"
    let
    legsTotal = 0,
    legsWait  = 0;
    o.emptyLegs = [];
    o.legs.forEach((leg, i) => {
        leg.prev = o.legs[i - 1];    // overwritten by stepsToLegs()
        leg.next = o.legs[i + 1];    // ditto
        legNumber(leg, s, i);
        legNumber(leg, e, i);
        legNumber(leg, w, i, ...Ez.defZero);
        legsWait += leg[w];
                                     // time and count require extra effort
        legNumber(leg, tc, i, ...Ez.undefGrThan0);
        legType(o, leg, i, type, isInc);
        if (leg.type == E.steps)
            steps(o, leg);           // E.steps: leg.timing can set leg.time

        if (leg[tc])
            legsTotal += leg[tc];    // accumulate leg.time|count
        else
            o.emptyLegs.push(leg);   // will receive o.spread
    });

    o.cEmpties = o.emptyLegs.length; // process o[tc] and legsTotal:
    if (!isInc)
        legsTotal += legsWait;
    if (o[tc]) {
        o.leftover = o[tc] - legsTotal;
        if (o.cEmpties) {            // calculate o.spread
            if (o.leftover <= 0)
                throw new Error(`${o.cEmpties} legs with ${tc} undefined `
                              + "and nothing left over to assign to them.");
            //---------------------------------
            o.spread = o.leftover / o.cEmpties;
        }
        else {                       // legsTotal overrides o[tc], in most cases
            const lastLeg = o.legs.at(-1);
            if (lastLeg.type != E.steps || lastLeg.jump & E.end)
                override(tc, undefined, o, "every", Ez.defGrThan0, legsTotal);
        }
    }
    else if (legsTotal && !o.cEmpties)
        o[tc] = legsTotal;           // o[tc] is previously undefined
    else if (!isInc)
        throw new Error("You must define a non-zero value for obj.time or every leg.time.");
    //--------------                 // !isInc is only time, no count
    return legsWait;
}
// steps() consolidates code in prepLegs()
//         Each step becomes a leg to make processing simpler during animation.
//         leg.steps  is Number, Array-ish, undefined. leg.easy eases leg.steps.
//         leg.timing is Array-ish, Easy, or undefined.
//         If leg.timing is Array-ish, leg.steps can be undefined, otherwise
//         the legs.steps or leg.steps.length must match leg.timing.length.
function steps(o, leg) {
    const s = "steps", t = "timing";
    let l, stepsIsA,
    stepsIsN = Is.Number(leg[s]);

    if (!stepsIsN && Is.def(leg[s])) {  // numeric string, array, or invalid
        const n = Is.A(leg[s]) ? NaN : parseFloat(leg[s]);
        if (Number.isNaN(n)) {      // it's an array of numbers or an error
            try {
                leg[s] = toNumberArray(leg[s].slice(), s);
            } catch {
                Ez._mustBeErr(s, "a Number, an Array [Number], or convertible "
                               + "to Number or Array [Number]")
            }
            stepsIsA = true;        // ...slice() preserves user array //!!how do you preserve it and set it at the same time??
            leg.stepsReady = true;
            if (Is.def(leg.start))
                console.info(leg.start != leg[s][0]); //!!leg.start is ignored anyway
            if (Is.def(leg.end))
                console.info(leg.end != leg[s].at(-1)); //!!leg.end is ignored anyway
        }
        else {                      // parseFloat() converted it to a number
            leg[s] = n;
            stepsIsN = true;
        }
    }
    else if (!Is.def(leg.easy))
        leg.easy = o.easy;

    if (!Is.def(leg[t]))                // validate/convert leg.timing
        leg[t] = o[t];
    if (Is.def(leg[t]) && !leg[t].isEasy) {
        try {                           // it's an array of numbers or error
            leg[t] = toNumberArray(leg[t], t);
        } catch {
            Ez._mustBeErr(t, "an Easy, an Array [Number], convertible "
                           + "to Array [Number], or undefined")
        }
        Ez._mustAscendErr(leg[t], `${t} array`);
        l = leg[t].length;
        if (stepsIsN && leg[s] != l)
            Ez._mustBeErr(`${s}`,
                          `the same as ${t}.length: ${leg[s]} != ${l}`);
        if (stepsIsA && leg[s].length != l)
            Ez._mustBeErr(`${s} and ${t} arrays`,
                          `the same length: ${leg[s].length} != ${l}`);
        //-------------------------
        const last = leg[t].at(-1);
        if (!Is.def(leg.time) || last > leg.time) {
            if (last > leg.time)
                console.warn("Your timing array extends past the total "
                           + "leg.time, and has overriden leg.time: "
                           + `${last} > ${leg.time}`);
            leg.time = last;        // avoids spreadToEmpties(), errors
        }
        leg.timingReady = true;
    }
    else {                          // auto-generate linear waits based
        const                       // on steps/ends and jump.
        j    = "jump",
        jump = leg.easy             // eased values means start = 0, end = 1
             ? E.end                //  E.end is the CSS steps() default
             : Number(leg[j] ?? o[j] ?? E.end);

        if (!E.jump[jump])
            Ez._invalidErr(j, jump, E.join(E.jump));
        //-------------
        let c;                      // the number of segments, the divisor
        if (stepsIsA) {
            l = leg[s].length;      // formulas for c/l are backwards here
            c = l + Number(jump == E.none)
                  - Number(jump == E.both);
            if (!c)
                throw new Error(`E.both requires 2 ${s} minimum.`);
        }
        else {
            c = Ez.toNumber(leg[s], s, 1, ...Ez.intGrThan0);
            l = c + Number(jump == E.both)
                  - Number(jump == E.none);
            if (!l)
                throw new Error(`{${s}:1, ${j}:E.none} = zero ${s}.`,
                                {cause:"zero steps"});
        } //----------------------------------
        const offset = jump & E.start ? 0 : 1;
        leg.waits = Array.from({length:l}, (_, i) => (i + offset) / c);
        leg.jump  = jump;   // validated/converted, see prepLegs(): lastLeg.jump
    }                       // only matters for #lastLeg...
}
//==============================================================================
// override() overrides o vs leg for start, end, time|count
//            prop is a string property name, not a Prop instance
//            called by constructor(start and end), #prepLegs(time|count)
//            for #prepLegs(): leg is always undefined, legVal is always defined
function override(prop, leg, o, txt, args, legVal = leg[prop]) {
    let obj, val;
    const oVal = o[prop];

    if (Is.def(legVal)) {   // leg over o
        if (Is.def(oVal) && legVal != oVal) {
            txt += ` leg.${prop}`;
            console.info(
                `You defined obj.${prop} and ${txt}, and they don't match. `
              + `${leg ? "" : "The sum of "}${txt} overrides obj.${prop}`);
        }
        [obj, val] = [o, legVal];
    }
    else if (Is.def(oVal))  // oVal over default value
        [obj, val] = [leg, oVal];
    else
        obj = o;            // default: o[prop] = args[0], leg[prop] = undefined

    obj[prop] = Ez.toNumber(val, prop, ...args);
}
function spreadToEmpties(leg, tc, v) {
    do { leg[tc] = v; } while((leg = leg.next));
}
function legText(i, name) {
    return `legs[${i}].${name}`;
}
function legNumber(leg, name, i, defVal, notNeg, notZero) {
    leg[name] = Ez.toNumber(leg[name], legText(i, name),
                            defVal, notNeg, notZero);
    return leg[name];
}
// legUnit() sets leg.unit, the e.unit end value for a leg, called by
//           _finishLegs(), stepsToLegs(); start, dist are o.start, o.dist
function legUnit(leg, start, dist, keys) {
    const val = (leg.end - start) / dist;
    leg[keys[0]] = val;
    leg[keys[1]] = Ez.comp(val);
}
//==============================================================================
// E.pow, E.bezier, E.steps, and E.increment require a value in a
// property of the same name. If a leg inherits the value, we might
// validate the same value more than once. The alternative is two blocks
// of validation code: one here, and one in constructor() that would
// validate all the possible values to be inherited, not just the value
// for one type, as legs of different types inherit different values.
// IMO the constructor() validation code is not worth it.
// Those types can also be set implicitly by setting that property
// value instead of setting the type.
function getType(o, defaultType, type = o.type) {
    if (!Is.def(type)) {
        for (const name of E.type.slice(E.pow))
            if (Is.def(o[name]))
                return E[name];  // E.pow, E.bezier, E.steps, E.increment
        //----------------------
        if (Is.def(defaultType))
            return defaultType;  // caller's default value
        else
            if (o.count || o.legs?.[0].increment || o.legs?.[0].count
                        || o.legs?.[0].type == E.increment)
                return E.increment;
            else
                return E.linear; // fallback default value
    }
    else if (!E.type[type])
        Ez._invalidErr("type", type, E.join(E.type));
    //----------
    return type;
}
function legType(o, leg, i, defaultType, isInc) {
    const type = getType(leg, defaultType);
    if ((type == E.increment) != isInc)
        Ez._cantBeErr("E.increment", "mixed with other types");
    //--------------
    leg.type = type;
    if (type >= E.pow) { // E.pow, E.bezier, E.steps, and E.increment
        // For E.pow and E.bezier leg[name] must be defined
        // For E.steps and E.increment additional validation occurs later
        const name = E.type[type];
        if (!Is.def(leg[name])) {
            if (!Is.def(o[name]) && type < E.steps)
                Ez._mustBeErr(`${legText(i, name)}`, "defined");
            //------------------
            leg[name] = o[name];
        }
        switch (type) {  // validate leg[name]
        case E.pow:
            legNumber(leg, name, i, o.pow, ...Ez.grThan0);
            break;
        case E.increment:
            legNumber(leg, name, i, ...Ez.undefNotZero);
        case E.bezier:   // new EBezier() must wait until leg.time defined
        case E.steps:    // ditto steps validation
        }
    }
}
function getIO(io, defaultEase = E.in) {
    const name = "io";
    switch (io) {
        case E.inOut: case E.inIn:
        case E.outIn: case E.outOut:
            if (arguments.length > 2) // leg.io, not o.io
                Ez._cantBeErr("leg.io", `${E.join(E.io, E.inIn)}. `
                                        + "You must split this leg into two legs");
        case E.in: case E.out:
            return io;
        case undefined:
            return defaultEase;
        default:
            Ez._invalidErr(name, io, E.join(E.io));
    }
}
//==============================================================================
function toBezier(val, time, name = E.type[E.bezier]) {
    try {
        if (val.isEBezier)
            val.time = time;
        else {
            val = toNumberArray(val, name);
            if (val.length != 4)
                throw new Error();
            //----------------------------------
            val = new EBezier(...val, time);
        }
    } catch {
        Ez._mustBeErr(name, "an EBezier or an array of 4 numbers");
    }
    return val;
}
function toNumberArray(val, name, notNeg) {
    return Ez.toArray(val, name, notNeg ? validNotNeg
                                        : validNumber);
}
function validNumber(val, name) { // val can be any number, but not undefined
    return Ez.toNumber(val, name, null, false, false, false, true);
}                                 //     !neg, !zero,!float,!undef

function validNotNeg(val, name) { // val must be a positive number
    return Ez.toNumber(val, name, ...Ez.defNotNeg);
}