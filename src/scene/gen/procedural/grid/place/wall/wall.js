import { cellSize, gridSize } from "../../constants.js";

// Function to create a wall in a specific direction
export function createWallOnly(x, z, direction, size, key, meshes) {
    const wall = meshes['wall'][0].createInstance(`${key}_wall_${direction}`);
    wall.isPickable = false;
    wall.alwaysSelectAsActiveMesh = true;
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
    wall.alwaysSelectAsActiveMesh = true;

    wall.parent = null;

    //create base
    let base = meshes['base'][0].createInstance("base_clone");
    base.isPickable = false;
    base.alwaysSelectAsActiveMesh = true;
    base.parent = wall;
    base.position = new BABYLON.Vector3(0, 0, 0);
    base.rotation = new BABYLON.Vector3(0, 0, 0);
    base.scaling = new BABYLON.Vector3(1, 1, 1);

    // second story
    let secondStory = meshes['wall'][1].createInstance("base_clone");
    secondStory.isPickable = false;
    secondStory.alwaysSelectAsActiveMesh = true;
    secondStory.parent = wall;
    secondStory.position = new BABYLON.Vector3(0, 0, 2);
    secondStory.rotation = new BABYLON.Vector3(0, 0, 0);
    secondStory.scaling = new BABYLON.Vector3(1, 1, 1);

    //roof
    let roof = createRoof(cornerInfo);
    roof.isPickable = false;
    roof.alwaysSelectAsActiveMesh = true;
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
    let roof = createNonFlatWall(MESH_LIBRARY['roof'], cornerInfo); //MESH_LIBRARY.buildings['debug']['roof']

    return roof;
    // add window
}

function createNonFlatWall(meshes, cornerInfo) {
    let roof = null;
    // let roof = meshes['Roof_Left_Flat_Right_Flat'][0].createInstance("roof_instance");
    // add roof wall
    //                     'Roof_Outset_Both': [fm('Roof_Outset_Both')],
    //                         'Roof_Outset_Left': [fm('Roof_Outset_Left')],
    //                             'Roof_Outset_Right': [fm('Roof_Outset_Right')]
    // }
    if (cornerInfo.left.type === "flat" && cornerInfo.right.type === "flat") {
        roof = meshes['Roof_Left_Flat_Right_Flat'][0].createInstance("roof_instance");
    } if (cornerInfo.left.type === "flat" && cornerInfo.right.type === "inset") {
        roof = meshes['Roof_Left_Inset_Right_Flat'][0].createInstance("roof_instance");
    } if (cornerInfo.left.type === "flat" && cornerInfo.right.type === "outset") {
        roof = meshes['Roof_Left_Outset_Right_Flat'][0].createInstance("roof_instance");
    }

    if (cornerInfo.left.type === "inset" && cornerInfo.right.type === "flat") {
        roof = meshes['Roof_Left_Flat_Right_Inset'][0].createInstance("roof_instance");
    } if (cornerInfo.left.type === "inset" && cornerInfo.right.type === "inset") {
        roof = meshes['Roof_Left_Inset_Right_Inset'][0].createInstance("roof_instance");
    } if (cornerInfo.left.type === "inset" && cornerInfo.right.type === "outset") {
        roof = meshes['Roof_Left_Outset_Right_Inset'][0].createInstance("roof_instance");
    }

    if (cornerInfo.left.type === "outset" && cornerInfo.right.type === "flat") {
        roof = meshes['Roof_Left_Flat_Right_Outset'][0].createInstance("roof_instance");
    } if (cornerInfo.left.type === "outset" && cornerInfo.right.type === "inset") {
        roof = meshes['Roof_Left_Inset_Right_Outset'][0].createInstance("roof_instance");
    } if (cornerInfo.left.type === "outset" && cornerInfo.right.type === "outset") {
        roof = meshes['Roof_Left_Outset_Right_Outset'][0].createInstance("roof_instance");
    }

    // console.log(cornerInfo);
    if (cornerInfo.debug) { roof.showBoundingBox = true; }


    return roof;

}