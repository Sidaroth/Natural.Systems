// Define the possible events that can be emitted. This is a constant object with a key for each event and a value of the event name.
export const EVENTS = {
    XML_UPLOADED: 'xml_uploaded',
} as const;

// Define the event data types - an array of all possible events with their data types.
export type EventData = {
    [EVENTS.XML_UPLOADED]: {
        xml: string;
    };
};

export type EventKeys = keyof EventData;

export interface Listener<T extends EventKeys> {
    id: string;
    dropped: boolean;
    once: boolean;
    event: T;
    callback: EventCallback<T>;
    drop: () => void;
}

export type EmitFunction<T extends EventKeys> = (event: T, data: EventData[T]) => void;
export type OffFunction<T extends EventKeys> = (listener: Listener<T>) => void;
export type OnFunction<T extends EventKeys> = (
    event: T,
    callback: EventCallback<T>,
    context: EmitComponent
) => Listener<T>;

export interface EmitComponent {
    emitGlobal: EmitFunction<any>
    emit: EmitFunction<any>
    on: OnFunction<any>
    once: OnFunction<any>
    off: OffFunction<any>
    removeAllListeners: () => void;
    destroy: () => void;
}

export interface ListenComponent {
    dropListener: (listener: Listener<any>) => void;

    listenOn<T extends EventKeys>(
        emitState: EmitComponent,
        event: T,
        callback: EventCallback<T>,
        context: EmitComponent): Listener<T>;

    listenOnce<T extends EventKeys>(
        emitState: EmitComponent,
        event: T,
        callback: EventCallback<T>,
        context: EmitComponent): Listener<T>;

    listenGlobal<T extends EventKeys>(event: T, fn: EventCallback<T>, context: EmitComponent): Listener<T>;
    listenOnceGlobal<T extends EventKeys>(event: T, fn: EventCallback<T>, context: EmitComponent): Listener<T>;
    destroy: () => void;
}

export interface MessageBus {
    emit: EmitFunction<any>;
    on: OnFunction<any>;
    once: OnFunction<any>;
    off: OffFunction<any>;
    eventNames: () => string[];
    listenerCount: (event: EventKeys) => number;
    removeAllListeners: () => void;
}

export type EventCallback<T extends EventKeys> = (event: EventData[T]) => void;
