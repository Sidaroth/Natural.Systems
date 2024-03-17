import getUUID from 'math/getUUID';
import createState from 'utils/createState';
import {
    EmitComponent, EventCallback, EventKeys, Listener,
} from './eventInterfaces';

function createListener<T extends EventKeys>(
    event: T,
    callback: EventCallback<T>,
    once: boolean,
    emitState: EmitComponent,
): Listener<T> {
    const state = {} as Listener<T>;

    function drop() {
        if (state.dropped) return;

        emitState.off(state);
        state.dropped = true;
    }

    const localState: Listener<T> = {
        // props
        id: getUUID(),
        dropped: false,
        once,
        event,
        callback: !once ? callback : (evt) => {
            callback(evt);
            state.drop();
        },
        // methods
        drop,
    };

    return createState({ stateName: 'Listener', mainState: state, states: { localState } });
}

export default createListener;
