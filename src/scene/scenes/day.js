import { loadHeroModel } from '../../character/hero.js';
import { setupCamera } from '../../utils/camera.js';
import { setupPhysics } from '../../utils/physics.js';
import { setupInputHandling } from '../../movement.js';
import { setupAnim } from '../../utils/anim.js';
import { setupWater } from '../../utils/water.js';

import { loadModels } from '../../utils/load.js';

import { setupEnemies } from '../../character/enemy.js';
import { Health } from '../../character/health.js';

import { placeVeg } from "../gen/parts/veg.js";

import { createCastle } from "../gen/LLM.js";
import { createCastleWFC } from "../gen/WFC.js";



export async function createDayDynamicTerrain(engine) {
    const scene = new BABYLON.Scene(engine);

    setupEnvironment(scene);


    const spawnPoint = new BABYLON.Vector3(65.261, -900, 274.181);
    const { character, dummyAggregate } = await setupPhysics(scene, spawnPoint);

    const terrain = await createTerrainDiamond(scene, 10000);

    BABYLON.NodeMaterial.ParseFromSnippetAsync("#AT7YY5#132", scene).then(function (nodeMaterial) {
        // Apply the loaded material to your terrain mesh
        terrain.material = nodeMaterial;
        terrain.material.transparencyMode = BABYLON.Material.MATERIAL_OPAQUE;
    });

    const camera = setupCamera(scene, character, engine);
    const { hero, skeleton } = await loadHeroModel(scene, character);

    let anim = setupAnim(scene, skeleton);
    setupInputHandling(scene, character, camera, hero, anim, engine, dummyAggregate);
    character.health = new Health("Hero", 100, dummyAggregate);
    character.health.rotationCheck = hero;
    character.health.rangeCheck = character;
    PLAYER = character;

    camera.alpha = 5.3805;
    camera.beta = 1.4479;
    camera.radius = 78.5573;
    camera.wheelDeltaPercentage = 0.0200;
    // camera.upperBetaLimit = Math.PI / 2; // Stops at the horizon (90 degrees)
    camera.upperBetaLimit = 3.13;
    camera.lowerRadiusLimit = 4;  // Minimum distance to target (closest zoom)
    camera.upperRadiusLimit = 3391.2407; // Maximum distance from target (farthest zoom)

    const light = setupLighting(scene);

    //   load all models
    const modelUrls = ["characters/enemy/slime/Slime1.glb", "characters/weapons/Sword2.glb", "util/HPBar.glb", "env/night/Bridge.glb", "env/night/House Parts.glb"];
    const models = await loadModels(scene, modelUrls);
    const slime1 = models["Slime1"];

    const sword = models["Sword2"];
    HPBAR = models["HPBar"];
    var blackMaterial = new BABYLON.StandardMaterial("blackMat", scene);
    blackMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0); // Black color
    blackMaterial.specularColor = new BABYLON.Color3(0, 0, 0); // No specular highlight
    // HPBAR.getChildMeshes()[1].material = blackMaterial;
    HPBAR.getChildMeshes()[1].material = blackMaterial;

    const shaderMaterial = new BABYLON.ShaderMaterial(
        "hpbar",
        scene,
        {
            vertex: "../../../shaders/hp/hp",
            fragment: "../../../shaders/hp/hp",
        },
        {
            attributes: ["position", "normal", "uv"],
            uniforms: ["worldViewProjection", "iTime", "iResolution", "iChannel0", "iChannel1"]
        },
    );

    var iChannel0 = new BABYLON.Texture("assets/textures/effects/ripple.png", scene);
    var iChannel1 = new BABYLON.Texture("assets/textures/effects/bar.png", scene);

    shaderMaterial.setTexture("iChannel0", iChannel0);
    shaderMaterial.setTexture("iChannel1", iChannel1);
    shaderMaterial.setFloat("iTime", 0);
    shaderMaterial.setVector2("iResolution", new BABYLON.Vector2(engine.getRenderWidth(), engine.getRenderHeight()));

    var iTime = 0;
    scene.onBeforeRenderObservable.add(() => {
        iTime += engine.getDeltaTime() / 1000.0;
        shaderMaterial.setFloat("iTime", iTime);
    });
    HPBAR.getChildMeshes()[0].material = shaderMaterial;

    let childMeshes = sword.getChildMeshes();

    // To find a specific child by name
    let specificChild = childMeshes.find(mesh => mesh.name === "mesh");
    if (specificChild.material && specificChild.material instanceof BABYLON.PBRMaterial) {
        // Set metallic and roughness properties
        specificChild.material.metallic = 1;
        specificChild.material.roughness = 1;
    } else {
        console.error("Sword material is not a PBRMaterial or is not assigned");
    }

    function findAllMeshesByName(meshes, name) {
        let foundMeshes = [];
        meshes.forEach(mesh => {
            if (mesh.name === name) {
                foundMeshes.push(mesh);
            }
            if (mesh.getChildren) {
                foundMeshes = foundMeshes.concat(findAllMeshesByName(mesh.getChildren(), name));
            }
        });
        return foundMeshes;
    }

    // Usage
    const allMeshesWithName = findAllMeshesByName(scene.meshes, "mixamorig:RightHand");
    console.log(allMeshesWithName[0]);
    attachSwordToBone(specificChild, allMeshesWithName[0], "mixamorig:RightHand");

    setupEnemies(scene, character, terrain, 7, slime1);




    models["Bridge"].getChildMeshes()[0].material.environmentIntensity = 0;
    const Bridge = models["Bridge"].getChildMeshes()[0].clone("Bridge");
    Bridge.scaling.scaleInPlace(50, 50, 50);
    Bridge.position = new BABYLON.Vector3(-31.532, -1100.051, 537.431);
    Bridge.rotation = new BABYLON.Vector3(0, (4.14), 0);
    // let BridgeCollision = new BABYLON.PhysicsImpostor(Bridge, BABYLON.PhysicsShapeType.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);
    Bridge.refreshBoundingInfo(true);
    Bridge.computeWorldMatrix(true);
    let BridgeCollision = new BABYLON.PhysicsAggregate(Bridge, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution: 0.0, friction: 1.0 }, scene);


    var houseParts = models["House Parts"].getChildMeshes();
    // Loop through each child mesh and set the environmentIntensity
    houseParts.forEach(function (mesh) {
        if (mesh.material) { // Check if the mesh has a material
            mesh.material.environmentIntensity = 0;
        } else {
            // console.log("No material found on", mesh.name); // Log if there's no material on a mesh
        }
    });
    const House = models["House Parts"].clone("House Parts");
    House.scaling.scaleInPlace(18, 18, 18);
    House.position = new BABYLON.Vector3(151.532, -1000.051, 700);
    House.rotation = new BABYLON.Vector3(0, (5 * (2 * 3.14) / 6) + 0.2, 0);

    // const House2 = models["House Parts"].clone("House Parts");
    // House2.scaling.scaleInPlace(18, 18, 30);
    // House2.position = new BABYLON.Vector3(100.532, -1000.051, 700);
    // House2.rotation = new BABYLON.Vector3(0, (1 * (2 * 3.14) / 6) + 0.2, 0);

    const House2 = models["House Parts"].clone("House Parts");
    House2.scaling.scaleInPlace(18, 18, 30);
    House2.position = new BABYLON.Vector3(100.532, -1000.051, 700);
    House2.rotation = new BABYLON.Vector3(0, (1 * (2 * 3.14) / 6) + 0.2, 0);


    // if (DEBUG) {
    //     const gizmoManager = new BABYLON.GizmoManager(scene);
    //     gizmoManager.usePointerToAttachGizmos = true; // Attach gizmos by pointer interaction
    //     gizmoManager.positionGizmoEnabled = true; // Enable position gizmo
    //     gizmoManager.rotationGizmoEnabled = true; // Enable rotation gizmo
    //     gizmoManager.scaleGizmoEnabled = true; // Enable scale gizmo
    // }

    // placeVeg(scene);
    // createCastle(scene);
    createCastleWFC(scene);

    createDust(scene, engine);
    // createFogSwirl(scene, engine);

    //   todo huge performance hit
    // maybe have light shadow, and detailed shadow in settings toggle
    // setupShadows(light, hero);
    let LEVEL_SIZE = 20000;
    camera.maxZ = LEVEL_SIZE;

    setupWater(scene, terrain, engine, hero, -2000, LEVEL_SIZE);
    setupPostProcessing(scene, camera);
    createSkydome(scene, LEVEL_SIZE);

    return scene;
}


function createFogSwirl(scene, engine) {
    // Emitters
    var emitter0 = BABYLON.Mesh.CreateBox("emitterClouds", 0.1, scene);
    emitter0.isVisible = false;

    // Custom shader for particles
    BABYLON.Effect.ShadersStore["fogSwirlFragmentShader"] =
        "#ifdef GL_ES\n" +
        "precision highp float;\n" +
        "#endif\n" +

        "varying vec2 vUV;\n" +
        "varying vec4 vColor;\n" +

        "uniform sampler2D diffuseSampler;\n" +
        "uniform float time;\n" +

        "void main(void) {\n" +
        "    vec2 position = vUV;\n" +
        "    vec2 center = vec2(0.5, 0.5);\n" +
        "    float distanceFromCenter = distance(position, center);\n" +

        "    // Creating the swirl effect\n" +
        "    float angle = time * 2.0 + distanceFromCenter * 10.0;\n" +
        "    vec2 swirl = vec2(sin(angle), cos(angle));\n" +
        "    float color = sin(angle);\n" +

        "    // Apply the swirling effect on texture coordinate\n" +
        "    vec2 swirledUV = position + swirl * 0.05;\n" +

        "    vec4 baseColor = texture2D(diffuseSampler, swirledUV);\n" +

        "    // Fade-in effect over time, adjust '20.0' to control speed of fade-in\n" +
        "    float fade = smoothstep(0.0, 1.0, time * 20.0 - distanceFromCenter * 4.0);\n" +

        "    gl_FragColor = baseColor * vColor * vec4(vec3(color), fade);\n" +
        "}\n" +
        "";

    // Particles
    var particleSystem = new BABYLON.GPUParticleSystem("particles", 50, scene, effect);
    particleSystem.particleTexture = new BABYLON.Texture("./assets/textures/effects/fogSwirl3.png", scene);
    particleSystem.minSize = 100.5;
    particleSystem.maxSize = 200.8;
    particleSystem.minLifeTime = 20.5;
    particleSystem.maxLifeTime = 22.0;
    particleSystem.minEmitPower = 0.01;
    particleSystem.maxEmitPower = 0.02;
    particleSystem.emitter = emitter0;
    particleSystem.emitRate = 10;
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    particleSystem.direction1 = new BABYLON.Vector3(-1, 10, -1);
    particleSystem.direction2 = new BABYLON.Vector3(1, 10, 1);
    particleSystem.color1 = new BABYLON.Color4(1, 1, 1, 1);
    particleSystem.color2 = new BABYLON.Color4(1, 1, 1, 1);
    particleSystem.gravity = new BABYLON.Vector3(0, -1.0, 0);
    // particleSystem.scaling = new BABYLON.Vector3(40, 50, 50);

    // Effect
    var effect = engine.createEffectForParticles("fogSwirl", ["time"], undefined, undefined, undefined, undefined, undefined, particleSystem);

    particleSystem.setCustomEffect(effect, 0);

    particleSystem.start();

    var time = 0;
    var order = 0.001;

    scene.onBeforeRenderObservable.add(() => {
        time += order;  // Increment time by 'order' each frame
    });

    effect.onBind = function () {
        effect.setFloat("time", time);
    };
    // emitter0.isVisible = true;
    emitter0.position = new BABYLON.Vector3(0, -1050, 300);
    emitter0.scaling = new BABYLON.Vector3(500, 30, 500);
}

function createSpellParticles(scene, engine) {
    // Emitters
    var emitter0 = BABYLON.Mesh.CreateBox("emitter0", 0.1, scene);
    emitter0.isVisible = false;

    // Custom shader for particles
    BABYLON.Effect.ShadersStore["myParticleFragmentShader"] =
        "#ifdef GL_ES\n" +
        "precision highp float;\n" +
        "#endif\n" +

        "varying vec2 vUV;\n" +                     // Provided by babylon.js
        "varying vec4 vColor;\n" +                  // Provided by babylon.js

        "uniform sampler2D diffuseSampler;\n" +     // Provided by babylon.js
        "uniform float time;\n" +                   // This one is custom so we need to declare it to the effect

        "void main(void) {\n" +
        "vec2 position = vUV;\n" +

        "float color = 0.0;\n" +
        "vec2 center = vec2(0.5, 0.5);\n" +

        "color = sin(distance(position, center) * 10.0+ time * vColor.g);\n" +

        "vec4 baseColor = texture2D(diffuseSampler, vUV);\n" +

        "gl_FragColor = baseColor * vColor * vec4( vec3(color, color, color), 1.0 );\n" +
        "}\n" +
        "";

    // Particles
    var particleSystem = new BABYLON.GPUParticleSystem("particles", 40, scene, effect);
    particleSystem.particleTexture = new BABYLON.Texture("./assets/textures/effects/flare.png", scene);
    particleSystem.minSize = 9.1;
    particleSystem.maxSize = 10.0;
    particleSystem.minLifeTime = 4.0;
    particleSystem.maxLifeTime = 5.0;
    particleSystem.minEmitPower = 0.5;
    particleSystem.maxEmitPower = 3.0;
    particleSystem.emitter = emitter0;
    particleSystem.emitRate = 1;
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    particleSystem.direction1 = new BABYLON.Vector3(-1, 1, -1);
    particleSystem.direction2 = new BABYLON.Vector3(1, 1, 1);
    particleSystem.color1 = new BABYLON.Color4(1, 1, 0, 1);
    particleSystem.color2 = new BABYLON.Color4(1, 0.5, 0, 1);
    particleSystem.gravity = new BABYLON.Vector3(0, -1.0, 0);

    // Effect
    var effect = engine.createEffectForParticles("myParticle", ["time"], undefined, undefined, undefined, undefined, undefined, particleSystem);

    particleSystem.setCustomEffect(effect, 0);

    particleSystem.start();

    var time = 0;
    var order = 0.1;

    effect.onBind = function () {
        effect.setFloat("time", time);

        // time += order;

        // if (time > 100 || time < 0) {
        //     order *= -1;
        // }
    };
    emitter0.isVisible = true;
    emitter0.position = new BABYLON.Vector3(0, -970, 300);


}

function createDust(scene, engine) {
    // Emitters
    var emitter0 = BABYLON.Mesh.CreateBox("emitter0", 0.1, scene);
    emitter0.isVisible = false;

    // Custom shader for particles
    BABYLON.Effect.ShadersStore["myParticleFragmentShader"] =
        "#ifdef GL_ES\n" +
        "precision highp float;\n" +
        "#endif\n" +

        "varying vec2 vUV;\n" +                     // Provided by babylon.js
        "varying vec4 vColor;\n" +                  // Provided by babylon.js

        "uniform sampler2D diffuseSampler;\n" +     // Provided by babylon.js
        "uniform float time;\n" +                   // This one is custom so we need to declare it to the effect

        "void main(void) {\n" +
        "vec2 position = vUV;\n" +

        "float color = 0.0;\n" +
        "vec2 center = vec2(0.5, 0.5);\n" +

        "color = sin(distance(position, center) * 10.0+ time * vColor.g);\n" +

        "vec4 baseColor = texture2D(diffuseSampler, vUV);\n" +

        "gl_FragColor = baseColor * vColor * vec4( vec3(color, color, color), 1.0 );\n" +
        "}\n" +
        "";

    // Particles
    var particleSystem = new BABYLON.GPUParticleSystem("particles", 5000, scene, effect);
    particleSystem.particleTexture = new BABYLON.Texture("./assets/textures/effects/flare.png", scene);
    particleSystem.minSize = 0.5;
    particleSystem.maxSize = 0.8;
    particleSystem.minLifeTime = 20.5;
    particleSystem.maxLifeTime = 22.0;
    particleSystem.minEmitPower = 0.01;
    particleSystem.maxEmitPower = 0.02;
    particleSystem.emitter = emitter0;
    particleSystem.emitRate = 20;
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    particleSystem.direction1 = new BABYLON.Vector3(-1, 1, -1);
    particleSystem.direction2 = new BABYLON.Vector3(1, 1, 1);
    particleSystem.color1 = new BABYLON.Color4(1, 1, 1, 1);
    particleSystem.color2 = new BABYLON.Color4(1, 1, 1, 1);
    particleSystem.gravity = new BABYLON.Vector3(0, -1.0, 0);
    // particleSystem.scaling = new BABYLON.Vector3(40, 50, 50);

    // Effect
    var effect = engine.createEffectForParticles("myParticle", ["time"], undefined, undefined, undefined, undefined, undefined, particleSystem);

    particleSystem.setCustomEffect(effect, 0);

    particleSystem.start();

    var time = 0;
    var order = 0.1;

    effect.onBind = function () {
        effect.setFloat("time", time);
    };
    // emitter0.isVisible = true;
    emitter0.position = new BABYLON.Vector3(0, -970, 300);
    emitter0.scaling = new BABYLON.Vector3(500, 30, 500);
}

function createAirSwirls() {

}




async function createTerrainDiamond(scene, maxHeight) {
    var terrain = await BABYLON.MeshBuilder.CreateGroundFromHeightMap("terrain", "/assets/textures/terrain/diamondHeight.png", {
        width: 10000, height: 10000, subdivisions: 100, minHeight: 0, maxHeight: maxHeight, onReady: () => {
            terrain.createNormals(true);
            terrain.computeWorldMatrix(true);
            let groundAggregate = new BABYLON.PhysicsAggregate(terrain, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution: 0.0, friction: 1.0 }, scene);
            scene.physicsEnabled = true;
        }
    }, scene);
    terrain.position.y = -maxHeight / 2 - (maxHeight / 3);

    const terrainMaterial = new BABYLON.StandardMaterial("terrainMaterial", scene);
    terrainMaterial.diffuseTexture = new BABYLON.Texture("assets/textures/terrain/grass.png", scene);
    terrainMaterial.diffuseTexture.uScale = 100; // Repeat texture horizontally
    terrainMaterial.diffuseTexture.vScale = 100; // Repeat texture vertically
    terrainMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    terrain.material = terrainMaterial;
    return terrain;
}

function setupEnvironment(scene) {
    scene.clearColor = new BABYLON.Color3.White();
    const environmentURL = "https://playground.babylonjs.com/textures/environment.env";
    const environmentMap = BABYLON.CubeTexture.CreateFromPrefilteredData(environmentURL, scene);
    scene.environmentTexture = environmentMap;
    scene.environmentIntensity = 1.0;
}

function createSkydome(scene, size) {
    var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: size }, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("https://playground.babylonjs.com/textures/skybox", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;

    return skybox;
}

function setupLighting(scene) {
    const light = new BABYLON.DirectionalLight("light0", new BABYLON.Vector3(-800, -1400, -1000), scene);
    light.intensity = 1.7;
    light.shadowMinZ = 1800;
    light.shadowMaxZ = 2100;
    light.diffuse = new BABYLON.Color3(1, 1, 1);
    return light;
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
    pipeline.bloomEnabled = false;  // Enable bloom
    pipeline.fxaaEnabled = true;   // Enable FXAA

    const imgProc = pipeline.imageProcessing;

    // Apply contrast and exposure adjustments
    imgProc.contrast = 1.6;
    imgProc.exposure = 1.8;

    // Enable tone mapping
    // imgProc.toneMappingEnabled = true;
    // imgProc.toneMappingType = BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;

    // Apply vignette effect
    imgProc.vignetteEnabled = true;
    imgProc.vignetteWeight = 2.6;
    imgProc.vignetteColor = new BABYLON.Color4(0, 0, 0, 1);
    imgProc.vignetteBlendMode = BABYLON.ImageProcessingConfiguration.VIGNETTEMODE_MULTIPLY;


    scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;

    // Set the start and end distances for the linear fog
    scene.fogStart = 600.0; // Where the fog starts
    scene.fogEnd = 6000.0;   // Where the fog completely obscures everything

    // Set the color of the fog 106, 131, 156
    // 214 234 255
    scene.fogColor = new BABYLON.Color3(0.769, 0.86, 1); // Light grey fog


}

function setupShadows(light, shadowCaster) {
    const shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
    shadowGenerator.darkness = 0.6;
    // shadowGenerator.darkness = 1;
    shadowGenerator.usePoissonSampling = true;
    // shadowGenerator.nearPlane = 400;
    // shadowGenerator.farPlane = 10000;
    shadowGenerator.addShadowCaster(shadowCaster);
}



function attachSwordToBone(sword, toAttach, boneName) {

    // const bone = skeleton.bones.find(b => b.name === boneName);
    if (toAttach) {
        // sword.attachToBone(toAttach);
        sword.parent = toAttach;
        sword.position = new BABYLON.Vector3(0, 26, 10);  // Adjust position relative to the bone as needed
        sword.scaling = new BABYLON.Vector3(500, 500, 500);


        // 0 100 180
        const degreesToRadians = (degrees) => degrees * Math.PI / 180;
        sword.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(
            degreesToRadians(0),    // 0 degrees in radians
            degreesToRadians(100),  // 100 degrees in radians
            degreesToRadians(180)   // 180 degrees in radians
        );
    } else {
        console.error("Bone not found");
    }
}
