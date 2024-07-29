export function createFloor(scene, x, z, cellSize, meshes, removeFunction) {

    let FLOOR_DEBUG = false;

    // let floor = meshes['floor'].clone("floor_clone");
    let floor = meshes['floor'].createInstance("floor_instance");

    floor.remove = removeFunction;

    floor.parent = null;
    if (FLOOR_DEBUG) {
        floor = BABYLON.MeshBuilder.CreateBox(`floor_${x}_${z}`, { size: cellSize }, scene);
        floor.scaling.y = 0.1;
        const floorDebugMaterial = new BABYLON.StandardMaterial("floorMat", scene);
        // floorMaterial.wireframe = true;
        floorDebugMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 1);
        floor.material = floorDebugMaterial;
    }
    floor.scaling.x = 0;
    floor.scaling.y = 0;
    floor.scaling.z = 0;

    floor.actionManager = new BABYLON.ActionManager(scene);

    // Register actions specifically for this floor piece
    floor.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, (evt) => {
        if (evt.sourceEvent.button === 0) { // Left click
            // Spawn chair or other objects here
        } else if (evt.sourceEvent.button === 2) { // Right click
            // Smoothly scale down and remove the floor piece
            floor.remove();

        }
    }));



    return floor;
}

