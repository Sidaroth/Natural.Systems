import getUUID from 'math/getUUID';

export default class Module {
    id = '';
    name = '';
    stage = null;

    constructor() {
        this.id = getUUID();
        this.name = `ModuleId: ${this.id}`;
    }

    setup() {}

    update() {}

    render() {}
}
