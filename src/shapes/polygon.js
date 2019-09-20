import Vector from '../math/Vector';

export default class Polygon {
    vertices = [];
    sprite;
    position;

    constructor(vertices) {
        [this.position] = vertices;
        this.vertices = vertices;
    }

    moveVertices(changeV) {
        this.vertices.forEach((vertex) => {
            vertex.add(changeV);
        });
    }

    getEdges() {
        const edges = [];
        this.vertices.forEach((vertex, index) => {
            const nextVertex = this.vertices[(index + 1) % this.vertices.length];
            const edge = Vector.sub(vertex, nextVertex);
            edges.push(edge);
        });

        return edges;
    }

    rotateBy(angle, pivot = this.vertices[0]) {
        this.vertices.forEach((vertex) => {
            vertex.rotateBy(angle, pivot);
        });
    }

    setPosition(posX, posY) {
        const newPos = new Vector(posX, posY);
        const changeV = Vector.sub(newPos, this.vertices[0]);
        this.moveVertices(changeV);
        [this.position] = this.vertices;
    }

    render(gfx, lineColor = 0x000000, fillColor = 0xCCCCCC) {
        gfx.beginFill(fillColor);
        gfx.lineStyle(2, lineColor);
        gfx.moveTo(this.vertices[0].x, this.vertices[0].y);

        this.vertices.forEach((vertex, index) => {
            const nextIndex = (index + 1) % this.vertices.length;
            const nextVertex = this.vertices[nextIndex];
            gfx.lineTo(nextVertex.x, nextVertex.y);
        });

        gfx.endFill();
    }

    // See https://www.wikiwand.com/en/Centroid#/Of_a_polygon
    getCentroid() {
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

        return new Vector(centerX, centerY);
    }
}
