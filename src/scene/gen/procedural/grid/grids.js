// load grid of 8 around

import { updateGrassThin } from "../../../../utils/plants/plants.js";
import { gridConfig } from "./constants.js";
import { createGridInput, createGridMesh } from "./grid.js";
import { createGridTracker, updateWallsForCell } from "./gridTracker.js";
import { createTools } from "./tools/tools.js";

// load json file containng a grid/map tile 

function extractTileData(grid) {
    let tile = {};
    // const vertexData = BABYLON.VertexData.ExtractFromMesh(grid);
    const positions = grid.getVerticesData(BABYLON.VertexBuffer.PositionKind);

    // Convert positions to Float32Array (if not already)
    if (positions instanceof Float32Array) {
        tile.positions = positions;
    } else {
        tile.positions = new Float32Array(positions);
    }


    tile.gridTracker = grid.gridTracker;
    return tile;
}

export function saveGridToTile(jsonObject, filename, download) {
    let tile = extractTileData(jsonObject);
    const jsonString = JSON.stringify(tile, null, 2);

    const positions = tile.positions; // Float32Array
    const metadata = {
        gridTracker: tile.gridTracker
    };

    // Convert metadata to JSON string
    const metadataString = JSON.stringify(metadata, null, 2);
    const metadataBlob = new Blob([metadataString], { type: 'application/json' });

    // Create a combined Blob (for simplicity, append JSON metadata first)
    const combinedBlob = new Blob([metadataBlob, positions.buffer], { type: 'application/octet-stream' });

    if (download) {
        // Create a Blob with the JSON string
        const link = document.createElement('a');
        link.href = URL.createObjectURL(combinedBlob);
        link.download = filename || 'tile.bin';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return tile;
}


function createNewGridFromTile(scene, tile, gridSize, cellSize) {
    // Parse the tracker data
    // console.log(tile);

    // Create a new grid
    const options = { width: gridSize * cellSize, height: gridSize * cellSize, subdivisions: gridSize };
    const newGrid = createNewGridMeshFromPositions(scene, tile.positions, gridSize);
    // const newGrid = createGridMesh(scene);

    newGrid.convert = function (x, z) {
        return { 'x': Math.round(x / cellSize) + Math.floor(gridSize / 2), 'z': Math.round(z / cellSize) + Math.floor(gridSize / 2) };
    }

    newGrid.groundAggregate = new BABYLON.PhysicsAggregate(newGrid, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution: 0.0, friction: 1000000000.8 }, scene);

    loadInGridTracker(scene, newGrid);
    TOOLS = createTools(scene, MESH_LIBRARY, newGrid.gridTracker, newGrid);

    newGrid.actionManager = new BABYLON.ActionManager(scene);
    createGridInput(scene, MESH_LIBRARY, newGrid, TOOLS);

    return newGrid;
}

function loadInGridTracker(scene, newGrid, newGridTrackerPassed) {
    // Create a new grid tracker
    const newGridTracker = createGridTracker(scene, null);

    // Load the tracker data into the new grid tracker
    for (let x = 0; x < gridConfig.gridSize; x++) {
        for (let z = 0; z < gridConfig.gridSize; z++) {
            newGridTracker[x][z] = newGridTrackerPassed[x][z];
            if (newGridTracker[x][z].f) {
                updateWallsForCell(x, z, false);

            }
        }
    }
    newGrid.gridTracker = newGridTracker;
}

export function gridTest(scene) {
    let tile = saveGridToTile(GRID);

    // Create a new grid using the exported positions
    let newGrid = createNewGridFromTile(scene, tile, gridConfig.gridSize, gridConfig.cellSize);

    // // Position the new grid as needed
    // newGrid.position = new BABYLON.Vector3(0, 0, gridSize * cellSize); // For example, place it next to the original grid

    // // Apply the same material to the new grid
    // newGrid.material = terrainShader;
}

// export function loadTileToGrid(scene) {
//     // Create an input element to trigger file selection dialog
//     const input = document.createElement('input');
//     input.type = 'file';
//     input.accept = '.json'; // Accept only JSON files

//     // Add an event listener to handle file selection
//     input.addEventListener('change', function (event) {
//         const file = event.target.files[0];
//         if (file) {
//             const reader = new FileReader();

//             // Define what to do once the file is read
//             reader.onload = function (e) {
//                 try {
//                     const tile = JSON.parse(e.target.result);
//                     loadNewGrid(scene, tile);

//                 } catch (error) {
//                     console.error('Error parsing JSON:', error);
//                 }
//             };

//             // Read the file as a text
//             reader.readAsText(file);
//         }
//     });

//     // Trigger the file input dialog
//     input.click();
// }
async function readFileAsJSON(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                resolve(data);
            } catch (error) {
                reject(new Error('Invalid JSON file'));
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}

export function loadTileToGrid(scene) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json'; // Accept binary files

    input.addEventListener('change', async function (event) {
        const file = event.target.files[0];
        if (file) {
            try {
                const data = await readFileAsJSON(file);
                loadGridFile(data);
            } catch (error) {
                console.error('Error parsing tile file:', error);
                console.error('Error details:', error.message);
            }
        };

    });

    input.click();
}

function loadNewGrid(scene, tile) {
    // deleteOldGrid
    GRID.dispose();

    let newGrid = createNewGridFromTile(scene, tile, 19, 63);
    newGrid.material = MESH_LIBRARY.terrain.terrainShader;
    GRID = newGrid;

}




function createNewGridMeshFromPositions(scene, positions, gridSize) {
    gridSize = gridConfig.gridSize;
    let cellSize = gridConfig.cellSize;
    // new grid creation, couldn't edit vertex colors with MeshBuilder.CreateGround
    let gridSizeForColor = gridSize * cellSize;
    const gridResolution = gridSize;

    const vertices = [];
    const indices = [];
    const uvs = [];

    for (let z = 0; z <= gridResolution; z++) {
        for (let x = 0; x <= gridResolution; x++) {
            vertices.push(
                x * gridSizeForColor / gridResolution - gridSizeForColor / 2,
                0,
                z * gridSizeForColor / gridResolution - gridSizeForColor / 2
            );
            uvs.push(x / gridResolution, z / gridResolution);
        }
    }

    for (let z = 0; z < gridResolution; z++) {
        for (let x = 0; x < gridResolution; x++) {
            const topLeft = z * (gridResolution + 1) + x;
            const topRight = topLeft + 1;
            const bottomLeft = topLeft + gridResolution + 1;
            const bottomRight = bottomLeft + 1;

            indices.push(topLeft, topRight, bottomLeft);
            indices.push(topRight, bottomRight, bottomLeft);
        }
    }

    // Create the grid mesh
    let gridMesh = new BABYLON.Mesh('grid', scene);
    const vertexData = new BABYLON.VertexData();
    vertexData.positions = vertices;
    vertexData.indices = indices;
    vertexData.uvs = uvs;
    vertexData.applyToMesh(gridMesh);

    const colors = [];
    for (let i = 0; i < vertices.length / 3; i++) {
        let randomBrightness = Math.random() + 0.5;
        colors.push(1, randomBrightness, 0, 1); // Set the vertex color to red
    }

    gridMesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, colors);

    const positionsOld = gridMesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);

    const positionsArray = flattenObjectToArray(positions);
    const vertexCount = positionsArray.length / 3;
    console.log(positionsOld[1]);

    for (let i = 0; i < vertexCount; i++) {
        positionsOld[i * 3 + 1] = positionsArray[i * 3 + 1];
    }

    let normals = [];
    BABYLON.VertexData.ComputeNormals(positionsArray, gridMesh.getIndices(), normals, { useRightHandedSystem: true });
    gridMesh.setVerticesData(BABYLON.VertexBuffer.NormalKind, normals);
    gridMesh.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positionsArray, true);
    gridMesh.convertToFlatShadedMesh();

    gridMesh.refreshBoundingInfo();
    gridMesh.markAsDirty();

    return gridMesh;
}

function flattenObjectToArray(obj) {
    let result = [];

    function recurse(value) {
        if (typeof value === 'number') {
            result.push(value);
        } else if (Array.isArray(value)) {
            value.forEach(recurse);
        } else if (typeof value === 'object' && value !== null) {
            Object.values(value).forEach(recurse);
        }
    }

    recurse(obj);
    return result;
}



export function downloadTilesAsBundleWithoutLibrary(tiles, folderName = 'tiles') {
    const zipParts = [];

    // ZIP file header constants
    const LOCAL_FILE_HEADER_SIGNATURE = "\x50\x4b\x03\x04";
    const CENTRAL_DIRECTORY_HEADER_SIGNATURE = "\x50\x4b\x01\x02";
    const END_OF_CENTRAL_DIRECTORY_SIGNATURE = "\x50\x4b\x05\x06";

    // Collect file entries and central directory entries
    let centralDirectory = "";
    let centralDirectoryOffset = 0;

    tiles.forEach((tile, index) => {
        const fileName = `${folderName}/tile_${index + 1}.json`;
        const jsonData = JSON.stringify(tile, null, 2);
        const dataBlob = new TextEncoder().encode(jsonData);
        const dataLength = dataBlob.length;

        // Create a local file header
        const localHeader = `${LOCAL_FILE_HEADER_SIGNATURE}\x14\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00`
            + toLittleEndianHex(dataLength, 4)
            + toLittleEndianHex(dataLength, 4)
            + toLittleEndianHex(fileName.length, 2)
            + "\x00\x00"
            + fileName;

        zipParts.push(localHeader);
        zipParts.push(dataBlob);

        // Create a central directory entry
        const centralHeader = `${CENTRAL_DIRECTORY_HEADER_SIGNATURE}\x14\x00\x14\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00`
            + toLittleEndianHex(dataLength, 4)
            + toLittleEndianHex(dataLength, 4)
            + toLittleEndianHex(fileName.length, 2)
            + "\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00"
            + toLittleEndianHex(centralDirectoryOffset, 4)
            + fileName;

        centralDirectory += centralHeader;

        // Update the central directory offset
        centralDirectoryOffset += localHeader.length + dataLength;
    });

    // End of central directory record
    const endOfCentralDirectory = `${END_OF_CENTRAL_DIRECTORY_SIGNATURE}\x00\x00\x00\x00\x01\x00\x01\x00`
        + toLittleEndianHex(centralDirectory.length, 4)
        + toLittleEndianHex(centralDirectoryOffset, 4)
        + "\x00\x00";

    // Final ZIP content
    const zipBlob = new Blob([...zipParts, centralDirectory, endOfCentralDirectory], { type: "application/zip" });

    // Trigger the download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = `${folderName}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Utility function to convert numbers to little-endian hexadecimal strings
function toLittleEndianHex(value, bytes) {
    let hex = value.toString(16).padStart(bytes * 2, '0');
    let result = '';
    for (let i = 0; i < bytes * 2; i += 2) {
        result += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return result;
}





function serializeMeshData(mesh) {
    return {
        positions: Array.from(mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind)),
        indices: Array.from(mesh.getIndices()),
        uvs: Array.from(mesh.getVerticesData(BABYLON.VertexBuffer.UVKind)),
        colors: Array.from(mesh.getVerticesData(BABYLON.VertexBuffer.ColorKind))
    };
}

export function saveMeshAndGridTracker(grid, filename) {
    const meshData = serializeMeshData(grid);
    const data = {
        mesh: meshData,
        gridTracker: grid.gridTracker
    };

    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
}


function addGridInteract(scene, newGrid, newGridTracker) {
    let gridSize = gridConfig.gridSize;
    let cellSize = gridConfig.cellSize;

    newGrid.convert = function (x, z) {
        return { 'x': Math.round(x / cellSize) + Math.floor(gridSize / 2), 'z': Math.round(z / cellSize) + Math.floor(gridSize / 2) };
    }

    newGrid.groundAggregate = new BABYLON.PhysicsAggregate(newGrid, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution: 0.0, friction: 1000000000.8 }, scene);

    loadInGridTracker(scene, newGrid, newGridTracker);
    TOOLS = createTools(scene, MESH_LIBRARY, newGrid.gridTracker, newGrid);

    newGrid.actionManager = new BABYLON.ActionManager(scene);
    createGridInput(scene, MESH_LIBRARY, newGrid, TOOLS);

    return newGrid;
}

export async function loadMeshAndGridTracker(scene, filename, x = 0, y = 0, data) {
    if (!data) {
        const response = await fetch(filename);
        data = await response.json();
    }

    const mesh = new BABYLON.Mesh('loadedGrid', scene);
    const vertexData = new BABYLON.VertexData();
    vertexData.positions = new Float32Array(data.mesh.positions);
    vertexData.indices = data.mesh.indices;
    vertexData.uvs = new Float32Array(data.mesh.uvs);
    vertexData.applyToMesh(mesh);

    mesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, new Float32Array(data.mesh.colors));

    mesh.material = MESH_LIBRARY.terrain.terrainShader;


    let tileDistance = gridConfig.gridSize * gridConfig.cellSize;
    mesh.position.x = tileDistance * x;
    mesh.position.z = tileDistance * y;
    return {
        mesh: mesh,
        gridTracker: data.gridTracker,
        x: x,
        y: y,
    };
}


export function loadGrid(scene) {
    GRID.dispose();
    loadMeshAndGridTracker(scene, 'tileNew.json').then(({ mesh, gridTracker }) => {
        let newGrid = addGridInteract(scene, mesh, gridTracker);
        GRID = newGrid;
        // async update foilage
        updateGrassThin();
    });
}

export function loadGridFile(scene, data) {
    GRID.dispose();
    loadMeshAndGridTracker(scene, "no_file_name.json", 0, 0, data).then(({ mesh, gridTracker }) => {
        let newGrid = addGridInteract(scene, mesh, gridTracker);
        GRID = newGrid;
        // async update foilage
        updateGrassThin();
    });
}


export async function loadSurrondingGrids(scene, centerX = 0, centerY = 0, radius = 1) {
    if (GRID) {
        GRID.dispose();
    }

    const loadPromises = [];
    for (let x = centerX - radius; x <= centerX + radius; x++) {
        for (let y = centerY - radius; y <= centerY + radius; y++) {
            const fileName = `data/world/tiles/tile_${x}_${y}.json`;
            loadPromises.push(loadMeshAndGridTracker(scene, fileName, x, y));
        }
    }

    try {
        const results = await Promise.all(loadPromises);

        results.forEach(({ mesh, gridTracker, x, y }) => {
            // Only add gridInteract for the center tile

            if (x === centerX && y === centerY) {
                console.log(x);

                addGridInteract(scene, mesh, gridTracker);
                GRID = mesh;
                updateGrassThin();
            }
        });

    } catch (error) {
        console.error("Error loading grid tiles:", error);
    }
}
