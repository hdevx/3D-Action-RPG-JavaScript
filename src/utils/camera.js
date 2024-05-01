export function setupCamera(scene, target) {
    const camera = new BABYLON.ArcRotateCamera("arcCam", 3 * Math.PI / 2, 3 * Math.PI / 8, 200, target.position, scene);
    camera.attachControl(document.getElementById('renderCanvas'), false);

    scene.collisionsEnabled = true;
    camera.checkCollisions = true;

    camera.allowUpsideDown = false;
    camera.panningSensibility = 0;
    
    camera.radius = 70;
    return camera;
}