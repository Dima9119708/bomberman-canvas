const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const isProd = process.env.NODE_ENV === 'production'
const isDev = !isProd

const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`

module.exports = {
    mode: 'development',
    entry: ["@babel/polyfill", "./src/index.js"],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: filename('js')
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './src/index.html'
        }),
    ],
    devtool: isDev ? 'source-map' : false,
    devServer: {
        contentBase: './dist',
    },
    module: {
        rules: [
            {
                test: /\.s[ac]ss$/i,
                use: [
                    // Creates `style` nodes from JS strings
                    "style-loader",
                    // Translates CSS into CommonJS
                    "css-loader",
                    // Compiles Sass to CSS
                    "sass-loader",
                ],
            },
            {
                test: /\.mp3|.wav$/,
                loader: 'file-loader'
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                use: [
                    {
                        loader: 'file-loader',
                    },
                ],
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                    {
                        loader: 'file-loader',
                    },
                ],
            },
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            [
                                "@babel/preset-env",
                                {
                                    targets: {
                                        node: "current"
                                    }
                                }
                            ]
                        ],
                        plugins: [
                            "@babel/plugin-proposal-class-properties",
                            "@babel/plugin-syntax-object-rest-spread",
                            "@babel/plugin-proposal-object-rest-spread",
                            "@babel/plugin-transform-arrow-functions",
                            "@babel/plugin-proposal-private-methods",
                            "@babel/plugin-proposal-optional-chaining",
                            "@babel/plugin-proposal-nullish-coalescing-operator"
                        ]
                    }
                }
            },
        ],
    },
};
