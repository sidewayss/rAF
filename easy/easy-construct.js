// Not exported by raf.js
// export everything
export {prepLegs, override, spreadToEmpties, legText, legNumber, legUnit,
        getType, getIO, splitIO, toBezier, toNumberArray};

import {E, Is, Ez, Easy} from "../raf.js";

import {steps}   from "./easy-steps.js"
import {EBezier} from "./ebezier.js";
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
        legNumber(leg, s, i);        // all non-incremental legs define
        legNumber(leg, e, i);        // start and end.
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
        else                         // legsTotal overrides o[tc]
            override(tc, undefined, o, "every", Ez.defGrThan0, legsTotal);
    }
    else if (!o.cEmpties)
        o[tc] = legsTotal;           // o[tc] is previously undefined
    else if (!isInc)
        throw new Error("You must define a non-zero value for "
                      + `obj.${tc} or for every leg.${tc}.`);
    //--------------
    return legsWait;
}
//==============================================================================
// override() overrides o vs leg for start, end, wait, time|count
//            prop is a string property name, not a Prop instance
//            called by constructor(), #prepLegs()
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
// legUnit() leg.unit = this._legUnit() = the e.unit end value for a leg,
//           called by _finishLegs(), stepsToLegs().
function legUnit(leg, start, dist) { // start is o.start, not leg.start
    return (leg.end - start) / Math.abs(dist);
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
        for (const name of Easy.type.slice(E.pow))
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
    else if (!Easy.type[type])
        Ez._invalidErr("type", type, Easy._listE("type"));
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
        const name = Easy.type[type];
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
                Ez._cantBeErr("leg.io", `${Easy._listE(name, E.inIn)}. `
                                        + "You must split this leg into two legs");
        case E.in: case E.out:
            return io;
        case undefined:
            return defaultEase;
        default:
            Ez._invalidErr(name, io, Easy._listE(name));
    }
}
// splitIO() splits two-legged io values into a 2 element array
//           first leg = in:0, out:1, second leg = _in:2, _out:4
function splitIO(io, fillTwo) {
    return io > E.out ? [io % 2, (io & 4) / 4] // 4 = _out = 2nd leg E.out
           : fillTwo  ? [io, io]
                      : [io];
}
//==============================================================================
function toBezier(val, time, name = Easy.type[E.bezier]) {
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