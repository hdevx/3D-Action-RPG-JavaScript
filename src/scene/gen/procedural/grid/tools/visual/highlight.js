import { gridConfig } from "../../constants.js";
let highlightMesh;
let highlightAnimation;
let currentHighlightedCell = { x: -1, z: -1 };

let scene;
export function createHighlight(scenePassed) {


    const outlinePoints = [
        new BABYLON.Vector3(-gridConfig.cellSize / 2, 0, -gridConfig.cellSize / 2),
        new BABYLON.Vector3(gridConfig.cellSize / 2, 0, -gridConfig.cellSize / 2),
        new BABYLON.Vector3(gridConfig.cellSize / 2, 0, gridConfig.cellSize / 2),
        new BABYLON.Vector3(-gridConfig.cellSize / 2, 0, gridConfig.cellSize / 2),
        new BABYLON.Vector3(-gridConfig.cellSize / 2, 0, -gridConfig.cellSize / 2)
    ];


    scene = scenePassed;
    highlightMesh = BABYLON.MeshBuilder.CreateLines("highlightMesh", { points: outlinePoints }, scene);
    highlightMesh.color = new BABYLON.Color3(1, 1, 1);
    highlightMesh.color = new BABYLON.Color3(0.1, 0.1, 0.1);
    highlightMesh.material.alpha = 0;
    highlightMesh.position.y = 0.01; // Slightly above the grid
    highlightMesh.isPickable = false;
    highlightMesh.alwaysSelectAsActiveMesh = true;
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
}
export function updateHighlight(event) {
    const pickResult = scene.pick(scene.pointerX, scene.pointerY);
    if (pickResult.hit && pickResult.pickedMesh.name === 'grid') {
        const pickedPoint = pickResult.pickedPoint;
        const xIndex = Math.floor((pickedPoint.x + (gridConfig.gridSize * gridConfig.cellSize / 2)) / gridConfig.cellSize);
        const zIndex = Math.floor((pickedPoint.z + (gridConfig.gridSize * gridConfig.cellSize / 2)) / gridConfig.cellSize);
        // console.log(xIndex + " " + zIndex);
        // updatePath(xIndex, zIndex);
        if (xIndex !== currentHighlightedCell.x || zIndex !== currentHighlightedCell.z) {
            highlightMesh.position.x = xIndex * gridConfig.cellSize - (gridConfig.gridSize * gridConfig.cellSize / 2) + gridConfig.cellSize / 2;
            highlightMesh.position.z = zIndex * gridConfig.cellSize - (gridConfig.gridSize * gridConfig.cellSize / 2) + gridConfig.cellSize / 2;

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

function updatePath(x, z) {
    const currentColors = GRID.getVerticesData(BABYLON.VertexBuffer.ColorKind);

    const startIndex = x * 6 + (z * 6 * gridConfig.gridSize);
    const endIndex = startIndex + 6; // 6 vertices per square (two triangles), 4 RGBA values per vertex
    for (let i = startIndex; i < endIndex; i++) {
        currentColors[(i * 4) + 0] = 0; // Red
        currentColors[(i * 4) + 1] = currentColors[(i * 4) + 1]; // Green //Used for brightness
        currentColors[(i * 4) + 2] = 1; // Blue
        currentColors[(i * 4) + 3] = 1; // Alpha
    }

    GRID.setVerticesData(BABYLON.VertexBuffer.ColorKind, currentColors);
}