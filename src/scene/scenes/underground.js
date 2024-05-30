import { loadHeroModel } from '../../character/hero.js';
import { setupCamera } from '../../utils/camera.js';
import { setupPhysics } from '../../utils/physics.js';
import { setupInputHandling } from '../../movement.js';
import { setupAnim } from '../../utils/anim.js';

import { setupEnemies } from '../../character/enemy.js';

import { Health } from '../../character/health.js';


import { loadModels } from '../../utils/load.js';

export async function createUnderground(engine) {
    const scene = new BABYLON.Scene(engine);

    const { terrain, terrainMaterial } = setupTerrain(scene);
    setupEnvironment(scene);
    //   createSkydome(scene);


    const { character, dummyAggregate } = await setupPhysics(scene);
    const camera = setupCamera(scene, character);
    const { hero, skeleton } = await loadHeroModel(scene, character);
    //   move anim with character model
    let anim = setupAnim(scene, skeleton);
    setupInputHandling(scene, character, camera, hero, anim, engine, dummyAggregate);
    character.health = new Health("Hero", 100, dummyAggregate);
    character.health.rotationCheck = hero;
    character.health.rangeCheck = character;
    PLAYER = character;

    const light = setupLighting(scene);
    addTorch(scene, new BABYLON.Vector3(1, 10, 1));
    //   todo huge performance hit
    //   setupShadows(light, hero);
    // setupPostProcessing(scene,camera);
    setUpFollowCamera(scene, camera, character);
    setupTurnCamera(scene, camera, engine);

    const modelUrls = ["characters/enemy/slime/Slime1.glb", "characters/weapons/Sword2.glb"];
    const models = await loadModels(scene, modelUrls);

    const slime1 = models["Slime1"];

    setupEnemies(scene, character, terrain, 7, slime1);



    return scene;
}




function setUpFollowCamera(scene, camera, character) {
    let desiredRadius = 50;
    scene.onBeforeRenderObservable.add(() => {
        if (character.position) {

            const offsetPosition = character.position.add(new BABYLON.Vector3(0, 10, 0));

            // Update camera target smoothly towards the character position
            // camera.setTarget(BABYLON.Vector3.Lerp(camera.getTarget(), offsetPosition, 0.5));
            camera.setTarget(BABYLON.Vector3.Lerp(camera.getTarget(), offsetPosition, 0.1));
            camera.radius = BABYLON.Scalar.Lerp(camera.radius, desiredRadius, 0.05); // Smoothly interpolate to the desired radius
            // You can also adjust camera radius dynamically if needed

            // camera.beta = 3 * Math.PI / 8;
        }
    });


}

function setupTurnCamera(scene, camera, engine) {
    var cameraRotationSpeed = 2.25;  // Adjust this value for faster or slower rotation
    var keyStates = {};

    // Function to handle keydown event
    function onKeyDown(event) {
        keyStates[event.key] = true;
    }

    // Function to handle keyup event
    function onKeyUp(event) {
        keyStates[event.key] = false;
    }

    // Add event listeners to the window
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    scene.onBeforeRenderObservable.add(() => {
        if (keyStates['a']) {
            (camera.alpha);
            camera.alpha += cameraRotationSpeed * engine.getDeltaTime() / 1000;
        }

        // Check if 'D' is pressed for rotating right
        if (keyStates['d']) {
            camera.alpha -= cameraRotationSpeed * engine.getDeltaTime() / 1000;
        }
    });

}

function setupEnvironment(scene) {
    scene.clearColor = new BABYLON.Color3.Black();
    const environmentURL = "https://playground.babylonjs.com/textures/environment.env";
    const environmentMap = BABYLON.CubeTexture.CreateFromPrefilteredData(environmentURL, scene);
    scene.environmentTexture = environmentMap;
    scene.environmentIntensity = 0.0;
}

function createSkydome(scene) {
    // const skydome = BABYLON.MeshBuilder.CreateSphere("skyDome", {diameter: 20000, segments: 32}, scene);
    // const skyMaterial = new BABYLON.StandardMaterial("skyMat", scene);
    // skyMaterial.backFaceCulling = false;
    // skyMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    // skyMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    // skyMaterial.emissiveTexture = new BABYLON.Texture("assets/textures/sky.png", scene);
    // skydome.material = skyMaterial;

    var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 10000.0 }, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("https://playground.babylonjs.com/textures/skybox", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;

    return skybox;
}



function setupTerrain(scene) {
    const terrainMaterial = new BABYLON.TerrainMaterial("terrainMaterial", scene);
    terrainMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    terrainMaterial.specularPower = 64;
    terrainMaterial.mixTexture = new BABYLON.Texture("assets/textures/terrain/mixMap.png", scene);
    terrainMaterial.diffuseTexture1 = new BABYLON.Texture("assets/textures/terrain/tileDark.png", scene);
    terrainMaterial.diffuseTexture2 = new BABYLON.Texture("assets/textures/terrain/grassRock.png", scene);
    terrainMaterial.diffuseTexture3 = new BABYLON.Texture("assets/textures/terrain/grass.png", scene);

    terrainMaterial.diffuseTexture1.uScale = terrainMaterial.diffuseTexture1.vScale = 25;
    terrainMaterial.diffuseTexture2.uScale = terrainMaterial.diffuseTexture2.vScale = 20;
    terrainMaterial.diffuseTexture3.uScale = terrainMaterial.diffuseTexture3.vScale = 23;

    const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap("ground", "assets/textures/terrain/hieghtMap.png", {
        width: 1000,
        height: 1000,
        subdivisions: 100,
        minHeight: 0,
        maxHeight: -30,
        onReady: function (ground) {
            ground.position.y = -10.05;
            ground.material = terrainMaterial;
            ground.receiveShadows = true;
            // ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.HeightmapImpostor, { mass: 0, restitution: 0.0, friction: 100.8 }, scene);
            // setTimeout(() => scene.physicsEnabled = true, 1000); // Enable physics after the ground is ready
            setTimeout(() => {
                var groundAggregate;
                groundAggregate = new BABYLON.PhysicsAggregate(ground, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution: 0.0, friction: 1000000000.8 }, scene);
                setTimeout(() => {
                    scene.physicsEnabled = true;
                }, 1000);
            }, 1000);

        }
    }, scene);

    return { terrain: ground, terrainMaterial: terrainMaterial };
}



function setupLighting(scene) {
    var light = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.5;

    light.diffuse = new BABYLON.Color3(1, 1, 1);
    light.specular = new BABYLON.Color3(1, 1, 1);
    // light.groundColor = new BABYLON.Color3(0.7, 0.7, 0.7);
    light.groundColor = new BABYLON.Color3(1.0, 1.0, 1.0);


    return light;
}

function setupShadows(light, shadowCaster) {

    const shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
    shadowGenerator.darkness = 0.6;
    shadowGenerator.usePoissonSampling = true;
    // shadowGenerator.nearPlane = 400;
    // shadowGenerator.farPlane = 10000;
    shadowGenerator.addShadowCaster(shadowCaster);
}


function setupPostProcessing(scene, camera) {
    // scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
    const pipeline = new BABYLON.DefaultRenderingPipeline(
        "default", // The name of the pipeline
        true,     // Do you want HDR textures?
        scene,    // The scene linked to
        [camera]  // The list of cameras to be attached to
    );

    // Configure effects
    pipeline.samples = 4;  // MSAA anti-aliasing
    pipeline.bloomEnabled = true;  // Enable bloom
    pipeline.fxaaEnabled = true;   // Enable FXAA

    const imgProc = pipeline.imageProcessing;

    // Apply contrast and exposure adjustments
    imgProc.contrast = 1.3;
    imgProc.exposure = 1.7;

    // Enable tone mapping
    imgProc.toneMappingEnabled = true;
    imgProc.toneMappingType = BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;

    // Apply vignette effect
    imgProc.vignetteEnabled = true;
    imgProc.vignetteWeight = 2.1;
    imgProc.vignetteColor = new BABYLON.Color4(0, 0, 0, 1);
    imgProc.vignetteBlendMode = BABYLON.ImageProcessingConfiguration.VIGNETTEMODE_MULTIPLY;

}

function addTorch(scene, position) {
    const light2 = new BABYLON.PointLight("pointLight", position, scene);
    light2.diffuse = new BABYLON.Color3(1, 0.29, 0);
}



