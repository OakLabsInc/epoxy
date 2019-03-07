// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    // https://github.com/standard/standard/blob/master/docs/RULES-en.md
    'standard',
  ],
  // add your custom rules here
  rules: {
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
     'indent': ['error', 2, {"ignoreComments": true}],
    // 'no-tabs': 'off',
    'space-in-parens': ['error', 'never'],
    'block-spacing': ['error', 'never'],
    'object-curly-spacing': ['error', 'never'],
    'space-before-function-paren': ['off'],
    // 'no-trailing-spaces': ['off'],
    // 'no-multiple-empty-lines': ['off'],
    'no-sparse-arrays': ['off'],
    camelcase: ['off'],
    'comma-dangle': ['off'],
    'no-new': ['off'],
    'padded-blocks': ['off'],
    'spaced-comment': ['off'],
    'object-property-newline': ['off'],
  },
  globals: {
    StatusBar: true,
  },
}
