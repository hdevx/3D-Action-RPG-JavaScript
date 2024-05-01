import { loadHeroModel } from '../../character/hero.js';
import { setupCamera } from '../../utils/camera.js'; 
import { setupPhysics } from '../../utils/physics.js'; 
import { setupInputHandling } from '../../movement.js'; 
import { setupAnim } from '../../utils/anim.js'; 
import { setupWater } from '../../utils/water.js'; 

import { loadModels } from '../../utils/load.js'; 

import { setupEnemies } from '../../character/enemy.js';
import { Health } from '../../character/health.js';


export async function createOutdoor(engine) {
  const scene = new BABYLON.Scene(engine);
  
  setupEnvironment(scene);
  createSkydome(scene);


//   createHealthBarTest(scene);
    

  
    const {character, dummyAggregate} = await setupPhysics(scene);
      const terrain = setupTerrain(scene);

    const camera = setupCamera(scene, character);
    const {hero, skeleton} = await loadHeroModel(scene, character);
  //   move anim with character model
    let anim = setupAnim(scene, skeleton);
    setupInputHandling(scene, character, camera, hero, anim, engine, dummyAggregate);
    character.health = new Health("Hero", 100, dummyAggregate);
    character.health.rotationCheck = hero;
    character.health.rangeCheck = character;
    PLAYER = character;


  const light = setupLighting(scene);


setupTurnCamera(scene, camera, engine);

//   load all model
const modelUrls = ["characters/enemy/slime/slime1.glb", "characters/weapons/Sword2.glb", "util/HPBar.glb"];
    const models = await loadModels(scene, modelUrls);
const slime1 = models["slime1"];

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
          vertexElement: "vertexShaderCode",
          fragmentElement: "fragmentShaderCode",
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


//   todo huge performance hit
// maybe have light shadow, and detailed shadow in settings toggle
  setupShadows(light, hero);
setupPostProcessing(scene,camera);

setupWater(scene, terrain, engine, hero);


  return scene;
}

function setupEnvironment(scene) {
    scene.clearColor = new BABYLON.Color3.White();
    const environmentURL = "https://playground.babylonjs.com/textures/environment.env";
    const environmentMap = BABYLON.CubeTexture.CreateFromPrefilteredData(environmentURL, scene);
    scene.environmentTexture = environmentMap;
    scene.environmentIntensity = 1.0;
}

function createSkydome(scene) {
    // const skydome = BABYLON.MeshBuilder.CreateSphere("skyDome", {diameter: 20000, segments: 32}, scene);
    // const skyMaterial = new BABYLON.StandardMaterial("skyMat", scene);
    // skyMaterial.backFaceCulling = false;
    // skyMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    // skyMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    // skyMaterial.emissiveTexture = new BABYLON.Texture("assets/textures/sky.png", scene);
    // skydome.material = skyMaterial;
    
    var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:8000.0}, scene);
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
                var groundAggregate;
                groundAggregate = new BABYLON.PhysicsAggregate(ground, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution: 0.0, friction: 1000000000.8 }, scene);
                setTimeout(() => {
                    scene.physicsEnabled = true;
                }, 10);
        }
    }, scene);

    return ground ;
}



function setupLighting(scene) {
    const light = new BABYLON.DirectionalLight("light0", new BABYLON.Vector3(-800, -1400, -1000), scene);
    light.intensity = 1.7;
    light.shadowMinZ = 1800;
    light.shadowMaxZ = 2100;
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
    shadowGenerator.darkness = 0.6;
    // shadowGenerator.darkness = 1;
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
//     var sharpen = new BABYLON.SharpenPostProcess("sharpen", 1.0, camera);
// sharpen.edgeAmount = 0.15;  // Increase or decrease for more or less sharpening
// sharpen.colorAmount = 1.0;

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
            camera.alpha += cameraRotationSpeed  * engine.getDeltaTime() / 1000;
        }

        // Check if 'D' is pressed for rotating right
        if (keyStates['d']) {
            camera.alpha -= cameraRotationSpeed * engine.getDeltaTime() / 1000;
        }
    });

}

function attachSwordToBone(sword, toAttach, boneName) {
    
    // const bone = skeleton.bones.find(b => b.name === boneName);
    if (toAttach) {
        // sword.attachToBone(toAttach);
        sword.parent = toAttach;
        sword.position = new BABYLON.Vector3(0,26,10);  // Adjust position relative to the bone as needed
        sword.scaling = new BABYLON.Vector3(500,500,500);


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


function createHealthBarTest(scene){
    var plane = BABYLON.MeshBuilder.CreatePlane("plane2", {width: 1, height: 1}, scene);
plane.position.z = 2;

// Define the shaders as strings
BABYLON.Effect.ShadersStore["vertexShaderCode"] = `
    precision highp float;

    // Attributes
    attribute vec3 position;
    attribute vec2 uv;

    // Uniforms
    uniform mat4 worldViewProjection;
    uniform mat4 view;

    void main() {
        vec3 p = position;

        // Calculate the camera position in world coordinates
        vec4 cameraPosition = inverse(view) * vec4(0.0, 0.0, 0.0, 1.0);
        float distance = length(cameraPosition.xyz - p);

        // Scale based on distance to maintain apparent size
        float scale = distance * 0.1;  // Adjust scaling factor as needed

        gl_Position = worldViewProjection * vec4(p * scale, 1.0);
    }
`;

BABYLON.Effect.ShadersStore["fragmentShaderCode"]  = `
    precision highp float;

    void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);  // Red color
    }
`;
var shaderMaterial2 = new BABYLON.ShaderMaterial("hpMaterial", scene, {
    vertex: BABYLON.Effect.ShadersStore["vertexShaderCode"],fragment: BABYLON.Effect.ShadersStore["fragmentShaderCode"]
}, {
    attributes: ["position", "normal", "uv"],
    uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
});

shaderMaterial2.VertexShader = BABYLON.Effect.ShadersStore["vertexShaderCode"];
shaderMaterial2.FragmentShader = BABYLON.Effect.ShadersStore["fragmentShaderCode"];
plane.scaling.scaleInPlace(300);
plane.position.y = 100;
plane.material2 = shaderMaterial2;
}