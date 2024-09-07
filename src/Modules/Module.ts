import getUUID from 'math/getUUID';
import { Container } from 'pixi.js';
import { ModuleSettings } from './IModule';

export default abstract class Module {
    id: string;

    name: string;

    description: string;

    settings: ModuleSettings;

    abstract stage: Container;

    abstract backgroundColor?: number;

    constructor() {
        this.id = getUUID();
        this.name = `ModuleId: ${this.id}`;
        this.description = `${this.name} placeholder description.`;
        this.settings = {
            id: this.id,
            label: this.name,
            title: this.name,
            description: this.description,
            options: [],
        };
    }

    abstract getSettings(): ModuleSettings;

    abstract destroy(): void;

    abstract update(delta: number): void;

    abstract render(): void;

    abstract setup(): void;
}
