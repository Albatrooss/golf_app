/* eslint-disable no-process-env, import/no-commonjs */
module.exports = {
  presets: [
    ['@babel/preset-env', { loose: true }],
    [
      '@babel/preset-react',
      {
        runtime: 'automatic',
        development: process.env.NODE_ENV === 'development',
      },
    ],
  ],
  plugins: [
    [
      'const-enum',
      {
        transform: 'constObject',
      },
    ],
    [
      '@babel/plugin-transform-typescript',
      { isTSX: true, allowNamespaces: true, allowDeclareFields: true },
    ],
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
  ],
};
