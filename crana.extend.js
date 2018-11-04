module.exports = {
  client: {
    webpack: {
      dev: 'config/webpack.dev.js',
      prod: 'config/webpack.prod.js'
    },
  },
  dependencies: {
    'svelte': '^2.0.0',
    'svelte-loader': '^2.9.0'
  }
}