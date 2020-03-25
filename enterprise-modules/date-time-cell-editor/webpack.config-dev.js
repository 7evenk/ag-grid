const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',

    // output: {
    //     libraryTarget: 'commonjs'
    // },
    entry: './src/dev.ts',

    resolve: {
        extensions: ['.ts', '.js'],
        // modules: [
        //     path.resolve(__dirname, 'src'),
        //     'node_modules'
        // ],
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                use: ["source-map-loader"],
                enforce: "pre"
            },
            {
                test: /\.ts$/,
                exclude: [/node_modules/],
                use: 'awesome-typescript-loader'
            }
        ]
    },

    plugins: [
        new HtmlWebpackPlugin({
            // filename: 'index.html'
        }),
    ],

    devtool: 'inline-source-map'
};
