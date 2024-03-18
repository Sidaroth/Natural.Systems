import createState from 'utils/createState';
import Vector from 'math/Vector';
import Rect from 'shapes/rect';
import store from 'root/store';
import Circle from 'shapes/circle';
import { Boid, Entity, QuadTree } from 'root/interfaces/entities';
import { Graphics } from 'pixi.js';

/**
 * https://www.wikiwand.com/en/Quadtree
 *
 * TODO This implementation is very inefficient with many moving objects (i.e boids module)
 * https://gamedev.stackexchange.com/questions/20607/quad-tree-with-a-lot-of-moving-objects
 * https://stackoverflow.com/questions/41946007/efficient-and-well-explained-implementation-of-a-quadtree-for-2d-collision-det
 *
 */
function createQuadTree(boundary: Rect, cap = Infinity, divisions = Infinity, subDivision = 0, parentNode?: QuadTree) {
    const state = {} as QuadTree;

    const capacity = cap;
    const maxDivisions = divisions;
    const bounds = boundary;
    const division = subDivision;
    const parent = parentNode;

    let entities: Entity[] = [];
    let subTrees: QuadTree[] = [];
    const isDivided = false;

    function subdivide() {
        // split boundary into 4 subRegions and redistribute entities to their new owners.
        state.isDivided = true;
        const width = bounds.w / 2;
        const height = bounds.h / 2;

        const midPoint = new Vector(bounds.x + (bounds.w / 2), bounds.y + (bounds.h / 2));
        const ne = new Rect(midPoint.x, midPoint.y - height, width, height);
        const nw = new Rect(bounds.x, midPoint.y - height, width, height);
        const se = new Rect(midPoint.x, midPoint.y, width, height);
        const sw = new Rect(bounds.x, midPoint.y, width, height);

        subTrees.push(createQuadTree(ne, capacity, maxDivisions, division + 1, state));
        subTrees.push(createQuadTree(nw, capacity, maxDivisions, division + 1, state));
        subTrees.push(createQuadTree(se, capacity, maxDivisions, division + 1, state));
        subTrees.push(createQuadTree(sw, capacity, maxDivisions, division + 1, state));

        // Redistribute current entities.
        for (let i = entities.length; i > 0; i -= 1) {
            const entity = entities.pop();
            if (entity) {
                subTrees.every((tree) => !(tree.insert(entity)));
            }
        }
    }

    // Collapse empty subtrees back into this node --> ask parent to check to collapse us if we're now empty.
    function cleanup() {
        if (state.isDivided) {
            let dividedSubTree = false;
            let entitiesInSubtrees = 0;
            subTrees.every((tree) => {
                dividedSubTree = tree.isDivided;
                if (dividedSubTree) return false;

                entitiesInSubtrees += tree.entities.length;

                return true;
            });

            if (!dividedSubTree && entitiesInSubtrees === 0) {
                subTrees = [];
                state.isDivided = false;
                if (parent) {
                    parent.cleanup();
                }
            }

            if (parent) {
                parent.cleanup();
            }
        } else if (!entities.length && parent) {
            parent.cleanup();
        }
    }

    function remove(entity: Entity) {
        if (!bounds.contains(entity.position)) return;
        if (state.isDivided) {
            subTrees.forEach((tree) => tree.remove(entity));
        } else {
            // We're in a leaf node.
            const idx = entities.findIndex((e) => e.id === entity.id);
            if (idx !== -1) {
                entities.splice(idx, 1);
                cleanup();
            }
        }
    }

    function insert(entity: Entity): boolean {
        if (!bounds.contains(entity.position)) return false;
        if (!state.isDivided && division + 1 <= maxDivisions && entities.length + 1 > capacity) subdivide();

        if (state.isDivided) {
            subTrees.every((tree) => !(tree.insert(entity)));
        } else {
            entities.push(entity);
        }

        return true;
    }

    function getAllEntities() {
        if (state.isDivided) {
            let subTreeEntities: Entity[] = [];
            subTrees.forEach((tree) => {
                subTreeEntities = [...subTreeEntities, ...tree.getAllEntities()];
            });

            return subTreeEntities;
        }

        return entities;
    }

    function getSubtrees() {
        return subTrees;
    }

    // Returns any point within given range/shape.
    function query(shape: Rect | Circle) {
        let found: Entity[] = [];

        if (!bounds.intersects(shape)) return found;

        if (state.isDivided) {
            // See what has been found in the subtrees.
            found = subTrees.reduce((subTreeBoids: Entity[], subTree: QuadTree) => {
                const foundInSubTree = subTree.query(shape);
                return subTreeBoids.concat(foundInSubTree);
            }, []);
        } else {
            entities.forEach((entity: Entity) => {
                store.count += 1;
                if (shape.contains(entity.position)) {
                    found.push(entity);
                }
            });
        }

        return found;
    }

    function clear() {
        entities = [];
        subTrees = [];
    }

    function render(context: Graphics) {
        context.rect(bounds.x, bounds.y, bounds.w, bounds.h).stroke({ width: 1, color: 0x000000 });

        subTrees.forEach((tree) => {
            tree.render(context);
        });
    }

    const localState: QuadTree = {
        insert,
        remove,
        render,
        query,
        subdivide,
        clear,
        getAllEntities,
        getSubtrees,
        entities,
        subTrees,
        cleanup,
        isDivided,
    };

    return createState({ stateName: 'QuadTree', mainState: state, states: { localState } });
}

export default createQuadTree;
