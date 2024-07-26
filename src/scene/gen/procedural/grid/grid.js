import { disposeAnimation, entryAnimationFloor, entryAnimationWall } from "./animations.js";
import { cellSize, gridSize } from "./constants.js";
import { updateCellAndSurronding, removeAllWalls, createGridTracker } from "./gridTracker.js";
import { createFloor } from "./place/floor.js";
import { createTools } from "./tools/tools.js";
import { createHighlight, updateHighlight } from "./tools/visual/highlight.js";


export function createGrid(scene, meshes) {


    const grid = BABYLON.MeshBuilder.CreateGround('grid', { width: gridSize * cellSize, height: gridSize * cellSize, subdivisions: gridSize }, scene);
    GRID = grid;
    let gridMaterial = new BABYLON.StandardMaterial("Selection_Grid_Mat", scene);
    // Create an invisible grid
    // gridMaterial.alpha = 0;
    // gridMaterial.wireframe = true;
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
    gridTracker[Math.floor(gridSize / 2)][Math.floor(gridSize / 2)] = true; // Fill a cell

    function convert(x, z) {
        return { 'x': x + Math.floor(gridSize / 2), 'z': z + Math.floor(gridSize / 2) };
    }

    // Grid Input Actions //
    grid.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, (evt) => {
        const pickedPoint = evt.additionalData.pickedPoint;
        if (!pickedPoint) return;

        const xIndex = Math.round(pickedPoint.x / cellSize);
        const zIndex = Math.round(pickedPoint.z / cellSize);
        let gridTrackerIndex = convert(xIndex, zIndex);
        console.log(`Clicked gridTrackerIndex: (${gridTrackerIndex.x}, ${gridTrackerIndex.z})`);
        console.log(`Clicked cell center: (${xIndex}, ${zIndex})`);

        // Create or remove the floor mesh based on click type
        if (evt.sourceEvent.button === 0) { // Left click
            // Do current Selected Tool
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
        }//  else if (evt.sourceEvent.button === 2) { // Right click
        //     const floor = scene.getMeshByName(`floor_${x}_${z}`);
        //     if (floor) {
        //         // Scale down and remove
        //         floor.scaling = new BABYLON.Vector3(0, 0, 0); // Animate this for a smoother effect
        //         setTimeout(() => floor.dispose(), 300); // Delay to show scaling
        //     }
        // }
    }));



    //  Grid Pointer Held //
    let leftHeldDown = false;
    scene.onPointerObservable.add((pointerInfo) => {
        if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
            if (pointerInfo.event.button == 0) leftHeldDown = true;
        }
        if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERUP) {
            leftHeldDown = false;
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
                console.log(`Clicked gridTrackerIndex: (${gridTrackerIndex.x}, ${gridTrackerIndex.z})`);
                console.log(`Clicked cell center: (${xIndex}, ${zIndex})`);

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












