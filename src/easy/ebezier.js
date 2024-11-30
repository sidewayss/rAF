/* This module is based on:
 *  https://chromium.googlesource.com/chromium/blink/+/master/Source/platform/animation/UnitBezier.h
 * and the last function in this file, accuracyForDuration():
 *  https://chromium.googlesource.com/chromium/blink/+/refs/heads/main/Source/platform/animation/AnimationUtilities.h
 * which I assume is all based on:
 *  https://github.com/WebKit/WebKit/blob/main/Source/WebCore/platform/graphics/UnitBezier.h
 * and thus requires this header:
 ****************************************************
 * Copyright (C) 2008 Apple Inc. All Rights Reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE INC. OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
import {Ez} from "../ez.js";
//==============================================================================
export class EBezier {
//  #accuracy is a relative level of precision for the calculation. If you want
//  more or less precision you can set this.time to a bigger or smaller number.
//  #accuracy is pre-calculated, which is one less calculation during animation,
//  but beware of reusing the same EBezier instance for legs of different
//  durations in the same animation (if you're concerned about the precision).
    #accuracy; #time;
    constructor(x1, y1, x2, y2, time) {
        // Calculate the polynomial coefficients, implicit first and last
        // control points are (0,0) and (1,1).
        Ez.readOnly(this, "cx", 3 * x1);
        Ez.readOnly(this, "cy", 3 * y1);
        Ez.readOnly(this, "bx", 3 * (x2 - x1) - this.cx);
        Ez.readOnly(this, "by", 3 * (y2 - y1) - this.cy);
        Ez.readOnly(this, "ax", 1 -  this.bx  - this.cx);
        Ez.readOnly(this, "ay", 1 -  this.by  - this.cy);

        Ez.readOnly(this, "x1", x1);    // required for .reversed and .array
        Ez.readOnly(this, "y1", y1);
        Ez.readOnly(this, "x2", x2);
        Ez.readOnly(this, "y2", y2);

        this.time = time; // setter
        Ez.is(this);
        Object.seal(this);
    }
//==============================================================================
// this.array() returns the original four values as an array
    get array() {
        return [this.x1, this.y1, this.x2, this.y2];
    }
// this.reversed is for round-tripping
    get reversed() {
        return new EBezier(1 - this.x2, 1 - this.y2,
                           1 - this.x1, 1 - this.y1,
                           this.#time);
    }
// this.time calculates #accuracy, the precision for evaluating a timing
//           function in an animation with the specified duration.
    set time(time) {
        this.#accuracy =  1 / (200 * time);
        this.#time = time;
    }
//==============================================================================
//  solve() is called as this.#leg.ease() in Easy.prototype.#ease().
    solve(x) {
        return this.#sampleCurveY(this.#solveCurveX(x));
    }
    #sampleCurveY(t) {
        return ((this.ay * t + this.by) * t + this.cy) * t;
    }
    #sampleCurveX(t) {
        // ax t^3 + bx t^2 + cx t expanded using Horner's rule.
        return ((this.ax * t + this.bx) * t + this.cx) * t;
    }
    #sampleCurveDerivativeX(t) {
        return (3 * this.ax * t + 2 * this.bx) * t + this.cx;
    }
    // Given an x value, find a parametric value it came from.
    #solveCurveX(x) {
        // First try a few iterations of Newton's method, normally very fast
        let d2, i, t0, t1, t2, x2;
        for (t2 = x, i = 0; i < 8; i++) {
            x2 = this.#sampleCurveX(t2) - x;
            if (Math.abs(x2) < this.#accuracy)
                return t2;
            d2 = this.#sampleCurveDerivativeX(t2);
            if (Math.abs(d2) < 1e-6)
                break;
            t2 = t2 - x2 / d2;
        }
        // Fall back to the bisection method for reliability
        t0 = 0;
        t1 = 1;
        t2 = x;
        if (t0 - t2 > Number.EPSILON)
            return t0;
        if (t2 - t1 > Number.EPSILON)
            return t1;
        while (t1 - t0 > Number.EPSILON) {
            x2 = this.#sampleCurveX(t2);
            if (Math.abs(x2 - x) < this.#accuracy)
                return t2;
            if (x > x2)
                t0 = t2;
            else
                t1 = t2;
            t2 = (t1 - t0) * 0.5 + t0;
        }
        return t2; // Failure
    }
}