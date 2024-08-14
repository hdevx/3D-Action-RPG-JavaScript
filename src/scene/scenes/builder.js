import { loadHeroModel } from '../../character/hero.js';
import { setupCamera } from '../../utils/camera.js';
import { setupPhysics } from '../../utils/physics.js';
import { setupInputHandling } from '../../movement.js';
import { setupAnim } from '../../utils/anim.js';
import { setupProcedural } from '../gen/procedural/procedural.js'
import { loadingAnim } from '../../utils/loadingAnim.js'

import { loadModels } from '../../utils/load.js';

import { Health } from '../../character/health.js';
import { setupBuilderWater } from '../../utils/water.js';
import { createBuilderSettings } from '../../utils/settings/builderSettings.js';
import { setupMainPlayerMenu } from '../../character/interact/builderMenu.js';

import { createMobileControls } from '../../utils/mobile/joystick.js';
import { addGrass } from '../../utils/plants/plants.js';
import { gridTest } from '../gen/procedural/grid/grids.js';


export async function createBuilder(engine) {
    const scene = new BABYLON.Scene(engine);



    createBuilderSettings(); //Has side effects highlight outlines generated based on cell size at start

    const spawnPoint = new BABYLON.Vector3(0, 40, -20);
    const { character, dummyAggregate } = await setupPhysics(scene, spawnPoint);

    const camera = setupCamera(scene, character, engine);
    camera.collisionRadius = new BABYLON.Vector3(12.5, 12.5, 12.5);

    if (!FAST_RELOAD) {
        // load all models, make sure parallel loading for speed
        const modelUrls = [
            "env/builder/parts.glb", "env/exterior/grass/grass.glb"];
        const heroModelPromise = loadHeroModel(scene, character);
        const [heroModel, models] = await Promise.all([
            heroModelPromise,
            loadModels(scene, modelUrls)
        ]);
        const { hero, skeleton } = heroModel;
        setupMainPlayerMenu(scene);
        createMobileControls(scene, camera, character);

        let anim = setupAnim(scene, skeleton);
        setupInputHandling(scene, character, camera, hero, anim, engine, dummyAggregate);
        character.health = new Health("Hero", 100, dummyAggregate);
        character.health.rotationCheck = hero;
        character.health.rangeCheck = character;
        PLAYER = character;
        DUMMY = dummyAggregate;

        setupEnvironment(scene);
        let LEVEL_SIZE = 20000;
        camera.maxZ = LEVEL_SIZE;
        camera.upperRadiusLimit = 1800.8044;

        createSkydome(scene, LEVEL_SIZE);

        setupPostProcessing(scene, camera);


        // let sword = addSword(scene, models["Sword2"]);
        // createTrail(scene, engine, sword, 0.2, 40, new BABYLON.Vector3(0, 0, 0.32));

        let meshes = addRoomMap(scene, models);
        hero.getChildMeshes().forEach((value) => { meshes.push(value); });


        setupLighting(scene);

        setupBuilder(scene, engine, meshes, camera);
        // gridTest(scene);

        //  disable for old editor with no grass
        // let terrain = setupTerrain(scene);
        let terrain = null;
        setupBuilderWater(scene, GRID, engine, hero, -100, 8000, terrain);
        // scene.fogColor = new BABYLON.Color3(135 / 255, 162 / 255, 204 / 255);
        scene.fogColor = new BABYLON.Color3(115 / 255, 162 / 255, 209 / 255);
        let vegatation = addGrass(scene, models);




        // // advanced lighting
        // // const spotLight = setupSpotlight(scene);
        // const light = new BABYLON.DirectionalLight("directionalLight", new BABYLON.Vector3(-800, -1400, -1000), scene);
        // light.intensity = 15.7;
        // // // light.intensity = 0;
        // // // light.shadowMinZ = 1800;
        // // // light.shadowMinZ = 2100;
        // light.shadowMinZ = 1500;
        // light.shadowMaxZ = 2300;
        // light.diffuse = new BABYLON.Color3(1, 1, 1);

        // // let lights = [light, spotLight];
        // // setupGI(scene, engine, lights, meshes);

        // setupShadows(light, hero);
        // loadingAnim(scene);

        // setupWater(scene, ground, engine, dummyAggregate, -10, 2000);



        addZReset(scene, dummyAggregate, spawnPoint);
    } else {

    }
    return scene;
}

function addZReset(scene, dummyAggregate) {
    scene.onBeforeRenderObservable.add(() => {
        if (dummyAggregate.body.transformNode._absolutePosition.y < -180) {
            dummyAggregate.resetToSpawn();
        }
    });
}

function setupBuilder(scene, engine, meshes, camera) {
    // standard setup for different themes
    // console.log(meshes);
    const fm = name => meshes.find(mesh => mesh.name === name);
    let assignedMeshes = {
        'floor': fm('Floor'),
        'wall': [fm('1_WallWindow'), fm('2_WallWood')],
        'clutter': [fm('0Barrel'), fm('1ChairGood'), fm('2Rug')],
        'door': [fm('Door'), fm('2_WallWood')],
        'base': [fm('StoneBase')],
        'roof': {
            'Roof_Left_Flat_Right_Flat': [fm('Roof_Left_Flat_Right_Flat')],
            'Roof_Left_Flat_Right_Inset': [fm('Roof_Left_Flat_Right_Inset')],
            'Roof_Left_Flat_Right_Outset': [fm('Roof_Left_Flat_Right_Outset')],

            'Roof_Left_Inset_Right_Flat': [fm('Roof_Left_Inset_Right_Flat')],
            'Roof_Left_Inset_Right_Inset': [fm('Roof_Left_Inset_Right_Inset')],
            'Roof_Left_Inset_Right_Outset': [fm('Roof_Left_Inset_Right_Outset')],

            'Roof_Left_Outset_Right_Flat': [fm('Roof_Left_Outset_Right_Flat')],
            'Roof_Left_Outset_Right_Inset': [fm('Roof_Left_Outset_Right_Inset')],
            'Roof_Left_Outset_Right_Outset': [fm('Roof_Left_Outset_Right_Outset')]
        }
    }
    assignedMeshes['clutter'][0].border = 10;
    assignedMeshes['clutter'][1].border = 10;
    assignedMeshes['clutter'][2].border = 10;
    setupProcedural(scene, engine, assignedMeshes);
}


function createSkydome(scene) {
    var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 8000.0 }, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("./assets/textures/lighting/skybox", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;

    scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
    scene.fogStart = 600.0; // Where the fog starts
    scene.fogEnd = 6000.0;   // Where the fog completely obscures everything
    scene.fogColor = new BABYLON.Color3(0.769, 0.86, 1); // Light grey fog




    return skybox;
}

function setupTerrain(scene) {
    const terrainMaterial = new BABYLON.TerrainMaterial("terrainMaterial", scene);
    terrainMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    terrainMaterial.specularPower = 64;
    terrainMaterial.mixTexture = new BABYLON.Texture("assets/textures/terrain/mixMap.png", scene);
    terrainMaterial.diffuseTexture1 = new BABYLON.Texture("assets/textures/terrain/floor.png", scene);
    terrainMaterial.diffuseTexture2 = new BABYLON.Texture("assets/textures/terrain/rock.png", scene);
    terrainMaterial.diffuseTexture3 = new BABYLON.Texture("assets/textures/terrain/grass.png", scene);

    terrainMaterial.diffuseTexture1.uScale = terrainMaterial.diffuseTexture1.vScale = 15;
    terrainMaterial.diffuseTexture2.uScale = terrainMaterial.diffuseTexture2.vScale = 8;
    terrainMaterial.diffuseTexture3.uScale = terrainMaterial.diffuseTexture3.vScale = 23;
    const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap("ground", "assets/textures/terrain/hieghtMap.png", {
        width: 10000,
        height: 10000,
        subdivisions: 100,
        minHeight: 0,
        maxHeight: 50,
        onReady: function (ground) {
            ground.position.y = -160.05;
            ground.material = terrainMaterial;
            ground.receiveShadows = true;
            // ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.HeightmapImpostor, { mass: 0, restitution: 0.0, friction: 100.8 }, scene);
            // setTimeout(() => scene.physicsEnabled = true, 1000); // Enable physics after the ground is ready
            var groundAggregate;
            groundAggregate = new BABYLON.PhysicsAggregate(ground, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution: 0.0, friction: 1000000000.8 }, scene);
            setTimeout(() => {
                scene.physicsEnabled = true;
            }, 10);
        }
    }, scene);
    ground.material = terrainMaterial;

    return ground;
}




function addRoomMap(scene, models) {
    let meshes = [];
    let parts = models["parts"];
    // let town_map = models["inn_map_procedural_individual"];
    parts.name = "parts";
    // parts.position.y = 10;

    parts.scaling = new BABYLON.Vector3(5, 5, 5);

    parts.position.y = -100;

    parts.getChildMeshes().forEach(mesh => {
        mesh.material.metallic = 0;
        mesh.receiveShadows = true;
        // set levels
        meshes.push(mesh);

        if (mesh.name === "Floor") {
            mesh.position.y = 100 / 5 + 0.023;
        }
        if (mesh.name === "2Rug") {
            mesh.position.y = 100 / 5 + 0.03;
        }
        if (mesh.name === "1ChairGood") {
            mesh.position.y = 100 / 5 + 0.023;
            mesh.position.x = 5;
            mesh.position.z = 3;
            mesh.rotation = new BABYLON.Vector3(0, -1.3, 0);
        }


        let town_mapCollision = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution: 0.0, friction: 1.0 }, scene);

    });

    scene.physicsEnabled = true;



    return meshes;
}

function setupEnvironment(scene) {
    scene.clearColor = new BABYLON.Color3.Black();
    const environmentURL = "./assets/textures/lighting/environment.env";
    const environmentMap = BABYLON.CubeTexture.CreateFromPrefilteredData(environmentURL, scene);
    scene.environmentTexture = environmentMap;
    scene.environmentIntensity = 1.0;
    scene.environmentIntensity = 0.0;
}

async function LoadLiLGUI() {
    return BABYLON.Tools.LoadScriptAsync("https://cdn.jsdelivr.net/npm/lil-gui@0.17.0/dist/lil-gui.umd.min.js");
}



function setupSpotlight(scene) {
    // Create a spotlight
    var spotlight = new BABYLON.SpotLight("spotLight", new BABYLON.Vector3(0, 40, 80), new BABYLON.Vector3(0, -1, 0), Math.PI / 3, 2, scene);
    spotlight.diffuse = new BABYLON.Color3(1, 1, 1); // White light
    spotlight.specular = new BABYLON.Color3(1, 1, 1);
    // Mixed GI and normal
    // spotlight.intensity = 1000000;
    // spotlight.intensity = 1000000;
    // GI Only
    spotlight.intensity = 10000.0000;
    // spotlight.angle = 166.1005;
    spotlight.angle = 140.1005;

    var frameRate = 30;
    var animation = new BABYLON.Animation("spotlightAnimation", "direction", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

    var keyFrames = [];
    var radius = 1; // Radius of the circular path
    var yPosition = -1; // Y position to keep the light pointing downwards

    for (var i = 0; i <= frameRate; i++) {
        var angle = (i / frameRate) * 2 * Math.PI; // Full circle in one second
        keyFrames.push({
            frame: i,
            value: new BABYLON.Vector3(Math.sin(angle) * radius, yPosition, Math.cos(angle) * radius)
        });
    }

    animation.setKeys(keyFrames);
    spotlight.animations.push(animation);

    scene.beginAnimation(spotlight, 0, frameRate, true, 0.2);

    return spotlight;

}

function setupLighting(scene) {


    // var light = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
    // light.intensity = 1.7;

    // light.diffuse = new BABYLON.Color3(1, 1, 1);
    // light.specular = new BABYLON.Color3(0, 1, 0);
    // light.groundColor = new BABYLON.Color3(0, 0.5, 1);

    // light.visible = true;

    var hemisphericLight = new BABYLON.HemisphericLight("hemisphericLight", new BABYLON.Vector3(0, 1, 0), scene);
    hemisphericLight.intensity = 1.15; // Adjust intensity of the light
    hemisphericLight.diffuse = new BABYLON.Color3(1, 183 / 255, 124 / 255); // White light
    hemisphericLight.specular = new BABYLON.Color3(0.0, 0.0, 0.0); // Gray specular highlight
    hemisphericLight.groundColor = new BABYLON.Color3(52 / 255, 63 / 255, 112 / 255); // Dark ground color


    return hemisphericLight;
}

function setupShadows(light, shadowCaster) {

    const shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
    // shadowGenerator.useExponentialShadowMap = false;
    shadowGenerator.darkness = 0.3;
    // shadowGenerator.darkness = 0.6;
    // shadowGenerator.darkness = 1;
    shadowGenerator.usePoissonSampling = true;
    shadowGenerator.nearPlane = 1621.2952;
    shadowGenerator.farPlane = 2007.0404;
    // shadowGenerator.minZ = -1000;
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
    pipeline.fxaaEnabled = true;   // Enable FXAA

    pipeline.bloomEnabled = true;  // Enable bloom
    pipeline.bloomThreshold = 1.8500;//only affect sun not clouds

    const imgProc = pipeline.imageProcessing;

    // Apply contrast and exposure adjustments
    imgProc.contrast = 2.0;
    imgProc.exposure = 1.8;

    // imgProc.contrast = 2.3;
    imgProc.contrast = 2.6;
    imgProc.exposure = 2.6;

    // Enable tone mapping
    // imgProc.toneMappingEnabled = true;
    // imgProc.toneMappingType = BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;

    // Apply vignette effect
    imgProc.vignetteEnabled = true;
    imgProc.vignetteWeight = 2.6;
    imgProc.vignetteColor = new BABYLON.Color4(0, 0, 0, 1);
    imgProc.vignetteBlendMode = BABYLON.ImageProcessingConfiguration.VIGNETTEMODE_MULTIPLY;
    //     var sharpen = new BABYLON.SharpenPostProcess("sharpen", 1.0, camera);
    // sharpen.edgeAmount = 0.15;  // Increase or decrease for more or less sharpening
    // sharpen.colorAmount = 1.0;

}
