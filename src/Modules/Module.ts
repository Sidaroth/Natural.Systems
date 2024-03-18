import getUUID from 'math/getUUID';
import { Container } from 'pixi.js';

export default abstract class Module {
    id: string;

    name: string;

    description: string;

    abstract stage: Container;

    abstract backgroundColor?: number;

    constructor() {
        this.id = getUUID();
        this.name = `ModuleId: ${this.id}`;
        this.description = `${this.name} placeholder description.`;
    }

    abstract destroy(): void;

    abstract update(delta: number): void;

    abstract render(): void;

    abstract setup(): void;
}
