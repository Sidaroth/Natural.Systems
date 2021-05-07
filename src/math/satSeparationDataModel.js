import Vector from './Vector';

export default class SATSeparationDataModel {
    constructor() {
        this.isSeparating = true;
        this.overlapDistance = undefined;
        this.overlapAxis = new Vector();
        this.aInB = false;
        this.bInA = false;
    }
}
