import { PipeFunction, State, StateCreationOptions } from 'interfaces/state';
import getFunctionUsage from './getFunctionUsage';
import pipe from './pipe';

function createState<T>(stateOptions: StateCreationOptions<T>): T {
    const {
        states, mainState, stateName, overrides,
    } = stateOptions;

    // List of named states (components) and their constructor functions.
    const stateList: State[] = [];

    // An array of function names that are used in multiple states (components).
    // If a function is used in multiple states, it will be piped together.
    const pipes: { [key: string]: Array<PipeFunction<T | undefined>> } = {};
    const finishedPipes: { [key: string]: PipeFunction<T | undefined> } = {};

    if (states) {
        // Loop over all states (components).
        Object.keys(states).forEach((stateKey) => {
            const state = states[stateKey];
            stateList.push({
                state,
                name: stateKey,
            });

            // Loop over all property keys on the state object. If functions, store them away.
            Object.keys(state).forEach((key) => {
                if (typeof state[key] === 'function') {
                    const currentFunction = state[key];
                    if (!pipes[key]) {
                        pipes[key] = [currentFunction];
                    } else {
                        const currentPipe = pipes[key];
                        currentPipe?.push(currentFunction);
                    }
                }
            });
        });
    }

    // Loop over all functions stored in pipes, check for multiple usages of the same name.
    // Automatically set up a pipe() structure for these.
    Object.keys(pipes).forEach((pipeKey: string) => {
        const currentPipe = pipes[pipeKey];
        if (currentPipe?.length) {
            finishedPipes[pipeKey] = pipe(...currentPipe);
        } else {
            delete pipes[pipeKey];
        }
    });

    getFunctionUsage(stateList, stateName);

    // Creates a piped init/constructor that runs each internalConstructor() function in the different states.
    // This allows a created class/state to have a constructor that is ran at create time.
    const constructors = stateList.map((state) => {
        const construct = state.state.internalConstructor as unknown as PipeFunction<T>;
        return construct;
    }).filter((constructor) => constructor);

    const init = pipe(...constructors);

    Object.assign(mainState, ...stateList.map((s) => s.state), pipes, overrides);

    // Cleans up any constructor still on the mainstate.
    if (mainState.internalConstructor) {
        delete mainState.internalConstructor;
    }

    // actually calls the piped init constructor from above.
    init();

    return mainState as T;
}

export default createState;
