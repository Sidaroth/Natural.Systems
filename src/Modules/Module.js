import getUUID from 'math/getUUID';

export default class Module {
    id = '';
    name = '';
    stage = null;

    constructor() {
        this.id = getUUID();
        this.name = `ModuleId: ${this.id}`;
    }

    setup() {
        console.error('must be implemented in child class');
    }

    update() {
        console.error('must be implemented in child class');
    }

    render() {
        console.error('must be implemented in child class');
    }
}
