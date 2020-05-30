import * as PIXI from 'pixi.js';
import config from '../config';

const hasParallax = function hasParallaxFunc(state) {
    const parallaxLayers = [];

    function setParallaxSpeed(speed) {
        parallaxLayers.forEach((layer) => {
            layer.speed = speed;
        });
    }

    function setParallaxSpeedOnLayer(layerkey, speed) {
        const layer = parallaxLayers.find(l => l.key === layerkey);
        if (layer) layer.speed = speed;
    }

    /**
     * @param {*} key - Used to reference layers later when updating i.e the speed of the layer.
     * @param {*} texture - Texture to use as a basis for the parallaxing effect.
     * @param {*} count - How many copies of the texture do we need to achieve a glitch-free effect?
     * @param {*} speed - How fast does the layer move.
     * @param {*} heightModifier - Changes the Y-position of the sprite when necessary.
     */
    function addParallaxLayer(key, texture, count, speed, heightModifier = 1) {
        const sprites = [];


        for (let i = 0; i < count; i += 1) {
            const sprite = new PIXI.Sprite(texture);
            sprite.position.x = sprite.width * i;
            sprite.position.y = config.WORLD.height - sprite.height / heightModifier;
            sprites.push(sprite);
            state.getContainer().addChild(sprite);
        }

        parallaxLayers.push({
            key,
            sprites,
            speed,
        });
    }

    function parallaxSprite(sprite, array, idx, speed) {
        sprite.position.x -= speed;
        if (sprite.position.x + sprite.width < 0) {
            // The previous sprite, if we need to move, should be the one at the end currently.
            const index = idx ? idx - 1 : array.length - 1;
            const lastSprite = array[index];
            sprite.position.x = lastSprite.x + lastSprite.width - speed;
        }
    }


    function updateParallax(delta) {
        parallaxLayers.forEach((layer) => {
            layer.sprites.forEach((sprite, index) => {
                parallaxSprite(sprite, layer.sprites, index, layer.speed * delta);
            });
        });

        return delta;
    }

    function destroy() {
        parallaxLayers.forEach((layer) => {
            layer.sprites.forEach((sprite) => {
                state.levelContainer.removeChild(sprite);
                sprite.destroy();
            });
        });
    }

    return {
        updateParallax,
        addParallaxLayer,
        setParallaxSpeed,
        setParallaxSpeedOnLayer,
        destroy,
    };
};

export default hasParallax;
