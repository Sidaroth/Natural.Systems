export default class Size {
    width: number = 0;

    height: number = 0;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    area(): number {
        return this.width * this.height;
    }
}
