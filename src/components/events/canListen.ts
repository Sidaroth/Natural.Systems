import store from 'root/store';
import {
    EmitComponent, EventCallback, EventKeys, ListenComponent, Listener,
} from './eventInterfaces';

function canListen() {
    const listeners: Listener<any>[] = [];

    function listenOn<T extends EventKeys>(
        emitState: EmitComponent,
        event: T,
        callback: EventCallback<T>,
        context: EmitComponent,
    ): Listener<T> {
        const listener: Listener<T> = emitState.on(event, callback, context);
        listeners.push(listener);
        return listener;
    }

    function listenOnce<T extends EventKeys>(
        emitState: EmitComponent,
        event: T,
        callback: EventCallback<T>,
        context: EmitComponent,
    ): Listener<T> {
        const listener: Listener<T> = emitState.once(event, callback, context);
        listeners.push(listener);
        return listener;
    }

    function listenGlobal<T extends EventKeys>(event: T, cb: EventCallback<T>, ctx: EmitComponent): Listener<T> {
        const listener = store.messageBus.on(event, cb, ctx);
        listeners.push(listener);
        return listener;
    }

    function listenOnceGlobal<T extends EventKeys>(event: T, cb: EventCallback<T>, ctx: EmitComponent): Listener<T> {
        const listener = store.messageBus.once(event, cb, ctx);

        listeners.push(listener);
        return listener;
    }

    function dropListener(listener: Listener<any>) {
        listeners.splice(listeners.findIndex((l) => l === listener), 1);
        listener.drop();
    }

    function destroy() {
        listeners.forEach((listener) => {
            listener.drop();
        });
    }

    const returnState: ListenComponent = {
        dropListener,
        listenOn,
        listenOnce,
        listenGlobal,
        listenOnceGlobal,
        destroy,
    };

    return returnState;
}

export default canListen;
