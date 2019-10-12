import getUUID from 'math/getUUID';

export default class Module {
    id = '';
    name = '';
    description = '';
    stage = null;

    constructor() {
        this.id = getUUID();
        this.name = `ModuleId: ${this.id}`;
        this.description = `${this.name} placeholder description.`;
    }

    setup() { }

    update() { }

    render() { }
}
