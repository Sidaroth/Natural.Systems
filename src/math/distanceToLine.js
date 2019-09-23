import Vector from './Vector';

const distanceToLine = (point, line) => {
    const axis = Vector.sub(line.end, line.origin).perpendicular();
    const toPoint = Vector.sub(point, line.origin);

    const dot = toPoint.dot(axis);

    return dot / axis.getLength();
};

export default distanceToLine;
