import { createInputGrid } from "./grid/grid.js";
export function setupProcedural(scene, engine, meshes) {
    // setupEditableTerrain(scene);

    // exterior
    // setupGeneratedTerrain(scene);
    // createBox(scene);

    //interior
    createInputGrid(scene, meshes);

    // setupBoxBuilder(scene, meshes);
}



function createBox(scene) {
    let base = createBoxBase(scene);
    // setupBoxRoof(scene).setParent(base);
}
function createCircle(scene) {
    let base = createCircleBase(scene);
    setupBoxRoof(scene).setParent(base);
}

function createBase(scene) {

}


let defaultBaseHeight = 10;
function createCircleBase(scene) {
    const cylinder = BABYLON.MeshBuilder.CreatePolygon("roof", {
        shape: [
            new BABYLON.Vector3(-5, 0, 0),
            new BABYLON.Vector3(5, 0, 0),
            new BABYLON.Vector3(0.5, 0, -5),
            new BABYLON.Vector3(-0.5, 0, -5)
            // add 4 more sides, then rotate it.
        ],
        depth: defaultBaseHeight
    }, scene);
    // r

    // addTools(scene, box);
    return box;
}
function createBoxBase(scene) {
    const box = BABYLON.MeshBuilder.CreatePolygon("roof", {
        shape: [
            new BABYLON.Vector3(0, 0, 5),
            new BABYLON.Vector3(5, 0, 0),
            new BABYLON.Vector3(0, 0, -5),
            new BABYLON.Vector3(-5, 0, 0)
        ],
        depth: defaultBaseHeight
    }, scene);
    box.rotation.x = BABYLON.Tools.ToRadians(180);
    box.position.z = -50;
    const boxMaterial = new BABYLON.StandardMaterial("boxMaterial", scene);
    boxMaterial.backFaceCulling = false;

    box.material = boxMaterial;

    addTools(scene, box);
    return box;
}

function setupBoxRoof(scene) {
    const roof = BABYLON.MeshBuilder.CreatePolygon("roof", {
        shape: [
            new BABYLON.Vector3(-5, 0, 0),
            new BABYLON.Vector3(5, 0, 0),
            new BABYLON.Vector3(0.5, 0, -5),
            new BABYLON.Vector3(-0.5, 0, -5)
        ],
        depth: 0.1
    }, scene);
    // roof.rotation.x = Math.PI / 2; // Adjust rotation to make the roof flat
    // roof.rotation.x = BABYLON.Tools.ToRadians(180);
    roof.scaling.x = 1;
    roof.scaling.y = 1;
    roof.scaling.z = 1;

    addTools(scene, roof);


    // // Assuming roof is already created as a Babylon.js mesh
    // const pointerDragBehavior = new BABYLON.PointerDragBehavior({ dragAxis: new BABYLON.Vector3(0, 0, 1) });

    // // Modify the pivot point so that the roof scales from the bottom
    // roof.setPivotPoint(new BABYLON.Vector3(0, 0, 0)); // Adjusting the pivot point to the bottom of the roof
    // pointerDragBehavior.onDragObservable.add(function (event) {
    //     let newHeight = roof.scaling.y + event.delta.y / 100;
    //     console.log("Dragging", event.delta.y / 100);

    //     roof.scaling.y = newHeight;
    //     // roof.scaling.y = 100;
    //     // roof.position.y = (newHeight - 1) / 2;
    // });

    // roof.addBehavior(pointerDragBehavior); // Add behavior directly to the roof

}

function addTools(scene, object) {
    addScaleUp(scene, object);

}

function addScaleUp(scene, object) {
    const line = BABYLON.MeshBuilder.CreateLines("line", {
        points: [
            new BABYLON.Vector3(0, -5, -1.5),
            new BABYLON.Vector3(0, 5, -1.5)
        ],
        updatable: true
    }, scene);
    line.setParent(object);
    line.position.y = object.position.y - 5;
    // get bounding box of object and set to x and z position 
    line.position.x = 6;
    line.color = new BABYLON.Color3.White();
    line.visibility = 0; // Initially invisible
    line.enableEdgesRendering();
    line.edgesWidth = 3;
    line.edgesColor = new BABYLON.Color4(1, 0, 0, 1);

    object.actionManager = new BABYLON.ActionManager(scene);
    object.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function (ev) {
        line.visibility = 1; // Show line on hover
    }));
    object.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, function (ev) {
        line.visibility = 0; // Hide line when not hovering
    }));

    addScaleZ(object);
}

function addGuideLines() {

}
function addMoveZ(object) {
    const pointerDragBehavior = new BABYLON.PointerDragBehavior({ dragAxis: new BABYLON.Vector3(0, 0, 1) });
    object.addBehavior(pointerDragBehavior); // Add behavior directly to the roof
}

const SCALING_SLOW = 10;
const OBJECT_MIN = 0.1;


function addScaleZ(object) {
    const pointerDragBehavior = new BABYLON.PointerDragBehavior({ dragAxis: new BABYLON.Vector3(0, 1, 0) });
    pointerDragBehavior.moveAttached = false;
    pointerDragBehavior.onDragObservable.add(function (event) {
        let newHeight = object.scaling.y + (event.delta.y / SCALING_SLOW);
        if (newHeight > OBJECT_MIN) {
            object.scaling.y = newHeight;
            // object.scaling.y = 100;
            // object.position.y = (newHeight - 1) / 2;

        }
    });

    object.addBehavior(pointerDragBehavior); // Add behavior directly to the roof
}

function setupBoxBuilder(scene, meshes) {
    let startPoint, endPoint;
    let walls = [];

    console.log(meshes[1].name);

    scene.onPointerDown = (evt) => {
        if (evt.button === 0) { // Left click
            startPoint = scene.pick(scene.pointerX, scene.pointerY).pickedPoint;
        }
    };

    scene.onPointerUp = (evt) => {
        if (evt.button === 0 && startPoint) {
            endPoint = scene.pick(scene.pointerX, scene.pointerY).pickedPoint;
            createWalls();
            startPoint = null;
        }
    };

    function createWalls() {
        const width = Math.abs(endPoint.x - startPoint.x);
        const depth = Math.abs(endPoint.z - startPoint.z);
        const height = 2; // Adjust as needed

        const positions = [
            [startPoint.x, startPoint.z],
            [endPoint.x, startPoint.z],
            [endPoint.x, endPoint.z],
            [startPoint.x, endPoint.z]
        ];

        walls.forEach(wall => wall.dispose());
        walls = [];

        for (let i = 0; i < 4; i++) {
            const wall = meshes[1].createInstance(`wall${i}`);
            wall.position = new BABYLON.Vector3(
                (positions[i][0] + positions[(i + 1) % 4][0]) / 2,
                height / 2,
                (positions[i][1] + positions[(i + 1) % 4][1]) / 2
            );
            wall.rotation.y = i % 2 === 0 ? 0 : Math.PI / 2;
            wall.scaling = new BABYLON.Vector3(i % 2 === 0 ? depth : width, height, 1);
            walls.push(wall);
        }
    }
}

function setupEditableTerrain(scene) {
    // Create ground
    const groundSize = 100;
    const subdivisions = 100;
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {
        width: groundSize,
        height: groundSize,
        subdivisions: subdivisions
    }, scene);

    // Create dynamic texture for heightmap
    const heightMapSize = 256;
    const heightMap = new BABYLON.DynamicTexture("heightMap", heightMapSize, scene, false);
    const ctx = heightMap.getContext();

    // Function to update heightmap
    const updateHeightMap = function () {
        const buffer = ctx.getImageData(0, 0, heightMapSize, heightMapSize);

        for (let i = 0; i < heightMapSize; i++) {
            for (let j = 0; j < heightMapSize; j++) {
                const height = 1;
                buffer.data[i * heightMapSize * 4 + j * 4] = height * 255 / 10;
                buffer.data[i * heightMapSize * 4 + j * 4 + 1] = height * 255 / 10;
                buffer.data[i * heightMapSize * 4 + j * 4 + 2] = height * 255 / 10;
                buffer.data[i * heightMapSize * 4 + j * 4 + 3] = 255;
            }
        }

        ctx.putImageData(buffer, 0, 0);
        heightMap.update();
    };

    updateHeightMap();

    // Create custom shader material
    const shaderMaterial = new BABYLON.ShaderMaterial("shader", scene, {
        vertex: "custom",
        fragment: "custom",
    },
        {
            attributes: ["position", "normal", "uv"],
            uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
        });

    // Set shader code
    BABYLON.Effect.ShadersStore["customVertexShader"] = `
          precision highp float;
          attribute vec3 position;
          attribute vec2 uv;
          uniform mat4 worldViewProjection;
          varying vec2 vUV;
          uniform sampler2D heightMapSampler;
          void main(void) {
              vUV = uv;
              vec4 heightMapColor = texture2D(heightMapSampler, uv);
              float height = heightMapColor.r * 10.0;
              vec3 newPosition = vec3(position.x, position.y + height, position.z);
              gl_Position = worldViewProjection * vec4(newPosition, 1.0);
          }
      `;

    BABYLON.Effect.ShadersStore["customFragmentShader"] = `
          precision highp float;
          varying vec2 vUV;
          uniform sampler2D heightMapSampler;
          void main(void) {
              vec4 heightMapColor = texture2D(heightMapSampler, vUV);
              gl_FragColor = vec4(heightMapColor.rgb, 1.0);
          }
      `;

    // Set heightmap texture
    shaderMaterial.setTexture("heightMapSampler", heightMap);

    // Apply material to ground
    ground.material = shaderMaterial;

    // Example: Update heightmap on click
    scene.onPointerDown = function () {
        updateHeightMap();
        heightMap.update();
    };

}