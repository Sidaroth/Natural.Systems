import Vector from './Vector';
/**
 * Finds the intersection point between a ray and an edge (two lines), if the lines are not paralell or coincident.
 */
export default function edgeIntersectPoint(ray, edge) {
    // A line is defined as L = Origin + step * (Point2 - Point1); --- http://paulbourke.net/geometry/pointlineplane/
    const rayV = ray.getVector();
    const edgeV = edge.getVector();
    const rayToEdge = Vector.sub(ray.origin, edge.origin);
    const intersectionPoint = new Vector();

    /* eslint-disable no-mixed-operators */
    const numerator = (edgeV.x * rayToEdge.y) - (edgeV.y * rayToEdge.x);
    const denominator = (edgeV.y * rayV.x) - (edgeV.x * rayV.y);
    if (denominator === 0) {
        // parallel or coincident, they will never intersect.
        return null;
    }
    const step = numerator / denominator;
    intersectionPoint.x = ray.origin.x + (step * rayV.x);
    intersectionPoint.y = ray.origin.y + (step * rayV.y);

    /* eslint-enable no-mixed-operators */

    return intersectionPoint;
}
