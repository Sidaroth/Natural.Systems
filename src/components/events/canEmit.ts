import store from 'root/store';
import { EventEmitter } from 'pixi.js';
import createListener from './createListener';
import {
    EmitComponent, EventCallback, EventData, EventKeys, Listener,
} from './eventInterfaces';

function canEmit(state: EmitComponent) {
    const localEmitter = new EventEmitter();
    const listeners: Listener<any>[] = [];

    function emitGlobal<T extends EventKeys>(event: T, data: EventData[T]) {
        store.messageBus.emit(event, data);
    }

    function emit<T extends EventKeys>(event: T, data: EventData[T]) {
        localEmitter.emit(event, data);
    }

    function on<T extends EventKeys>(event: T, cb: EventCallback<T>, context: EmitComponent): Listener<T> {
        localEmitter.on(event, cb, context);

        const listener = createListener(event, cb, false, state);
        listeners.push(listener);
        return listener;
    }

    function once<T extends EventKeys>(event: T, cb: EventCallback<T>, context: EmitComponent): Listener<T> {
        localEmitter.once(event, cb, context);

        const listener = createListener(event, cb, true, state);
        listeners.push(listener);
        return listener;
    }

    function off<T extends EventKeys>(listener: Listener<T>) {
        if (listeners.indexOf(listener) >= 0) {
            localEmitter.off(listener.event, listener.callback, listener.once);
            listeners.splice(listeners.indexOf(listener), 1);
        }
    }

    function removeAllListeners() {
        if (!localEmitter) return;

        listeners.forEach((listener) => {
            listener.drop();
        });
    }

    function destroy() {
        state.removeAllListeners();
    }

    const returnState: EmitComponent = {
        emitGlobal,
        emit,
        on,
        once,
        off,
        removeAllListeners,
        destroy,
    };

    return returnState;
}

export default canEmit;
