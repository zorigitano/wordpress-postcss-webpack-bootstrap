// requires
const webpack = require('webpack');
const path = require('path');
const glob = require('glob');

const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// paths
const root = path.resolve();
const srcRoot = `${root}/src`;
const assetsRoot = `${srcRoot}/entries`;
const distRoot = `${root}/dist`;
const entryArray = glob.sync(`${assetsRoot}/**/index.js`);
const modules = {};
const entriesObj = entryArray.forEach(function(key) {
    const path = key.replace('/index.js', '');
    const pathArray = path.split('/');
    const name = pathArray.pop();

    modules[name] = key;
});

module.exports = {
    entry: entriesObj,
    output: {
        path: `${distRoot}/assets`,
        publicPath: '/dist/assets',
        filename: "[name].chunk.js",
        chunkFilename: "[id].[chunkhash].lazy.chunk.js",
    },
    resolve: {
        modules: [
            "node_modules"
        ],
        extensions: [".js", ".css"]
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: "babel-loader"
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader?importLoaders=1&minimize=true",
                    "postcss-loader"
                ]
            },
            {
                test: /\.(png|jpe?g|jpg|gif|ico|svg|webp)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 1,
                    name: '/[name]-[hash].[ext]',
                }
            }
        ]
    },
    devtool: 'source-map',
    plugins: [
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
            name: "shared",
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: "vendor",
            minChunks: Infinity,
            chunks: ["vendor"]
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: "inline",
            filename: "inline.[chunkhash].chunk.js",
            minChunks: Infinity
        }),
        function() {
            this.plugin('done', stats => {
                require('fs').writeFileSync(
                    path.join(__dirname, '../public/js/webpack-manifest.json'),
                    JSON.stringify({publicPath: stats.toJson().publicPath, assets: stats.toJson().assetsByChunkName})
                )
            })
        }
    ]
}
