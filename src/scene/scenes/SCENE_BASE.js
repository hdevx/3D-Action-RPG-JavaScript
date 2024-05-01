import { loadHeroModel } from '../../character/hero.js';
import { setupCharacter } from '../../character/character.js';
import { setupCamera } from '../../utils/camera.js'; 
import { setupPhysics } from '../../utils/physics.js'; 
import { setupInputHandling } from '../../movement.js'; 

export async function createRoom(engine) {
  const scene = new BABYLON.Scene(engine);
  
  const terrain = setupTerrain(scene);
  setupEnvironment(scene);
//   createSkydome(scene);

  
  const {character, dummyAggregate} = await setupPhysics(scene);
  const camera = setupCamera(scene, character);
  const hero = await loadHeroModel(scene, character);
//   move anim with character model
  let anim = setupAnim(scene);
  setupInputHandling(scene, character, camera, hero, anim, engine, dummyAggregate);

  const light = setupLighting(scene);
//   todo huge performance hit
//   setupShadows(light, hero);
// setupPostProcessing(scene,camera);

  return scene;
}

function setupEnvironment(scene) {
    scene.clearColor = new BABYLON.Color3.White();
    const environmentURL = "https://playground.babylonjs.com/textures/environment.env";
    const environmentMap = BABYLON.CubeTexture.CreateFromPrefilteredData(environmentURL, scene);
    scene.environmentTexture = environmentMap;
    scene.environmentIntensity = 0.7;
}

function createSkydome(scene) {
    // const skydome = BABYLON.MeshBuilder.CreateSphere("skyDome", {diameter: 20000, segments: 32}, scene);
    // const skyMaterial = new BABYLON.StandardMaterial("skyMat", scene);
    // skyMaterial.backFaceCulling = false;
    // skyMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    // skyMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    // skyMaterial.emissiveTexture = new BABYLON.Texture("assets/textures/sky.png", scene);
    // skydome.material = skyMaterial;
    
    var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:10000.0}, scene);
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
    terrainMaterial.diffuseTexture1 = new BABYLON.Texture("assets/textures/terrain/floor.png", scene);
    terrainMaterial.diffuseTexture2 = new BABYLON.Texture("assets/textures/terrain/rock.png", scene);
    terrainMaterial.diffuseTexture3 = new BABYLON.Texture("assets/textures/terrain/grass.png", scene);
    
    terrainMaterial.diffuseTexture1.uScale = terrainMaterial.diffuseTexture1.vScale = 15;
    terrainMaterial.diffuseTexture2.uScale = terrainMaterial.diffuseTexture2.vScale = 8;
    terrainMaterial.diffuseTexture3.uScale = terrainMaterial.diffuseTexture3.vScale = 23;

    const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap("ground", "assets/textures/terrain/hieghtMap.png", {
        width: 1000,
        height: 1000,
        subdivisions: 100,
        minHeight: 0,
        maxHeight: 100,
        onReady: function(ground) {
            ground.position.y = -10.05;
            ground.material = terrainMaterial;
            ground.receiveShadows = true;
            // ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.HeightmapImpostor, { mass: 0, restitution: 0.0, friction: 100.8 }, scene);
            // setTimeout(() => scene.physicsEnabled = true, 1000); // Enable physics after the ground is ready
            setTimeout(() => {
                var groundAggregate;
                groundAggregate = new BABYLON.PhysicsAggregate(ground, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution: 0.0, friction: 1000000000.8 }, scene);
            }, 1000);
            
        }
    }, scene);

    return { ground, terrainMaterial };
}



function setupLighting(scene) {
    const light = new BABYLON.DirectionalLight("light0", new BABYLON.Vector3(-800, -1400, -1000), scene);
    light.intensity = 1.7;
    // light.shadowMinZ = 1800;
    // light.shadowMaxZ = 2100;
    light.diffuse = new BABYLON.Color3(1, 1, 1);


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

function setupAnim(scene) {
    let anim = {};
    anim.BreathingIdle = scene.getAnimationGroupByName("BreathingIdle");
    anim.Running = scene.getAnimationGroupByName("RunningSprint");
    anim.Jump = scene.getAnimationGroupByName("Jump");
    anim.Roll = scene.getAnimationGroupByName("SprintingForwardRollInPlace");
    anim.SelfCast = scene.getAnimationGroupByName('Standing 2H Magic Area Attack 02');
    
    scene.animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride();
    scene.animationPropertiesOverride.enableBlending = true;
    scene.animationPropertiesOverride.blendingSpeed = 0.06;
    scene.animationPropertiesOverride.loopMode = 1;

    return anim;
}