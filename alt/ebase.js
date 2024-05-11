//++set(e) {
//++    const elms = this.#elms, prop = this.#prop, val = this.#value;
//++    for (var i = 0, l = this.#cElms; i < l; i++)
//++        prop.setIt(elms[i], val[i].join(""));
//++}
//++static #assignByArgByElm(twoD, mask, val) {
//++    let i, j; // if it comes to this, test declaring this inside the loops
//++    const lm = mask.length;
//++    const lt = twoD[0].length;
//++    for (i = 0; i < lm; i++)
//++        for (j = 0; j < lt; j++)
//++            val[j][mask[i]] = twoD[i][j];
//++}
//++static #assignByElmByArg(twoD, mask, val) {
//++    let i, j;
//++    const lm = mask.length;
//++    const lt = twoD.length;
//++    for (i = 0; i < lt; i++)
//++        for (j = 0; j < lm; j++)
//++            val[i][mask[j]] = twoD[i][j];
//++}
//++static #assignToElm(oneD, mask, val) {
//++    let i;
//++    const lm = mask.length;
//++    for (i = 0; i < lm; i++)
//++        val[mask[i]] = oneD[i];
//++}