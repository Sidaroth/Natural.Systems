const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const pkg = require('../package.json');

const PATHS = {
    src: path.join(__dirname, '../src'),
    dist: path.join(__dirname, '../dist'),
};

module.exports = {
    context: __dirname,
    mode: 'development',
    node: {
        fs: 'empty',
    },
    entry: {
        app: [PATHS.src],
        vendors: Object.keys(pkg.dependencies),
    },
    devtool: 'eval-source-map',
    output: {
        filename: '[name].js',
        path: PATHS.dist,
        publicPath: '/',
    },
    resolve: {
        extensions: ['.js', '.jsx', '.jsm'],
        alias: {
            styles: path.resolve(__dirname, '../styles'),
            assets: path.resolve(__dirname, '../assets'),
            components: path.resolve(__dirname, '../src/components'),
            config: path.resolve(__dirname, '../src'),
            math: path.resolve(__dirname, '../src/math'),
        },
    },
    devServer: {
        contentBase: PATHS.dist,
        compress: true,
        headers: {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
        },
        open: true,
        overlay: {
            warnings: true,
            errors: true,
        },
        port: 3001,
        publicPath: 'http://localhost:3001/',
        hot: true,
    },
    module: {
        rules: [
            {
                test: [/\.vert$/, /\.frag$/],
                use: 'raw-loader',
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader',
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
            PRODUCTION: JSON.stringify(false),
        }),
        new HtmlWebpackPlugin({
            template: '../node_modules/html-webpack-template/index.ejs',
            title: 'Natural Systems',
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
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin(),
        // new CopyWebpackPlugin([
        //     {
        //         from: path.join(__dirname, '../assets/images/**/*'),
        //         to: path.join(PATHS.dist, 'images/'),
        //         flatten: false,
        //     },
        //     {
        //         from: path.join(__dirname, '../assets/sounds/**/*'),
        //         to: path.join(PATHS.dist, 'sounds/'),
        //         flatten: false,
        //     },
        //     {
        //         from: path.join(__dirname, '../assets/spritesheets/**/*'),
        //         to: path.join(PATHS.dist, 'spritesheets/'),
        //         flatten: false,
        //     },
        // ]),
    ],
};
