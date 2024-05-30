import SceneManager from './src/scene/SceneManager.js';

import { setSceneManager } from './src/character/damagePopup.js';

window.addEventListener('DOMContentLoaded', async function () {
    console.log("DOM Loaded");

    // const canvas = document.getElementById('renderCanvas');
    // let engine = new BABYLON.WebGPUEngine(canvas);
    // await engine.initAsync();
    // SCENE_MANAGER = new SceneManager('renderCanvas', engine);

    SCENE_MANAGER = new SceneManager('renderCanvas');
    await SCENE_MANAGER.start();

    setSceneManager(SCENE_MANAGER);
});

// function setupGamepadManagement(scene, character) {
//     const gamepadManager = new BABYLON.GamepadManager();
//     gamepadManager.onGamepadConnectedObservable.add((gamepad, state) => {
//         console.log('Gamepad connected:', gamepad.index);
//         handleGamepadInput(gamepad, character);
//     });
// }



