import { Renderer } from 'pixi.js';
import Point from 'math/point';
import Rect from 'shapes/rect';
import { MessageBus } from 'components/events/eventInterfaces';
import createMessageBus from 'components/events/createMessageBus';

interface Store {
    renderer?: Renderer;
    worldBoundary: Rect;
    count: number;
    mousePosition: Point
    messageBus: MessageBus;
}

const store: Store = {
    renderer: undefined,
    worldBoundary: new Rect(),
    count: 0,
    mousePosition: new Point(),
    messageBus: createMessageBus(),
};

export default store;
