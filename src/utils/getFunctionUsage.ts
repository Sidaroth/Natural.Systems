import config from 'root/config';
import { State } from 'root/interfaces/state';

const alreadyLogged: string[] = [];

// Create a map of functions and the states that use them
function updateFunctionUsage(stateName: string, state: any, functionMap: Map<string, string[]>) {
    Object.keys(state).forEach((func: string) => {
        if (typeof state[func] !== 'function') return;

        const existing = functionMap.get(func);
        if (existing) {
            existing.push(stateName);
        } else {
            functionMap.set(func, [stateName]);
        }
    });
}

function isInFilter(stateNames: string[], source: string) {
    if (!config) return false;

    const {
        ENABLE_FILTER, ENABLE_FACTORY_FILTER, FILTER, FACTORY_FILTER,
    } = config.COMPOSITION_INFO;

    let inNameFilter = true;
    if (ENABLE_FILTER) {
        inNameFilter = false;
        FILTER.every((filterName) => {
            if (stateNames.find((name) => name === filterName)) {
                inNameFilter = true;
            }

            // Continue if inside is false (not found) - until we find a match or end of array
            return !inNameFilter;
        });
    }

    let inFactoryFilter = true;
    if (ENABLE_FACTORY_FILTER) {
        inFactoryFilter = FACTORY_FILTER.some((filter: string) => filter === source);
    }
    return inNameFilter && inFactoryFilter;
}

function getFunctionUsage(states: State[], source: string) {
    if (alreadyLogged.find((val) => val === source)) {
        return;
    }

    alreadyLogged.push(source);
    if (!config?.COMPOSITION_INFO?.ENABLE) return;

    // map all states
    const functionMap = new Map<string, string[]>();
    states.forEach((state: State) => {
        updateFunctionUsage(state.name, state.state, functionMap);
    });

    // print info
    functionMap.forEach((stateNames: string[], funcName: string) => {
        const inFilter = isInFilter(stateNames, source);
        if (!inFilter || stateNames.length <= 1) return;

        const stateNameString = stateNames.reduce((acc: string, name: string) => `${acc} ${name},`, '');
        console.log(
            `%c${source} %cneeds to pipe %c${funcName} %c=>${stateNameString}`,
            'color: yellow',
            'color: inherits',
            'color: yellow',
            'color: inherits',
        );
    });
}

export default getFunctionUsage;
