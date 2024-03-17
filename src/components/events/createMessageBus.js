import canEmit from 'components/events/canEmit';
import createState from 'utils/createState';

function createMessageBus() {
    const state = {};

    const localState = {
        // props
        // methods
    };

    return createState('MessageBus', state, {
        localState,
        canEmit: canEmit(state),
    });
};

export default createMessageBus;
