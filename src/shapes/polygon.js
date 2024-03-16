import Vector from '../math/Vector';
import radiansToDegrees from '../math/radiansToDegrees';
import Rect from './rect';

export default class Polygon {
    constructor(vertices) {
        [this.position] = vertices;
        this.vertices = vertices;
        this.edges = [];
        this.centroid = undefined;
        this.isConcave = false;
        this.aabb = undefined;

        this.updateEdges();
    }

    /**
     * Technically this could just invalidate the prev. cache, so that
     * it only recalculates on actual get calls where cache is invalid.
     */
    updateEdges() {
        const edges = [];
        this.vertices.forEach((vertex, index) => {
            const nextVertex = this.vertices[(index + 1) % this.vertices.length];
            const edge = Vector.sub(vertex, nextVertex);
            edges.push(edge);
        });

        this.edges = edges;
        this.isConcave = this.calculateCentroid();
        this.aabb = this.calculateAABB();
    }

    /**
    * Collision detection with SAT does not work with concave polygons. It is useful to have this cached,
    * along with how to split the polygon into convex partitions.
    *
    * Detection of a concave polygon (https://mathworld.wolfram.com/ConvexPolygon.html):
    * - A polygon is CONVEX if it contains fully every line segment from vertex to vertex.
    *   - From this, we can detect the CONCAVENESS of a polygon by detecting intersection between these line segments, and the polygons edges.
    * - A polygon is considered CONCAVE if at least one of its INTERNAL angles are greater than 180 degrees.
    * - A CONCAVE polygon must have at least 4 vertices.
    *
    * https://stackoverflow.com/a/45372025
    *
    */
    calculateIsConcave() {
        if (this.edges.length <= 3) return false;

        for (let i = 0; i < this.vertices.length; i += 1) {
            const prevVertex = this.vertices[i === 0 ? this.vertices.length - 1 : i - 1];
            const vertex = this.vertices[i];
            const nextVertex = this.vertices[(i + 1) % this.vertices.length];

            console.log(prevVertex, vertex, nextVertex);
            const edgeA = Vector.sub(prevVertex, vertex);
            const edgeB = Vector.sub(nextVertex, vertex);

            console.log(edgeA, edgeB);

            const angle = edgeA.angleBetween2d(edgeB);
            console.log(radiansToDegrees(angle));
            if (angle > 2 * Math.PI) {
                return true;
            }
        }
        return false;
    }

    // See https://www.wikiwand.com/en/Centroid#/Of_a_polygon
    calculateCentroid() {
        let centerX = 0;
        let centerY = 0;
        let area = 0;

        this.vertices.forEach((vertex, i) => {
            const nextVertex = this.vertices[(i + 1) % this.vertices.length];

            const a = vertex.x * nextVertex.y - nextVertex.x * vertex.y;
            centerX += (vertex.x + nextVertex.x) * a;
            centerY += (vertex.y + nextVertex.y) * a;
            area += a;
        });

        area *= 3;
        centerX /= area;
        centerY /= area;

        this.centroid = new Vector(centerX, centerY);
    }

    /*
    * returns a naive Axis-Aligned Bounding Box for the polygon. Used for preliminary collision detection to determine if we
    * need to use more detailed and expensive calculations (SAT). Should be cached.
    */
    calculateAABB() {
        let x = Infinity;
        let y = Infinity;
        let width = -Infinity;
        let height = -Infinity;

        this.vertices.forEach((vertex) => {
            if (vertex.x < x) ({ x } = vertex);
            if (vertex.x > width) width = vertex.x;
            if (vertex.y < y) ({ y } = vertex);
            if (vertex.y > height) height = vertex.y;
        });

        return new Rect(x, y, width, height);
    }

    moveVertices(changeV) {
        this.vertices.forEach((vertex) => {
            vertex.add(changeV);
        });
        this.updateEdges();
    }

    setPosition(posX, posY) {
        const newPos = new Vector(posX, posY);
        const changeV = Vector.sub(newPos, this.vertices[0]);
        this.moveVertices(changeV);
        [this.position] = this.vertices;
    }

    rotateBy(angle, pivot = this.vertices[0]) {
        this.vertices.forEach((vertex) => {
            vertex.rotateBy(angle, pivot);
        });
        this.updateEdges();
    }

    edgeColors = [
        0x000000, // black
        0xFF0000, // red
        0x00FF00, // green
        0x0000FF, // blue
        0xFF00FF, // magenta
        0x00FFFF, // cyan
        0xFFFF00, // yellow
    ];

    render(gfx, lineColor = 0x000000, fillColor = 0xCCCCCC) {
        gfx.beginFill(fillColor);
        gfx.lineStyle(2, lineColor);
        gfx.moveTo(this.vertices[0].x, this.vertices[0].y);

        this.vertices.forEach((vertex, index) => {
            const nextIndex = (index + 1) % this.vertices.length;
            const nextVertex = this.vertices[nextIndex];
            gfx.lineStyle(2, this.edgeColors[index]);
            gfx.lineTo(nextVertex.x, nextVertex.y);
        });

        gfx.endFill();
    }

    getAABB() {
        return this.aabb;
    }

    getEdges() {
        return this.edges;
    }

    getCentroid() {
        return this.centroid;
    }
}
