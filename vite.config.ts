import { defineConfig, UserConfig, ConfigEnv } from 'vite';
import stripCode from 'rollup-plugin-strip-code';
import { resolve } from 'path';
import { setDefaultResultOrder } from 'dns';

setDefaultResultOrder('verbatim');

function getConfig(environment: ConfigEnv): UserConfig {
    const { mode } = environment;

    const baseConfig: UserConfig = {
        base: './',
        // plugins: [],
        resolve: {
            alias: {
                root: resolve(__dirname, './src/'),
                components: resolve(__dirname, './src/components'),
                interfaces: resolve(__dirname, './src/interfaces'),
                math: resolve(__dirname, './src/math'),
                utils: resolve(__dirname, './src/utils'),
                modules: resolve(__dirname, './src/modules'),
                shapes: resolve(__dirname, './src/shapes'),
                styles: resolve(__dirname, './src/styles'),
            },
        },

        server: {
            port: 3000,
        },
    };

    if (mode === 'production') {
        return Object.assign(baseConfig, {
            plugins: [...baseConfig.plugins,
            stripCode({
                start_comment: 'develblock:start',
                end_comment: 'develblock:end',
            }),
            ],
        });
    } else if (mode === 'development') {
        return Object.assign(baseConfig, {
            build: {
                ...baseConfig.build,
                sourcemap: true,
            }
        });
    }

    return baseConfig;
};

// https://vitejs.dev/config/
export default defineConfig(getConfig);