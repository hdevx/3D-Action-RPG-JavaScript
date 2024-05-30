import { createNight } from './scenes/night.js';
import { createDayDynamicTerrain } from './scenes/day.js';
import { createOutdoor } from './scenes/outdoor.js';
import { createRoom } from './scenes/room.js';
import { createUnderground } from './scenes/underground.js';
import { createTown } from './scenes/town.js';
import { createRoomGI } from './scenes/roomGI.js';

class SceneManager {
  constructor(canvasId, engine) {
    this.canvas = document.getElementById(canvasId);
    // if (engine) this.engine = engine;
    // else this.engine = new BABYLON.Engine(this.canvas, true);
    this.engine = new BABYLON.Engine(this.canvas, true);
    this.guiTextures = new Map();
    this.scenes = [];
    this.activeScene = null;
  }

  async initializeWebGPU() {
    // console.log(this.canvas);
    // this.engine = new BABYLON.WebGPUEngine(this.canvas);
    // await this.engine.initAsync();
    console.log('WebGPU Engine initialized');
    return;
  }


  async loadScene(sceneCreationFunction) {
    const scene = await sceneCreationFunction(this.engine);
    scene.damagePopupAnimationGroup = new BABYLON.AnimationGroup("popupAnimation", scene);
    this.scenes.push(scene);
    this.guiTextures.set(scene, new BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene));
    this.activeGUI = this.guiTextures.get(this.activeScene);

    return scene;
  }

  async switchToScene(index) {
    if (this.activeScene) {
      this.engine.stopRenderLoop();
      if (DEBUG) this.activeScene.debugLayer.hide();
      // this.disposeActiveScene();
      //   this.activeScene.dispose(); // Optional: dispose only if not planning to return to this scene
    }
    this.activeScene = this.scenes[index];
    this.activeGUI = this.guiTextures.get(this.activeScene);
    this.engine.runRenderLoop(() => {
      this.activeScene.render();
    });

    if (DEBUG) this.activeScene.debugLayer.show();
  }

  // todo map of scenes near the current scene
  // in this case, just load starting zone
  async start() {
    if (WEBGPU) {
      await this.initializeWebGPU();
    }

    this.loadScene(createRoomGI).then(() => {
      this.switchToScene(0);
      // this.loadScene(createTown);
      // this.loadScene(createOutdoor);
      // this.loadScene(createRoom);
      // this.loadScene(createOutdoor);
      // this.loadScene(createNight);
      // this.loadScene(createDayDynamicTerrain);
      // this.loadScene(createUnderground);
    });


    // Setup scene switching logic, e.g., based on user input or game events
    window.addEventListener('keydown', (e) => {
      if (e.key === 'i') {
        this.switchToScene(0);
      } else if (e.key === 'o') {
        this.switchToScene(1);
      } else if (e.key === 'p') {
        this.switchToScene(2);
      }
    });

    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

}

export default SceneManager;
