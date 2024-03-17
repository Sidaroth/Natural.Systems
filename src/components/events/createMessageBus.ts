import canEmit from 'components/events/canEmit';
import createState from 'utils/createState';
import { MessageBus } from './eventInterfaces';

function createMessageBus(): MessageBus {
    const state = {} as MessageBus;

    return createState({
        stateName: 'MessageBus',
        mainState: state,
        states: {
            canEmit: canEmit(state),
        },
    });
}

export default createMessageBus;
