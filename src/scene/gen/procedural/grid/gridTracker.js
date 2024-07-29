import { entryAnimationWall } from "./animations.js";
import { cellSize, gridSize } from "./constants.js";
import { createWall2Story } from "./place/wall/wall.js";


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
            // if (building.hasRoof) {}
            // if (!wall) {
            //     const cornerInfo = detectCorner(x, z, direction);
            //     wall = createWall2Story(x, z, direction, cellSize, key, cornerInfo);
            //     entryAnimationWall(scene, wall);
            // }

            // need for surronding roofs refresh, use above instead if no roof
            // console.log("building new wall" + key);
            wall?.dispose();
            const cornerInfo = detectCorner(x, z, direction);
            wall = createWall2Story(x, z, direction, cellSize, key, cornerInfo);
            entryAnimationWall(scene, wall);

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
// function getNeighbor(x, z, direction) {
//     let nx = x, nz = z;
//     switch (direction) {
//         case 'north': nz -= 1; break;
//         case 'south': nz += 1; break;
//         case 'east': nx += 1; break;
//         case 'west': nx -= 1; break;
//     }
//     if (nx < 0 || nx >= gridSize || nz < 0 || nz >= gridSize) return false; // Out of bounds is like an empty cell
//     return gridTracker[nx][nz];
// }


function getNeighbor(x, z, direction) {
    let nx = x, nz = z;
    if (typeof x === 'object') {
        nx = x.x;
        nz = x.z;
    }
    switch (direction) {
        case 'north': nz -= 1; break;
        case 'south': nz += 1; break;
        case 'east': nx += 1; break;
        case 'west': nx -= 1; break;
    }
    if (nx < 0 || nx >= gridSize || nz < 0 || nz >= gridSize) return false;
    return gridTracker[nx][nz];
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

// export function updateCellAndSurronding(gridTrackerIndex) {
//     for (let x = -2; x <= 2; x++) {
//         for (let z = -2; z <= 2; z++) {
//             updateWallsForCell(gridTrackerIndex.x + x, gridTrackerIndex.z + z);
//         }
//     }
// }



// function detectCorner(x, z, direction) {
//     const left = getLeftDirection(direction);
//     const right = getRightDirection(direction);

//     const frontLeft = getNeighbor(x, z, direction) && getNeighbor(x, z, left);
//     const frontRight = getNeighbor(x, z, direction) && getNeighbor(x, z, right);
//     const backLeft = !getNeighbor(x, z, direction) && getNeighbor(x, z, left);
//     const backRight = !getNeighbor(x, z, direction) && getNeighbor(x, z, right);

//     if (frontLeft && !frontRight) return { isCorner: true, side: 'left', type: 'outset' };
//     if (!frontLeft && frontRight) return { isCorner: true, side: 'right', type: 'outset' };
//     if (backLeft && !backRight) return { isCorner: true, side: 'left', type: 'inset' };
//     if (!backLeft && backRight) return { isCorner: true, side: 'right', type: 'inset' };

//     return { isCorner: false };
// }

function detectCorner(x, z, direction) {
    const leftDir = getLeftDirection(direction);
    const rightDir = getRightDirection(direction);

    const front = getNeighbor(x, z, direction);
    const frontLeft = getNeighbor(x, z, direction) && getNeighbor(x, z, leftDir);
    const frontRight = getNeighbor(x, z, direction) && getNeighbor(x, z, rightDir);
    const backLeft = gridTracker[getBackLeftCoordinates(x, z, direction).x][getBackLeftCoordinates(x, z, direction).z];
    const backRight = gridTracker[getBackRightCoordinates(x, z, direction).x][getBackRightCoordinates(x, z, direction).z];

    const left = getNeighbor(x, z, leftDir);
    const right = getNeighbor(x, z, rightDir);

    let cornerInfo = {
        left: { isCorner: false, type: null },
        right: { isCorner: false, type: null }
    };

    // Check left side
    if (!front && !left) {
        cornerInfo.left.isCorner = true;
        cornerInfo.left.type = 'inset';
    }

    // Check right side
    if (!front && !right) {
        cornerInfo.right.isCorner = true;
        cornerInfo.right.type = 'inset';
    }

    if (backLeft && !backRight) {
        cornerInfo.left.isCorner = true;
        cornerInfo.left.type = 'outset';
        cornerInfo.debug = true;
    }
    if (backRight && !backLeft) {
        cornerInfo.right.isCorner = true;
        cornerInfo.right.type = 'outset';
        cornerInfo.debug = true;
    }
    if (backRight && backLeft) {
        cornerInfo.left.isCorner = true;
        cornerInfo.right.isCorner = true;
        cornerInfo.left.type = 'outset';
        cornerInfo.right.type = 'outset';
        cornerInfo.debug = true;
    }


    return cornerInfo;
}

function getBackLeftCoordinates(x, z, direction) {
    switch (direction) {
        case 'north': return { x: x - 1, z: z - 1 };
        case 'south': return { x: x + 1, z: z + 1 };
        case 'east': return { x: x + 1, z: z - 1 };
        case 'west': return { x: x - 1, z: z + 1 };
    }
}

function getBackRightCoordinates(x, z, direction) {
    switch (direction) {
        case 'north': return { x: x + 1, z: z - 1 };
        case 'south': return { x: x - 1, z: z + 1 };
        case 'east': return { x: x + 1, z: z + 1 };
        case 'west': return { x: x - 1, z: z - 1 };
    }
}

function getLeftDirection(direction) {
    const directions = ['north', 'west', 'south', 'east'];
    const index = directions.indexOf(direction);
    return directions[(index + 1) % 4];
}

function getRightDirection(direction) {
    const directions = ['north', 'east', 'south', 'west'];
    const index = directions.indexOf(direction);
    return directions[(index + 1) % 4];
}