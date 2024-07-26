import { entryAnimationWall } from "./animations.js";
import { cellSize, gridSize } from "./constants.js";


// Example usage
// gridTracker[0][0] = true; // Fill a cell
// gridTracker[0][1] = true; // Fill a cell
// gridTracker[0][2] = true; // Fill a cell
// gridTracker[0][3] = true; // Fill a cell
// updateWallsForCell(0, 0); // Update walls for this cell
// updateWallsForCell(0, 1); // Update walls for this cell
// updateWallsForCell(0, 2); // Update walls for this cell
// updateWallsForCell(0, 3); // Update walls for this cell

let gridTracker;
let scene;
let meshes;
export function createGridTracker(scenePassed, meshesPassed) {
    scene = scenePassed;
    meshes = meshesPassed;
    gridTracker = new Array(gridSize).fill(null).map(() => new Array(gridSize).fill(false));
    return gridTracker;
}

// Function to update walls for a specific cell
function updateWallsForCell(x, z) {
    if (x < 0 || x > gridSize - 1 || z < 0 || z > gridSize - 1) { return; }
    const key = `cell_${x}_${z}`;
    let cell = scene.getMeshByName(key);
    if (!gridTracker[x][z]) {
        cell?.dispose();
        return;
    }
    if (!cell) {
        // cell = BABYLON.MeshBuilder.CreateBox(key, { width: cellSize, height: 1, depth: cellSize }, scene);
        // cell.position = new BABYLON.Vector3(x * cellSize + cellSize / 2, 10, z * cellSize + cellSize / 2);
        // cell.material = wallMaterial;
        // todo can safetly remove this, was old wall expiriment
        // const wallMaterial = new BABYLON.StandardMaterial("wallMat", scene);
        // wallMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.3, 0.3);
    }

    ['north', 'south', 'east', 'west'].forEach(direction => {
        const neighbor = getNeighbor(x, z, direction);
        const wallKey = `${key}_wall_${direction}`;
        let wall = scene.getMeshByName(wallKey);
        if (neighbor === false) {
            if (!wall) {
                wall = createWall(scene, x, z, direction, cellSize, key);
                entryAnimationWall(scene, wall);
            }
        } else {
            wall?.dispose();
        }
    });
}

export function removeAllWalls(x, z) {
    ['north', 'south', 'east', 'west'].forEach(direction => {
        const key = `cell_${x}_${z}`;
        const wallKey = `${key}_wall_${direction}`;
        let wall = scene.getMeshByName(wallKey);

        console.log(wallKey);
        console.log(wall);
        wall?.dispose();
    });
}

// Function to get the filled status of a neighboring cell
function getNeighbor(x, z, direction) {
    let nx = x, nz = z;
    switch (direction) {
        case 'north': nz -= 1; break;
        case 'south': nz += 1; break;
        case 'east': nx += 1; break;
        case 'west': nx -= 1; break;
    }
    if (nx < 0 || nx >= gridSize || nz < 0 || nz >= gridSize) return false; // Out of bounds is like an empty cell
    return gridTracker[nx][nz];
}

// Function to create a wall in a specific direction
function createWall(scene, x, z, direction, size, key) {
    const wall = meshes['wall'][0].clone(`${key}_wall_${direction}`);
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
    wall.scaling.x = 0;
    wall.scaling.y = 0;
    wall.scaling.z = 0;
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

export function updateCellAndSurronding(gridTrackerIndex) {
    updateWallsForCell(gridTrackerIndex.x, gridTrackerIndex.z);

    // also update walls for each cell around
    updateWallsForCell(gridTrackerIndex.x, gridTrackerIndex.z + 1);
    updateWallsForCell(gridTrackerIndex.x, gridTrackerIndex.z - 1);
    updateWallsForCell(gridTrackerIndex.x + 1, gridTrackerIndex.z + 1);
    updateWallsForCell(gridTrackerIndex.x + 1, gridTrackerIndex.z);
    updateWallsForCell(gridTrackerIndex.x + 1, gridTrackerIndex.z - 1);
    updateWallsForCell(gridTrackerIndex.x - 1, gridTrackerIndex.z + 1);
    updateWallsForCell(gridTrackerIndex.x - 1, gridTrackerIndex.z);
    updateWallsForCell(gridTrackerIndex.x - 1, gridTrackerIndex.z - 1);
}