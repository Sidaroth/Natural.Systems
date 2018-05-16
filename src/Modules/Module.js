import getUUID from 'utils/getUUID';

export default class Module {
    id = '';
    constructor() {
        this.id = getUUID();
    }

    setup() {
        console.error('must be implemented in child class');
    }

    update() {
        console.error('must be implemented in child class');
    }

    clear() {
        console.error('must be implemented in child class');
    }

    render() {
        console.error('must be implemented in child class');
    }
}
