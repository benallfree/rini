const path = require('path')
const { getLoader, loaderByName } = require('@craco/craco')

module.exports = {
  webpack: {
    alias: {},
    plugins: [],
    configure: (webpackConfig, { env, paths }) => {
      const { isFound, match } = getLoader(
        webpackConfig,
        loaderByName('babel-loader')
      )
      if (isFound) {
        const include = Array.isArray(match.loader.include)
          ? match.loader.include
          : [match.loader.include]
        match.loader.include = include.concat[path.join(__dirname, '../common')]
      }
      return webpackConfig
    },
  },
}
