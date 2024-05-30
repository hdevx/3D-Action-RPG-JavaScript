export function placeOnTerrain(scene, object, x, z, yOffset = 0) {
    const maxHeight = 4000;

    const rayStart = new BABYLON.Vector3(x, maxHeight, z);
    const rayEnd = new BABYLON.Vector3(x, -maxHeight, z);

    const ray = new BABYLON.Ray(rayStart, rayEnd.subtract(rayStart).normalize(), maxHeight * 2);
    // if (DEBUG) drawDebugRay(scene, ray, new BABYLON.Color3(1, 0, 0), 20000); // Ray in red, visible for 2000 ms

    const hit = scene.pickWithRay(ray, (mesh) => mesh.name === "terrain");
    if (hit.hit) {
        object.position.x = -hit.pickedPoint.x;
        object.position.y = hit.pickedPoint.y;
        object.position.z = -hit.pickedPoint.z;
        object.position.y += yOffset; // Adjust vertical offset as needed
    }
}

function drawDebugRay(scene, ray, color, duration) {
    let rayHelper = new BABYLON.RayHelper(ray);

    // Define the ray's visual characteristics
    let rayColor = color || new BABYLON.Color3(1, 0, 0); // Default to red if no color is specified
    rayHelper.show(scene, rayColor);

    // Optionally, set a duration for how long the ray should be visible
    if (duration) {
        setTimeout(() => {
            rayHelper.hide();
        }, duration);
    }
}