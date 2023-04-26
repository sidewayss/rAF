# rAF - <b>JavaScript animation library for CSS and SVG</b>

It provides a structured, compact way to create and execute CSS or SVG animations of two types:<br>
	•	Gradual value changes, aka easing<br>
	•	Cue-based animations, where timing cues trigger animation events

Goals, Assumptions, and Approach:<br>
  •	Normalize all things similar across CSS and SVG.<br>
  •	Allow for the animation of every property/attribute and function in full detail.<br>
  •	Create a minimal syntax that is both flexible and forgiving.<br>
  •	Make it fully object-oriented within the confines of JavaScript.<br>
  •	Assume a “modern browser” that supports ES6.<br>
  •	Build in callbacks for flexibility and the ability to meet as-yet-unknown requirements.<br>
  •	Use my home page animations as functional requirements and a test bed.  Ensure that all the exceptional situations are handled.  There are ~100 separate animations, most of which work together as parts of larger animations.
  
Structure:<br>
raf.js has three sub-libraries that wrap each other like nesting dolls (inner to outer order):<br>
•	prop.js defines the Prop, Func, and Ez classes<br>
•	easy.js defines the Easy, Easee, Easer, Teaser, and Geaser classes<br>
•	raf.js defines the ACues and AFrame classes<br>
Each file is standalone.  easy.js contains all the prop.js code.  raf.js contains all the easy.js code.  I didn't want to get into JavaScript modules with something this small.  The purpose of offering prop.js is to allow users to take advantage of its property/attribute setting features when they are not animating anything.  easy.js can be used to animate by integrating with your own requestAnimationFrame() calls and callbacks, not those provided by raf.js.<br>
As a user of the library, you will not need to know all of these classes, and you will never  need to write: let myVar = new ClassName();
Unless you're getting fancy with pausing one animation to play another, then resuming the paused animation, you only need one declared instance of each class.  So the libraries pre-declare an instance for you.  You'll see how that works in the examples.  Of course you are free to declare instances of any of these classes, but beware that in the case of the AFrame class that means multiple requestAnimationFrame callback loops.
