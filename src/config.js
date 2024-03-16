const config = {
    WORLD: {
        width: 1280,
        height: 720,
    },
    EVENTS: {
        ENTITY: {
            DIE: 'entity die',
            FIRSTFLAP: 'entity flap',
            DEACTIVATE: 'entity deactivate',
            PASSED: 'entity passed',
        },
    },
    COMPOSITION_INFO: {
        ENABLE: false,
        ENABLE_FILTER: false,
        FILTER: [],
        ENABLE_FACTORY_FILTER: false,
        FACTORY_FILTER: ['Note'],
    },
    DEBUG: false,
};

export default config;
