
export function createGrid(scene, meshes) {
    const gridSize = 63; // Grid size (10x10)
    const cellSize = 60;  // Each cell is 1x1 units

    // Create an invisible grid
    const grid = BABYLON.MeshBuilder.CreateGround('grid', { width: gridSize * cellSize, height: gridSize * cellSize, subdivisions: gridSize }, scene);
    // grid.isVisible = false;
    const gridMaterial = new BABYLON.StandardMaterial("Selection_Grid_Mat", scene);
    gridMaterial.alpha = 0;
    if (DEBUG) {
        // gridMaterial.alpha = 1;
        // gridMaterial.wireframe = true;
        // gridMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    }

    grid.material = gridMaterial;
    grid.actionManager = new BABYLON.ActionManager(scene);



    const gridTracker = new Array(gridSize).fill(null).map(() => new Array(gridSize).fill(false));
    const wallMaterial = new BABYLON.StandardMaterial("wallMat", scene);
    wallMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.3, 0.3);

    // center starting cell - spawn in then enable physics
    gridTracker[Math.floor(gridSize / 2)][Math.floor(gridSize / 2)] = true; // Fill a cell
    // Example usage
    // gridTracker[0][0] = true; // Fill a cell
    // gridTracker[0][1] = true; // Fill a cell
    // gridTracker[0][2] = true; // Fill a cell
    // gridTracker[0][3] = true; // Fill a cell
    // updateWallsForCell(0, 0); // Update walls for this cell
    // updateWallsForCell(0, 1); // Update walls for this cell
    // updateWallsForCell(0, 2); // Update walls for this cell
    // updateWallsForCell(0, 3); // Update walls for this cell

    function convert(x, z) {
        return { 'x': x + Math.floor(gridSize / 2), 'z': z + Math.floor(gridSize / 2) };
    }

    // Function to update walls for a specific cell
    function updateWallsForCell(x, z, meshes) {
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
        }

        ['north', 'south', 'east', 'west'].forEach(direction => {
            const neighbor = getNeighbor(x, z, direction);
            const wallKey = `${key}_wall_${direction}`;
            let wall = scene.getMeshByName(wallKey);
            if (neighbor === false) {
                if (!wall) {
                    wall = createWall(scene, x, z, direction, cellSize, key, meshes);
                    entryAnimationWall(scene, wall);
                }
            } else {
                wall?.dispose();
            }
        });
    }

    function removeAllWalls(x, z) {
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
    function createWall(scene, x, z, direction, size, key, meshes) {
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

    function updateCellAndSurronding(gridTrackerIndex, meshes) {
        updateWallsForCell(gridTrackerIndex.x, gridTrackerIndex.z, meshes);
        // also update walls for each cell around
        updateWallsForCell(gridTrackerIndex.x, gridTrackerIndex.z + 1, meshes);
        updateWallsForCell(gridTrackerIndex.x, gridTrackerIndex.z - 1, meshes);
        updateWallsForCell(gridTrackerIndex.x + 1, gridTrackerIndex.z + 1, meshes);
        updateWallsForCell(gridTrackerIndex.x + 1, gridTrackerIndex.z, meshes);
        updateWallsForCell(gridTrackerIndex.x + 1, gridTrackerIndex.z - 1, meshes);
        updateWallsForCell(gridTrackerIndex.x - 1, gridTrackerIndex.z + 1, meshes);
        updateWallsForCell(gridTrackerIndex.x - 1, gridTrackerIndex.z, meshes);
        updateWallsForCell(gridTrackerIndex.x - 1, gridTrackerIndex.z - 1, meshes);
    }


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
            let floor = scene.getMeshByName(`floor_${xIndex}_${zIndex}`);
            if (!floor) {
                let removeFunction = function () {
                    disposeAnimation(scene, floor);
                    gridTracker[gridTrackerIndex.x][gridTrackerIndex.z] = false;
                    removeAllWalls(gridTrackerIndex.x, gridTrackerIndex.z);
                    updateCellAndSurronding(gridTrackerIndex, meshes);
                };
                floor = createFloor(scene, xIndex, zIndex, cellSize, meshes, removeFunction);
                // Position at the exact center of the cell
                floor.position = new BABYLON.Vector3((xIndex + 0.5) * cellSize - cellSize / 2, 0.1, (zIndex + 0.5) * cellSize - cellSize / 2);

                let completeFunction = function () {
                    gridTracker[gridTrackerIndex.x][gridTrackerIndex.z] = true;
                    updateCellAndSurronding(gridTrackerIndex, meshes);
                }
                floor.completeFunction = completeFunction;
                entryAnimationFloor(scene, floor, meshes, cellSize);


            }
        }//  else if (evt.sourceEvent.button === 2) { // Right click
        //     const floor = scene.getMeshByName(`floor_${x}_${z}`);
        //     if (floor) {
        //         // Scale down and remove
        //         floor.scaling = new BABYLON.Vector3(0, 0, 0); // Animate this for a smoother effect
        //         setTimeout(() => floor.dispose(), 300); // Delay to show scaling
        //     }
        // }
    }));


    let highlightMesh;
    let highlightAnimation;
    const outlinePoints = [
        new BABYLON.Vector3(-cellSize / 2, 0, -cellSize / 2),
        new BABYLON.Vector3(cellSize / 2, 0, -cellSize / 2),
        new BABYLON.Vector3(cellSize / 2, 0, cellSize / 2),
        new BABYLON.Vector3(-cellSize / 2, 0, cellSize / 2),
        new BABYLON.Vector3(-cellSize / 2, 0, -cellSize / 2)
    ];
    highlightMesh = BABYLON.MeshBuilder.CreateLines("highlightMesh", { points: outlinePoints }, scene);
    highlightMesh.color = new BABYLON.Color3(1, 1, 1);
    highlightMesh.color = new BABYLON.Color3(0.1, 0.1, 0.1);
    highlightMesh.material.alpha = 0;
    highlightMesh.position.y = 0.01; // Slightly above the grid
    highlightMesh.isPickable = false;
    highlightMesh.visibility = 1; // Start invisible

    // Create animation for smooth transition
    highlightAnimation = new BABYLON.Animation(
        "highlightAnimation",
        "material.alpha",
        60,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const keyframes = [
        { frame: 0, value: 0 },
        { frame: 60, value: 1 }
    ];
    highlightAnimation.setKeys(keyframes);

    // Add easing function for smoother animation
    const easingFunction = new BABYLON.QuadraticEase();
    easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
    highlightAnimation.setEasingFunction(easingFunction);

    let leftHeldDown = false;
    scene.onPointerObservable.add((pointerInfo) => {
        if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
            if (pointerInfo.event.button == 0) leftHeldDown = true;
        }
        if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERUP) {
            leftHeldDown = false;
        }

        if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERMOVE) {
            updateHighlight(pointerInfo.event, scene);
            if (leftHeldDown) {
                console.log(pointerInfo);
                const pickedPoint = pointerInfo._pickInfo.pickedPoint;
                if (!pickedPoint) return;

                const xIndex = Math.round(pickedPoint.x / cellSize);
                const zIndex = Math.round(pickedPoint.z / cellSize);
                let gridTrackerIndex = convert(xIndex, zIndex);
                if (gridTracker[gridTrackerIndex.x][gridTrackerIndex.z]) { return; } //don't place while already filling
                console.log(`Clicked gridTrackerIndex: (${gridTrackerIndex.x}, ${gridTrackerIndex.z})`);
                console.log(`Clicked cell center: (${xIndex}, ${zIndex})`);

                // if (evt.sourceEvent.button === 0) { // Left click
                let floor = scene.getMeshByName(`floor_${xIndex}_${zIndex}`);
                if (!floor) {
                    let removeFunction = function () {
                        disposeAnimation(scene, floor);
                        gridTracker[gridTrackerIndex.x][gridTrackerIndex.z] = false;
                        removeAllWalls(gridTrackerIndex.x, gridTrackerIndex.z);
                        updateCellAndSurronding(gridTrackerIndex, meshes);
                    };
                    floor = createFloor(scene, xIndex, zIndex, cellSize, meshes, removeFunction);
                    // Position at the exact center of the cell
                    floor.position = new BABYLON.Vector3((xIndex + 0.5) * cellSize - cellSize / 2, 0.1, (zIndex + 0.5) * cellSize - cellSize / 2);

                    let completeFunction = function () {
                        gridTracker[gridTrackerIndex.x][gridTrackerIndex.z] = true;
                        updateCellAndSurronding(gridTrackerIndex, meshes);
                    }
                    floor.completeFunction = completeFunction;
                    entryAnimationFloor(scene, floor, meshes, cellSize);


                }
                // }
            }
        }

    });


    let currentHighlightedCell = { x: -1, z: -1 };

    function updateHighlight(event, scene) {
        const pickResult = scene.pick(scene.pointerX, scene.pointerY);
        if (pickResult.hit && pickResult.pickedMesh.name === 'grid') {
            const pickedPoint = pickResult.pickedPoint;
            const xIndex = Math.floor((pickedPoint.x + (gridSize * cellSize / 2)) / cellSize);
            const zIndex = Math.floor((pickedPoint.z + (gridSize * cellSize / 2)) / cellSize);

            if (xIndex !== currentHighlightedCell.x || zIndex !== currentHighlightedCell.z) {
                highlightMesh.position.x = xIndex * cellSize - (gridSize * cellSize / 2) + cellSize / 2;
                highlightMesh.position.z = zIndex * cellSize - (gridSize * cellSize / 2) + cellSize / 2;

                // Animate in
                // scene.beginDirectAnimation(highlightMesh, [highlightAnimation], 0, 10, false, 1);

                currentHighlightedCell = { x: xIndex, z: zIndex };
            }
        } else if (currentHighlightedCell.x !== -1) {
            // Animate out
            const reverseAnimation = highlightAnimation.clone();
            reverseAnimation.getKeys().reverse();
            scene.beginDirectAnimation(highlightMesh, [reverseAnimation], 0, 10, false, 1, () => {
                currentHighlightedCell = { x: -1, z: -1 };
            });
        }
    }


}


function entryAnimationWall(scene, object) {
    const popInAnim = new BABYLON.Animation("popInAnim", "scaling", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    const keys = [
        { frame: 0, value: new BABYLON.Vector3(20, 5, 0) },
        { frame: 3, value: new BABYLON.Vector3(20, 5, 20) }
    ];
    popInAnim.setKeys(keys);

    const easingFunction = new BABYLON.SineEase();
    easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEIN);
    const moveEasingFucntion = new BABYLON.CubicEase();
    moveEasingFucntion.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);

    popInAnim.setEasingFunction(easingFunction);

    const moveAnim = new BABYLON.Animation(
        "moveAnim",
        "position",
        30,
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
    );

    const moveKeys = [
        { frame: 0, value: new BABYLON.Vector3(object.position.x + 0, object.position.y + 60, object.position.z - 0) },
        { frame: 30, value: new BABYLON.Vector3(object.position.x + 0, object.position.y - 0, object.position.z - 0) }
    ];
    moveAnim.setKeys(moveKeys);

    moveAnim.setEasingFunction(moveEasingFucntion);

    object.animations = [popInAnim, moveAnim];


    scene.beginAnimation(object, 0, 30, false, 1, () => {
        // object.createCeiling();
    });
}

// createStory(scene, x, z, cellSize, meshes) {

// }


function createFloor(scene, x, z, cellSize, meshes, removeFunction) {
    let FLOOR_DEBUG = false;

    let floor = meshes['floor'].clone("floor_clone");
    floor.remove = removeFunction;
    // console.log(floor);
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




function createClutter(scene, meshes, floor, cellSize) {
    // Get a random number between -1 and 1
    function getClutterToPlace(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    let clutterToPlace = getClutterToPlace(-2, meshes['clutter'].length - 1);
    if (clutterToPlace <= -1) {
        return null;// don't place any clutter this turn
    }
    // let object = meshes['clutter'][clutterToPlace].clone("clutter_clone");
    let object = meshes['clutter'][clutterToPlace].clone("clutter_clone");

    // clutter specific methods
    function getRandomPosition(cellSize, border) {
        let halfSize = cellSize - border;
        return {
            x: (Math.random() - 0.5) * ((cellSize - border) / 2.5) / 2,
            y: (Math.random() / 100) + 0.11,  // Assuming you want the clutter to stay on the ground (y=0)
            z: (Math.random() - 0.5) * ((cellSize - border) / 2.5) / 2
        };
    }
    function getRandomYRotation() {
        return new BABYLON.Vector3(0, (Math.random() * 2 * Math.PI), 0);
    }

    let newPosition = getRandomPosition(cellSize, object.border);

    object.parent = floor;

    object.position.x = object.position.x + newPosition.x;
    object.position.y = object.position.y + newPosition.y;
    object.position.z = object.position.z + newPosition.z;

    object.rotation = getRandomYRotation();

    object.scaling.x = 0;
    object.scaling.y = 0;
    object.scaling.z = 0;
    object.actionManager = new BABYLON.ActionManager(scene);

    // Register actions specifically for this object
    object.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, (evt) => {
        if (evt.sourceEvent.button === 0) { // Left click
        } else if (evt.sourceEvent.button === 2) { // Right click
            disposeAnimation(scene, object);
        }
    }));



    return object;
}

function entryAnimationFloor(scene, object, meshes, cellSize) {
    const popInAnim = new BABYLON.Animation("popInAnim", "scaling", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    const keys = [
        { frame: 0, value: new BABYLON.Vector3(0, 0, 0) },
        { frame: 30, value: new BABYLON.Vector3(5, 5, 5) }
    ];
    popInAnim.setKeys(keys);

    const easingFunction = new BABYLON.QuinticEase();
    easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
    popInAnim.setEasingFunction(easingFunction);

    object.animations = [popInAnim];

    object.completeFunction();


    scene.beginAnimation(object, 0, 30, false, 1, () => {
        // after animation finishes
        let physics = new BABYLON.PhysicsAggregate(object, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution: 0.0, friction: 1.0 }, scene);



        // create clutter
        let clutter = createClutter(scene, meshes, object, cellSize);
        // for each
        if (clutter != null) {
            entryAnimationClutter(scene, clutter);
        }
    });
}




function entryAnimationClutter(scene, object) {
    // stagger timing
    const popInAnim = new BABYLON.Animation("popInAnim", "scaling", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    const keys = [
        { frame: 0, value: new BABYLON.Vector3(0, 0, 0) },
        { frame: 30, value: new BABYLON.Vector3(1, 1, 1) }
    ];
    popInAnim.setKeys(keys);

    const easingFunction = new BABYLON.QuinticEase();
    easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
    popInAnim.setEasingFunction(easingFunction);

    object.animations = [popInAnim];
    scene.beginAnimation(object, 0, 30, false, 1, () => {
        // after animation finishes
        let physics = new BABYLON.PhysicsAggregate(object, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution: 0.0, friction: 1.0 }, scene);
    });
}

function disposeAnimation(scene, object) {
    const scaleAnim = new BABYLON.Animation("scaleAnim", "scaling", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    const keys = [
        { frame: 0, value: object.scaling },
        { frame: 30, value: new BABYLON.Vector3(0, 0, 0) }
    ];
    scaleAnim.setKeys(keys);
    // scaleAnim.setEasingFunction(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    const easingFunction = new BABYLON.CubicEase();
    easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    scaleAnim.setEasingFunction(easingFunction);

    object.animations = [scaleAnim];
    scene.beginAnimation(object, 0, 30, false, 1, () => {
        object.dispose(); // Dispose after animation
    });
}

