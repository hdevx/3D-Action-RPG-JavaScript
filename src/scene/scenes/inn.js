import { loadHeroModel } from '../../character/hero.js';
import { setupCamera } from '../../utils/camera.js';
import { setupPhysics } from '../../utils/physics.js';
import { setupInputHandling } from '../../movement.js';
import { setupAnim } from '../../utils/anim.js';

import { loadModels } from '../../utils/load.js';

import { Health } from '../../character/health.js';

export async function createInn(engine) {
    const scene = new BABYLON.Scene(engine);

    const spawnPoint = new BABYLON.Vector3(0, 80, 80);
    const { character, dummyAggregate } = await setupPhysics(scene, spawnPoint);

    const camera = setupCamera(scene, character, engine);
    camera.collisionRadius = new BABYLON.Vector3(12.5, 12.5, 12.5);
    // load all models, make sure parallel loading for speed
    const modelUrls = [
        "env/interior/inn/inn_map_procedural.glb"];
    const heroModelPromise = loadHeroModel(scene, character);
    const [heroModel, models] = await Promise.all([
        heroModelPromise,
        loadModels(scene, modelUrls)
    ]);
    const { hero, skeleton } = heroModel;

    let anim = setupAnim(scene, skeleton);
    setupInputHandling(scene, character, camera, hero, anim, engine, dummyAggregate);
    character.health = new Health("Hero", 100, dummyAggregate);
    character.health.rotationCheck = hero;
    character.health.rangeCheck = character;
    PLAYER = character;

    setupEnvironment(scene);

    setupPostProcessing(scene, camera);


    // let sword = addSword(scene, models["Sword2"]);
    // createTrail(scene, engine, sword, 0.2, 40, new BABYLON.Vector3(0, 0, 0.32));

    let meshes = addRoomMap(scene, models);
    hero.getChildMeshes().forEach((value) => { meshes.push(value); });
    // console.log(hero.getChildMeshes());


    setupLighting(scene);


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

    return scene;
}
function setupGI(scene, engine, lights, meshes) {
    // TODO set defaultRSMTextureRatio to 30 for mobile 
    const defaultRSMTextureRatio = 8;
    const defaultGITextureRatio = 2;

    const outputDimensions = {
        width: engine.getRenderWidth(true),
        height: engine.getRenderHeight(true),
    };

    const rsmTextureDimensions = {
        width: Math.floor(engine.getRenderWidth(true) / defaultRSMTextureRatio),
        height: Math.floor(engine.getRenderHeight(true) / defaultRSMTextureRatio),
    };

    const giTextureDimensions = {
        width: Math.floor(engine.getRenderWidth(true) / defaultGITextureRatio),
        height: Math.floor(engine.getRenderHeight(true) / defaultGITextureRatio),
    };


    // high performance settings
    // texture ratio 45
    // radius 0.65   - 5.4 
    // intesity 0.004
    // edge artifact correction 0.41
    // number of sampes 100-1000 - 
    const giRSMs = [];

    giRSMs.push(new BABYLON.GIRSM(new BABYLON.ReflectiveShadowMap(scene, lights[1], rsmTextureDimensions)));

    giRSMs.forEach((girsm) => girsm.rsm.forceUpdateLightParameters = true); // for the demo, don't do this in production!

    const giRSMMgr = new BABYLON.GIRSMManager(scene, outputDimensions, giTextureDimensions, 2048);

    giRSMMgr.addGIRSM(giRSMs);

    giRSMMgr.enable = true;

    meshes.forEach((mesh) => {
        giRSMs.forEach((girsm) => girsm.rsm.addMesh(mesh));
        if (mesh.material) {
            giRSMMgr.addMaterial(mesh.material);
            // mesh.material.environmentIntensity = 0;
            // mesh.material.directIntensity = 0;
            mesh.material.emissiveColor = new BABYLON.Color3(0, 0, 0);


            // ground for more natural spotlight
            // mesh.material.metallic = 0.5;
            // mesh.material.directIntensity = 0.0100;

            // old starting levels for GI
            mesh.material.metallic = 0.8;
            mesh.material.roughness = 1.0;
            mesh.material.directIntensity = 0.15;

            // new inn lighting
            mesh.material.metallic = 0.6;
            mesh.material.roughness = 1.0;
            mesh.material.directIntensity = 0.15;


            // only GI 
            // mesh.material.metallic = 0.0;
            // mesh.material.roughness = 1.0;
            // mesh.material.directIntensity = 0.09;

            // mesh.scaling.x = -mesh.scaling.x;

            // when not using gi, 
            // mesh.material.metallic = 1.0;
            // mesh.material.roughness = 1.0;
            // mesh.material.directIntensity = 0.15;
        }
    });





    giRSMMgr.giRSM.forEach((giRSM) => {
        // Mixed GI and Normal
        giRSM.numSamples = 400;
        giRSM.intensity = 0.01;
        giRSM.radius = 0.35;

        // GI only
        // giRSM.numSamples = 1000;
        // giRSM.intensity = 0.001;
        // giRSM.radius = 0.15;
    });

    // giRSMMgr.blurKernel = 20;

    let guiParams = {
        rsmTextureRatio: 8,
        giTextureRatio: 2,
    };

    const resize = () => {
        outputDimensions.width = engine.getRenderWidth(true);
        outputDimensions.height = engine.getRenderHeight(true);

        rsmTextureDimensions.width = Math.floor(engine.getRenderWidth(true) / guiParams.rsmTextureRatio);
        rsmTextureDimensions.height = Math.floor(engine.getRenderHeight(true) / guiParams.rsmTextureRatio);

        giTextureDimensions.width = Math.floor(engine.getRenderWidth(true) / guiParams.giTextureRatio);
        giTextureDimensions.height = Math.floor(engine.getRenderHeight(true) / guiParams.giTextureRatio);

        giRSMs.forEach((girsm) => girsm.rsm.setTextureDimensions(rsmTextureDimensions));
        giRSMMgr.setOutputDimensions(outputDimensions);
        giRSMMgr.setGITextureDimensions(giTextureDimensions);
    };

    engine.onResizeObservable.add(() => {
        resize();
    });

    resize();


    GIDebug(scene, giRSMMgr, engine);




}

function addRoomMap(scene, models) {
    let meshes = [];
    let town_map = models["inn_map_procedural"];
    // let town_map = models["inn_map_procedural_individual"];
    town_map.name = "inn map";
    town_map.position.y = 10;

    town_map.scaling = new BABYLON.Vector3(5, 5, 5);


    town_map.getChildMeshes().forEach(mesh => {
        mesh.material.metallic = 0;
        mesh.receiveShadows = true;
        // set levels
        meshes.push(mesh);

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

async function GIDebug(scene, giRSMMgr, engine) {
    await LoadLiLGUI();

    const gui = new lil.GUI({ title: "RSM Global Illumination" });

    gui.domElement.style.marginTop = "60px";
    // gui.domElement.id = domElementName;


    const firstRSMParams = giRSMMgr.giRSM[0];
    let guiInputs = {
        rsmTextureRatio: 8,
        giTextureRatio: 2,
    }
    const params = {
        // Global
        enabled: giRSMMgr.enable,
        fxaa: true,
        disableShadows: false,

        // RSM
        rsmTextureRatio: guiInputs.rsmTextureRatio,

        // // GI
        useFullRSMTexture: firstRSMParams.useFullTexture,
        radius: firstRSMParams.radius,
        intensity: firstRSMParams.intensity,
        edgeArtifactCorrection: firstRSMParams.edgeArtifactCorrection,
        numSamples: firstRSMParams.numSamples,
        rotateSamples: firstRSMParams.rotateSample,
        noiseFactor: firstRSMParams.noiseFactor,
        giTextureRatio: guiInputs.giTextureRatio,
        giTextureType: giRSMMgr.giTextureType,
        showOnlyGI: giRSMMgr.showOnlyGI,

        // // GI - Blur
        enableBlur: giRSMMgr.enableBlur,
        blurKernel: giRSMMgr.blurKernel,
        bilateralBlurDepthThreshold: giRSMMgr.blurDepthThreshold,
        bilateralBlurNormalThreshold: giRSMMgr.blurNormalThreshold,
        useQualityBilateralBlur: giRSMMgr.useQualityBlur,
        fullSizeBlur: giRSMMgr.fullSizeBlur,
        bilateralUpsamplerKernel: giRSMMgr.upsamplerKernel,
        useQualityBilateralUpsampling: giRSMMgr.useQualityUpsampling,

        // GPU timings
        counter: "",
    };

    // gui
    //     .add(params, "disableShadows")
    //     .name("Disable shadows")
    //     .onChange((value) => {
    //         console.log(giRSMMgr);
    //         giRSMMgr.giRSM.forEach((girsm) => girsm.rsm.light.shadowEnabled = !value);
    //         if (!checkCounterList()) {
    //             createGPUTimingsGUI();
    //         }
    //     });
    gui
        .add(params, "rsmTextureRatio", 1, 60, 1)
        .name("Texture ratio")
        .onChange((value) => {
            giRSMMgr.giRSM.forEach((girsm) => girsm.rsm.setTextureDimensions({
                width: Math.floor(engine.getRenderWidth(true) / value),
                height: Math.floor(engine.getRenderHeight(true) / value),
            }));
        });



    gui
        .add(params, "enabled")
        .name("Enabled")
        .onChange((value) => {
            giRSMMgr.enable = value;
        });

    let fxaa = null;
    gui
        .add(params, "fxaa")
        .name("FXAA")
        .onChange((value) => {
            fxaa?.dispose();
            fxaa = null;
            if (value) {
                fxaa = new BABYLON.FxaaPostProcess("fxaa", 1, scene.activeCamera);
            }
        });

    gui
        .add(params, "showOnlyGI")
        .name("Show only GI")
        .onChange((value) => {
            giRSMMgr.showOnlyGI = value;
        });

    gui
        .add(params, "radius", 0, 6, 0.01)
        .name("Radius")
        .onChange((value) => {
            giRSMMgr.giRSM.forEach((girsm) => girsm.radius = value);
        });

    gui
        .add(params, "intensity", 0, 1, 0.001)
        .name("Intensity")
        .onChange((value) => {
            giRSMMgr.giRSM.forEach((girsm) => girsm.intensity = value);
        });

    gui
        .add(params, "edgeArtifactCorrection", 0, 1, 0.01)
        .name("Edge artifact correction")
        .onChange((value) => {
            giRSMMgr.giRSM.forEach((girsm) => girsm.edgeArtifactCorrection = value);
        });

    gui
        .add(params, "numSamples", 16, 2048, 16)
        .name("Number of samples")
        .onChange((value) => {
            giRSMMgr.giRSM.forEach((girsm) => girsm.numSamples = value);
        });

    gui
        .add(params, "rotateSamples")
        .name("Rotate samples")
        .onChange((value) => {
            giRSMMgr.giRSM.forEach((girsm) => girsm.rotateSample = value);
        });

    gui
        .add(params, "noiseFactor", 0, 1000, 0.1)
        .name("Noise factor")
        .onChange((value) => {
            giRSMMgr.giRSM.forEach((girsm) => girsm.noiseFactor = value);
        });

    gui
        .add(params, "enableBlur")
        .name("Enable Blur")
        .onChange((value) => {
            giRSMMgr.enableBlur = value;
        });
    gui
        .add(params, "blurKernel", 1, 64, 1)
        .name("Blur kernel")
        .onChange((value) => {
            giRSMMgr.blurKernel = value;
        });
    gui
        .add(params, "useQualityBilateralBlur")
        .name("Use quality blur")
        .onChange((value) => {
            giRSMMgr.useQualityBlur = value;
        });


    // giRSMMgr.enable = true;
    // giRSMMgr.showOnlyGI = true;

    return guiInputs;
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
