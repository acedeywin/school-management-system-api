import globals from 'globals'
import pluginJs from '@eslint/js'
import pluginRegex from 'eslint-plugin-regex'

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  {
    plugins: {
      regex: pluginRegex
    },
    rules: {
      'no-useless-escape': 'off',
      'no-redeclare': 'off',
      'no-prototype-builtins': 'off',
      'no-undef': 'off'
    }
  }
]
