import tseslint from 'typescript-eslint';

export default tseslint.config({
    rules: {
        '@typescript-eslint/no-explicit-any': ['warn', { ignoreRestArgs: true, fixToUnknown: true }],
        '@typescript-eslint/ban-ts-comment': [
            'error',
            {
                'ts-expect-error': 'allow-with-description',
                'ts-ignore': 'allow-with-description',
                'ts-nocheck': true,
                'ts-check': false,
                minimumDescriptionLength: 8,
            },
        ],
    },
    files: ['**/*.{ts,tsx}'],
}, {
    files: ['**/*.gen.ts', '**/*.gen.tsx', '**/__generated__/**'],
    rules: { '@typescript-eslint/ban-ts-comment': 'off' },
}, {
    files: ['**/*.test.ts?(x)', '**/*.spec.ts?(x)', '**/*.stories.ts?(x)', 'scripts/**/*.ts'],
    rules: {
        '@typescript-eslint/ban-ts-comment': [
            'error',
            {
                'ts-expect-error': 'allow-with-description',
                'ts-ignore': 'allow-with-description',
                'ts-nocheck': true,
                'ts-check': false,
                minimumDescriptionLength: 5,
            },
        ],
    },
});
