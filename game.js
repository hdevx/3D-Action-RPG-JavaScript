import SceneManager from '/src/scene/SceneManager.js';

import { setSceneManager } from './src/character/damagePopup.js';

    window.addEventListener('DOMContentLoaded', async function () {
        // const { scene, engine } = await createScene();

        // engine.runRenderLoop(() => {
        //     scene.render();
        // });

        const sceneManager = new SceneManager('renderCanvas');
        sceneManager.start();

        setSceneManager(sceneManager);

        // window.addEventListener('resize', () => {
        //     engine.resize();
        // });

        
    });


    

    import { loadHeroModel } from './src/character/hero.js';

    // async function createScene() {
    //     let anim = setupAnim(scene, hero);

    //     setupGamepadManagement(scene, character);
    //     setupInputHandling(scene, character, camera, hero, anim, engine);


    //     let desiredRadius = 50; // Desired distance from the target
    //     function handleScroll(event) {
    //         if (event.deltaY < 0) {
    //             desiredRadius -= 12;
    //         } else if (event.deltaY > 0) {
    //             desiredRadius += 12;
    //         }
    //         event.preventDefault();
        
    //         // Log or use the updated desiredRadius value
    //         console.log('Updated Desired Radius:', desiredRadius);
    //     }
    //     window.addEventListener('wheel', handleScroll);
        
    // scene.onBeforeRenderObservable.add(() => {
    //     if (character.position) {
            
    //         const offsetPosition = character.position.add(new BABYLON.Vector3(0, 10, 0)); 
            
    //         // Update camera target smoothly towards the character position
    //         // camera.setTarget(BABYLON.Vector3.Lerp(camera.getTarget(), offsetPosition, 0.5));
    //         camera.setTarget(BABYLON.Vector3.Lerp(camera.getTarget(), offsetPosition, 0.1));
    //         camera.radius = BABYLON.Scalar.Lerp(camera.radius, desiredRadius, 0.05); // Smoothly interpolate to the desired radius
    //         // You can also adjust camera radius dynamically if needed

    //         // camera.beta = 3 * Math.PI / 8;
    //     } 
    // });


    // var cameraRotationSpeed = 2.25;  // Adjust this value for faster or slower rotation
    // var keyStates = {};

    // // Function to handle keydown event
    // function onKeyDown(event) {
    //     keyStates[event.key] = true;
    // }

    // // Function to handle keyup event
    // function onKeyUp(event) {
    //     keyStates[event.key] = false;
    // }

    // // Add event listeners to the window
    // window.addEventListener('keydown', onKeyDown);
    // window.addEventListener('keyup', onKeyUp);
    // scene.onBeforeRenderObservable.add(() => {
    //     if (keyStates['a']) {
    //         (camera.alpha);
    //         camera.alpha += cameraRotationSpeed * engine.getDeltaTime() / 1000;
    //     }

    //     // Check if 'D' is pressed for rotating right
    //     if (keyStates['d']) {
    //         camera.alpha -= cameraRotationSpeed * engine.getDeltaTime() / 1000;
    //     }
    // });


    //     return { scene, engine };
    // }








    // function setupGamepadManagement(scene, character) {
    //     const gamepadManager = new BABYLON.GamepadManager();
    //     gamepadManager.onGamepadConnectedObservable.add((gamepad, state) => {
    //         console.log('Gamepad connected:', gamepad.index);
    //         handleGamepadInput(gamepad, character);
    //     });
    // }


   
