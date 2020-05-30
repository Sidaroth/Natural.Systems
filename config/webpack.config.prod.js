const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const pkg = require('../package.json');

const PATHS = {
    src: path.join(__dirname, '../src'),
    dist: path.join(__dirname, '../dist'),
};

module.exports = {
    context: __dirname,
    mode: 'production',
    entry: {
        app: [PATHS.src],
        vendors: Object.keys(pkg.dependencies),
    },
    output: {
        path: PATHS.dist,
        filename: '[name].js',
        publicPath: './',
    },
    resolve: {
        alias: {
            assets: path.resolve(__dirname, '../assets'),
            styles: path.resolve(__dirname, '../styles'),
            root: path.resolve(__dirname, '../src'),
            math: path.resolve(__dirname, '../src/math'),
            utils: path.resolve(__dirname, '../src/utils'),
            levels: path.resolve(__dirname, '../src/levels'),
            shaders: path.resolve(__dirname, '../src/shaders'),
            components: path.resolve(__dirname, '../src/components'),
        },
        extensions: ['.js', '.jsx'],
    },
    module: {
        rules: [
            {
                test: [/\.vert$/, /\.frag$/],
                use: 'raw-loader',
            },
            {
                test: /\.js$/,
                use: ['babel-loader'],
                exclude: /node_modules/,
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            camelCase: 'dashes',
                            localIdentName: '[path][name]__[local]',
                        },
                    },
                    {
                        loader: 'resolve-url-loader',
                    },
                    {
                        loader: 'sass-loader',
                    },
                ],
            },
            {
                test: /\.(jpg|png|woff)$/,
                use: 'file-loader',
            },
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            CANVAS_RENDERER: JSON.stringify(true),
            WEBGL_RENDERER: JSON.stringify(true),
            PRODUCTION: JSON.stringify(true),
        }),
        new HtmlWebpackPlugin({
            template: '../node_modules/html-webpack-template/index.ejs',
            title: 'Natural.Systems',
            meta: [{ name: 'robots', content: 'noindex,nofollow' }],
            appMountIds: ['content'],
            inject: false,
            minify: {
                collapseWhitespace: true,
                conservativeCollapse: true,
                preserveLineBreaks: true,
                useShortDoctype: true,
                html5: true,
            },
            mobile: true,
        }),
        new CopyWebpackPlugin({
            patterns: [{
                from: '../assets/images/**/*',
                to: 'images/',
                flatten: false,
            },
            {
                from: '../assets/sounds/**/*',
                to: 'sounds/',
                flatten: false,
            },
            ],
            options: {
                concurrency: 100,
            },
        }),
    ],
    node: {
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
    },
};
