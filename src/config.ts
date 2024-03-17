import Size from 'math/size';

interface CompositionInfo {
    ENABLE: boolean;
    ENABLE_FILTER: boolean;
    ENABLE_FACTORY_FILTER: boolean;
    FILTER: string[];
    FACTORY_FILTER: string[];
}

interface DevConfig {
    WORLD: Size;
    COMPOSITION_INFO: CompositionInfo;
    DEBUG: boolean;
}

const config: DevConfig = {
    WORLD: new Size(1280, 720),
    COMPOSITION_INFO: {
        ENABLE: false,
        ENABLE_FILTER: false,
        FILTER: ['Test'],
        ENABLE_FACTORY_FILTER: false,
        FACTORY_FILTER: ['Note'],
    },
    DEBUG: false,
};

export default config;
