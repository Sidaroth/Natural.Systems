import Vector from 'math/Vector';

export default class SATSeparationDataModel {
    isSeparating: boolean;

    overlapDistance: number;

    overlapAxis: Vector;

    aInB: boolean;

    bInA: boolean;

    constructor() {
        this.isSeparating = true;
        this.overlapDistance = Infinity;
        this.overlapAxis = new Vector();
        this.aInB = false;
        this.bInA = false;
    }
}
