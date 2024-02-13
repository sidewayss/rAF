let cache;
const TEST = "test",           load   = "load.js",
      test = `/raf/${TEST}/`,  update = "update.js",  named  = "named.js";
//==============================================================================
async function cacheOpen () {
    return caches.open(TEST).catch(catchError);
};
//==============================================================================
self.addEventListener("install", evt => {
  //self.skipWaiting();           // it's tempting...
    evt.waitUntil(cacheAddAll()); // waitUntil() chokes on anonymous functions
});
// Shared file names & different baseURI folders force the use of absolute path
async function cacheAddAll() {
    const fonts = `${test}fonts/`;
    const html  = "/html-elements/";

    cache = await cacheOpen();
    cache.addAll([
        "/", "/raf.js",
        `${test}common.css`,   `${test}${load}`,    `${test}play.js`,
        `${test}common.json`,  `${test}${update}`,  `${test}copy.js`,
        `${test}common.js`,    `${test}${named}`,   `${test}sw.js`,
        `${fonts}RobotoMono.ttf`,  `${fonts}MaterialSymbolsRounded.woff2`,
        `${html}templates.html`,   `${html}multi-button.js`,
        `${html}multi-state.js`,   `${html}multi-check.js`
    ]).catch(responseError);
}
//==============================================================================
self.addEventListener("activate", evt => {
    ; //!! TBD !!
});
//==============================================================================
self.addEventListener("fetch", evt => {
    evt.respondWith(cacheMatchOrPut(evt.request));
});
async function cacheMatchOrPut(request) {
    if (!cache)
        cache = await cacheOpen();

    let response = await cache.match(request).catch(responseError);
    if (!response) {
        response = await fetch(request.clone()).catch(responseError);
        await cache.put(request, response.clone())
                   .catch(catchError);
    }
    return response;
};
//==============================================================================
self.addEventListener("message", async evt => {
    const id   = evt.data.id;
    const dir  = `${test}${id}/`;
    const html = "index.html";
    cache.match(`${dir}${html}`).then(response => {
        if (!response) {
            let file;
            const requests = [];

            for (file of [html,"index.css","index.js","events.js"])
                requests.push(`${dir}${file}`);
            for (file of [load, update, named])
                requests.push(`${dir}_${file}`);

            if (id[0] == "e")  // easings has some additional files
                requests.push(`${dir}chart.js`,`${dir}msg.js`,`${dir}tio-pow.js`,
                              `${dir}steps.js`,`${dir}not-steps.js`);

            cache.addAll(requests);
        }
      }
    ).catch(catchError);
});
//==============================================================================
function catchError   (err) { console.error(err, err.stack); }
function responseError(err) {
    catchError(err);
    return new Response("Network error",
                        {status: 408, headers:{"Content-Type":"text/plain"}});
}