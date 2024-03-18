import Line from 'shapes/line';
import Point from 'math/point';
import Vector from 'math/Vector';

// Calculate the shortest distance from a given point to a line in 2D space
function distanceToLine(point: Point, line: Line): number {
    // Calculate the axis, which is a vector perpendicular to the line
    const axis = Vector.sub(line.end, line.origin).perpendicular();

    // Calculate the vector from the line's origin to the point
    const toPoint = Vector.sub(point, line.origin);

    // Calculate the dot product of toPoint and axis. This gives the length of the projection of toPoint onto axis,
    // which is the shortest distance from the point to the line.
    const dot = toPoint.dot(axis);

    // Return the length of the projection of toPoint onto axis, divided by the length of axis.
    return dot / axis.getLength();
}

export default distanceToLine;
