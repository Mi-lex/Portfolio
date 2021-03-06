const webpack = require('webpack')
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ImageminWebpWebpackPlugin = require('imagemin-webp-webpack-plugin')

const BUILD_FOLDER = 'docs'

const config = {
	entry: {
		app: ['./src/js/main.js', './src/sass/style.scss'],
	},

	output: {
		path: path.resolve(__dirname, `./${BUILD_FOLDER}`),
		filename: '[name].js',
	},

	module: {
		rules: [
			{
				test: /\.html$/,
				loader: 'html-loader',
				options: {
					interpolate: true,
				},
			},
			{
				test: /\.js$/,
				exclude: [
					path.resolve(__dirname, './node_modules'),
					path.resolve(__dirname, './src/js/static'),
				],
				loader: 'babel-loader',
			},
			{
				test: /\.js$/,
				include: path.resolve(__dirname, './src/js/static'),
				loaders: [
					{
						loader: 'file-loader',
						options: {
							name: './static/[name].[ext]',
						},
					},
				],
			},
			{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
			},
			{
				test: /\.s[ac]ss$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					'postcss-loader',
					'sass-loader',
				],
			},
			{
				test: /\.eot|ttf|woff2?$/,
				loader: 'file-loader',
				options: {
					name: './fonts/[name].[ext]',
				},
			},
			{
				test: /\.svg$/,
				use: [
					{
						loader: 'svg-sprite-loader',
						options: {
							extract: true,
							publicPath: '/img/',
						},
					},
					'svgo-loader',
				],
			},
		],
	},
	devServer: {
		contentBase: path.join(__dirname, BUILD_FOLDER),
	},
	plugins: [
		new MiniCssExtractPlugin(),
		new SpriteLoaderPlugin(),
		new ImageminWebpWebpackPlugin({
			config: [
				{
					// exclude backgrounds images
					test: /^(?:(?!bg-).)*\.(png|jpe?g)$/,
					options: {
						quality: 80,
					},
				},
			],
			overrideExtension: true,
			detailedLogs: false,
			silent: false,
			strict: true,
		}),
		new HtmlWebpackPlugin({
			template: './src/html/main.html.js',
		}),
	],

	optimization: {
		minimizer: [],
	},
}

module.exports = (env, argv) => {
	if (argv.mode === 'production') {
		// Change rule for images
		const imgsRule = {
			test: /\.(png|jpe?g|gif|ico)$/,
			loaders: [
				{
					loader: 'file-loader',
					options: {
						name: './img/[name].[ext]',
					},
				},
				{
					loader: 'image-webpack-loader',
					options: {
						mozjpeg: {
							progressive: true,
							quality: 80,
						},
						optipng: {
							enabled: false,
						},
						pngquant: {
							quality: '80-90',
							speed: 2,
						},
					},
				},
			],
		}

		config.module.rules.push(imgsRule)

		// Plagins
		config.plugins.unshift(
			new CleanWebpackPlugin([BUILD_FOLDER], {
				root: __dirname,
				verbose: true,
				dry: false,
			}),
		)
		config.plugins.push(
			new webpack.LoaderOptionsPlugin({
				minimize: true,
			}),
		)
		// Minimizing
		config.optimization.minimizer = [new UglifyJsPlugin()]
	} else {
		const imgsRule = {
			test: /\.(png|jpe?g|gif|ico)$/,
			loaders: [
				{
					loader: 'file-loader',
					options: {
						name: './img/[name].[ext]',
					},
				},
			],
		}

		config.module.rules.push(imgsRule)
	}

	return config
}
