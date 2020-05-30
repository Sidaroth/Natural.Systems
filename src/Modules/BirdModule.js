import * as PIXI from 'pixi.js';
import Module from './Module';
import store from '../store';
import Rect from '../shapes/rect';
import createEndlessForest from 'levels/BirdModule/createEndlessForest';
import config from '../config';

export default class BirdModule extends Module {
    constructor(stage) {
        super();
        this.name = 'bird';
        this.description = 'Trees, flapping, what more do you need?\nPress LMB to flap!';
        this.stage = stage;

        this.settings = {
            autoBird: false,
            speed: 12.5,
            maxSpeed: 20,
            flapForce: 11,
            gravity: 0.7,
        };

        this.SFXVolume = 50;
        this.BGMVolume = 25;
        store.SFXVolume = this.SFXVolume / 100;
        store.BGMVolume = this.BGMVolume / 100;

        this.loadTiledData();
        this.loadSpritesheets();
        this.loadAudio();
    }

    /* eslint-disable class-methods-use-this */
    // Load collision rects from Tiled Tsx datzaset.
    // TODO: Swap to async load, or use a pixi loader.
    loadTiledData() {
        const xmlhttp = new XMLHttpRequest();
        xmlhttp.open('GET', '../../assets/images/trees/trees.tsx', false);
        xmlhttp.send();
        const tiledXml = xmlhttp.responseXML;
        const tiles = tiledXml.getElementsByTagName('tile');
        store.treeColliderMap = new Map();

        for (let i = 0; i < tiles.length; i += 1) {
            const tile = tiles[i];
            const colliders = [];
            const colliderObjects = tile.getElementsByTagName('object');

            for (let j = 0; j < colliderObjects.length; j += 1) {
                const colliderObj = colliderObjects[j];
                const x = +colliderObj.getAttribute('x');
                const y = +colliderObj.getAttribute('y');
                const width = +colliderObj.getAttribute('width');
                const height = +colliderObj.getAttribute('height');

                const collider = new Rect(x, y, width, height);
                colliders.push(collider);
            }

            store.treeColliderMap.set(`tree${i + 1}`, colliders);
        }
    }

    loadAudio() {
        PIXI.Loader.shared.add('birdBgm', 'assets/sounds/bgm.wav');
        PIXI.Loader.shared.add('swoosh1', 'assets/sounds/Swoosh_Swipe-Thick_01.wav');
        PIXI.Loader.shared.add('swoosh2', 'assets/sounds/Swoosh_Swipe-Thick_02.wav');
        PIXI.Loader.shared.add('swoosh3', 'assets/sounds/Swoosh_Swipe-Thick_03.wav');
        PIXI.Loader.shared.add('crashGround', 'assets/sounds/collision_paper_soft_02.wav');
        PIXI.Loader.shared.add('crashTree', 'assets/sounds/collision_hallow_01.wav');
    }

    loadSpritesheets() {
        PIXI.Loader.shared.add('birdSheet', 'assets/images/bird/bird_packed.json');
        PIXI.Loader.shared.add('parallaxSheet', 'assets/images/parallax/parallax.json');
        PIXI.Loader.shared.add('treeSheet', 'assets/images/trees/trees.json');
        PIXI.Loader.shared.add('clutterSheet', 'assets/images/clutter/clutter.json');
    }

    // Create a map of available SFX/Music for easy access.
    mapAudio(resources) {
        store.SFXMap = new Map();
        store.SFXMap.set('swoosh1', resources.swoosh1.sound);
        store.SFXMap.set('swoosh2', resources.swoosh2.sound);
        store.SFXMap.set('swoosh3', resources.swoosh3.sound);
        store.SFXMap.set('crashGround', resources.crashGround.sound);
        store.SFXMap.set('crashTree', resources.crashTree.sound);
        store.SFXMap.set('endlessForestBGM', resources.birdBgm.sound);
    }

    // Create a map of available textures for easy access.
    mapTextures(resources) {
        store.textureMap = new Map();
        const treeTextures = resources.treeSheet.spritesheet.textures;
        const clutterTextures = resources.clutterSheet.spritesheet.textures;
        const parallaxTextures = resources.parallaxSheet.spritesheet.textures;
        const birdSheet = resources.birdSheet.spritesheet;

        // trees.
        for (let i = 1; i <= 10; i += 1) {
            store.textureMap.set(`tree${i}`, treeTextures[`completeTree${i}.png`]);
        }

        // Rocks and other clutter.
        for (let i = 1; i <= 11; i += 1) {
            store.textureMap.set(`clutter${i}`, clutterTextures[`groundClutter${i}.png`]);
        }

        for (let i = 1; i <= 3; i += 1) {
            store.textureMap.set(`bush${i}`, clutterTextures[`bush${i}.png`]);
        }

        store.textureMap.set('sky', parallaxTextures['sky.png']);
        store.textureMap.set('farTrees', parallaxTextures['furthest_trees.png']);
        store.textureMap.set('nearTrees', parallaxTextures['nearest_trees.png']);
        store.textureMap.set('backgroundBushes', parallaxTextures['background_bushes.png']);
        store.textureMap.set('foregroundTile', parallaxTextures['foreground_tile.png']);

        store.textureMap.set('birdSpritesheet', birdSheet);
    }
    /* eslint-enable class-methods-use-this */

    onSettingsChanged() {
        this.activeLevel.updateSettings(this.settings);
    }

    onVolumeChanged() {
        store.BGMVolume = this.BGMVolume / 100;
        store.SFXVolume = this.SFXVolume / 100;
        this.activeLevel.setMusicVolume(this.BGMVolume / 100);
    }

    setupGui() {
        this.folder = store.gui.addFolder('Settings');
        this.folder.add(this.settings, 'flapForce', 0, 50).listen().onChange(v => this.onSettingsChanged());
        this.folder.add(this.settings, 'gravity', 0, 1.5).listen().onChange(v => this.onSettingsChanged());
        this.folder.add(this.settings, 'speed', 0, 30).listen().onChange(v => this.onSettingsChanged());

        this.folder.add(this, 'BGMVolume', 0, 100).listen().onChange(v => this.onVolumeChanged());
        this.folder.add(this, 'SFXVolume', 0, 100).listen().onChange(v => this.onVolumeChanged());

        this.folder.add(this, 'makeItFast');
        this.folder.open();
    }

    makeItFast() {
        this.settings.flapForce = 15;
        this.settings.gravity = 1.3;
        this.settings.speed = 30;

        this.onSettingsChanged();
    }

    updateScore() {
        this.score += 1;
        this.scoreText.text = this.score;
        this.scoreText.position.x = config.WORLD.width / 2 - this.scoreText.width / 2;
    }

    setupText() {
        this.bgText = new PIXI.Text('Flap to begin!', {
            fontFamily: 'Tahoma',
            fontSize: 72,
            fill: 0xFFFFFF,
            align: 'center',
            fontWeight: 'bold',
            strokeThickness: 3,
            dropShadow: true,
        });
        this.bgText.position.x = config.WORLD.width / 2 - this.bgText.width / 2;
        this.bgText.position.y = config.WORLD.height / 10;
        this.bgText.zIndex = 999;

        this.scoreText = new PIXI.Text('0', {
            fontFamily: 'Tahoma',
            fontSize: 100,
            fill: 0xFFFFFF,
            align: 'center',
            fontWeight: 'bold',
            strokeThickness: 4,
            dropShadow: true,
        });
        this.scoreText.zIndex = 999;
        this.scoreText.position.x = config.WORLD.width / 2 - this.scoreText.width / 2;
        this.scoreText.position.y = config.WORLD.height / 10;
        this.scoreText.visible = false;

        this.stage.addChild(this.bgText);
        this.stage.addChild(this.scoreText);
    }

    reset() {
        this.score = 0;
        if (this.scoreText) {
            this.scoreText.text = 0;
            this.scoreText.position.x = config.WORLD.width / 2 - this.scoreText.width / 2;
            this.scoreText.visible = false;
        }

        this.bgText.visible = true;
    }

    setup() {
        this.isLoaded = false;
        PIXI.Loader.shared.load((loader, resources) => {
            this.mapAudio(resources);
            this.mapTextures(resources);

            this.isLoaded = true;
            this.activeLevel = createEndlessForest(this.settings);
            this.activeLevel.setup();

            this.activeLevel.on(config.EVENTS.ENTITY.PASSED, () => {
                this.updateScore();
            });

            this.activeLevel.on(config.EVENTS.ENTITY.FIRSTFLAP, () => {
                this.bgText.visible = false;
                this.scoreText.visible = true;
            });

            this.activeLevel.on(config.EVENTS.ENTITY.DIE, () => {
                this.scoreText.visible = false;
                this.bgText.visible = true;
                this.reset();
            });

            this.stage.addChild(this.activeLevel.getContainer());
            this.stage.sortChildren();
        });

        this.setupGui();
        this.setupText();
        this.reset();
    }

    update(delta) {
        if (!this.isLoaded) return;

        this.activeLevel.update(delta);
    }

    destroy() {
        if (this.folder) {
            store.gui.removeFolder(this.folder);
        }

        if (this.bgText) {
            this.stage.removeChild(this.bgText);
            this.bgText.destroy();
        }

        if (this.scoreText) {
            this.stage.removeChild(this.scoreText);
            this.scoreText.destroy();
        }

        this.stage.removeChild(this.activeLevel.getContainer());
        this.activeLevel.destroy();
    }
}
