module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'prettier',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },
  plugins: [
    'vue',
    '@typescript-eslint',
  ],
  rules: {
    'prettier/prettier': 'warn',
    'vue/multi-word-component-names': 'warn',
    'vue/no-reserved-component-names': 'off',
    'vue/component-name-in-template-casing': ['warn', 'PascalCase'],
    'vue/no-unused-vars': 'warn',
    'vue/attributes-order': ['warn', { order: [
      'DEFINITION',
      'LIST_RENDERING',
      'CONDITIONALS',
      'RENDER_MODIFIERS',
      'GLOBAL',
      'UNIQUE',
      'SLOT',
      'TWO_WAY_BINDING',
      'OTHER_DIRECTIVES',
      'OTHER_ATTR',
      'EVENTS',
      'CONTENT'
    ]}],
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  },
  globals: {
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        // project: ['./tsconfig.app.json'], // Temporarily commented out for diagnosis
        // tsconfigRootDir: __dirname,    // Temporarily commented out for diagnosis
      },
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/stylistic',
      ],
      rules: {
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        'no-unused-vars': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    {
      files: ['*.vue'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
        // project: ['./tsconfig.app.json'], // Temporarily commented out for diagnosis
        // tsconfigRootDir: __dirname,    // Temporarily commented out for diagnosis
        extraFileExtensions: ['.vue'],
      },
      extends: [
        'plugin:vue/vue3-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/stylistic',
        'plugin:prettier/recommended',
      ],
      rules: {
        'vue/multi-word-component-names': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        'no-unused-vars': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    {
      files: ['*.d.ts'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        'no-unused-vars': 'off',
      },
    },
    {
      files: ['vite.config.ts', '.eslintrc.cjs', '.prettierrc.cjs', 'postcss.config.js'],
      env: { node: true },
      parserOptions: {
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
  settings: {
    vue: {
      version: 'detect',
    },
  },
}; 