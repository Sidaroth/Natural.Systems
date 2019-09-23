import Vector from '../math/Vector';
import Rect from '../shapes/rect';
import store from '../store';

// https://www.wikiwand.com/en/Quadtree
const createQuadTree = (boundary, cap = Infinity) => {
    const state = {};

    const capacity = cap;
    const bounds = boundary;
    const entities = [];
    const subTrees = [];

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

        subTrees.push(createQuadTree(ne, capacity));
        subTrees.push(createQuadTree(nw, capacity));
        subTrees.push(createQuadTree(se, capacity));
        subTrees.push(createQuadTree(sw, capacity));

        // Redistribute current points.
        for (let i = entities.length; i > 0; i -= 1) {
            const entity = entities.pop();
            subTrees.every((tree) => {
                if (tree.insert(entity)) return false;
                return true;
            });
        }
    }

    function insert(entity) {
        if (!bounds.contains(entity.position)) return false;
        if (!isSubdivided && entities.length + 1 > capacity) subdivide();

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

    // Returns any point within given range/shape.
    function query(shape) {
        let found = [];

        if (!bounds.intersects(shape)) return found;
        if (isSubdivided) {
            subTrees.forEach((tree) => {
                found = [...found, ...tree.query(shape)];
            });
        } else {
            entities.forEach((entity) => {
                store.count += 1;
                if (shape.contains(entity.position)) found.push(entity);
            });
        }

        return found;
    }

    function render(context) {
        context.lineStyle(1, 0x000000);
        context.drawRect(bounds.x, bounds.y, bounds.w, bounds.h);

        entities.forEach((entity) => {
            context.beginFill(0x000000);
            context.drawCircle(entity.position.x, entity.position.y, 1);
            context.endFill();
        });

        subTrees.forEach((tree) => {
            tree.render(context);
        });
    }

    function getEntities() {
        return entities;
    }

    return Object.assign(state, {
        insert,
        render,
        query,
        subdivide,
        getEntities,
        entities,
        subTrees,
        // stuff
    });
};

export default createQuadTree;
