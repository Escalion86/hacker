module.exports = {
  // The Webpack config to use when compiling your react app for development or production.
  webpack: function (config, env) {
    // ...add your webpack config
    config.output.filename = 'static/js/[name].js'
    config.optimization = {
      ...config.optimization,
      runtimeChunk: false,
      splitChunks: {
        chunks(chunk) {
          return false
        },
      },
    }

    return config
  },
}
