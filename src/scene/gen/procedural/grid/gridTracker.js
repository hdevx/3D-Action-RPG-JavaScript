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
// Meshes should be global
let meshes;
export function createGridTracker(scenePassed, meshesPassed) {
    scene = scenePassed;
    if (meshesPassed) meshes = meshesPassed;
    // gridTracker = new Array(gridSize).fill(null).map(() => new Array(gridSize).fill(false));
    gridTracker = new Array(gridSize).fill(null).map(() =>
        new Array(gridSize).fill(null).map(() => ({ f: false, dirty: false, path: false }))
    );
    // gridTracker = new Array(gridSize).fill(null).map(() => new Array(gridSize).fill({ v: false, d: true }));
    createCeilingMaterial();

    return gridTracker;
}

// Function to update walls for a specific cell
export function updateWallsForCell(x, z, entryAnim) {
    if (x < 0 || x > gridSize - 1 || z < 0 || z > gridSize - 1) { return; }
    const key = `cell_${x}_${z}`;
    let cell = scene.getMeshByName(key);
    if (!gridTracker[x][z].f) {
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
            wall.parent = gridTracker.parentNode;
            if (entryAnim) entryAnimationWall(scene, wall);
            else {
                wall.scaling = new BABYLON.Vector3(20, 5, 20);
            }



        } else {
            wall?.dispose();
        }

    });

    updateCeilingTile(x, z);

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
    return gridTracker[nx][nz].f;
}

export function updateCellAndSurronding(gridTrackerIndex) {
    updateWallsForCell(gridTrackerIndex.x, gridTrackerIndex.z, true);

    // also update walls for each cell around
    setTimeout(() => {
        // check if each index is marked as dirty, only update then for animation feel
        updateWallsForCell(gridTrackerIndex.x, gridTrackerIndex.z + 1, false);
        updateWallsForCell(gridTrackerIndex.x, gridTrackerIndex.z - 1, false);
        updateWallsForCell(gridTrackerIndex.x + 1, gridTrackerIndex.z + 1, false);
        updateWallsForCell(gridTrackerIndex.x + 1, gridTrackerIndex.z, false);
        updateWallsForCell(gridTrackerIndex.x + 1, gridTrackerIndex.z - 1, false);
        updateWallsForCell(gridTrackerIndex.x - 1, gridTrackerIndex.z + 1, false);
        updateWallsForCell(gridTrackerIndex.x - 1, gridTrackerIndex.z, false);
        updateWallsForCell(gridTrackerIndex.x - 1, gridTrackerIndex.z - 1, false);
    }, 1000);

}

// export function updateCellAndSurronding(gridTrackerIndex) {
//     for (let x = -2; x <= 2; x++) {
//         for (let z = -2; z <= 2; z++) {
//             updateWallsForCell(gridTrackerIndex.x + x, gridTrackerIndex.z + z);
//         }
//     }
// }

let ceilingMaterial;
function createCeilingMaterial() {
    ceilingMaterial = new BABYLON.PBRMaterial("ceilingMat", scene);
    // ceilingMaterial.emissiveColor = new BABYLON.Color4(0.18, 0.117, 0.04, 1.0);
    ceilingMaterial.emissiveColor = new BABYLON.Color3(0.014, 0.004, 0.001);
    return ceilingMaterial;
}

function updateCeilingTile(gridIndexX, gridIndexZ) {
    const x = gridIndexX;
    const z = gridIndexZ;
    const key = `ceiling_${x}_${z}`;
    let ceilingTile = scene.getMeshByName(key);

    // Check if a ceiling tile is needed
    const isCeilingNeeded = checkIfCeilingNeeded(x - 1, z);

    if (isCeilingNeeded) {
        if (!ceilingTile) {
            // Create new ceiling tile if it doesn't exist
            ceilingTile = BABYLON.MeshBuilder.CreateBox(key, { width: cellSize, height: 0.1, depth: cellSize }, scene);

            const positionX = (x * cellSize) - (gridSize * cellSize / 2);// + (cellSize);
            const positionZ = (z * cellSize) - (gridSize * cellSize / 2);

            ceilingTile.position = new BABYLON.Vector3(positionX, 120, positionZ);
            ceilingTile.material = ceilingMaterial;
            ceilingTile.isPickable = false;
            // if (wall) ceilingTile.parent = wall;
        }
    } else {
        // Remove ceiling tile if it exists and is not needed
        if (ceilingTile) {
            ceilingTile.dispose();
        }
    }
}
function checkIfCeilingNeeded(x, z) {
    // Check if the current cell is filled
    if (!gridTracker[x][z].f) return false;

    // // // Check all surrounding cells (including diagonals)
    // for (let dx = -1; dx <= 1; dx++) {
    //     for (let dz = -1; dz <= 1; dz++) {
    //         if (dx === 0 && dz === 0) continue; // Skip the current cell
    //         const nx = x + dx;
    //         const nz = z + dz;

    //         // If any surrounding cell is empty or out of bounds, a ceiling is needed
    //         if (nx < 0 || nx >= gridSize || nz < 0 || nz >= gridSize || !gridTracker[nx][nz]) {
    //             return true;
    //         }
    //     }
    // }


    // Check if north, east, and northeast cells are filled
    // This works for single cell row roofs
    const isNorthFilled = z > 0 && gridTracker[x][z - 1].f;
    const isEastFilled = x < gridSize - 1 && gridTracker[x + 1][z].f;
    const isNorthEastFilled = x < gridSize - 1 && z > 0 && gridTracker[x + 1][z - 1].f;

    const isNorthEastSouthWestFilled = isNorthFilled && isEastFilled && isNorthEastFilled;


    const isSouthFilled = gridTracker[x][z + 1].f;

    // Ceiling is needed only when all three cells are filled
    // return isNorthFilled && isEastFilled && isNorthEastFilled;

    // Check if all surrounding cells are filled
    // const isAllSurroundingFilled = checkAllSurroundingFilled(x - 1, z);

    // Ceiling is needed when either condition is met
    return isNorthEastSouthWestFilled;
}



// function checkIfCeilingNeeded(x, z) {
//     // Check if this cell is the southwest corner of a 2x2 filled square
//     return isCellFilled(x, z) && isCellFilled(x + 1, z) && isCellFilled(x, z - 1) && isCellFilled(x + 1, z - 1);
// }

// function isCellFilled(x, z) {
//     // Check if the cell is within bounds and filled
//     return x >= 0 && x < gridSize && z >= 0 && z < gridSize && gridTracker[x][z];
// }


function checkAllSurroundingFilled(x, z) {
    for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
            if (dx === 0 && dz === 0) continue; // Skip the current cell
            const nx = x + dx;
            const nz = z + dz;

            // If any surrounding cell is empty or out of bounds, return false
            if (nx < 0 || nx >= gridSize || nz < 0 || nz >= gridSize || !gridTracker[nx][nz].f) {
                return false;
            }
        }
    }
    // If we've checked all surrounding cells and none were empty, return true
    return true;
}


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
    const back = getNeighbor(x, z, getBackDirection(direction));
    const frontLeft = getNeighbor(x, z, direction) && getNeighbor(x, z, leftDir);
    const frontRight = getNeighbor(x, z, direction) && getNeighbor(x, z, rightDir);


    const backLeft = gridTracker[getBackLeftCoordinates(x, z, direction).x][getBackLeftCoordinates(x, z, direction).z].f;
    const backRight = gridTracker[getBackRightCoordinates(x, z, direction).x][getBackRightCoordinates(x, z, direction).z].f;

    const left = getNeighbor(x, z, leftDir);
    const right = getNeighbor(x, z, rightDir);

    let cornerInfo = {
        left: { isCorner: false, type: 'flat' },
        right: { isCorner: false, type: 'flat' }
    };

    // Check left side
    if (!front && !left) {
        cornerInfo.left.type = 'inset';
    }

    if (left && !front && !back && !backLeft) {
        cornerInfo.left.type = 'flat';
    }

    if (!left && !back && !front) {
        cornerInfo.left.type = 'inset';
    }

    if (left && !back && backLeft) {
        cornerInfo.left.type = 'outset';
    }


    // if (!left && !back && !front) {
    //     cornerInfo.left.type = 'inset';
    // }

    // // Check right side
    if (!front && !right) {
        cornerInfo.right.type = 'inset';
    }

    if (right && !front && !back && !backRight) {
        cornerInfo.right.type = 'flat';
    }

    if (!right && !back && !front) {
        cornerInfo.right.type = 'inset';
    }

    if (right && !back && backRight) {
        cornerInfo.right.type = 'outset';
    }

    if (right && !back && backRight && left && backLeft) {
        cornerInfo.left.type = 'outset';
        cornerInfo.right.type = 'outset';
    }

    if (backRight && right && backLeft && left) {
        cornerInfo.left.type = 'outset';
        cornerInfo.right.type = 'outset';
    }

    if (backRight && right) {
        cornerInfo.right.type = 'outset';
    }

    if (backLeft && left) {
        cornerInfo.left.type = 'outset';
        // cornerInfo.debug = true;
    }

    // if (backLeft && !backRight) {
    //     cornerInfo.left.isCorner = true;
    //     cornerInfo.left.type = 'outset';
    // }
    // if (backRight && !backLeft) {
    //     cornerInfo.right.isCorner = true;
    //     cornerInfo.right.type = 'outset';
    // }
    // if (backRight && backLeft) {
    //     cornerInfo.left.isCorner = true;
    //     cornerInfo.right.isCorner = true;
    //     cornerInfo.left.type = 'outset';
    //     cornerInfo.right.type = 'outset';
    // }


    return cornerInfo;
}

function getBackLeftCoordinates(x, z, direction) {
    if (x <= 0 || x >= gridSize || z < 0 || z >= gridSize) return { x: 0, z: 0 }; //Todo, edges of grid give error for similar methods
    switch (direction) {
        case 'north': return { x: x - 1, z: z - 1 };
        case 'south': return { x: x + 1, z: z + 1 };
        case 'east': return { x: x + 1, z: z - 1 };
        case 'west': return { x: x - 1, z: z + 1 };
    }

}

function getBackRightCoordinates(x, z, direction) {
    if (x < 0 || x >= gridSize || z < 0 || z >= gridSize) return { x: 0, z: 0 };
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

function getBackDirection(direction) {
    const directions = ['north', 'east', 'south', 'west'];
    const index = directions.indexOf(direction);
    return directions[(index + 2) % 4];
}