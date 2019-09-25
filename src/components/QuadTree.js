import Vector from '../math/Vector';
import Rect from '../shapes/rect';
import store from '../store';

// https://www.wikiwand.com/en/Quadtree
const createQuadTree = (boundary, cap = Infinity, divisions = Infinity, subDivision = 0, parentNode = undefined) => {
    const state = {};

    const capacity = cap;
    const maxDivisions = divisions;
    const bounds = boundary;
    const entities = [];
    const division = subDivision;
    const parent = parentNode;

    let subTrees = [];
    let isSubdivided = false;

    function subdivide() {
        // split boundary into 4 subRegions and redistribute entities to their new owners.
        isSubdivided = true;
        const width = bounds.w / 2;
        const height = bounds.h / 2;

        const midPoint = new Vector(bounds.x + bounds.w / 2, bounds.y + bounds.h / 2);
        const ne = new Rect(midPoint.x, midPoint.y - height, width, height);
        const nw = new Rect(bounds.x, midPoint.y - height, width, height);
        const se = new Rect(midPoint.x, midPoint.y, width, height);
        const sw = new Rect(bounds.x, midPoint.y, width, height);

        subTrees.push(createQuadTree(ne, capacity, maxDivisions, division + 1, state));
        subTrees.push(createQuadTree(nw, capacity, maxDivisions, division + 1, state));
        subTrees.push(createQuadTree(se, capacity, maxDivisions, division + 1, state));
        subTrees.push(createQuadTree(sw, capacity, maxDivisions, division + 1, state));

        // Redistribute current points.
        for (let i = entities.length; i > 0; i -= 1) {
            const entity = entities.pop();
            subTrees.every((tree) => {
                if (tree.insert(entity)) return false;
                return true;
            });
        }
    }

    function cleanup() {
        const subEntities = subTrees.reduce((ents, tree) => ents + tree.entities.length, 0);
        if (subEntities === 0) {
            subTrees = [];
            isSubdivided = false;
        }

        if (parent) parent.cleanup();
    }

    function remove(entity) {
        if (!bounds.contains(entity.position)) return;
        if (isSubdivided) {
            subTrees.every((tree) => {
                const idx = tree.entities.findIndex(e => e.id === entity.id);
                if (idx !== -1) {
                    tree.entities.splice(idx, 1);
                    cleanup();
                    return false;
                }

                return true;
            });
        } else {
            const idx = entities.findIndex(e => e.id === entity.id);
            if (idx !== -1) {
                entities.splice(idx, 1);
                cleanup();
            }
        }
    }

    function insert(entity) {
        if (!bounds.contains(entity.position)) return false;
        if (!isSubdivided && !(division + 1 > maxDivisions) && entities.length + 1 > capacity) subdivide();

        if (isSubdivided) {
            subTrees.every((tree) => {
                if (tree.insert(entity)) return false;
                return true;
            });
        } else {
            entities.push(entity);
        }

        return true;
    }

    function getAllEntities() {
        if (isSubdivided) {
            let ents = [];
            subTrees.forEach((tree) => {
                ents = [...ents, ...tree.getAllEntities()];
            });

            return ents;
        }

        return entities;
    }

    // Returns any point within given range/shape.
    function query(shape) {
        let found = [];

        if (!bounds.intersects(shape)) return found;
        if (isSubdivided) {
            found = subTrees.reduce((arr, tree) => arr.concat(...tree.query(shape)), []);
        } else {
            entities.forEach((entity) => {
                store.count += 1;
                if (shape.contains(entity.position)) found.push(entity);
            });
        }

        return found;
    }

    function clear() {
        this.entities = [];
        this.subTrees.forEach(tree => tree.clear());
        this.subTrees = [];
    }

    function render(context) {
        context.lineStyle(1, 0x000000);
        context.drawRect(bounds.x, bounds.y, bounds.w, bounds.h);

        subTrees.forEach((tree) => {
            tree.render(context);
        });
    }

    return Object.assign(state, {
        insert,
        remove,
        render,
        query,
        subdivide,
        clear,
        getAllEntities,
        entities,
        subTrees,
        cleanup,
        // stuff
    });
};

export default createQuadTree;
