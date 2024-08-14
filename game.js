import SceneManager from './src/scene/SceneManager.js';

import { setSceneManager } from './src/character/damagePopup.js';

window.addEventListener('DOMContentLoaded', async function () {
    SCENE_MANAGER = new SceneManager('renderCanvas');
    await SCENE_MANAGER.start();

    setSceneManager(SCENE_MANAGER);
});