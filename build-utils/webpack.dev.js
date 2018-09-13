const merge = require('webpack-merge');
const common = require('./webpack.common.js');

const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = merge(common, {
    output: {
        filename: '[name].bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.(png|jpe?g|jpg|gif|ico|svg|webp)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 1000,
                    name: '/[name].[ext]',
                }
            },
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css"
        }),
    ]
});