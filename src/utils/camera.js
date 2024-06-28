export function setupCamera(scene, target, engine) {
    const camera = new BABYLON.ArcRotateCamera("arcCam", 3 * Math.PI / 2, 3 * Math.PI / 8, 200, target.position, scene);
    camera.attachControl(document.getElementById('renderCanvas'), false);

    scene.collisionsEnabled = true;
    // camera.checkCollisions = true;
    camera.collisionRadius = new BABYLON.Vector3(0.5, 0.5, 0.5);

    camera.allowUpsideDown = false;
    camera.panningSensibility = 0;

    camera.radius = 70;

    // More Professional Limited Camera, avoids collision
    camera.wheelDeltaPercentage = 0.0200;
    camera.upperBetaLimit = 3.13;
    camera.lowerRadiusLimit = 4;  // Minimum distance to target (closest zoom)
    camera.upperRadiusLimit = 656.8044;
    camera.upperBetaLimit = Math.PI / 2; // Stops at the horizon (90 degrees)
    camera.alpha = 4.954;
    camera.beta = 1.3437;

    // if camera
    // setupCameraCollision(scene, camera, target);
    setupCameraCollisionZoomInOnly(scene, camera, target);

    setupTurnCamera(scene, camera, engine);
    return camera;
}

function setupCameraCollision(scene, camera, player) {
    camera.upperBetaLimit = Math.PI // Full rotate

    let cameraSnap = 0.01;
    let targetRadius = 80;
    let targetPosition = camera.position.clone();
    let transitionSpeed = 0.1;

    let ray = new BABYLON.Ray(camera.position, player.position.subtract(camera.position), 800);
    // let rayHelper = new BABYLON.RayHelper(ray);
    // rayHelper.show(scene);

    let frameCounter = 0;
    const updateInterval = 10; // Update every 3 frames
    scene.registerBeforeRender(() => {

        const offset = 0.00; // Adjust this value as needed
        ray.direction = player.position.subtract(camera.position).normalize();
        ray.origin = camera.position.add(ray.direction.scale(offset));

        // Perform ray cast
        let pickInfo = scene.pickWithRay(ray, (mesh) => mesh !== player);



        let hitObjectName = pickInfo.pickedMesh ? pickInfo.pickedMesh.name : "Unknown";
        // console.log("Hit object name:", hitObjectName);
        // console.log("pickInfo.pickedMesh.cameraCollide", pickInfo.pickedMesh?.cameraCollide);

        let distanceBetweenCameraAndProjected = BABYLON.Vector3.Distance(camera.position, BABYLON.Vector3.Lerp(camera.position, targetPosition, 0.2));

        if (pickInfo.pickedMesh?.cameraCollide ?? true) {


            let distanceToObject = pickInfo.distance;
            let distanceToPlayer = BABYLON.Vector3.Distance(camera.position, player.position);

            // Adjust these values as needed
            let minDistanceFromWall = 0; // Minimum distance to keep from the wall
            let minDistanceFromPlayer = 0; // Minimum distance to keep from the player
            let forwardBias = 0.0; // Small forward bias

            // Calculate target distance
            let targetDistance = Math.min(
                distanceToObject - minDistanceFromWall,
                distanceToPlayer - minDistanceFromPlayer
            );

            // Ensure we don't go backwards
            // targetDistance = Math.max(targetDistance, 0);

            // Calculate new target position
            targetPosition = camera.position.add(ray.direction.scale(targetDistance));

            // console.log(distanceToPlayer);
            // console.log(distanceToPlayer);
            // camera.position = targetPosition;
            let distanceBetweenCameraAndProjected = BABYLON.Vector3.Distance(camera.position, BABYLON.Vector3.Lerp(camera.position, targetPosition, 0.2));

            // if (distanceBetweenCameraAndProjected > 0.10) {
            camera.position = BABYLON.Vector3.Lerp(camera.position, targetPosition, 0.91);
            // camera.position = targetPosition;
            // } else {
            // console.log("not moving");
            // }



        } else {
            // if the camera has room to move inward, don't apply moving out force
            if (distanceBetweenCameraAndProjected > cameraSnap) {

                // If no collision, set target to a position behind the player
                let defaultDistance = 70;
                let judgedDistance = targetRadius;


                let distanceToPlayer = BABYLON.Vector3.Distance(camera.position, player.position);
                // if there would still be a collision, set distance to player, otherwise set target radius
                if (distanceToPlayer < targetRadius)
                    judgedDistance = distanceToPlayer;
                // defaultDistance = camera.radius;
                // targetPosition = player.position.subtract(ray.direction.scale(defaultDistance));

                // console.log(pickInfo.pickedMesh?.cameraCollide);
                targetPosition = player.position.subtract(ray.direction.scale(targetRadius));
                // targetPosition = player.position.subtract(ray.direction.scale(judgedDistance));

                camera.position = BABYLON.Vector3.Lerp(camera.position, targetPosition, 0.02);
                // camera.position = targetPosition;
            }
        }

        // Smoothly move camera
        // camera.position = BABYLON.Vector3.Lerp(camera.position, targetPosition, transitionSpeed);


        // camera.radius = BABYLON.Vector3.Lerp(camera.radius, targetRadius, transitionSpeed);
    });

    // scene.onPointerObservable.add((pointerInfo) => {
    //     if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERWHEEL) {
    //         // Adjust zoom speed as needed
    //         let zoomSpeed = 1;
    //         targetRadius += pointerInfo.event.wheelDelta * zoomSpeed;

    //         // Set min and max zoom limits
    //         targetRadius = Math.max(5, Math.min(targetRadius, 100));
    //     }
    // });
}

function setupCameraCollisionZoomInOnly(scene, camera, player) {
    camera.upperBetaLimit = Math.PI // Full rotate

    let cameraSnap = 0.01;
    let targetRadius = 80;
    let targetPosition = camera.position.clone();
    let transitionSpeed = 0.1;

    let ray = new BABYLON.Ray(camera.position, player.position.subtract(camera.position), 800);
    // let rayHelper = new BABYLON.RayHelper(ray);
    // rayHelper.show(scene);

    let frameCounter = 0;
    const updateInterval = 10; // Update every 3 frames
    scene.registerBeforeRender(() => {
        const offset = 0.00; // Adjust this value as needed
        ray.direction = player.position.subtract(camera.position).normalize();
        ray.origin = camera.position.add(ray.direction.scale(offset));

        // Perform ray cast
        let pickInfo = scene.pickWithRay(ray, (mesh) => mesh !== player);

        // console.log("Hit object name:", hitObjectName);
        // console.log("pickInfo.pickedMesh.cameraCollide", pickInfo.pickedMesh?.cameraCollide);


        if (pickInfo.pickedMesh?.cameraCollide ?? true) {
            let distanceToObject = pickInfo.distance;
            let distanceToPlayer = BABYLON.Vector3.Distance(camera.position, player.position);

            // Adjust these values as needed
            let minDistanceFromWall = 0; // Minimum distance to keep from the wall
            let minDistanceFromPlayer = 0; // Minimum distance to keep from the player
            let forwardBias = 0.0; // Small forward bias

            // Calculate target distance
            let targetDistance = Math.min(
                distanceToObject - minDistanceFromWall,
                distanceToPlayer - minDistanceFromPlayer
            );

            // Ensure we don't go backwards
            // targetDistance = Math.max(targetDistance, 0);

            // Calculate new target position
            targetPosition = camera.position.add(ray.direction.scale(targetDistance));

            // console.log(distanceToPlayer);
            // console.log(distanceToPlayer);
            // camera.position = targetPosition;
            let distanceBetweenCameraAndProjected = BABYLON.Vector3.Distance(camera.position, BABYLON.Vector3.Lerp(camera.position, targetPosition, 0.2));

            // if (distanceBetweenCameraAndProjected > 0.10) {
            camera.position = BABYLON.Vector3.Lerp(camera.position, targetPosition, 0.91);
            // camera.position = targetPosition;
            // } else {
            // console.log("not moving");
            // }
        }
    });

    // scene.onPointerObservable.add((pointerInfo) => {
    //     if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERWHEEL) {
    //         // Adjust zoom speed as needed
    //         let zoomSpeed = 1;
    //         targetRadius += pointerInfo.event.wheelDelta * zoomSpeed;

    //         // Set min and max zoom limits
    //         targetRadius = Math.max(5, Math.min(targetRadius, 100));
    //     }
    // });
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