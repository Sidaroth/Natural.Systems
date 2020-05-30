import store from '../store';

const playSFX = (key, volume = store.SFXVolume) => {
    if (!store.SFXMap) return;

    const SFX = store.SFXMap.get(key);
    if (SFX) {
        SFX.volume = volume;
        SFX.play();
    }
};

export default playSFX;
