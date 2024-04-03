// Not exported by raf.js
export {Prop, Bute, PrAtt, HtmlBute}

import {PBase} from "./pbase.js";

import {E, Ez, F, P} from "../raf.js"
//==============================================================================
class Prop extends PBase {
    constructor() {
        super(...arguments);
        Ez.is(this);
    }
//  count() returns argument count
    count(f = this.func) {
        if (f)
            return f.count;
        //-------------
        switch (this) {
        case P.tO:          // transformOrigin
            return 3;
        case P.m: case P.p: // margin, padding
            return 4;
        default:
            return this.isUn ? 0 : 1;
        }
    }
//  required() returns required arg count
    required(f = this.func) { return f?.required ?? 1; }

//  cut() aka remove() removes this property from one or more elements.
//  removeProperty() requires a kebab-case name.
    cut(elms) {
        const name = Ez.camelToKebab(this.name);
        for (const elm of Ez.toElements(elms))
            elm.style.removeProperty(name);
    }
}
//==============================================================================
// Bute assumes that no numeric attributes use units, which is true for the
// attributes supported at this time. The name Attr is already taken:
// https://developer.mozilla.org/en-US/docs/Web/API/Attr
class Bute extends PBase {
    constructor() {
        super(...arguments);
        Ez.is(this);
    }
//  count() returns argument count
    count(f = this.func) {
        if (f)              //$$ the price of supporting SVG rotate()
            return f === F.r ? 3 : f.count;
        //-----------------
        switch (this) {
        case P.bF:      // baseFrequency
            return  2;
        case P.vB:      // viewBox
            return  4;
        case P.values:  // <feColorMatrix>type="matrix"
            return 20;
        default:
            return this.isUn ? 0 : 1;
        }
    }
//  required() returns required arg count
    required(f = this.func) {
        return f?.required ?? (this === P.vB ? 4 : 1);
    }
//  cut() aka remove() removes this attribute from one or more elements.
//  An element can have a value in both the style.property and the element
//  attribute. This class sets the attribute only.
    cut(elms) {
        const name = this.name;
        for (const elm of Ez.toElements(elms))
            elm.removeAttribute(name);
    }
//  getOne() gets a single element's value. Returns "" instead of null
//  because it's friendlier to always return a string. The spec allows for
//  some property/attribute values to have leading or trailing whitespace.
//  If not trimmed, parse(v) or v.split() return leading/trailing array
//  elements containing "".
    getOne(elm) {
        return elm.getAttribute(this.name)?.trim() ?? "";
    }
//  setIt() and setEm() override PBase
    setIt(elm,  str) { elm.setAttribute(this.name, str); }
    setEm(elms, arr, l = elms.length) {
        for (var i = 0, name = this.name; i < l; i++)
            elms[i].setAttribute(name, arr[i]);
    }
//  _unitz() overrides PBase because SVG transforms don't use units
    _unitz() { return this.units; }

//  isDef() exists because this.getOne() changes null to ""
    isDef(elm)  { return elm.getAttribute(this.name) !== null; }
}
//==============================================================================
// PrAtt is for hybrid property-attributes such as most all the SVG attributes
// as of today. They can be set in SVG or CSS, but CSS has precedence.
class PrAtt extends PBase {
    constructor() {
        super(...arguments);
        Ez.is(this);
    }
//  count() and required() are the simplest for PrAtt
    count   (f = this.func) { return f?.count    ?? 1; }
    required(f = this.func) { return f?.required ?? 1; }

//  cut() aka remove() removes this property from one or more elements.
//  An element can have a value in both the style.property and the element
//  attribute. The both argument allows you to remove both at once.
//  removeProperty() and removeAttribute() both require a kebab-case name.
    cut(elms, both) {
        const name = Ez.camelToKebab(this.name);
        for (const elm of Ez.toElements(elms)) {
            elm.style.removeProperty(name);
            if (both)
                elm.removeAttribute?.(name); // elm can be a CSSStyleRule
        }
    }
}
//==============================================================================
// HtmlBute is for animation only. Why write P.value.set(elm, val) when you can
// write elm.value = val? Currently only for <input>.value.
// Is it an attribute or a property? "value" is both, attribute for the initial
// value, then property for any other value the user or code might set, but it's
// not a styleable property, it's a direct property on the object.
class HtmlBute extends PBase {
    constructor() {
        super(...arguments);
        Ez.is(this);
    }
    count()    { return 1; }
    required() { return 1; }

    getOne(elm) { return elm[this.name]; }

    setIt(elm, val) {
        elm[this.name] = val;
    }
    setEm(elms, arr, l = elms.length) {
        for (var i = 0, name = this.name; i < l; i++)
            elms[i][name] = arr[i];
    }
}