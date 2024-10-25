// To put it bluntly: <input type="number"> sucks. This code is necessary to
// format the values properly while spinning (mouse & arrow keys) versus while
// inputting numbers as text. Exports everything except isSpinning and number.
import {Ez} from "../src/raf.js";

import {INPUT, CHANGE, elms, g} from "./common.js";

let isSpinning;
//==============================================================================
// >> number contains event handlers
const number = {
    input(evt) {
        const
        tar = evt.target,
        n   = tar.valueAsNumber,
        b   = Number.isNaN(n);
        invalidInput(tar, b);
        if (!b && isSpinning)
            formatInputNumber(tar, maxMin(tar, n));
    },
    change(evt) {
        const tar = evt.target;
        formatInputNumber(tar, maxMin(tar, tar.valueAsNumber ?? tar.value));
    },
    mousedown() {
        isSpinning = true; // input, change only fires if spinning
    },
    keydown(evt) {
        if (evt.key == "ArrowDown" || evt.key == "ArrowUp")
            isSpinning = true;
    },
    mouseup() {
        isSpinning = false;
    },
    keyup(evt) {
        switch (evt.key) {
        case "ArrowDown": case "ArrowUp":
            isSpinning = false;
            break;
        case "Enter": case "Escape":
            document.activeElement.blur();  // fires change event for Escape,
        }                                   // Esc does not cancel input, it's
    }                                       // the same as Enter here.
};
// listenInputNumber() is the only public access to number
export function listenInputNumber(elements) {
    let elm, key;
    const
    events = [INPUT, CHANGE, "mousedown", "keydown", "mouseup", "keyup"],
    minmax = ["min", "max"];
    for (elm of elements) {
        for (key of events)
            elm.addEventListener(key, number[key]);
        for (key of minmax) {           // enforce min/max in input, change
            elm.dataset[key] = elm[key] // events instead of letting the DOM
            elm.removeAttribute(key);   // do it automatically.
        }
    }
}
//==============================================================================
// invalidInput() helps number.input(), input.color(), click.clear(), more than
//                one input can be invalid, #x and #play only enabled if none.
export function invalidInput(elm, b) {
    elm.classList.toggle("invalid", b);
    g.invalids[b ? "add" : "delete"](elm);
    b = Boolean(g.invalids.size);
    elms.x   .disabled = b;
    elms.play.disabled = b;
}
// isInvalid() returns true for inputs with class="invalid"
export function isInvalid(elm) {
    return g.invalids.has(elm);
}
//==============================================================================
// formatInputNumber() sets decimal places for <input type="number"> by id,
//                     called by easingFromObj(), vtArray(), inputTypePow(),
//                               clickClear(), updateSplitGap(), setSplitGap().
export function formatInputNumber(elm, n) {
    let decimals;
    switch (elm.id[0]) {
        case "m":
        case "v": decimals = 0; break; // mid, v0-2
        case "p": decimals = 1; break; // pow and pow2
        case "b": decimals = 2; break; // bezier0-3
        default:  decimals = 3;        // split, gap, t0-2
    }
    elm.value = Number(n).toFixed(decimals);
}
// maxMin() enforces the max and min properties for numeric inputs
export function maxMin(elm, n = elm.valueAsNumber) {
    return Ez.clamp(elm.dataset.min, n, elm.dataset.max);
}