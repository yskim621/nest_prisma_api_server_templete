// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'settings.json', '**/*.config.js'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off', // 인터페이스 이름 앞에 'I' 붙이지 않아도 허용 (ex: IUser → User)
      '@typescript-eslint/explicit-function-return-type': 'off', // 함수의 리턴 타입을 생략해도 허용
      '@typescript-eslint/explicit-module-boundary-types': 'off', // 모듈 함수(public 함수 등)의 리턴 타입 생략 허용
      // '@typescript-eslint/no-explicit-any': 'off', // any 타입 사용 허용 (타입 안정성 낮아지지만 유연성 ↑)
      // '@typescript-eslint/no-unsafe-assignment': 'off', // 타입이 확실하지 않은 값(unknown, any 등)을 변수에 할당해도 허용
      // '@typescript-eslint/no-unsafe-return': 'off', // 타입이 명확하지 않은 값을 리턴하는 것 허용
      // '@typescript-eslint/no-unsafe-call': 'off',
      // "@typescript-eslint/no-unsafe-member-access": 'off'
    },
  },
);