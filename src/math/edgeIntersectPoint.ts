import Line from 'src/shapes/line';
import Vector from 'math/Vector';
import Point from 'math/point';

/**
 * Finds the intersection point between a ray and an edge (two lines), if the lines are not paralell or coincident.
 */
export default function edgeIntersectPoint(ray: Line, edge: Line): Point | null {
    // A line is defined as L = Origin + step * (Point2 - Point1); --- http://paulbourke.net/geometry/pointlineplane/
    const rayV = ray.getVector();
    const edgeV = edge.getVector();
    const rayToEdge = Vector.sub(ray.origin, edge.origin);
    const intersectionPoint = new Point();

    const numerator = (edgeV.x * rayToEdge.y) - (edgeV.y * rayToEdge.x);
    const denominator = (edgeV.y * rayV.x) - (edgeV.x * rayV.y);
    if (denominator === 0) {
        // parallel or coincident, they will never intersect.
        return null;
    }

    const step = numerator / denominator;
    intersectionPoint.x = ray.origin.x + (step * rayV.x);
    intersectionPoint.y = ray.origin.y + (step * rayV.y);

    return intersectionPoint;
}
