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