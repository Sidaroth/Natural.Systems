import Point from 'math/point';
import Vector from 'math/Vector';
import { Graphics } from 'pixi.js';
import Rect from 'shapes/rect';

export default class Polygon {
    position: Point;

    vertices: Point[] = [];

    edges: Vector[] = [];

    centroid: Point;

    isConcave: boolean;

    aabb: Rect;

    edgeColors = [
        0x000000, // black
        0xFF0000, // red
        0x00FF00, // green
        0x0000FF, // blue
        0xFF00FF, // magenta
        0x00FFFF, // cyan
        0xFFFF00, // yellow
    ];

    constructor(vertices: Point[]) {
        if (vertices.length < 3) throw new Error('A polygon must have at least 3 vertices.');

        this.position = vertices[0] as Point;
        this.vertices = vertices;
        this.edges = [];
        this.isConcave = false;
        this.centroid = new Point();
        this.aabb = new Rect();

        this.updateEdges();
    }

    /**
     * Technically this could just invalidate the prev. cache, so that
     * it only recalculates on actual get calls where cache is invalid.
     */
    updateEdges() {
        const edges: Vector[] = [];
        this.vertices.forEach((vertex: Point, index: number) => {
            // Next - wraps around to the first vertex if we're at the last.
            const nextVertex = this.vertices[(index + 1) % this.vertices.length] as Point;
            const edge = Vector.sub(vertex, nextVertex);
            edges.push(edge);
        });

        this.edges = edges;

        this.calculateCentroid();
        this.calculateAABB();
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
    calculateIsConcave(): boolean {
        // Points, Lines and Triangles are always considered convex, there is no way to define a concave angle in these shapes.
        if (this.edges.length <= 3) return false;

        for (let i = 0; i < this.vertices.length; i += 1) {
            const vertex = this.vertices[i] as Point;
            const prevVertex = this.vertices[i === 0 ? this.vertices.length - 1 : i - 1] as Point; // Wrap around to the last vertex if we're at the first.
            const nextVertex = this.vertices[(i + 1) % this.vertices.length] as Point; // Wrap around to the first vertex if we're at the last.

            const edgeA = Vector.sub(prevVertex, vertex);
            const edgeB = Vector.sub(nextVertex, vertex);

            const angle = edgeA.angleBetween2d(edgeB);
            if (angle > (2 * Math.PI)) {
                // We found a concave angle - return early.
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
            const nextVertex = this.vertices[(i + 1) % this.vertices.length] as Point;

            const a = (vertex.x * nextVertex.y) - (nextVertex.x * vertex.y);
            centerX += (vertex.x + nextVertex.x) * a;
            centerY += (vertex.y + nextVertex.y) * a;
            area += a;
        });

        area *= 3;
        centerX /= area;
        centerY /= area;

        this.centroid = new Point(centerX, centerY);
    }

    /*
    * Calculate a naive Axis-Aligned Bounding Box for the polygon. Used for preliminary collision detection to determine if we
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

        this.aabb = new Rect(x, y, width, height);
    }

    moveVertices(change: Point) {
        this.vertices.forEach((vertex) => {
            vertex.add(change);
        });

        this.updateEdges();
    }

    setPosition(posX: number, posY: number) {
        const pos = new Point(posX, posY);

        const currentPos = this.position;
        // We want to move each vertex in the polygon by the difference between the new position and the old position.
        const change = Point.subtract(pos, currentPos);
        this.moveVertices(change);

        // Update the position of the polygon - defined as the first vertex.
        const newPosition = this.vertices[0] as Point;
        this.position = newPosition;
    }

    rotateBy(angle: number, pivot = this.vertices[0]) {
        this.vertices.forEach((vertex) => {
            vertex.rotate(angle, pivot);
        });
        this.updateEdges();
    }

    render(gfx: Graphics, fillColor = 0xCCCCCC) {
        if (this.vertices.length === 0) return;

        // Set the drawing start point to the first vertex.
        const firstVertex = this.vertices[0] as Point;
        gfx.moveTo(firstVertex.x, firstVertex.y);

        this.vertices.forEach((vertex, index) => {
            const nextIndex = (index + 1) % this.vertices.length;
            // Due to the modulo, this will wrap around to the first vertex if we're at the last - it can never be out of bounds.
            const nextVertex = this.vertices[nextIndex] as Point;

            // Draw each subsequent line.
            gfx.lineTo(nextVertex.x, nextVertex.y).stroke({ width: 2, color: this.edgeColors[index] });
        });

        gfx.fill(fillColor);
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
