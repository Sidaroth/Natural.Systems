const drawVector = (gfxContext, from, vector) => {
    gfxContext.beginFill();
    gfxContext.lineStyle(3, 0xff0000);
    gfxContext.moveTo(from.x, from.y);
    gfxContext.lineTo(from.x + vector.x, from.y + vector.y);
    gfxContext.endFill();
};

export default {
    drawVector,
};
