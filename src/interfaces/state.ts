export interface State {
    state: {
        internalConstructor?: (...args: []) => void;
        [key: string]: any;
    };
    name: string;
}

export type PipeFunction<T = undefined> = (input?: T) => T;

export type GenericState = { [key: string]: any };

export interface StateCreationOptions<T> {
    stateName: string;
    mainState: T & { internalConstructor?: unknown };
    states?: GenericState;
    overrides?: GenericState;
}
