import SATSeparationDataModel from './satSeparationDataModel';

/**
 * Sources for SAT:
 * https://www.sevenson.com.au/programming/sat/
 * https://www.metanetsoftware.com/technique/tutorialA.html
 * https://gamedevelopment.tutsplus.com/tutorials/collision-detection-using-the-separating-axis-theorem--gamedev-169
 * https://dyn4j.org/2010/01/sat/ (handling of concave polygons)
 * http://programmerart.weebly.com/separating-axis-theorem.html
 * https://badai.xyz/2019-10-07-sat-collision-detection-polygon-and-circle/
 * https://www.wikiwand.com/en/Hyperplane_separation_theorem
 */

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

function isSeparatingAxis(polygon1, polygon2, axis) {
    const separationData = new SATSeparationDataModel();
    const offset = polygon2.position.clone().sub(polygon1.position);
    const projectedOffset = offset.dot(axis);
    const pol1Range = projectMinMaxOnAxis(polygon1.vertices, axis, projectedOffset);
    const pol2Range = projectMinMaxOnAxis(polygon2.vertices, axis, projectedOffset);

    // There's a gap on this axis.
    if (pol1Range.min > pol2Range.max || pol2Range.min > pol1Range.max) {
        return separationData;
    }

    // There's overlap, calculate the amount along this axis.
    let overlap = 0;
    separationData.isSeparating = false;

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

function boundsOverlaps(polygon1, polygon2) {
    return polygon1.getAABB().intersects(polygon2.getAABB());
}

function checkPolygonPolygon(polygon1, polygon2) {
    let shortestOverlap = new SATSeparationDataModel();

    // We can determine that if the axis-aligned bounding box of the polygons do not overlap, there is no collision.
    if (!boundsOverlaps(polygon1, polygon2)) {
        return shortestOverlap;
    }

    // We only need to test against unique axes. We can reduce computational load by filtering out duplicates.
    // This optimization relies on the filtering process being cheaper computationally than the seperating axis calculations.
    const uniqueAxes = [];
    [...polygon1.getEdges(), ...polygon2.getEdges()].forEach((axis) => {
        const normal = axis.normal();
        if (uniqueAxes.find(a => a.equals(normal)) === undefined) uniqueAxes.push(normal);
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
    shortestOverlap.overlapVector = shortestOverlap.overlapAxis.multiply(shortestOverlap.overlapDistance);
    return shortestOverlap;
}

export default {
    checkPolygonPolygon,
};
