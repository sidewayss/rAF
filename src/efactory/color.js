export {color, cjsTo};

import {Ez} from "../raf.js"
//==============================================================================
// color() sets o.cjs, the primary Color instance
function color(o) {
    if (o.prop && o.func && o.func.isCFunc != o.prop.isColor)
        Ez._cantErr("You", `use ${o.func.name} with ${o.prop.name}`);
    //-------------
    if (!o.cjs)
        o.cjs = o.colorjs;                   // alt long name for users
    if (o.cjs) {
        if (!isCjs(o.cjs))
            Ez._mustBeErr("colorjs", "an instance of Color");
        else if (o.prop && !o.prop.isColor) //!!until .isNet and gradients/color-mix
            Ez._cantErr("You", `use colorjs with ${o.prop.name}`);
        else if (o.func && (o.func.space ?? o.func.name) != o.cjs.cssId)
            Ez._mustBeErr(`The colorjs space (${o.cjs.cssId})` // rgb !=srgb, but why use colorjs for rgb??
                        + `the same as the func (${o.func.space ?? o.func.name})`);
        //-------------------
        o.cjs = o.cjs.clone();               // preserve the user object and
        if (o.displaySpace) {                // avoid later user mutations.
            let ds = o.displaySpace;
            if (!ds.space) {
                if (isCjsSpace(ds))          // it's a ColorSpace
                    ds = ds.id;              // we want the string id as
                o.displaySpace = {space:ds}; // an object property for Color.js
            }
            try {                            // use Color.js to validate it
                o.cjs.display(o.displaySpace);
            }
            catch (err) {
                err.message = "displaySpace property - " + err.message;
                throw err;
             } //---------
        }
        o.space = Ez.kebabToSnake(o.cjs.spaceId);
    } //o.space is used only once, in current(), but it's simpler to set it here
}
// cjsTo() converts CSS color strings to o.cjs's color space, using Color.to().
//         If you set o.currentValue, you can use Color.js serialized space ids.
function cjsTo(o, cv) { // only called if o.cjs is defined and validated
    let cjs;
    const to    = o.cjs.constructor.to;
    const space = o.cjs.space;
    cv.forEach((v, i) => {
        try { cjs = to(v, space); }
        catch (err) { // should never happen for DOM values, only o.currentValue
            throw new Error(`elms[${i}]'s ${o.prop.name} value is an invalid `
                          + `color string: ${v}\n${err}`);
        }
        cv[i] = [...Ez.noneToZero(cjs.coords), cjs.alpha];
    });
    return cv;
}// isCjs() validates that val is an instance of Color, but Color is not imported
//         here, so can't use `val instanceof Color`. ditto isCjsSpace().
function isCjs(obj) {
    try   { return obj?.constructor.name == "Color" && "cam16_jmh" in obj; }
    catch { return false; }
}
function isCjsSpace(obj) {  // `in` throws when obj is Number, String
    try { return obj?.constructor.name == "ColorSpace" && "gamutSpace" in obj; }
    catch { return false; }
}