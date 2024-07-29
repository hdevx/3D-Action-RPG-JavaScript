export function setupMainPlayerMenu(scene) {
    // Set up right-click event listener
    // console.log(hero);
    scene.onPointerObservable.add((pointerInfo) => {
        if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN && pointerInfo.event.button === 2) {
            // Right mouse button clicked
            const pickResult = scene.pick(scene.pointerX, scene.pointerY);

            if (pickResult.hit) {
                const pickedMesh = pickResult.pickedMesh;

                if (pickedMesh.name === 'dummyPhysicsRoot') {
                    console.log("clicked player");
                }
            }
        }
    }, BABYLON.PointerEventTypes.POINTERDOWN);
}