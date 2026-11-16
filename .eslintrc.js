module.exports = {
  root: true,
  extends: [
    'airbnb-base',
    'plugin:json/recommended',
    'plugin:xwalk/recommended',
  ],
  env: {
    browser: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    requireConfigFile: false,
  },
  overrides: [
    {
      // Config do Playwright: roda só no Node, com devDependencies.
      files: ['playwright.config.js'],
      rules: { 'import/no-extraneous-dependencies': ['error', { devDependencies: true }] },
    },
  ],
  rules: {
    'import/extensions': ['error', { js: 'always' }], // require js file extensions in imports
    'linebreak-style': ['error', 'unix'], // enforce unix linebreaks
    'no-param-reassign': [2, { props: false }], // allow modifying properties of param
    // Autoria só pela Universal Editor: um campo por célula é o contrato medido no author.
    // Agrupar campos (classes_*, grupos) só depois de medir o markup que ele gera.
    'xwalk/max-cells': ['error', { '*': 4, topics: 5, 'topics-item': 6 }],
  },
};
