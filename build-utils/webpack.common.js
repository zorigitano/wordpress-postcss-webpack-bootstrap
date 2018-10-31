// requires
const webpack = require('webpack');
const path = require('path');
const glob = require('glob');

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ImageminWebpWebpackPlugin = require("imagemin-webp-webpack-plugin");

// paths
const root = path.resolve();
const srcRoot = `${root}/src`;
const assetsRoot = `${srcRoot}/entries`;
const distRoot = `${root}/dist`;
const entryArray = glob.sync(`${assetsRoot}/**/index.js`);
const modules = {};
entryArray.forEach(function(key) {
    const path = key.replace('/index.js', '');
    const pathArray = path.split('/');
    const name = pathArray.pop();

    modules[name] = key;
});

module.exports = {
    entry: modules,
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
                    "css-loader?importLoaders=1",
                    "postcss-loader"
                ]
            },
            {
                test: /\.(png|jpe?g|jpg|gif|ico|svg)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 1000,
                    name: '/images/[name].[ext]',
                }
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '/fonts/[name].[ext]'
                    }
                }]
            }
        ]
    },
    devtool: 'source-map',
    optimization: {
        minimize: true,
        namedChunks: true,
        removeEmptyChunks: true,
        mergeDuplicateChunks: true,
        concatenateModules: true,
        splitChunks: {
            chunks: 'async',
            minSize: 30000,
            maxSize: 0,
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            automaticNameDelimiter: '~',
            name: true,
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true
                }
            }
        }
    },
    plugins: [
        new webpack.optimize.ModuleConcatenationPlugin(),
        new ImageminWebpWebpackPlugin({
            config: [{
                test: /\.(jpe?g|png)$/,
                options: {
                    quality:  75
                }
            }]
        }),
        function() {
            this.plugin('done', stats => {
                require('fs').writeFileSync(
                    path.join(__dirname, '../dist/webpack-manifest.json'),
                    JSON.stringify({publicPath: stats.toJson().publicPath, assets: stats.toJson().assetsByChunkName})
                )
            })
        }
    ]
}
