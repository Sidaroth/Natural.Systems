import { Graphics, Sprite, Texture } from 'pixi.js';
import Vector from 'math/Vector';
import Point from 'math/point';

import Circle from 'shapes/circle';
import Rect from 'shapes/rect';

export interface QuadTree {
    insert(entity: Boid): boolean;
    remove(entity: Boid): void;
    subdivide(): void;
    getAllEntities(): Boid[];
    getSubtrees(): QuadTree[];
    cleanup(): void;
    query(shape: Rect | Circle): Boid[];
    clear(): void;
    render(context: Graphics): void;
    isDivided: boolean;
    entities: Boid[];
    subTrees: QuadTree[];
}

export interface Boid {
    id: string; // UUID
    position: Point;
    velocity: Vector;
    sprite: Sprite;
    texture: Texture;
    visionRadius: number;
    fov: number;
    addForce(x: number, y?: number): void;
    setVizualizationStatus(connections: boolean,
        vision: boolean,
        separation: boolean,
        alignment: boolean,
        cohesion: boolean): void;
    getPosition(): Point;
    setPosition(x: number, y: number): void;
    setRotation(angle: number): void;
    setVelocity(vel: Vector): void;
    setSpeed(speed: number): void;
    update(delta: number, tree: QuadTree): void;
}
