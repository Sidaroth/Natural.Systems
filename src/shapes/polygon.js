import Vector from '../math/Vector';

export default class Polygon {
    vertices = [];
    sprite;
    position;
    name;

    constructor(vertices, name = '') {
        this.name = name;
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

    rotateBy(angle) {
        this.vertices.forEach((vertex) => {
            vertex.rotateBy(angle, this.vertices[0]);
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
}
