import { cellSize, gridSize } from "./constants.js";
import { updateCellAndSurronding, removeAllWalls, createGridTracker } from "./gridTracker.js";
import { createTools } from "./tools/tools.js";
import { createHighlight, updateHighlight } from "./tools/visual/highlight.js";


export function createGrid(scene, meshes) {

    let options = { width: gridSize * cellSize, height: gridSize * cellSize, subdivisions: gridSize };
    const grid = BABYLON.MeshBuilder.CreateGround('grid', options, scene);

    MESH_LIBRARY = meshes;
    GRID = grid;

    // const body = new BABYLON.PhysicsBody(GRID, BABYLON.PhysicsMotionType.STATIC, false, scene);
    GRID.groundAggregate = new BABYLON.PhysicsAggregate(GRID, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution: 0.0, friction: 1000000000.8 }, scene);
    // body.shape = this.terrainShape;

    // addNonTilingColor(grid);
    let gridMaterial = new BABYLON.StandardMaterial("Selection_Grid_Mat", scene);
    // Create an invisible grid
    gridMaterial.alpha = 0;
    gridMaterial.wireframe = true;
    if (DEBUG) {
        gridMaterial.alpha = 1;
        gridMaterial.wireframe = true;
        gridMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    }

    // Terrain Material with height rocks and flat grass blending
    BABYLON.NodeMaterial.ParseFromSnippetAsync("#AT7YY5#132", scene).then(function (nodeMaterial) {
        grid.material = nodeMaterial;
        gridMaterial.alpha = 1;
        grid.material.transparencyMode = BABYLON.Material.MATERIAL_OPAQUE;
    });

    grid.material = gridMaterial;
    grid.actionManager = new BABYLON.ActionManager(scene);

    createHighlight(scene);
    const gridTracker = createGridTracker(scene, meshes);
    let tools = createTools(scene, meshes, gridTracker, grid);



    // Player starts on this cell, the mesh is already filled in. 
    // gridTracker[Math.floor(gridSize / 2)][Math.floor(gridSize / 2)] = true; // Fill a cell

    function convert(x, z) {
        return { 'x': x + Math.floor(gridSize / 2), 'z': z + Math.floor(gridSize / 2) };
    }

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
    gridTracker.parentNode = parentNode;



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
                if (gridTracker[gridTrackerIndex.x][gridTrackerIndex.z]) { return; } //don't place while already filling
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










