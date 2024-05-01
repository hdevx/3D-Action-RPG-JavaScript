import { createOutdoor } from './scenes/outdoor.js';
import { createRoom } from './scenes/room.js';
import { createUnderground } from './scenes/underground.js';

class SceneManager {
  constructor(canvasId) {
    const canvas = document.getElementById(canvasId);
    this.engine = new BABYLON.Engine(canvas, true);
    this.guiTextures = new Map();
    this.scenes = [];
    this.activeScene = null;
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
    // console.log(this.activeScene);
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

  

//   todo map of scenes near
// in this case, just load starting zone

  start() {
    this.loadScene(createOutdoor).then(() => {
      this.switchToScene(0);
      this.activeScene.debugLayer.show();
      // this.loadScene(createRoom);
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
  }
}

export default SceneManager;
