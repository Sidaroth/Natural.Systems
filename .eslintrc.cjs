const config = {
    extends: [
        '@sidaroth/eslint-config-base',
        '@sidaroth/eslint-config-typescript',
        // '@sidaroth/eslint-config-vue',
    ],
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
                ],
                extensions: ['.js', '.ts', '.cjs', '.mjs'],
            },
        },
    },
};

module.exports = config;
