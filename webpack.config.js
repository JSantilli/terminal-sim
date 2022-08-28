const path = require('path');

module.exports = {
	entry: './src/index.ts',
	devtool: 'source-map',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.ts(x)?$/,
				loader: 'ts-loader',
				exclude: /node_modules/
			}
		]
	},
	resolve: {
		extensions: [
			'.tsx',
			'.ts',
			'.js'
		]
	}
};
