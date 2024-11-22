import baseConfig from '@sidaroth/eslint-config-base';
import tsConfig from '@sidaroth/eslint-config-typescript';

const config = [
    ...baseConfig,
    ...tsConfig,
    {
        settings: {
            'import/resolver': {
                alias: {
                    map: [
                        ['root', './src'],
                        ['components', './src/components'],
                        ['interfaces', './src/interfaces'],
                        ['math', './src/math'],
                        ['utils', './src/utils'],
                        ['modules', './src/modules'],
                        ['shapes', './src/shapes'],
                        ['styles', './src/styles'],
                        ['shaders', './src/shaders'],
                    ],
                    extensions: ['.js', '.ts', '.cjs', '.mjs', '.vue'],
                },
            },
        },
        rules: {
            'no-console': 'off',
            'max-len': ['error', { code: 120, ignoreComments: true }],
            'import/no-cycle': 'off', // For some reason primevue imports die with this on.
        },
    }
];

export default config;