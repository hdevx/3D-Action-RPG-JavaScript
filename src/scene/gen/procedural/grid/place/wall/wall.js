import { cellSize, gridSize } from "../../constants.js";

// Function to create a wall in a specific direction
export function createWallOnly(x, z, direction, size, key, meshes) {
    const wall = meshes['wall'][0].createInstance(`${key}_wall_${direction}`);
    wall.isPickable = false;
    wall.parent = null;
    // const wall = BABYLON.MeshBuilder.CreateBox(`${key}_wall_${direction}`, { width: size, height: 20, depth: 1 }, scene);
    // positions for using mesh builder
    // case 'north':
    //     wall.position = new BABYLON.Vector3(x * size + size / 2 - totalGridOffset, 20, z * size - totalGridOffset);
    //     wall.rotation = new BABYLON.Vector3(0, 0, 0);
    //     break;
    // case 'south':
    //     wall.position = new BABYLON.Vector3(x * size + size / 2 - totalGridOffset, 20, z * size + size - totalGridOffset);
    //     wall.rotation = new BABYLON.Vector3(0, Math.PI, 0);
    //     break;
    // case 'east':
    //     wall.position = new BABYLON.Vector3(x * size + size - totalGridOffset, 20, z * size + size / 2 - totalGridOffset);
    //     wall.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);
    //     break;
    // case 'west':
    //     wall.position = new BABYLON.Vector3(x * size - totalGridOffset, 20, z * size + size / 2 - totalGridOffset);
    //     wall.rotation = new BABYLON.Vector3(0, -Math.PI / 2, 0);
    //     break;

    wall.scaling = new BABYLON.Vector3(0, 0, 0);
    let totalGridOffset = gridSize * cellSize / 2;
    switch (direction) {
        case 'north':
            wall.position = new BABYLON.Vector3(x * size + size / 2 - totalGridOffset + 10, 20, z * size - totalGridOffset - cellSize / 2);
            wall.rotation = new BABYLON.Vector3(-Math.PI / 2, 0, 0);
            break;
        case 'south':
            wall.position = new BABYLON.Vector3(x * size + size / 2 - totalGridOffset - 10, 20, z * size + size - totalGridOffset + cellSize / 2);
            wall.rotation = new BABYLON.Vector3(-Math.PI / 2, Math.PI, 0);
            break;
        case 'east':
            wall.position = new BABYLON.Vector3(x * size + size - totalGridOffset - cellSize / 2, 20, z * size + size / 2 - totalGridOffset - 10);
            wall.rotation = new BABYLON.Vector3(-Math.PI / 2, Math.PI / 2, 0);
            break;
        case 'west':
            wall.position = new BABYLON.Vector3(x * size - totalGridOffset + cellSize / 2, 20, z * size + size / 2 - totalGridOffset + 10);
            wall.rotation = new BABYLON.Vector3(-Math.PI / 2, -Math.PI / 2, 0);
            break;
    }


    return wall;
}


// Function to create a wall in a specific direction
// todo don't pass meshes each time
export function createWall2Story(x, z, direction, size, key, cornerInfo) {

    let meshes = MESH_LIBRARY;

    // create wall mesh
    let wall;
    // random door
    const randomValue = Math.random();

    // Determine if we should use a different wall mesh (10% chance)
    const useDifferentMesh = randomValue < 0.1;
    // Select Door
    if (useDifferentMesh) {
        wall = meshes['door'][0].createInstance(`${key}_wall_${direction}`);
    } else {
        // Use the default wall mesh
        wall = meshes['wall'][0].createInstance(`${key}_wall_${direction}`);
    }
    wall.isPickable = false;
    wall.parent = null;

    //create base
    let base = meshes['base'][0].createInstance("base_clone");
    base.isPickable = false;
    base.parent = wall;
    base.position = new BABYLON.Vector3(0, 0, 0);
    base.rotation = new BABYLON.Vector3(0, 0, 0);
    base.scaling = new BABYLON.Vector3(1, 1, 1);

    // second story
    let secondStory = meshes['wall'][1].createInstance("base_clone");
    secondStory.isPickable = false;
    secondStory.parent = wall;
    secondStory.position = new BABYLON.Vector3(0, 0, 2);
    secondStory.rotation = new BABYLON.Vector3(0, 0, 0);
    secondStory.scaling = new BABYLON.Vector3(1, 1, 1);

    //roof
    let roof = createRoof(cornerInfo);
    roof.parent = wall;
    roof.position = new BABYLON.Vector3(0, 0, 4);
    roof.rotation = new BABYLON.Vector3(0, 0, 0);
    roof.scaling = new BABYLON.Vector3(1, 1, 1);
    switch (direction) {
        case 'north':
            roof.position = new BABYLON.Vector3(-1, -12, 4);
            roof.rotation = new BABYLON.Vector3(0, 0, Math.PI);
            roof.scaling = new BABYLON.Vector3(1, 1, 1);
            break;
        case 'south':
            roof.position = new BABYLON.Vector3(-1, -12, 4);
            roof.rotation = new BABYLON.Vector3(0, 0, Math.PI);
            roof.scaling = new BABYLON.Vector3(1, 1, 1);
    }

    wall.scaling = new BABYLON.Vector3(0, 0, 0);
    let totalGridOffset = gridSize * cellSize / 2;
    switch (direction) {
        case 'north':
            wall.position = new BABYLON.Vector3(x * size + size / 2 - totalGridOffset + 10, 20, z * size - totalGridOffset - cellSize / 2);
            wall.rotation = new BABYLON.Vector3(-Math.PI / 2, 0, 0);
            break;
        case 'south':
            wall.position = new BABYLON.Vector3(x * size + size / 2 - totalGridOffset - 10, 20, z * size + size - totalGridOffset + cellSize / 2);
            wall.rotation = new BABYLON.Vector3(-Math.PI / 2, Math.PI, 0);
            break;
        case 'east':
            wall.position = new BABYLON.Vector3(x * size + size - totalGridOffset - cellSize / 2, 20, z * size + size / 2 - totalGridOffset - 10);
            wall.rotation = new BABYLON.Vector3(-Math.PI / 2, Math.PI / 2, 0);
            break;
        case 'west':
            wall.position = new BABYLON.Vector3(x * size - totalGridOffset + cellSize / 2, 20, z * size + size / 2 - totalGridOffset + 10);
            wall.rotation = new BABYLON.Vector3(-Math.PI / 2, -Math.PI / 2, 0);
            break;
    }


    return wall;
}

function createRoof(cornerInfo) {
    let meshes = MESH_LIBRARY;
    let roof;

    // add roof wall
    //                     'Roof_Outset_Both': [fm('Roof_Outset_Both')],
    //                         'Roof_Outset_Left': [fm('Roof_Outset_Left')],
    //                             'Roof_Outset_Right': [fm('Roof_Outset_Right')]
    // }
    if (cornerInfo.left.type == "outset" || cornerInfo.right.isCorner == "outset") {
        if (cornerInfo.left.type == "outset") {
            roof = meshes['roof']['Roof_Outset_Right'][0].createInstance("roof_instance");
            // if (cornerInfo.debug) { roof.showBoundingBox = true; }

        }
        if (cornerInfo.right.type == "outset") {
            roof = meshes['roof']['Roof_Outset_Left'][0].createInstance("roof_instance");
        }


    } else {
        if (cornerInfo.left.isCorner && cornerInfo.right.isCorner) {
            roof = meshes['roof']['Roof_Inset_Both'][0].createInstance("roof_instance");
        } if (cornerInfo.left.isCorner && !cornerInfo.right.isCorner) {
            roof = meshes['roof']['Roof_Inset_Left'][0].createInstance("roof_instance");
        } if (!cornerInfo.left.isCorner && cornerInfo.right.isCorner) {
            roof = meshes['roof']['Roof_Inset_Right'][0].createInstance("roof_instance");
        } if (!cornerInfo.left.isCorner && !cornerInfo.right.isCorner) {
            roof = meshes['roof']['Roof_Wall'][0].createInstance("roof_instance");
        }
    }

    return roof;


    // add window
}