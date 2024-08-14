import { cellSize, gridConfig } from "./constants.js";

export function entryAnimationFloor(scene, object, meshes) {
    const popInAnim = new BABYLON.Animation("popInAnim", "scaling", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    const keys = [
        { frame: 0, value: new BABYLON.Vector3(0, 0, 0) },
        { frame: 30, value: new BABYLON.Vector3(5 * gridConfig.cellSize / 60, 5 * gridConfig.cellSize / 60, 5 * gridConfig.cellSize / 60) }
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
    let object = meshes['clutter'][clutterToPlace].createInstance("clutter_clone");

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

    object.position.x = 0;
    object.position.y = 0;
    object.position.z = 0;

    // Nan when using instance, todo 
    // object.position.x = object.position.x + newPosition.x;
    // object.position.y = object.position.y + newPosition.y;
    // object.position.z = object.position.z + newPosition.z;

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


export function entryAnimationClutter(scene, object) {
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
        let physics = new BABYLON.PhysicsAggregate(object, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution: 0.0, friction: 1.0 }, scene);
    });
}











export function entryAnimationWall(scene, object) {
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




export function disposeAnimation(scene, object, callback) {
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

export function entryAnimationCeiling(scene, object) {
    const popInAnim = new BABYLON.Animation("popInAnim", "scaling", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    const keys = [
        { frame: 0, value: new BABYLON.Vector3(0, 0, 0) },
        { frame: 30, value: new BABYLON.Vector3(5 * gridConfig.cellSize / 60, 5 * gridConfig.cellSize / 60, 5 * gridConfig.cellSize / 60) }
    ];
    popInAnim.setKeys(keys);

    const easingFunction = new BABYLON.QuinticEase();
    easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
    popInAnim.setEasingFunction(easingFunction);

    object.animations = [popInAnim];

    scene.beginAnimation(object, 0, 30, false, 1, () => {
        // after animation finishes
    });
}
