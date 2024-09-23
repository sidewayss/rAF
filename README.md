<img src="img/rAFoffset.svg" type="image/svg+xml" style="width:180px; height:180px;"></object>
# JavaScript animation library for CSS and SVG
## What is it?
The name **rAF** is a common abbreviation for the core JavaScript animation function: `requestAnimationFrame()`. It is a highly flexible animation library for HTMLElements, SVGElements, and CSSStyleRules. It includes 99% of CSS animation functionality, but also extends that functionality greatly.
It is a solo open source project about to be released in its first public version 1.0. Hopefully others will contribute in the future.
## Getting started
If you want to skip the formalities and jump right in, the best place to start is the <a href="apps/">Three Apps</a> (web pages) that test/demonstrate the app and generate starting-point JavaScript code for the configured animation. I am hosting them on my personal site. GitHub Pages will be up when I learn how to fully disable Jekyll...
<p>There are also animation examples in these collections on CodePen:</p>
<p><i>...coming soon along with v1.0</i></p>
<p><a href="docs/raf-by-class.html">Properties and Methods by Class</a> catalogs classes and constants you might want to use. The current state of documentation is like a sparse array. Hopefully the examples, apps, and app instructions will help to fill in the gaps.</p>

<h2>Setup</h2>
<p><span class="rAF">rAF</span> is modular. There are currently no packages or minified file. Should be coming your way soon after v1.0. For most users <span>raf.js</span> provides all the exports you need. Here is a typical import statement:</p>
<p><span>import {E, Ez, F, P, PFactory, Easy, Easies, AFrame}<br>from "https://sidewayss.com/raf/src/raf.js";</span></p>
<p>To initializes constants, including the <span>F</span> and <span>P</span> objects containing all the built-in <span>Func</span> and <span>Prop</span> instances, you must run this line of code prior to using any other <span class="rAF">rAF</span> features:</p>
<p><span>PFactory.init();</span></p>

<h2>Features</h2>
<p><i>...coming soon along with v1.0</i></p>

<h2>Why bother?</h2>
<p>I originally got interested in web animations through animating SVG sheet music scores created and exported to SVG by <a href="https://musescore.org">MuseScore</a> (github repo <a href="https://github.com/musescore/MuseScore">here</a>). I then decided to create a heavily animated personal web site. In that process I consolidated a bunch of common animation code and created the initial version of <span class="rAF">rAF</span>.</p>
<p>Soon thereafter I stepped away from programming for the next five years. Upon my return in April, 2023 I started to update my personal site. I soon realized that CSS had evolved notably and that my core design for <span class="rAF">rAF</span> was outdated and not as clean or complete as I had thought. I was considering seeking gainful employment in programming again, and updating <span class="rAF">rAF</span> seemed like a good way to freshen up my skills and produce a result that would fill in for the gap in my CV.</p>
<p>I don't expect to see a lot of interest in <span class="rAF">rAF</span>. It's a now obscure niche, and there have been many animation libraries produced since Velocity.js took the web by storm well over a decade ago. I was mostly animating SVG, and Velocity doesn't do SVG gradients, among other things, so I built my own stuff.</p>
<p>These days animated video is much more common than web animations, and I can understand why: way more tools for creation and more reliable results. The one advantage that web animations have is their interactivity, but how many interactive animations have you seen beyond the welcome animation on my personal site?</p>
<p>Running a digital video stream through a codec is a lot more reliable than running a JavaScript animation. Browser differences can mostly be ignored. The code has been supremely optimized. Loss of resolution due to bandwidth is friendlier than a stuttering or otherwise malfunctioning animation, and users are more familiar with it. They understand what's to blame.</p>
<p>This is a project built for personal satisfaction & education, a goofy personal website, and to demonstrate that I can still write solid code. I figure there might be a few other people out there who want to do more extreme animations, and maybe they'll find it useful. Maybe I'll even get a few people interested in contributing. Maybe not.</p>

<b>**rAF** provides a flexible, structured, and compact way to create and execute CSS or SVG animations of two types:</b><br>
&nbsp;• Gradual value changes, aka easing or steps<br>
&nbsp;• Cue-based animations, where timing cues trigger animation events<br>
It also provides an alternate paradigm for setting properties/attributes where the property sets the value on the element, not the other way around.  It has its advantages.

<b>Goals, Assumptions, and Approach:</b><br>
&nbsp;• Normalize all things similar across CSS and SVG.<br>
&nbsp;• Allow for the animation of every property/attribute and function in full detail.<br>
&nbsp;• Create a minimal syntax that is both flexible and forgiving.<br>
&nbsp;• Make it fully object-oriented within the confines of JavaScript.<br>
&nbsp;• Assume a “modern browser” that supports ES6*.<br>
&nbsp;• Build in callbacks for flexibility and the ability to meet as-yet-unknown requirements.<br>
&nbsp;• Create a way to test user gpu power and develop methods for handling low-end vs high-end gpus.<br>
&nbsp;• Use my home page animations as functional requirements and a test bed.  Ensure that all the exceptional situations are handled.  There are ~100 separate animations, most of which work together as parts of larger animations.

\* _Probably the biggest browser compatibility issue for rAF is [private properties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties) which have [limited support](https://caniuse.com/?search=private%20class) in pre-2021 browser versions. I have considered converting all the `#`s to `_`s, but the more time that passes, the less it matters._

<b>Structure:</b><br>
I have not included every CSS property and SVG attribute in existence. Not even close. Adding to those lists is a pull request I will accept easily.

<b>Getting Started:</b><br>
No package or minified version yet, hopefully soon.

I'm working on docs too...

If you want to contribute, contact me here, and we'll work something out.  I'm the only one here right now.
