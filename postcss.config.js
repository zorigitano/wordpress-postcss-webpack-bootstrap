const webpack = require("webpack");

module.exports = {
    plugins: [
        require("postcss-import")({
            addDependencyTo: webpack
        }),
        require("postcss-cssnext")({
            browsers: ["last 2 versions", "not ie <= 11", "not ie_mob <= 11"]
        }),
        require("postcss-prefix")({}),
        require("postcss-nested")({})
    ]
};