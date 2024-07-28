const { minify } = require("html-minifier-terser");

module.exports = (_req, res, next) => {
    if (process.env.NODE_ENV === "dev") return next();
    const originalRender = res.render; // * save original render function
    res.render = function (view, options, fn) {
        // * override render function
        originalRender.call(this, view, options, function (err, html) {
            // * call original render function
            if (err && fn) return fn(err);
            // * minify html
            minify(html, {
                removeAttributeQuotes: true,
                minifyCSS: true,
                minifyJS: true,
                noNewlinesBeforeTagClose: true,
                collapseWhitespace: true,
                removeComments: true,
                removeEmptyAttributes: true,
            })
                .then((minified) => res.send(minified)) // * send minified html
                .catch((err) => {
                    console.error(err, "Error in minify");
                    res.send(html); // * send original html if error
                });
        });
    };
    next();
};
