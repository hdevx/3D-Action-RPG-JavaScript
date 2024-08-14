import { createNight } from './scenes/night.js';
import { createDayDynamicTerrain } from './scenes/day.js';
import { createOutdoor } from './scenes/outdoor.js';
import { createRoom } from './scenes/room.js';
import { createUnderground } from './scenes/underground.js';
import { createTown } from './scenes/town.js';
import { createRoomGI } from './scenes/roomGI.js';
import { createInn } from './scenes/inn.js';
import { createBuilder } from './scenes/builder.js';

class SceneManager {
  constructor(canvasId, engine) {
    this.canvas = document.getElementById(canvasId);
    this.engine = new BABYLON.Engine(this.canvas, true);
    this.guiTextures = new Map();
    this.scenes = [];
    this.activeScene = null;
    this.sceneCreators = {
      night: createNight,
      day: createDayDynamicTerrain,
      outdoor: createOutdoor,
      room: createRoom,
      underground: createUnderground,
      town: createTown,
      roomGI: createRoomGI,
      inn: createInn,
      builder: createBuilder
    };
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

    let timeout = 100;
    if (!FAST_RELOAD) timeout = 1000;
    setTimeout(() => {
      this.canvas.classList.add('visible');
    }, timeout);

    const urlParams = new URLSearchParams(window.location.search);

    const debugParam = urlParams.get('debug');
    if (debugParam === 'true') { DEBUG = true; }

    const sceneParam = urlParams.get('scene');
    const defaultScene = this.sceneCreators[sceneParam] || this.sceneCreators.outdoor; // Default to outdoor if no valid scene parameter

    await this.loadScene(defaultScene);
    await this.switchToScene(0);
    this.canvas.focus();

    // Uncomment this for key based scene switching. 
    // await this.loadScene(this.sceneCreators['inn']);
    // await this.loadScene(this.sceneCreators['builder']);
    // Setup scene switching logic, e.g., based on user input or game events
    // window.addEventListener('keydown', (e) => {
    //   if (e.key === 'i') {
    //     this.switchToScene(0);
    //   } else if (e.key === 'o') {
    //     this.switchToScene(1);
    //   } else if (e.key === 'p') {
    //     this.switchToScene(2);
    //   }
    // });

    window.addEventListener('resize', () => {
      this.engine.resize();
    });

    const endTime = performance.now();
    const domLoadTime = endTime - startTime;
    console.log(`Scene loaded in ${domLoadTime.toFixed(2)} milliseconds`);

  }
}

export default SceneManager;
