import SceneManager from '../scene/SceneManager.js';

// Assuming you have a global variable or singleton pattern to access the instance of SceneManager
let sceneManager;  // This will be initialized with the SceneManager instance
let damageAndHealthBarOffset = 5;
// let damageAndHealthBarOffsetScreenSpace = -150;
let damageAndHealthBarOffsetScreenSpace = -70; //needs to be multiplied by camera.radius and viewporrt hieght to be consistent across devices

// TODO IMPORTANT: SPAWN IN 3D WORLD SPACE, DON'T USE GUI LAYER B/C BAD PERFORMANCE
// USE Numbers from a texture atlas
function createDamagePopup(damage, position) {
    if (!sceneManager) {
        console.error('SceneManager has not been initialized.');
        return;
    }

    let text1 = new BABYLON.GUI.TextBlock();
    text1.text = damage.toString();
    text1.color = "red";
    text1.fontSize = 24;
    text1.outlineWidth = 4;
    text1.outlineColor = "black";
    sceneManager.activeGUI.addControl(text1);

    // position = new BABYLON.Vector3(position.x, position.y + damageAndHealthBarOffset, position.z );
    // Set initial position based on the world position where the damage occurred
    let startPosition = BABYLON.Vector3.Project(
        position,
        BABYLON.Matrix.Identity(),
        sceneManager.activeScene.getTransformMatrix(),
        sceneManager.activeScene.activeCamera.viewport.toGlobal(
            sceneManager.engine.getRenderWidth(),
            sceneManager.engine.getRenderHeight()
        )
    );

    startPosition.x = startPosition.x - sceneManager.engine.getRenderWidth() / 2;
    startPosition.y = startPosition.y - sceneManager.engine.getRenderHeight() / 2;;
    // let startPosition = position;
    startPosition.y = startPosition.y + damageAndHealthBarOffsetScreenSpace;

    text1.left = startPosition.x;
    text1.top = startPosition.y;

    // Animate popup (move up and fade out)
    // let animationGroup = sceneManager.activeScene.damagePopupAnimationGroup;
    let animationGroup = new BABYLON.AnimationGroup("popupAnimation", sceneManager.activeScene);

    var moveUpAnimation = new BABYLON.Animation("moveUp", "top", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var keys = [];
    keys.push({ frame: 0, value: startPosition.y });
    keys.push({ frame: 60, value: startPosition.y - 100 });
    moveUpAnimation.setKeys(keys);

    var fadeOutAnimation = new BABYLON.Animation("fadeOut", "alpha", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    keys = [];
    keys.push({ frame: 0, value: 1 });
    keys.push({ frame: 60, value: 0 });
    fadeOutAnimation.setKeys(keys);

    animationGroup.addTargetedAnimation(moveUpAnimation, text1);
    animationGroup.addTargetedAnimation(fadeOutAnimation, text1);
    animationGroup.onAnimationEndObservable.add(() => {
        sceneManager.activeGUI.removeControl(text1); // Remove text after animation
    });
    animationGroup.play();
}

function createHealthBar(mesh) {
    // Ensure the SceneManager and its GUI are properly initialized
    if (!sceneManager || !sceneManager.activeGUI) {
        console.error("SceneManager or its GUI layer is not initialized.");
        return null;
    }

    // Create a rectangle to serve as the health bar background
    var healthBar = new BABYLON.GUI.Rectangle();
    healthBar.width = "150px";
    healthBar.height = "40px";
    healthBar.cornerRadius = 5;
    healthBar.color = "Black";
    healthBar.thickness = 2;
    healthBar.background = "rgba(255,0,0,0.85)";
    healthBar.shadowBlur = 15;
    healthBar.shadowColor = 'black';

    // Add text to display health
    var healthText = new BABYLON.GUI.TextBlock();
    healthText.text = "100%";
    healthText.color = "red";
    healthText.color = "rgb(225,225,225,1)";
    healthText.outlineColor = "black";
    healthText.outlineWidth = 5;
    healthText.fontSize = 20;  // Set font size for visibility
    healthBar.addControl(healthText);

    // Add the health bar to the active GUI layer
    sceneManager.activeGUI.addControl(healthBar);
    // healthBar.show = true;
    // sceneManager.activeScene.onBeforeRenderObservable.add(() => {
    //     if (healthBar.show && PLAYER.target != null) {
    //     let startPosition = BABYLON.Vector3.Project(
    //         PLAYER.target.position,
    //         BABYLON.Matrix.Identity(),
    //         sceneManager.activeScene.getTransformMatrix(),
    //         sceneManager.activeScene.activeCamera.viewport.toGlobal(
    //             sceneManager.engine.getRenderWidth(),
    //             sceneManager.engine.getRenderHeight()
    //         )
    //     );
    //     // console.log(startPosition.x);

    //     startPosition.x = startPosition.x - sceneManager.engine.getRenderWidth()/2;
    //     startPosition.y = startPosition.y - sceneManager.engine.getRenderHeight()/2;;
    //     // healthBar.left = 10;
    //     // healthBar.top = 10;

    //     healthBar.left = startPosition.x;
    //     healthBar.top = startPosition.y;
    //     }

    // });
    healthBar.update = function (health, maxHealth) {
        // if (!healthBar || !healthBar.bar || !healthBar.text) {
        //     console.error("Invalid health bar object.");
        //     return;
        // }
        let healthPercentage = health / maxHealth * 100;
        console.log(healthPercentage);
        healthBar.width = `${1.5 * healthPercentage}px`;  // Dynamic width based on health
        healthBar.healthText.text = `${Math.floor(healthPercentage)}%`;
        // healthBar.bar.background = healthPercentage < 50 ? "red" : "green";  // Color change based on health status
    }

    // healthBar.linkOffsetY = damageAndHealthBarOffset;

    healthBar.linkOffsetY = damageAndHealthBarOffsetScreenSpace;
    healthBar.linkWithMesh(mesh);

    healthBar.healthText = healthText;
    return healthBar;
}



function createMeshLabel(mesh, message) {
    var label = new BABYLON.GUI.Rectangle(message);
    label.background = "black";
    label.height = "30px";
    label.alpha = .5;
    label.width = message.length * 11 + "px";
    label.cornerRadius = 20;
    label.thickness = 1;
    //label.linkOffsetY = 30;
    sceneManager.activeGUI.addControl(label);
    label.linkWithMesh(mesh);
    var text1 = new BABYLON.GUI.TextBlock();
    text1.text = message;
    text1.color = "white";
    label.addControl(text1)

    return label;
};

function createHighPerformantHealthbar(mesh) {

    var nameplateAnchor = new BABYLON.AbstractMesh("Nameplate Anchor", sceneManager.activeScene);
    nameplateAnchor.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    nameplateAnchor.position.y = -2.5; //-meshHieght
    nameplateAnchor.parent = mesh;


    let healthBar = HPBAR.clone("hpBar");
    // var healthBar = new BABYLON.MeshBuilder.CreatePlane("healthBar", {width: 2, height: 0.7}, sceneManager.activeScene);
    healthBar.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    // healthBar.position.y = -2.5; //-meshHieght
    healthBar.parent = nameplateAnchor;
    healthBar.scaling = new BABYLON.Vector3(1, 1, 1);


    // var healthBar = new BABYLON.MeshBuilder.CreatePlane("healthBar", {width: 2, height: 0.7}, sceneManager.activeScene);
    // healthBar.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    // // healthBar.position.y = -2.5; //-meshHieght
    // healthBar.parent = nameplateAnchor;

    // healthBar.renderOutline = true;
    // healthBar.outlineWidth = 1.1;
    // healthBar.outlineColor = new BABYLON.Color3.Black();

    // var healthBarBackground = new BABYLON.MeshBuilder.CreatePlane("healthBarBackground", {width: 2, height: 0.7}, sceneManager.activeScene);
    // healthBarBackground.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    // // healthBar.position.y = -2.5; //-meshHieght
    // healthBarBackground.parent = nameplateAnchor;
    // healthBarBackground.scaling.scaleInPlace(1.1,1.1,1.1);
    // healthBarBackground.position.x = -0.001;
    // healthBarBackground.position.z = -0.001;

    // var backgroundMaterial = new BABYLON.BackgroundMaterial("backgroundMaterial", sceneManager.activeScene);
    // backgroundMaterial.diffuseColor = new BABYLON.Color3(0, 1, 0); // Green color
    // healthBarBackground.material = backgroundMaterial;




    healthBar.update = function (health, maxHealth) {
        // if (!healthBar || !healthBar.bar || !healthBar.text) {
        //     console.error("Invalid health bar object.");
        //     return;
        // }
        let healthPercentage = health / maxHealth;
        // console.log(healthPercentage);
        healthBar.scaling.x = healthPercentage;  // Dynamic width based on health
        // healthBar.healthText.text = `${Math.floor(healthPercentage)}%`;
        // healthBar.bar.background = healthPercentage < 50 ? "red" : "green";  // Color change based on health status
    }




    return healthBar;
}

function attachHealthBar(mesh) {
    // createMeshLabel(mesh, "test" );
    // let healthBar = createHealthBar(mesh);

    let healthBar = createHighPerformantHealthbar(mesh);
    return healthBar;
    // if (healthBar) {
    //     healthBar.bar.linkWithMesh(mesh);
    //     healthBar.bar.linkOffsetY = -1;  // Adjust this offset to position the health bar above the mesh
    // }
}




function setSceneManager(manager) {
    sceneManager = manager;
}


export { createDamagePopup, setSceneManager, attachHealthBar };