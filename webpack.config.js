var path = require('path');

module.exports = () => {
	return {
		entry: './src/app.ts',
		target: 'web',
		mode: 'production',
		output: {
			path: path.resolve(__dirname, 'app'),
			filename: 'bundle.js'
		},
		performance: {
			hints: false
		},
		node: {
			fs: 'empty'
		},
		resolve: {
			extensions: ['.ts', '.js']
		},
		module: {
			rules: [
				{
					use: 'ts-loader',
					test: /\.ts?$/
				}
			]
		}
	};
};
