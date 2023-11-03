const path = require('path');

module.exports = {
    entry: './src/App.jsx',
    output: {
        filename: '',
        path: path.resolve(__dirname, 'pages'),
    },
    module:{
        rules: [
            {
                test: /\.jsx$/,
                use: 'babel-loader',
                exclude: /node_modules/,
            },
        ],
    },
};