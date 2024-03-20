import createState from 'utils/createState';
import { EventEmitter } from 'pixi.js';
import {
    EmitComponent,
    EventCallback, EventData, EventKeys, MessageBus,
} from './eventInterfaces';

function createMessageBus(): MessageBus {
    const state = {} as MessageBus;
    const globalEmitter = new EventEmitter();

    function emit<T extends EventKeys>(event: T, data: EventData[T]) {
        globalEmitter.emit(event, data);
    }

    function on<T extends EventKeys>(event: T, cb: EventCallback<T>, context?: EmitComponent) {
        return globalEmitter.on(event, cb, context);
    }

    function once<T extends EventKeys>(event: T, cb: EventCallback<T>, context?: EmitComponent) {
        return globalEmitter.once(event, cb, context);
    }

    function off<T extends EventKeys>(event: T, cb: EventCallback<T>, context?: EmitComponent) {
        return globalEmitter.off(event, cb, context);
    }

    function eventNames() {
        return globalEmitter.eventNames();
    }

    function listenerCount(event: EventKeys) {
        return globalEmitter.listenerCount(event);
    }

    function removeAllListeners(event?: EventKeys) {
        return globalEmitter.removeAllListeners(event);
    }

    const localState = {
        emit,
        on,
        once,
        off,
        eventNames,
        listenerCount,
        removeAllListeners,
    };

    return createState({
        stateName: 'MessageBus',
        mainState: state,
        states: {
            localState,
        },
    });
}

export default createMessageBus;
