import { updateGrassThin } from "../../../../utils/plants/plants.js";
import { cellSize, gridConfig, gridSize } from "./constants.js";
import { updateCellAndSurronding, removeAllWalls, createGridTracker } from "./gridTracker.js";
import { createTools } from "./tools/tools.js";
import { createHighlight, updateHighlight } from "./tools/visual/highlight.js";


export function createInputGrid(scene, meshes) {
    let options = { width: gridSize * cellSize, height: gridSize * cellSize, subdivisions: gridSize };
    // const grid = BABYLON.MeshBuilder.CreateGround('grid', options, scene);
    // const grid = BABYLON.MeshBuilder.CreateGround('grid', options, scene, true); //updateable is true
    // const result = BABYLON.SceneLoader.ImportMeshAsync  (null, "./assets/env/exterior/terrain/", "terrain_patch.glb", scene);

    // const grid = BABYLON.MeshBuilder.CreatePlane("grid2", {
    //     width: 1900,
    //     height: 1900,
    //     sideOrientation: BABYLON.Mesh.DOUBLESIDE
    // }, scene);

    const gridMesh = createGridMesh();
    let grid = gridMesh;


    grid.convert = function (x, z) {
        return { 'x': Math.round(x / cellSize) + Math.floor(gridSize / 2), 'z': Math.round(z / cellSize) + Math.floor(gridSize / 2) };
    }

    setOuterRingCliffs(grid);

    // todo builder meshes should be seperate from grid 
    MESH_LIBRARY = meshes;
    GRID = grid;

    // const body = new BABYLON.PhysicsBody(GRID, BABYLON.PhysicsMotionType.STATIC, false, scene);
    GRID.groundAggregate = new BABYLON.PhysicsAggregate(GRID, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution: 0.0, friction: 1000000000.8 }, scene);
    // body.shape = this.terrainShape;

    // addNonTilingColor(grid);



    const terrainShader = createGridMaterial(scene);
    grid.material = terrainShader;
    grid.gridMaterial = terrainShader;

    grid.actionManager = new BABYLON.ActionManager(scene);

    createHighlight(scene);
    const gridTracker = createGridTracker(scene, meshes);
    grid.gridTracker = gridTracker;

    let tools = createTools(scene, meshes, gridTracker, grid);
    TOOLS = tools;

    createGridInput(scene, meshes, grid, tools);

}

export function createGridInput(scene, meshes, grid, tools) {
    function convert(x, z) {
        return { 'x': x + Math.floor(gridSize / 2), 'z': z + Math.floor(gridSize / 2) };
    }

    // Player starts on this cell, the mesh is already filled in. 
    // gridTracker[Math.floor(gridSize / 2)][Math.floor(gridSize / 2)] = true; // Fill a cell


    // Grid Input Actions //
    grid.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, (evt) => {
        if (ON_MOBILE) {
            const { width, height } = scene.getEngine().getRenderingCanvas();
            if (evt.pointerY >= height * 0.6) {
                console.log("clicked bottom");
                CANVASES[1].style.zIndex = 1;
                return;
            }
        }
        const pickedPoint = evt.additionalData.pickedPoint;
        if (!pickedPoint) return;

        const xIndex = Math.round(pickedPoint.x / cellSize);
        const zIndex = Math.round(pickedPoint.z / cellSize);
        let gridTrackerIndex = convert(xIndex, zIndex);
        // console.log(`Clicked gridTrackerIndex: (${gridTrackerIndex.x}, ${gridTrackerIndex.z})`);
        // console.log(`Clicked cell center: (${xIndex}, ${zIndex})`);

        // Create or remove the floor mesh based on click type
        if (evt.sourceEvent.button === 0) { // Left click

            // Clicked Entire Building - Brings up Bubble Menu
            // // Swap Building Type
            // // Or Edit Position
            // const gizmoManager = new BABYLON.GizmoManager(scene);
            // gizmoManager.positionGizmoEnabled = true;
            // gizmoManager.rotationGizmoEnabled = true;
            // // gizmoManager.scaleGizmoEnabled = true;
            // gizmoManager.boundingBoxGizmoEnabled = true;
            // gizmoManager.usePointerToAttachGizmos = false;
            // gizmoManager.attachToMesh(gridTracker.parentNode);
            // // gizmoManager.attachableMeshes = [gridTracker.parentNode];

            // Clicked Individual 

            // Clicked Terrain
            // Do current Selected Tool
            // tools.selectedTool.click(xIndex, zIndex, gridTrackerIndex, gridTracker, pickedPoint);

            // let floor = scene.getMeshByName(`floor_${xIndex}_${zIndex}`);
            // if (!floor) {
            //     let removeFunction = function () {
            //         disposeAnimation(scene, floor);
            //         gridTracker[gridTrackerIndex.x][gridTrackerIndex.z] = false;
            //         removeAllWalls(gridTrackerIndex.x, gridTrackerIndex.z);
            //         updateCellAndSurronding(gridTrackerIndex, meshes);
            //     };
            //     floor = createFloor(scene, xIndex, zIndex, cellSize, meshes, removeFunction);
            //     // Position at the exact center of the cell
            //     floor.position = new BABYLON.Vector3((xIndex + 0.5) * cellSize - cellSize / 2, 0.1, (zIndex + 0.5) * cellSize - cellSize / 2);

            //     let completeFunction = function () {
            //         gridTracker[gridTrackerIndex.x][gridTrackerIndex.z] = true;
            //         updateCellAndSurronding(gridTrackerIndex, meshes);
            //     }
            //     floor.completeFunction = completeFunction;
            //     entryAnimationFloor(scene, floor, meshes);


            // }
        }//  else if (evt.sourceEvent.button === 2) { // Right click
        //     const floor = scene.getMeshByName(`floor_${x}_${z}`);
        //     if (floor) {
        //         // Scale down and remove
        //         floor.scaling = new BABYLON.Vector3(0, 0, 0); // Animate this for a smoother effect
        //         setTimeout(() => floor.dispose(), 300); // Delay to show scaling
        //     }
        // }
    }));



    var parentNode = new BABYLON.TransformNode("parentNode", scene);
    grid.gridTracker.parentNode = parentNode;
    let gridTracker = grid.gridTracker;


    //  Grid Pointer Held //
    let leftHeldDown = false;
    scene.onPointerObservable.add((pointerInfo) => {
        if (ON_MOBILE) {
            const { width, height } = scene.getEngine().getRenderingCanvas();
            if (pointerInfo.event.clientY >= height * 0.6) {
                console.log("clicked bottom");
                CANVASES[1].style.zIndex = 1;
                return;
            }
        }
        if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
            if (pointerInfo.event.button == 0) leftHeldDown = true;
        }
        if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERUP) {
            leftHeldDown = false;
            if (pointerInfo.event.button == 0) {
                if (tools.selectedTool.mouseUp) tools.selectedTool.mouseUp(gridTracker);
            }
        }

        if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERMOVE) {
            updateHighlight(pointerInfo.event);
            if (leftHeldDown) {
                // console.log(pointerInfo);
                const pickedPoint = pointerInfo._pickInfo.pickedPoint;
                if (!pickedPoint) return;

                const xIndex = Math.round(pickedPoint.x / cellSize);
                const zIndex = Math.round(pickedPoint.z / cellSize);
                let gridTrackerIndex = convert(xIndex, zIndex);
                if (gridTracker[gridTrackerIndex.x][gridTrackerIndex.z].f) { return; } //don't place while already filling
                // console.log(`Clicked gridTrackerIndex: (${gridTrackerIndex.x}, ${gridTrackerIndex.z})`);
                // console.log(`Clicked cell center: (${xIndex}, ${zIndex})`);

                // if (evt.sourceEvent.button === 0) { // Left click
                tools.selectedTool.click(xIndex, zIndex, gridTrackerIndex, gridTracker, pickedPoint);

                // let floor = scene.getMeshByName(`floor_${xIndex}_${zIndex}`);
                // if (!floor) {
                //     let removeFunction = function () {
                //         disposeAnimation(scene, floor);
                //         gridTracker[gridTrackerIndex.x][gridTrackerIndex.z] = false;
                //         removeAllWalls(gridTrackerIndex.x, gridTrackerIndex.z);
                //         updateCellAndSurronding(gridTrackerIndex, meshes);
                //     };
                //     floor = createFloor(scene, xIndex, zIndex, cellSize, meshes, removeFunction);
                //     // Position at the exact center of the cell
                //     floor.position = new BABYLON.Vector3((xIndex + 0.5) * cellSize - cellSize / 2, 0.1, (zIndex + 0.5) * cellSize - cellSize / 2);

                //     let completeFunction = function () {
                //         gridTracker[gridTrackerIndex.x][gridTrackerIndex.z] = true;
                //         updateCellAndSurronding(gridTrackerIndex, meshes);
                //     }
                //     floor.completeFunction = completeFunction;
                //     entryAnimationFloor(scene, floor, meshes);

                // }
                // }
            }
        }

    });
}

function createGridMaterial(scene) {
    // Terrain Material with height rocks and flat grass blending
    // BABYLON.NodeMaterial.ParseFromSnippetAsync("#AT7YY5#132", scene).then(function (nodeMaterial) {
    //     grid.material = nodeMaterial;
    //     gridMaterial.alpha = 1;
    //     grid.material.transparencyMode = BABYLON.Material.MATERIAL_OPAQUE;
    // });
    // grid.material = gridMaterial;

    // let gridMaterial = new BABYLON.StandardMaterial("Selection_Grid_Mat", scene);
    // // Create an invisible grid
    // gridMaterial.alpha = 0;
    // gridMaterial.wireframe = true;
    // if (DEBUG) {
    //     gridMaterial.alpha = 1;
    //     gridMaterial.wireframe = true;
    //     gridMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    // }


    const terrainShader = new BABYLON.ShaderMaterial(
        "terrain",
        scene,
        {
            vertex: "../../../shaders/env/terrain/slope_blender_terrain",
            fragment: "../../../shaders/env/terrain/slope_blender_terrain",
        },
        {
            attributes: ["position", "normal", "uv", "color"],
            uniforms: ["world", "worldView", "worldViewProjection", "view", "projection", "time", "viewProjection"],
        });
    terrainShader.setTexture("grassTexture", new BABYLON.Texture("assets/textures/terrain/grass.png", scene));
    terrainShader.setTexture("rockTexture", new BABYLON.Texture("assets/textures/terrain/rock.png", scene));
    terrainShader.setTexture("pathTexture", new BABYLON.Texture("assets/textures/terrain/floor.png", scene));
    terrainShader.setTexture("transitionTexture", new BABYLON.Texture("assets/textures/terrain/terrainMask.png", scene));
    terrainShader.setFloat("slopeThreshold", 0.05);
    terrainShader.setFloat("transitionSmoothness", 0.9);
    terrainShader.setFloat("transitionExtent", 0.1);
    terrainShader.setVector2("grassScale", new BABYLON.Vector2(7 * gridConfig.gridSize / 19, 7 * gridConfig.gridSize / 19));
    terrainShader.setVector2("rockScale", new BABYLON.Vector2(6 * gridConfig.gridSize / 19, 6 * gridConfig.gridSize / 19));
    terrainShader.setVector2("transitionScale", new BABYLON.Vector2(19 * gridConfig.gridSize / 19, 19 * gridConfig.gridSize / 19));
    // debug 
    // BABYLON.Tools.LoadScriptAsync("https://cdn.jsdelivr.net/npm/lil-gui@0.17.0/dist/lil-gui.umd.min.js").then(() => {
    //     // Create the GUI
    //     var gui = new lil.GUI();

    //     // Add controllers to modify shader parameters
    //     var params = {
    //         slopeThreshold: 0.3,
    //         transitionSmoothness: 0.1,
    //         grassSize: 1,
    //         rockSize: 1,
    //         transitionScale: 1,
    //         transitionExtent: 1,
    //     };

    //     gui.add(params, 'slopeThreshold', -2, 2).onChange(function (value) {
    //         terrainShader.setFloat("slopeThreshold", value);
    //     });

    //     gui.add(params, 'transitionSmoothness', -2, 2).onChange(function (value) {
    //         terrainShader.setFloat("transitionSmoothness", value);
    //     });

    //     gui.add(params, 'grassSize', 0, 100).onChange(function (value) {
    //         terrainShader.setVector2("grassScale", new BABYLON.Vector2(value, value));
    //     });

    //     gui.add(params, 'rockSize', 0, 100).onChange(function (value) {
    //         terrainShader.setVector2("rockScale", new BABYLON.Vector2(value, value));
    //     });

    //     gui.add(params, 'transitionScale', -100, 100).onChange(function (value) {
    //         terrainShader.setVector2("transitionScale", new BABYLON.Vector2(value, value));
    //     });
    //     gui.add(params, 'transitionExtent', -100, 100).onChange(function (value) {
    //         terrainShader.setVector2("transitionExtent", new BABYLON.Vector2(value, value));
    //     });
    // });
    MESH_LIBRARY.terrain = {};
    MESH_LIBRARY.terrain.terrainShader = terrainShader;
    return terrainShader;
}

export function createGridMesh(scene) {
    let gridSize = gridConfig.gridSize;
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
    // const totalVertices = (options.subdivisions) * (options.subdivisions);
    // const blackVertexColors = new Array(totalVertices * 4).fill(1);
    // for (let i = 0; i < totalVertices * 4; i += 4) {
    //     blackVertexColors[i + 3] = 1; // Set alpha channel to 1 for opaque black
    // }

    // grid.setVerticesData(BABYLON.VertexBuffer.ColorKind, blackVertexColors, false);

    // const vertexColors = [
    //     1, 0, 0, 1, // red
    //     0, 1, 0, 1, // green/
    //     0, 0, 1, 1, // blue
    //     1, 1, 0, 1  // yellow
    // ];
    // var indiece = grid.getIndices();
    // var colors = grid.getVerticesData(BABYLON.VertexBuffer.ColorKind);
    // console.log(colors);
    // grid.setVerticesData(BABYLON.VertexBuffer.ColorKind, vertexColors, true);

    // const vertexColorsGet = grid.getVerticesData(BABYLON.VertexBuffer.ColorKind);
    // console.log(vertexColorsGet);

    gridMesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, colors);

    return gridMesh;
}

function addNonTilingColor(grid) {
    // Access the vertex data
    const geometry = grid.getGeometry();
    const positions = geometry.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    const indices = geometry.getIndices();

    // Create an array to hold the colors
    const colors = new Array(positions.length / 3 * 4); // 4 color components per vertex (RGBA)

    // Fill the colors array with random greyscale values
    for (let i = 0; i < positions.length / 3; i++) {
        // Generate a random greyscale value
        const grey = Math.random();

        // Assign the same grey value to R, G, B channels, and set alpha to 1 (opaque)
        colors[i * 4] = grey;     // Red
        colors[i * 4 + 1] = grey; // Green
        colors[i * 4 + 2] = grey; // Blue
        colors[i * 4 + 3] = 1;    // Alpha
    }

    // Set the colors to the geometry
    geometry.setVerticesData(BABYLON.VertexBuffer.ColorKind, colors, true);

    // Apply the geometry to the mesh
    grid.refreshBoundingInfo();
    grid.computeWorldMatrix(true);
}




function setOuterRingCliffs(grid) {
    const vertexData = BABYLON.VertexData.ExtractFromMesh(grid);
    const positions = vertexData.positions;

    // Function to set height for a vertex
    function setHeight(x, z, minHeight, maxHeight) {
        const index = 3 * (z * (gridSize + 1) + x) + 1; // Y is at index 1
        positions[index] = Math.random() * (maxHeight - minHeight) + minHeight;
    }

    // Set outer ring to at least -100
    for (let x = 0; x <= gridSize; x++) {
        setHeight(x, 0, -220, -70); // Bottom edge
        setHeight(x, gridSize, -220, -70); // Top edge
    }
    for (let z = 1; z < gridSize; z++) {
        setHeight(0, z, -180, -100); // Left edge
        setHeight(gridSize, z, -180, -100); // Right edge
    }

    // Set second outer ring to random -10 to -100
    for (let x = 1; x < gridSize; x++) {
        setHeight(x, 1, -70, 55); // Bottom inner edge
        setHeight(x, gridSize - 1, -70, -10); // Top inner edge
    }
    for (let z = 2; z < gridSize - 1; z++) {
        setHeight(1, z, -70, -10); // Left inner edge
        setHeight(gridSize - 1, z, -70, -10); // Right inner edge
    }

    // Set Third outer ring to random -10 to -100
    for (let x = 3; x < gridSize; x++) {
        setHeight(x, 2, -2, -40); // Bottom inner edge
        setHeight(x, gridSize - 1, -1, -40); // Top inner edge
    }
    for (let z = 4; z < gridSize - 1; z++) {
        setHeight(2, z, -2, -40); // Left inner edge
        setHeight(gridSize - 2, z, -2, -40); // Right inner edge
    }

    // Apply the changes
    vertexData.applyToMesh(grid);

    let normals = [];
    BABYLON.VertexData.ComputeNormals(positions, grid.getIndices(), normals, { useRightHandedSystem: true });
    grid.setVerticesData(BABYLON.VertexBuffer.NormalKind, normals);
    grid.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions, true);
    grid.convertToFlatShadedMesh();

    grid.refreshBoundingInfo();
    grid.markAsDirty();

    setTimeout(() => {
        updateGrassThin();
    }, 2000);
}





