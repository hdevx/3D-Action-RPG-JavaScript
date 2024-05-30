export function setupCamera(scene, target, engine) {
    const camera = new BABYLON.ArcRotateCamera("arcCam", 3 * Math.PI / 2, 3 * Math.PI / 8, 200, target.position, scene);
    camera.attachControl(document.getElementById('renderCanvas'), false);

    scene.collisionsEnabled = true;
    camera.checkCollisions = true;

    camera.allowUpsideDown = false;
    camera.panningSensibility = 0;

    camera.radius = 70;

    // More Professional Limited Camera, avoids collision
    camera.wheelDeltaPercentage = 0.0200;
    // camera.upperBetaLimit = Math.PI / 2; // Stops at the horizon (90 degrees)
    camera.upperBetaLimit = 3.13;
    camera.lowerRadiusLimit = 4;  // Minimum distance to target (closest zoom)
    camera.upperRadiusLimit = 656.8044;
    camera.upperBetaLimit = Math.PI / 2; // Stops at the horizon (90 degrees)
    camera.alpha = 4.954;
    camera.beta = 1.3437;

    setupTurnCamera(scene, camera, engine);
    return camera;
}


function setupTurnCamera(scene, camera, engine) {
    var cameraRotationSpeed = 2.25;  // Adjust this value for faster or slower rotation
    var keyStates = {};

    // Function to handle keydown event
    function onKeyDown(event) {
        keyStates[event.key] = true;
    }

    // Function to handle keyup event
    function onKeyUp(event) {
        keyStates[event.key] = false;
    }

    // Add event listeners to the window
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    scene.onBeforeRenderObservable.add(() => {
        if (keyStates['a']) {
            (camera.alpha);
            camera.alpha += cameraRotationSpeed * engine.getDeltaTime() / 1000;
        }

        // Check if 'D' is pressed for rotating right
        if (keyStates['d']) {
            camera.alpha -= cameraRotationSpeed * engine.getDeltaTime() / 1000;
        }
    });
}


// Function to update camera beta limit based on terrain height
// function updateCameraBetaLimit() {
//     var ray = new Babylon.Ray(camera.target, new Babylon.Vector3(0, -1, 0));
//     var pickInfo = scene.pickWithRay(ray, function(mesh) { return mesh === ground; });
//     if (pickInfo.hit) {
//         var terrainHeight = pickInfo.pickedPoint.y;
//         var heightAboveTerrain = camera.position.y - terrainHeight;
//         var minBeta = Math.atan2(heightAboveTerrain, camera.radius);
//         camera.lowerBetaLimit = minBeta;
//     }
// }
// updateCameraBetaLimit();