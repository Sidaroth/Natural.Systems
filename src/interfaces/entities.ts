import { Graphics, Sprite, Texture } from 'pixi.js';
import Vector from 'math/Vector';
import Point from 'math/point';

import Circle from 'shapes/circle';
import Rect from 'shapes/rect';

export interface Entity {
    id: string; // UUID
    position: Point;
    sprite: Sprite;
}

export interface QuadTree {
    insert(entity: Entity): boolean;
    remove(entity: Entity): void;
    subdivide(): void;
    getAllEntities(): Entity[];
    getSubtrees(): QuadTree[];
    cleanup(): void;
    query(shape: Rect | Circle): Entity[];
    clear(): void;
    render(context: Graphics): void;
    isDivided: boolean;
    entities: Entity[];
    subTrees: QuadTree[];
}

export interface Boid extends Entity {
    velocity: Vector;
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
    setTree(tree: QuadTree): void;
    update(delta: number): void;
}
