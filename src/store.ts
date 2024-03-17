import { Application, Renderer } from 'pixi.js';
import Point from 'math/point';
import Rect from 'shapes/rect';

interface Store {
    app?: Application;
    renderer?: Renderer;
    worldBoundary?: Rect;
    count: number;
    mousePosition: Point
    messageBus: any;
}

const store: Store = {
    renderer: undefined,
    mousePosition: new Point(),
    worldBoundary: undefined,
    count: 0,
    messageBus: undefined,
};

export default store;
