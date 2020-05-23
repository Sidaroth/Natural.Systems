import * as PIXI from 'pixi.js';

const hasAnimation = function hasAnimationFunc(state, sheet, animationKey) {
    let textureSheet = sheet;
    let currentAnimation = animationKey;
    let animationSpeed = 0.25;

    const animatedSprite = new PIXI.AnimatedSprite(textureSheet.animations[currentAnimation]);
    animatedSprite.animationSpeed = animationSpeed;
    animatedSprite.play();

    function setTextureSheet(texSheet) {
        textureSheet = texSheet;
    }

    function setAnimation(key) {
        currentAnimation = key;
    }

    function setAnimationSpeed(speed) {
        animationSpeed = speed;
        animatedSprite.animationSpeed = animationSpeed;
    }

    function getSprite() {
        return animatedSprite;
    }

    function setPosition(pos) {
        animatedSprite.position.x = pos.x;
        animatedSprite.position.y = pos.y;
    }

    function destroy() {
        animatedSprite.destroy();
    }

    function setRenderable(renderable) {
        animatedSprite.renderable = renderable;
    }

    return {
        setAnimation,
        setTextureSheet,
        setAnimationSpeed,
        getSprite,
        setPosition,
        setRenderable,
        destroy,
    };
};

export default hasAnimation;