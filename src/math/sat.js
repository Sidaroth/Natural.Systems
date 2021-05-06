import Vector from './Vector';

// Projects the points onto a unit vector axis,
// resulting in a one dimensional range of the minimum and maximum value on that axis.
function projectMinMaxOnAxis(points, axis, offset) {
    let min = Infinity;
    let max = -Infinity;

    for (let i = 0; i < points.length; i += 1) {
        const dotProd = points[i].dot(axis);
        if (dotProd < min) min = dotProd;
        if (dotProd > max) max = dotProd;
    }

    return { min: min + offset, max: max + offset };
}

function calculateEdgeNormals(edges) {
    const normals = [];
    edges.forEach((edge) => {
        const normal = new Vector()
            .copy(edge)
            .perpendicular()
            .getUnit();

        normals.push(normal);
    });

    return normals;
}

function isSeparatingAxis(polygon1, polygon2, axis) {
    const separationData = {
        isSeparating: false,
        overlapDistance: undefined,
        overlapAxis: new Vector(),
        aInB: false,
        bInA: false,
    };

    const offset = polygon2.position.clone().sub(polygon1.position);
    const projectedOffset = offset.dot(axis);
    const pol1Range = projectMinMaxOnAxis(polygon1.vertices, axis, projectedOffset);
    const pol2Range = projectMinMaxOnAxis(polygon2.vertices, axis, projectedOffset);

    // There's a gap on this axis.
    if (pol1Range.min > pol2Range.max || pol2Range.min > pol1Range.max) {
        separationData.isSeparating = true;
        return separationData;
    }

    // There's overlap, calculate the amount along this axis.
    let overlap = 0;

    // Polygon 1 is to the left of Polygon2 along this axis.
    if (pol1Range.min < pol2Range.min) {
        if (pol1Range.max < pol2Range.max) {
            // Polygon 1 ends before polygon 2.
            overlap = pol1Range.max - pol2Range.min;
        } else {
            // Polygon 2 is entirely within polygon 1. Find shortest path out.
            separationData.bInA = true;
        }
    } else if (pol1Range.max > pol2Range.max) {
        // Polygon 1 is to the right of Polygon 2 && Polygon 2 ends before polygon 1.
        overlap = pol1Range.min - pol2Range.max;
    } else {
        // Polygon 1 is entirely within polygon 2. Find shortest path out.
        separationData.aInB = true;
    }

    if (separationData.aInB || separationData.bInA) {
        const option1 = pol1Range.max - pol2Range.min;
        const option2 = pol2Range.max - pol1Range.min;
        overlap = option1 < option2 ? option1 : -option2;
    }

    const absOverlap = Math.abs(overlap);
    separationData.overlapDistance = absOverlap;
    separationData.overlapAxis = axis.clone();
    if (overlap > 0) separationData.overlapAxis.inverse();

    return separationData;
}

function checkPolygonPolygon(polygon1, polygon2) {
    const pol1Normals = calculateEdgeNormals(polygon1.getEdges());
    const pol2Normals = calculateEdgeNormals(polygon2.getEdges());

    let shortestOverlap = {
        isSeparating: false,
        overlapDistance: Infinity,
    };

    // We only need to test against unique axes. We can reduce computational load by filtering out duplicates.
    // This optimization relies on the filtering process being cheaper computationally than the seperating axis calculations.
    const uniqueAxes = [];
    [...pol1Normals, ...pol2Normals].forEach((axis) => {
        if (uniqueAxes.find(a => a.equals(axis)) === undefined) uniqueAxes.push(axis);
    });

    for (let i = 0; i < uniqueAxes.length; i += 1) {
        const separationData = isSeparatingAxis(polygon1, polygon2, uniqueAxes[i]);
        if (separationData.isSeparating) {
            return separationData; // We've found a separating line, no collision.
        } else if (separationData.overlapDistance < shortestOverlap.overlapDistance) {
            shortestOverlap = separationData;
        }
    }

    // Calculate overlap vector based on shortest overlap distance along the corresponding axis.
    shortestOverlap.overlapVector = shortestOverlap.overlapAxis.clone().multiply(shortestOverlap.overlapDistance);
    return shortestOverlap;
}

export default {
    checkPolygonPolygon,
};
