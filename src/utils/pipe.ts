// Takes an arbitrary number of functions and returns a new function that takes an input and applies each function to it in order

import { PipeFunction } from 'interfaces/state';

// Acts like a pipe in bash, where the output of one command is the input of the next
function pipe<T>(...functions: PipeFunction<T>[]): PipeFunction<T | undefined> {
    // If the current function exists, apply it to the input, otherwise return the input
    const reducer = (input: T | undefined, currentFunction: PipeFunction<T>) => {
        if (currentFunction) {
            return currentFunction(input);
        }

        return input;
    };

    return function pipeChain(initialInput?: T) {
        return functions.reduce(reducer, initialInput);
    };
}

export default pipe;
