import { defineConfig, UserConfig, ConfigEnv } from 'vite';
import { resolve } from 'path';
import { setDefaultResultOrder } from 'dns';
import vue from '@vitejs/plugin-vue';

setDefaultResultOrder('verbatim');

function getConfig(environment: ConfigEnv): UserConfig {
    const baseConfig: UserConfig = {
        base: './',
        plugins: [vue()],
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
                shaders: resolve(__dirname, './src/shaders'),
            },
        },
        server: {
            port: 3000,
        },
    };

    return baseConfig;
};

// https://vitejs.dev/config/
export default defineConfig(getConfig);