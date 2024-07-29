import { loadHeroModel } from '../../character/hero.js';
import { setupCamera } from '../../utils/camera.js';
import { setupPhysics } from '../../utils/physics.js';
import { setupInputHandling } from '../../movement.js';
import { setupAnim } from '../../utils/anim.js';
import { setupWater } from '../../utils/water.js';

import { loadModels } from '../../utils/load.js';

import { setupEnemies } from '../../character/enemy.js';
import { Health } from '../../character/health.js';
import addSword from '../../character/equips/held.js';

export async function createTown(engine) {
    const scene = new BABYLON.Scene(engine);

    const spawnPoint = new BABYLON.Vector3(134.683, 80, -271.427);
    const { character, dummyAggregate } = await setupPhysics(scene, spawnPoint);
    const terrain = setupTerrain(scene);

    const camera = setupCamera(scene, character, engine);
    camera.wheelDeltaPercentage = 0.0200;
    // camera.upperBetaLimit = Math.PI / 2; // Stops at the horizon (90 degrees)
    camera.upperBetaLimit = 3.13;
    camera.lowerRadiusLimit = 4;  // Minimum distance to target (closest zoom)
    camera.upperRadiusLimit = 656.8044;
    camera.upperBetaLimit = Math.PI / 2; // Stops at the horizon (90 degrees)
    camera.alpha = 4.954;
    camera.beta = 1.3437;

    // load all models, make sure parallel loading for speed
    const modelUrls = ["characters/enemy/slime/Slime1.glb", "characters/weapons/Sword2.glb", "util/HPBar.glb",
        "env/town/terrain/terrain.glb", "env/town/town_map.glb"];
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

    // Todo: add shadow and post toggles in settings
    // Defer non-critical operations
    setupEnvironment(scene);
    createSkydome(scene);

    setupWater(scene, terrain, engine, hero, 12.16, 8000);

    const light = setupLighting(scene);


    setupShadows(light, hero);
    setupPostProcessing(scene, camera);

    loadHPModels(scene, engine, models["HPBar"]);

    let sword = addSword(scene, models["Sword2"]);
    createTrail(scene, engine, sword, 0.2, 40, new BABYLON.Vector3(0, 0, 0.32));

    const slime1 = models["Slime1"];
    setupEnemies(scene, character, terrain, 7, slime1);

    VFX['fireBall'] = addFireball(scene, engine);

    addTownMap(scene, models);
    addMountains(scene, models);

    return scene;
}

function addTownMap(scene, models) {
    let town_map = models["town_map"];
    town_map.name = "town map";
    town_map.position.y = 30;

    town_map.scaling = new BABYLON.Vector3(6, 6, 6);


    town_map.getChildMeshes().forEach(mesh => {
        mesh.material.metallic = 1;
        // set levels

        let town_mapCollision = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution: 0.0, friction: 1.0 }, scene);

    });
}

function placeObject(object, position, rotation, scale) {
    object.position = position;
    object.rotation = new BABYLON.Vector3(0, BABYLON.Tools.ToRadians(rotation.y), 0);
    object.scaling = scale;

}

function addMountains(scene, models) {
    // models["terrain"].scaling.scaleInPlace(20, 20, 20);
    let mountainRight = models["terrain"].clone("mountainRight");
    placeObject(mountainRight,
        new BABYLON.Vector3(234.081, -10.638, 917.554),
        new BABYLON.Vector3(93.495, 305, 40.352),
        new BABYLON.Vector3(93.495, 90.614, 120)
    );

    let mountainLeft = models["terrain"].clone("mountainLeft");
    placeObject(mountainLeft,
        new BABYLON.Vector3(-1255.157, 0, 1011.619),
        new BABYLON.Vector3(93.495, 307.9000, 40.352),
        new BABYLON.Vector3(170, 120.614, 120));



    const gizmoManager = new BABYLON.GizmoManager(scene);

    // Enable position, rotation, and scale gizmos
    gizmoManager.positionGizmoEnabled = true;
    gizmoManager.rotationGizmoEnabled = true;
    gizmoManager.scaleGizmoEnabled = true;

    // Attach the gizmo to the trail
    gizmoManager.attachToMesh(mountainRight);
}


function setupEnvironment(scene) {
    scene.clearColor = new BABYLON.Color3.White();
    const environmentURL = "./assets/textures/lighting/environment.env";
    const environmentMap = BABYLON.CubeTexture.CreateFromPrefilteredData(environmentURL, scene);
    scene.environmentTexture = environmentMap;
    scene.environmentIntensity = 1.0;
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
        width: 2000,
        height: 2000,
        subdivisions: 100,
        minHeight: 0,
        maxHeight: 30,
        onReady: function (ground) {
            ground.position.y = 10.05;
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

    return ground;
}



function setupLighting(scene) {
    const light = new BABYLON.DirectionalLight("light0", new BABYLON.Vector3(-800, -1400, -1000), scene);
    light.intensity = 1.7;
    // light.shadowMinZ = 1800;
    // light.shadowMinZ = 2100;
    light.shadowMinZ = 1500;
    light.shadowMaxZ = 2300;
    light.diffuse = new BABYLON.Color3(1, 1, 1);

    // var light = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
    // light.intensity = 1.7;

    // light.diffuse = new BABYLON.Color3(1, 1, 1);
    // light.specular = new BABYLON.Color3(0, 1, 0);
    // light.groundColor = new BABYLON.Color3(0, 0.5, 1);

    return light;
}

function setupShadows(light, shadowCaster) {

    const shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
    // shadowGenerator.useExponentialShadowMap = false;
    shadowGenerator.darkness = 0.6;
    // shadowGenerator.darkness = 1;
    shadowGenerator.usePoissonSampling = true;
    shadowGenerator.nearPlane = 1;
    shadowGenerator.farPlane = 10000;
    shadowGenerator.minZ = -100;
    shadowGenerator.addShadowCaster(shadowCaster);
}

function loadHPModels(scene, engine, HPBar) {
    HPBAR = HPBar;
    var blackMaterial = new BABYLON.StandardMaterial("blackMat", scene);
    blackMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0); // Black color
    blackMaterial.specularColor = new BABYLON.Color3(0, 0, 0); // No specular highlight
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
    //     var sharpen = new BABYLON.SharpenPostProcess("sharpen", 1.0, camera);
    // sharpen.edgeAmount = 0.15;  // Increase or decrease for more or less sharpening
    // sharpen.colorAmount = 1.0;

}

function addFireball(scene, engine) {
    let orbMaterial = addShaders(scene, engine);

    const sphere = BABYLON.MeshBuilder.CreateSphere("Fireball Orb", { diameter: 2, segments: 32 }, scene);
    sphere.material = orbMaterial;
    sphere.material.backFaceCulling = true;
    sphere.material.alphaMode = BABYLON.Constants.ALPHA_COMBINE;
    sphere.material.needAlphaBlending = function () { return true; };

    createTrailFire(scene, engine, sphere);
    return sphere;
}

function addShaders(scene, engine) {
    var orbMaterial = new BABYLON.ShaderMaterial("orb", scene, {
        vertex: "../../../shaders/vfx/orb",
        fragment: "../../../shaders/vfx/orb"
    }, {
        attributes: ["position", "uv"],
        uniforms: ["worldViewProjection", "iTime", "iResolution", "iMouse", "Radius", "Background", "NoiseSteps", "NoiseAmplitude", "NoiseFrequency", "Animation", "Color1", "Color2", "Color3", "Color4"]
    });

    orbMaterial.setFloat("Radius", 2.0);
    orbMaterial.setVector4("Background", new BABYLON.Vector4(0.1, 0.0, 0.0, 0.0));
    orbMaterial.setInt("NoiseSteps", 8);
    orbMaterial.setFloat("NoiseAmplitude", 0.09);
    orbMaterial.setFloat("NoiseFrequency", 1.2);
    orbMaterial.setVector3("Animation", new BABYLON.Vector3(0.0, -2.0, 0.5));
    orbMaterial.setVector4("Color1", new BABYLON.Vector4(1.0, 1.0, 1.0, 1.0));
    orbMaterial.setVector4("Color2", new BABYLON.Vector4(1.0, 0.3, 0.0, 1.0));
    orbMaterial.setVector4("Color3", new BABYLON.Vector4(1.0, 0.03, 0.0, 1.0));
    orbMaterial.setVector4("Color4", new BABYLON.Vector4(0.05, 0.02, 0.02, 1.0));


    engine.runRenderLoop(() => {
        orbMaterial.setFloat("iTime", performance.now() * 0.001);
        orbMaterial.setVector2("iResolution", new BABYLON.Vector2(engine.getRenderWidth(), engine.getRenderHeight()));
        orbMaterial.setFloat("uAlpha", 0.5);
    });

    function creatDebug() {
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        const panel = new BABYLON.GUI.StackPanel();
        panel.width = "220px";
        panel.top = "-20px";
        panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        advancedTexture.addControl(panel);

        const createSlider = (label, min, max, value, step, callback) => {
            const header = new BABYLON.GUI.TextBlock();
            header.text = label;
            header.height = "30px";
            header.color = "white";
            panel.addControl(header);

            const slider = new BABYLON.GUI.Slider();
            slider.minimum = min;
            slider.maximum = max;
            slider.value = value;
            slider.step = step;
            slider.height = "20px";
            slider.width = "200px";
            slider.onValueChangedObservable.add(callback);
            panel.addControl(slider);
        };

        const createColorPicker = (label, defaultColor, callback) => {
            const header = new BABYLON.GUI.TextBlock();
            header.text = label;
            header.height = "30px";
            header.color = "white";
            panel.addControl(header);

            const picker = new BABYLON.GUI.ColorPicker();
            picker.value = defaultColor;
            picker.height = "150px";
            picker.width = "150px";
            picker.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            picker.onValueChangedObservable.add(callback);
            panel.addControl(picker);
        };


        createSlider("Radius", 0.0, 5.0, 2.0, 0.1, value => orbMaterial.setFloat("Radius", value));
        createSlider("Noise Amplitude", 0.0, 1.0, 0.09, 0.01, value => orbMaterial.setFloat("NoiseAmplitude", value));
        createSlider("Noise Frequency", 0.0, 5.0, 1.2, 0.1, value => orbMaterial.setFloat("NoiseFrequency", value));

        createColorPicker("Color1", BABYLON.Color3.FromHexString("#640000"), color => {
            orbMaterial.setVector4("Color1", new BABYLON.Vector4(color.r, color.g, color.b, 1.0));
        });

        createColorPicker("Color2", BABYLON.Color3.FromHexString("#ff4d00"), color => {
            orbMaterial.setVector4("Color2", new BABYLON.Vector4(color.r, color.g, color.b, 1.0));
        });

        createColorPicker("Color3", BABYLON.Color3.FromHexString("#ff0a00"), color => {
            orbMaterial.setVector4("Color3", new BABYLON.Vector4(color.r, color.g, color.b, 1.0));
        });

        createColorPicker("Color4", BABYLON.Color3.FromHexString("#0d0505"), color => {
            orbMaterial.setVector4("Color4", new BABYLON.Vector4(color.r, color.g, color.b, 1.0));
        });
    }

    // if (DEBUG) creatDebug();




    return orbMaterial;
}

function createTrailFire(scene, engine, sphere) {
    let spawnPoint = new BABYLON.Vector3(154.683, 70, -281.427);
    sphere.position.y = spawnPoint.y;
    sphere.position.x = spawnPoint.x;
    sphere.position.z = spawnPoint.z;
    // sphere.position = spawnPoint;

    // uncomment for fireball demo
    // sphere.scaling.scaleInPlace(3, 3, 3);
    // // Animate the sphere
    // var AlphaTime = 0;
    // var alpha = 0;
    // var alphaChange = 0.5;
    // scene.registerBeforeRender(function () {
    //     sphere.position.x = 19.1 * Math.cos(alpha) + spawnPoint.x;
    //     sphere.position.y = 2 * Math.sin(alpha) + spawnPoint.y;
    //     // sphere.position.y = 4 * Math.sin(alpha) + spawnPoint.y;
    //     // sphere.position.y = 20 * Math.sin(alpha);
    //     sphere.position.z = 5.1 * Math.sin(alpha) + spawnPoint.z;

    //     alphaChange = 0.05 * Math.sin(AlphaTime);
    //     alpha += alphaChange;
    //     AlphaTime += 0.01;

    //     // alpha += 0.01;
    //     // alpha += 0.05;
    // });



    SHADERS['fireTrailShader'] = new BABYLON.ShaderMaterial("fireTrail", scene, {
        vertex: "../../../shaders/vfx/trail",
        fragment: "../../../shaders/vfx/trail",
    }, {
        attributes: ["position", "normal", "uv"],
        uniforms: ["world", "worldViewProjection", "view", "projection", "time"],
        needAlphaBlending: true
    });
    SHADERS['fireTrailShader'].transparencyMode = BABYLON.Material.MATERIAL_OPAQUE;
    // fireTrailShader.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;

    const trail = new BABYLON.TrailMesh("trail", sphere, scene, 0.5, 120, true);
    trail.diameter = 0.5;
    trail.material = SHADERS['fireTrailShader'];
    trail.alphaIndex = 0; // Set beside fire shader
    // trail.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    // trail.scaling.scaleInPlace(1, 1, 1);

    let time = 0;
    scene.registerBeforeRender(() => {
        time += engine.getDeltaTime() * 0.001;
        SHADERS['fireTrailShader'].setFloat("time", time);
        // trail.update();
    });

    // trail.parent = sphere;



    // const gizmoManager = new BABYLON.GizmoManager(scene);

    // // Enable position, rotation, and scale gizmos
    // gizmoManager.positionGizmoEnabled = true;
    // gizmoManager.rotationGizmoEnabled = true;
    // gizmoManager.scaleGizmoEnabled = true;

    // // Attach the gizmo to the trail
    // gizmoManager.attachToMesh(trail);





    // Create the trail material
    // var trailMaterial = new BABYLON.StandardMaterial("trailMaterial", scene);
    // trailMaterial.emissiveColor = new BABYLON.Color3(1, 0, 0);

    // // Create the trail mesh
    // var trail = new BABYLON.TrailMesh("trail", sphere, scene, 0.2, 30, true);
    // trail.material = trailMaterial;

}


function createTrail(scene, engine, objectToAttach, diameter, segments, offset, rotation, scale) {
    const fireTrailShader = new BABYLON.ShaderMaterial("fireTrail", scene, {
        vertex: "../../../shaders/vfx/trail_sword",
        fragment: "../../../shaders/vfx/trail_sword",
    }, {
        attributes: ["position", "normal", "uv"],
        uniforms: ["world", "worldViewProjection", "view", "projection", "time"],
        needAlphaBlending: true
    });
    // fireTrailShader.transparencyMode = BABYLON.Material.MATERIAL_OPAQUE;
    fireTrailShader.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
    fireTrailShader.backFaceCulling = false;

    var trailNode = new BABYLON.TransformNode("trailNode");
    trailNode.parent = objectToAttach;
    trailNode.position = offset;
    trailNode.scaling.scale
    // Set rotation in degrees
    var rotationXInDegrees = 196.2000;
    var rotationYInDegrees = 269.8000;
    var rotationZInDegrees = 0;

    // Convert rotation from degrees to radians
    trailNode.rotation.x = BABYLON.Tools.ToRadians(rotationXInDegrees);
    trailNode.rotation.y = BABYLON.Tools.ToRadians(rotationYInDegrees);
    trailNode.rotation.z = BABYLON.Tools.ToRadians(rotationZInDegrees);

    // Set scale
    trailNode.scaling = new BABYLON.Vector3(1, 0.2, 1);

    // Can also rotate trailNode for cool effects!
    // can use rotate z for hand casting animation!

    const trail = new BABYLON.TrailMesh("SwordTrail", trailNode, scene, diameter, segments, true);
    trail.diameter = diameter;
    trail.material = fireTrailShader;
    trail.alphaIndex = 0; // Set beside fire shader
    // trail.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    // trail.scaling.scaleInPlace(1, 1, 1);

    var offset = new BABYLON.Vector3(0, 2, 0);

    const parentMesh = objectToAttach;
    // Function to apply local transformation
    function applyLocalTransformation(mesh, offset) {
        // Transform the offset into the parent mesh's local space
        var worldMatrix = mesh.getWorldMatrix();
        var localOffset = BABYLON.Vector3.TransformCoordinates(offset, worldMatrix);
        return localOffset;
    }
    // Update the trail mesh position with the offset
    let time = 0;
    scene.registerBeforeRender(() => {
        time += engine.getDeltaTime() * 0.001;
        fireTrailShader.setFloat("time", time);

        // var localOffset = applyLocalTransformation(parentMesh, offset);
        // trail.position = parentMesh.position.add(localOffset);
        // trail.rotationQuaternion = parentMesh.rotationQuaternion ? parentMesh.rotationQuaternion.clone() : BABYLON.Quaternion.Identity();
        // trail.update();
    });

    // trail.rotation.y = Math.PI / 4; // 45 degrees

}

