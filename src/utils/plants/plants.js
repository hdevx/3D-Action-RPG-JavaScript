import { cellSize, gridSize } from "../../scene/gen/procedural/grid/constants.js";

function loadShaders() {

}

function setupMeshes() {

}

let grassInfo = {};
export function reloadGrass() {

    const fm = name => grassMeshes.find(mesh => mesh.name === name);
    let grassInstance = fm('Grass_2').clone("grassInstance");
    // createInstance("test");
    grassInstance.parent = null;
    grassInstance.position.x = 40;
    grassInstance.position.y = 5;
    grassInstance.position.z = 5;
    grassInstance.scaling.y = 5;
    // grassInstance.material = grassThinShader;
    grassInstance.INSTANCEDMESH_SORT_TRANSPARENT = true;
    // scatterThin(grassInstance, -100, 100, -100, 100, 3);


    grassInfo.thinInstances = [];
    scatterThin(grassInstance, -100, 100, -100, 100, 2000); //2000);
    let flowersInstance = fm('Grass_3').clone('flowersInstance');
    flowersInstance.parent = null;
    flowersInstance.position.x = 40;
    flowersInstance.position.y = 5;
    flowersInstance.position.z = 5;
    flowersInstance.scaling.y = 5;
    // flowersInstance.INSTANCEDMESH_SORT_TRANSPARENT = true;
    scatterThin(flowersInstance, -100, 100, -100, 100, 400);

    let groveInstance = fm('Grass_1').clone('groveInstance');
    groveInstance.parent = null;
    groveInstance.position.x = 40;
    groveInstance.position.y = 5;
    groveInstance.position.z = 5;
    groveInstance.scaling.y = 5;
    // flowersInstance.INSTANCEDMESH_SORT_TRANSPARENT = true;
    scatterThin(groveInstance, -100, 100, -100, 100, 300);

    let bushInstance = fm('Bush_1').clone('bushInstance');
    bushInstance.parent = null;
    bushInstance.position.x = 40;
    bushInstance.position.y = 5;
    bushInstance.position.z = 5;
    bushInstance.rotation.x = 12.0;
    bushInstance.scaling.y = 5;
    scatterThin(bushInstance, -100, 100, -100, 100, 40, true);

    // let woodInstance = fm('Trunk').clone('TrunkInstance');
    // woodInstance.parent = null;
    // woodInstance.position.x = 40;
    // woodInstance.position.y = 5;
    // woodInstance.position.z = 5;
    // woodInstance.rotation.x = 12.0;
    // woodInstance.scaling.y = 5;
    // let woodLeafInstance = fm('Bush_Leaf_1').clone('woodLeafInstance');
    // woodLeafInstance.parent = null;
    // woodLeafInstance.position.x = 40;
    // woodLeafInstance.position.y = 5;
    // woodLeafInstance.position.z = 5;
    // woodLeafInstance.rotation.x = 12.0;
    // woodLeafInstance.scaling.y = 5;
    // scatterThin(woodInstance, -100, 100, -100, 100, 10, true, 1.0, woodLeafInstance);


    let woodInstance2 = fm('Trunk').clone('TrunkInstance2');
    woodInstance2.parent = null;
    woodInstance2.position.x = 40;
    woodInstance2.position.y = 5;
    woodInstance2.position.z = 5;
    woodInstance2.rotation.x = 12.0;
    woodInstance2.scaling.y = 5;
    let woodLeafInstance2 = fm('Bush_Leaf_2_Evergreen').clone('woodLeafInstance');
    woodLeafInstance2.parent = null;
    woodLeafInstance2.position.x = 40;
    woodLeafInstance2.position.y = 5;
    woodLeafInstance2.position.z = 5;
    woodLeafInstance2.rotation.x = 12.0;
    woodLeafInstance2.scaling.y = 5;
    scatterThin(woodInstance2, -100, 100, -100, 100, 4, true, 2.0, woodLeafInstance2);
}


function getHeightAtPoint(x, z, sceneOptional) {
    // Get the terrain vertex data
    const vertexData = GRID.getVerticesData(BABYLON.VertexBuffer.PositionKind);

    // Get terrain properties
    const subdivisions = GRID.subdivisions;
    const width = gridSize * cellSize;
    const height = gridSize * cellSize;

    // Calculate the step size
    let stepX = width / subdivisions;
    let stepZ = height / subdivisions;
    stepX = gridSize;
    stepZ = gridSize;

    // Adjust x and z to be relative to the terrain's origin
    const relativeX = 19;
    const relativeZ = 19;


    // Use Math.floor for correct negative number handling
    let col = Math.floor(relativeX / stepX);
    let row = Math.floor(relativeZ / stepZ);
    // col += 9;
    // row += 9;
    // Find the grid square that contains the point

    // Clamp col and row to valid range

    let debug = true;
    if (debug) {
        const maxHeight = 4000;

        const rayStart = new BABYLON.Vector3(x * cellSize - (gridSize * cellSize / 2), maxHeight, z * cellSize - (gridSize * cellSize / 2));
        const rayEnd = new BABYLON.Vector3(x * cellSize - (gridSize * cellSize / 2), -maxHeight, z * cellSize - (gridSize * cellSize / 2));

        const ray = new BABYLON.Ray(rayStart, rayEnd.subtract(rayStart).normalize(), maxHeight * 2);
        let rayHelper = new BABYLON.RayHelper(ray);

        // Define the ray's visual characteristics
        let rayColor = new BABYLON.Color3(1, 0, 0); // Default to red if no color is specified
        rayHelper.show(sceneOptional, rayColor);
    }

    console.log("x " + x);
    // console.log("col " + col);

    console.log("z " + z);
    // console.log("row " + row);


    // Clamp to terrain bounds
    const clampedCol = Math.max(0, Math.min(col, subdivisions));
    const clampedRow = Math.max(0, Math.min(row, subdivisions));

    // Calculate vertex indices
    const i1 = 3 * ((6) * (((19 - 1 - z) * (gridSize)) + x));
    const i2 = i1 + 3;
    const i3 = i2 + 3;
    const i4 = i3 + 3;

    // Get vertex positions
    const x1 = vertexData[i1], y1 = vertexData[i1 + 1], z1 = vertexData[i1 + 2];
    const x2 = vertexData[i2], y2 = vertexData[i2 + 1], z2 = vertexData[i2 + 2];
    const x3 = vertexData[i3], y3 = vertexData[i3 + 1], z3 = vertexData[i3 + 2];
    const x4 = vertexData[i4], y4 = vertexData[i4 + 1], z4 = vertexData[i4 + 2];

    if (debug) {
        const maxHeight = 4000;

        const rayStart = new BABYLON.Vector3(vertexData[i1], maxHeight, z1);
        const rayEnd = new BABYLON.Vector3(vertexData[i1], -maxHeight, z1);

        const ray = new BABYLON.Ray(rayStart, rayEnd.subtract(rayStart).normalize(), maxHeight * 2);
        let rayHelper = new BABYLON.RayHelper(ray);

        // Define the ray's visual characteristics
        let rayColor = new BABYLON.Color3(1, 1, 0); // Default to red if no color is specified
        rayHelper.show(sceneOptional, rayColor);


        const rayStart2 = new BABYLON.Vector3(x2, maxHeight, z2);
        const rayEnd2 = new BABYLON.Vector3(x2, -maxHeight, z2);

        const ray2 = new BABYLON.Ray(rayStart2, rayEnd2.subtract(rayStart2).normalize(), maxHeight * 2);
        let rayHelper2 = new BABYLON.RayHelper(ray2);

        // Define the ray's visual characteristics
        let rayColor2 = new BABYLON.Color3(0, 1, 0); // Default to red if no color is specified
        rayHelper2.show(sceneOptional, rayColor2);

        const rayStart3 = new BABYLON.Vector3(x3, maxHeight, z3);
        const rayEnd3 = new BABYLON.Vector3(x3, -maxHeight, z3);

        const ray3 = new BABYLON.Ray(rayStart3, rayEnd3.subtract(rayStart3).normalize(), maxHeight * 2);
        let rayHelper3 = new BABYLON.RayHelper(ray3);

        // Define the ray's visual characteristics
        let rayColor3 = new BABYLON.Color3(0, 1, 0); // Default to red if no color is specified
        rayHelper3.show(sceneOptional, rayColor3);

        const rayStart4 = new BABYLON.Vector3(x4, maxHeight, z4);
        const rayEnd4 = new BABYLON.Vector3(x4, -maxHeight, z4);

        const ray4 = new BABYLON.Ray(rayStart4, rayEnd4.subtract(rayStart4).normalize(), maxHeight * 2);
        let rayHelper4 = new BABYLON.RayHelper(ray4);

        // Define the ray's visual characteristics
        let rayColor4 = new BABYLON.Color3(0, 1, 0); // Default to red if no color is specified
        rayHelper4.show(sceneOptional, rayColor4);
    }
    const detT = (z3 - z1) * (x2 - x1) - (x3 - x1) * (z2 - z1);
    const l1 = ((z3 - z1) * (x - x1) + (x1 - x3) * (z - z1)) / detT;
    const l2 = ((z1 - z2) * (x - x1) + (x2 - x1) * (z - z1)) / detT;
    const l3 = 1 - l1 - l2;

    // Interpolate the Y value
    return (l1 * y1 + l2 * y2 + l3 * y3) / 5;

}

function getRandomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

function getHeightOnGridAtPoint(x, z) {
    let gridSpace = convertToGridSpace(x, z);
    x = gridSpace.x;
    z = gridSpace.z;
    // Create a ray starting from above the grid, pointing downwards
    const origin = new BABYLON.Vector3(x, 1000, z); // Start high above the grid
    const direction = new BABYLON.Vector3(0, -1, 0);
    const length = 2000; // Adjust based on your scene scale
    const ray = new BABYLON.Ray(origin, direction, length);

    // todo raycast against simpler geometry, like only a patch of the terrain or subset.

    // BABYLON.RayHelper.CreateAndShow(ray, grassInfo.scene, new BABYLON.Color3(1, 1, 0.1));
    // Perform the raycast
    const pickResult = grassInfo.scene.pickWithRay(ray, (mesh) => mesh === GRID);

    if (pickResult.hit) {
        // Return the Y coordinate of the intersection point
        return pickResult.pickedPoint.y / 5;
    } else {
        // No intersection found
        return null;
    }
}

function convertToGridSpace(x, z) {
    x = (x + 8) * 5;
    z = (z + 1) * 5;
    return { x: x, z: z }
}

function getCoordinatesFromMatrix(matrix, i) {
    return {
        x: matrix[(i * 16) + 12],
        y: matrix[(i * 16) + 13],
        z: matrix[(i * 16) + 14]
    };
}


export function updateGrassThin() {


    // let matrices = grassInfo.grass.matrices;
    // console.log(grassInfo.grass.bufferMatrices);

    // let newMatricies = grassInfo.grass.bufferMatrices;
    if (grassInfo.thinInstances.length === 0) { return; }
    for (let g = 0; g < grassInfo.thinInstances.length; g++) {


        const maxIterations = grassInfo.thinInstances[g].bufferMatrices.length / 16;
        // console.log(grassInfo.thinInstances);

        for (let i = 0; i < maxIterations; i++) {

            // only do within dirty cells;

            let cords = getCoordinatesFromMatrix(grassInfo.thinInstances[g].bufferMatrices, i);
            // console.log(array[i]);
            // console.log(cords.y);

            // find the cell the grass is on
            let gridCords = convertToGridSpace(cords.x, cords.z);
            let gridTrackerIndex = GRID.convert(gridCords.x, gridCords.z);
            // console.log(GRID.gridTracker[gridTrackerIndex.x][gridTrackerIndex.z]);
            // if the cell is filled, set height -1000
            if (GRID.gridTracker[gridTrackerIndex.x][gridTrackerIndex.z]) {
                grassInfo.thinInstances[g].bufferMatrices[i * 16 + 13] = -1000;
            } else { // else set it to the terrain 
                let newY = getHeightOnGridAtPoint(cords.x, cords.z);
                // let newY = getHeightAtPoint(gridTrackerIndex.x, gridTrackerIndex.z, grassInfo.scene);
                // console.log("newY" + newY);
                // newY = 5;
                // newY = newY + 1;
                // calculate height and slope. if the slope is too high, don't spawn grass, spawn rock 
                // 
                grassInfo.thinInstances[g].bufferMatrices[i * 16 + 13] = newY;
            }



        }

        grassInfo.thinInstances[g].parent.thinInstanceSetBuffer("matrix", grassInfo.thinInstances[g].bufferMatrices, 16, true); // matrix buffer is updateable, static is false

    }

}

function scatterThin(grass_1, minX, maxX, minZ, maxZ, instanceCount, rotate, variance, additional) {

    // grassThinShader.transparencyMode = BABYLON.Material.MATERIAL_ALPHATESTANDBLEND
    // grassThinShader.needDepthPrePass = true;
    // scene.enableDepthPrePass = true;

    // scene.setRenderingAutoClearDepthStencil(1, false, false, false);

    // scene.useOrderIndependentTransparency = true;
    // grassThinShader.needAlphaBlending = function () { return true; };
    let thinGrass = grass_1.clone("thinGrass2");

    thinGrass.rotation = BABYLON.Quaternion.Identity();

    let numInstances = instanceCount;
    // box.thinInstanceEnableUpdate(true);

    // Create matrices for instances
    let scale = grass_1.scaling;

    scale.x = 1.0;
    scale.y = 1.0;
    scale.z = 1.0;


    let matrices = [];
    var bufferMatrices = new Float32Array(16 * numInstances);
    for (let i = 0; i < numInstances; i++) {

        const matrix = BABYLON.Matrix.Identity();

        // Random position on the plane
        let x = getRandomInRange(minX, maxX);
        let z = getRandomInRange(minZ, maxZ);

        let yScale = Math.random() * (variance - 1.0) + 1.0;
        if (variance != null) {
            scale.x = yScale;
            scale.z = yScale;
            scale.y = yScale;
        }


        // Random rotation around Y axis
        const noRotation = BABYLON.Quaternion.Identity();
        let rotation = 0;
        if (!rotate) {
            rotation = -Math.PI / 2;
        }
        let fixedRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, rotation); // 90 degrees

        let randomRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, Math.random() * Math.PI * 2);
        let combinedRotation = fixedRotation.multiply(randomRotation);
        if (rotate) {
            let randomRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.random() * Math.PI * 2);
            combinedRotation = noRotation.multiply(randomRotation);
        }

        // let height = getHeightAtPoint(x, z);
        let height = getHeightOnGridAtPoint(x, z);
        // height /= 5;
        // console.log(height);


        BABYLON.Matrix.ComposeToRef(
            scale,
            combinedRotation,
            new BABYLON.Vector3(x, height, z),
            matrix
        );
        // console.log(matrix);
        // x = matrix._m[12];
        // z = matrix._m[14];


        // matrix._m[13] = height;

        matrices.push(matrix);

        matrix.copyToArray(bufferMatrices, 16 * i);
    }

    // var idx = thinGrass.thinInstanceAdd(matrices);
    thinGrass.thinInstanceSetBuffer("matrix", bufferMatrices, 16);
    if (additional) {
        let addtionalMesh = additional.clone("additional");
        addtionalMesh.rotation = BABYLON.Quaternion.Identity();
        addtionalMesh.position.y += 70;
        addtionalMesh.thinInstanceSetBuffer("matrix", bufferMatrices, 16);

        grassInfo.thinInstances.push({ 'parent': thinGrass, 'bufferMatrices': bufferMatrices });
        grassInfo.grass = { 'parent': thinGrass, 'bufferMatrices': bufferMatrices };
    }

    grassInfo.thinInstances.push({ 'parent': thinGrass, 'bufferMatrices': bufferMatrices });
    grassInfo.grass = { 'parent': thinGrass, 'bufferMatrices': bufferMatrices };
    return thinGrass;

}

// use mesh library
let grassMeshes = null;
export function addGrass(scene, models) {
    let grasses = models["grass"];
    grasses.scaling = new BABYLON.Vector3(1, 1, 1);
    grasses.name = "veg";

    const grassShader = new BABYLON.ShaderMaterial(
        "grass",
        scene,
        {
            vertex: "../../../shaders/env/grass",
            fragment: "../../../shaders/env/grass",
        },
        {
            attributes: ["position", "normal", "uv", "color"],
            uniforms: ["world", "worldView", "worldViewProjection", "view", "projection", "time", "viewProjection"],
            needAlphaBlending: true
        });
    // material.setFloat("time", performance.now() * 0.001); 
    grassShader.setArray4("world0", [1, 0, 0, 0]);
    grassShader.setArray4("world1", [0, 1, 0, 0]);
    grassShader.setArray4("world2", [0, 0, 1, 0]);
    grassShader.setArray4("world3", [0, 0, 0, 1]);

    var grassTexture = new BABYLON.Texture("./assets/env/exterior/grass/grass_transparent_shadow.png", scene);
    grassShader.setTexture("textureSampler", grassTexture);
    grassShader.backFaceCulling = false;
    grassShader.imageProcessingConfiguration = new BABYLON.ImageProcessingConfiguration();
    grassShader.imageProcessingConfiguration.exposure = 0.0; // Set to default exposure
    grassShader.imageProcessingConfiguration.contrast = 0.0; // Set to default contrast
    grassShader.imageProcessingConfiguration.vignetteWeight = 0; // Disable vignette
    grassShader.imageProcessingConfiguration.colorGradingTexture = null; // Remove color grading
    grassShader.imageProcessingConfiguration.toneMappingEnabled = false; // Disable tone mapping
    // grassShader.disableDepthWrite = true;


    scene.onBeforeRenderObservable.add(() => {
        const time = performance.now() * 0.001; // Current time in seconds
        grassShader.setFloat("time", time);

        var playerPosition = DUMMY.body.transformNode._absolutePosition;
        // DUMMY.body.transformNode._absolutePosition
        var playerPosition = new BABYLON.Vector3(DUMMY.body.transformNode._absolutePosition.x, DUMMY.body.transformNode._absolutePosition.y, DUMMY.body.transformNode._absolutePosition.z);
        grassShader.setVector3("playerPosition", playerPosition);
    });


    const grassThinShader = new BABYLON.ShaderMaterial(
        "grass_thin",
        scene,
        {
            vertex: "../../../shaders/env/grass/grass_thin/grass_thin",
            fragment: "../../../shaders/env/grass/grass_thin/grass_thin",
        },
        {
            attributes: ["position", "normal", "uv", "color", "world0", "world1", "world2", "world3"],
            uniforms: ["world", "worldView", "worldViewProjection", "view", "projection", "time", "viewProjection", "vFogInfos", "vFogColor"],
            needAlphaBlending: true,
            needAlphaTesting: true
        });


    const shaderMaterial = new BABYLON.ShaderMaterial(
        'shader',
        scene,
        {
            vertex: "../../../shaders/env/grass/grass_thin/grass_alphatest",
            fragment: "../../../shaders/env/grass/grass_thin/grass_alphatest",
        },
        {
            attributes: ['position', 'normal', 'uv'],
            uniforms: ['world', 'worldView', 'worldViewProjection', 'view', 'projection'],
            needAlphaBlending: true,
            needAlphaTesting: true
        }
    );

    const mainTexture = new BABYLON.Texture(
        'https://dl.dropbox.com/s/uuoym37nsr17pv2/grass2.png',
        scene
    );

    // shaderMaterial.setTexture('textureSampler', mainTexture);
    shaderMaterial.setTexture('textureSampler', grassTexture);
    // shaderMaterial.alpha = BABYLON.Material.MATERIAL_ALPHATEST;
    shaderMaterial.backFaceCulling = false;


    var grassThinTexture = new BABYLON.Texture("./assets/env/exterior/grass/grass_transparent_shadow.png", scene);
    grassThinShader.setTexture("textureSampler", grassThinTexture);
    // grassThinShader.backFaceCulling = false;
    // grassThinShader.imageProcessingConfiguration = new BABYLON.ImageProcessingConfiguration();
    // grassThinShader.imageProcessingConfiguration.exposure = 0.0; // Set to default exposure
    // grassThinShader.imageProcessingConfiguration.contrast = 0.0; // Set to default contrast
    // grassThinShader.imageProcessingConfiguration.vignetteWeight = 0; // Disable vignette
    // grassThinShader.imageProcessingConfiguration.colorGradingTexture = null; // Remove color grading
    // grassThinShader.imageProcessingConfiguration.toneMappingEnabled = false; // Disable tone mapping
    // grassThinShader.disableDepthWrite = true;
    grassThinShader.setArray4("world0", [1, 0, 0, 0]);
    grassThinShader.setArray4("world1", [0, 1, 0, 0]);
    grassThinShader.setArray4("world2", [0, 0, 1, 0]);
    grassThinShader.setArray4("world3", [0, 0, 0, 1]);
    grassThinShader.backFaceCulling = false;
    grassThinShader.needDepthPrePass = true;
    // grassThinShader.transparencyMode = BABYLON.Material.MATERIAL_OPAQUE;
    // grassThinShader.transparencyMode = BABYLON.Material.MATERIAL_ALPHATESTANDBLEND;
    // grassThinShader.transparencyMode = BABYLON.Material.MATERIAL_ALPHATEST;

    grassThinShader.onBind = function (mesh) {
        // const effect = grassThinShader.getEffect();
        // effect.setMatrix("view", scene.getViewMatrix());
        // effect.setFloat4("vFogInfos", scene.fogMode, scene.fogStart, scene.fogEnd, scene.fogDensity);
        // effect.setColor3("vFogColor", scene.fogColor);
    };

    scene.onBeforeRenderObservable.add(() => {
        const time = performance.now() * 0.001; // Current time in seconds
        grassThinShader.setFloat("time", time);
    });


    // const pbr = new BABYLON.PBRMetallicRoughnessMaterial("pbr", scene);
    const pbr = new BABYLON.StandardMaterial("myMaterial", scene);
    pbr.diffuseTexture = grassThinTexture;
    pbr.transparencyMode = BABYLON.Material.MATERIAL_ALPHATEST;
    pbr.diffuseTexture.hasAlpha = true;
    pbr.useAlphaFromDiffuseTexture = true;
    pbr.backFaceCulling = false;



    // var custom = new BABYLON.CustomMaterial("wobbleMaterial", scene);

    // custom.AddUniform('test1', 'vec3');

    // custom.Vertex_Before_PositionUpdated('float wave = 0.0; wave = sin(position.x * 1.0 + time) * 0.5; vec3 displacedPosition = position + vec3(0.0, wave, 0.0)\
    //   ');

    const leafShader = new BABYLON.ShaderMaterial(
        "leaves",
        scene,
        {
            vertex: "../../../shaders/env/grass",
            fragment: "../../../shaders/env/grass",
        },
        {
            attributes: ["position", "normal", "uv", "color"],
            uniforms: ["world", "worldView", "worldViewProjection", "view", "projection", "time"],
            needAlphaBlending: true
        });
    var leafTexture = new BABYLON.Texture("./assets/env/exterior/grass/leaves.png", scene);
    leafShader.setTexture("textureSampler", leafTexture);
    leafShader.backFaceCulling = false;

    scene.onBeforeRenderObservable.add(() => {
        const time = performance.now() * 0.001; // Current time in seconds
        leafShader.setFloat("time", time);
    });

    const treeShader = new BABYLON.StandardMaterial("trunk", scene);
    // treeShader.disableDepthWrite = true;
    treeShader.emissiveColor = new BABYLON.Color3(1, 1, 1);
    treeShader.diffuseTexture = new BABYLON.Texture("./assets/env/exterior/grass/trunk.png", scene);

    const grassNonMovement = new BABYLON.StandardMaterial("grassNonMovement", scene);
    // treeShader.disableDepthWrite = true;
    grassNonMovement.emissiveColor = new BABYLON.Color3(1, 1, 1);
    grassNonMovement.diffuseTexture = new BABYLON.Texture("./assets/env/exterior/grass/grass_transparent_shadow.png", scene);
    grassNonMovement.transparencyMode = BABYLON.Material.MATERIAL_OPAQUE;

    const leaves_sphereShader = new BABYLON.StandardMaterial("leaves_sphere", scene);
    // leaves_sphereShader.disableDepthWrite = true;
    leaves_sphereShader.emissiveColor = new BABYLON.Color3(1, 1, 1);
    leaves_sphereShader.diffuseTexture = new BABYLON.Texture("./assets/env/exterior/grass/leaves_tile_des.png", scene);

    let meshes = [];
    grasses.getChildMeshes().forEach(mesh => {
        // mesh.material.metallic = 0;
        // mesh.receiveShadows = true;
        // mesh.useVertexColors = true;
        // set levels
        meshes.push(mesh);
        mesh.scaling = new BABYLON.Vector3(5, 5, 5);
        // mesh.position.y = 5;
        if (mesh.name.toLowerCase().includes("grass") || mesh.name.toLowerCase().includes("leaves") || mesh.name.toLowerCase().includes("bush")) {
            // mesh.material = grassShader;
            mesh.material = grassThinShader;
            // mesh.material = pbr;
            // mesh.material = shaderMaterial;

        }
        if (mesh.name.toLowerCase().includes("trunk")) {
            mesh.material = treeShader;
            mesh.useVertexColors = false;
            mesh.refreshBoundingInfo();
            // mesh.renderingGroupId = 2;
            mesh.material.transparencyMode = BABYLON.Material.MATERIAL_OPAQUE;
        }
        if (mesh.name.toLowerCase().includes("leaves")) {
            // mesh.material = grassShader;
            // mesh.material.transparencyMode = BABYLON.Material.MATERIAL_OPAQUE;
            // mesh.material = leafShader;
            // mesh.scaling.x = 0.01;
            // mesh.scaling.y = 0.01;
            // mesh.scaling.z = 0.01;
        }
        if (mesh.name.toLowerCase().includes("sphere")) {
            mesh.material = leaves_sphereShader;
            mesh.useVertexColors = false;
            mesh.material.transparencyMode = BABYLON.Material.MATERIAL_OPAQUE;
        }
        mesh.isPickable = false;
    });
    // var grassMeshes = grasses.getChildMeshes();
    grassMeshes = meshes;

    // scatter grass
    // const positions = [];
    var grassesParentNode = new BABYLON.TransformNode("grasses", scene);


    function scatter(grassType, minX, maxX, minZ, maxZ, instanceCount) {
        // // Scatter positions randomly within a certain range
        for (let i = 0; i < instanceCount; i++) {

            let randomX = getRandomInRange(minX, maxX);
            let randomZ = getRandomInRange(minZ, maxZ);
            let randomYRotation = getRandomInRange(0, 2 * 3.14);

            // var newInstance = grassType.createInstance("grass" + i);
            var newInstance = grassType.clone("grass" + i);

            newInstance.position.x = randomX;
            newInstance.position.y = 5;
            newInstance.position.z = randomZ;

            newInstance.scaling.x = 5;
            if (grassType.scaling.y < 0) {
                newInstance.scaling.y = -grassType.scaling.y;
            } else {

            }

            newInstance.scaling.z = 5;

            newInstance.rotate(new BABYLON.Vector3(0, 1, 0), randomYRotation, BABYLON.Space.WORLD);
            newInstance.parent = grassesParentNode;

            // newInstance.position = new BABYLON.Vector3(5, 5, -10);
            // newInstance.rotation = new BABYLON.Vector3(0, 0, 0);
            // newInstance.scaling = new BABYLON.Vector3(1, 1, 1);

            newInstance.isPickable = false;
            newInstance.alwaysSelectAsActiveMesh = true;
            // newInstance.doNotSyncBoundingInfo = true;
            // newInstance.freezeWorldMatrix();
            // newInstance.alwaysSelectAsActiveMesh = true;
            // newInstance.billboardMode = 2;

        }
        // scene.freeActiveMeshes();

    }

    function scatterThin(grass_1, minX, maxX, minZ, maxZ, instanceCount) {
        const thinInstanceMesh = new BABYLON.InstancedMesh('thinInstanceMesh', fm('Grass_1'), 100);
        // // Scatter positions randomly within a certain range

        grassThinShader.transparencyMode = BABYLON.Material.MATERIAL_ALPHATESTANDBLEND
        grassThinShader.needDepthPrePass = true;
        // scene.enableDepthPrePass = true;
        scene.setRenderingAutoClearDepthStencil(1, false, false, false);
        // scene.useOrderIndependentTransparency = true;
        // grassThinShader.needAlphaBlending = function () { return true; };
        let thinGrass = grass_1.clone("thinGrass2");
        thinGrass.material = grassThinShader;

        let numInstances = instanceCount;
        // box.thinInstanceEnableUpdate(true);

        // Create matrices for instances
        let scale = fm('Grass_2').scaling;
        scale.x = 1.2;
        scale.y = 1.2;
        scale.z = 1.2;

        let matrices = [];
        for (let i = 0; i < numInstances; i++) {
            const matrix = BABYLON.Matrix.Identity();

            // Random position on the plane
            let x = getRandomInRange(minX, maxX);
            let z = getRandomInRange(minZ, maxZ);

            // Random rotation around Y axis
            const fixedRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, Math.PI / 2); // 90 degrees
            const randomRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, Math.random() * Math.PI * 2);
            const combinedRotation = fixedRotation.multiply(randomRotation);

            BABYLON.Matrix.ComposeToRef(
                scale,
                combinedRotation,
                new BABYLON.Vector3(x, z, 0),
                matrix
            );
            matrices.push(matrix);
        }

        var idx = thinGrass.thinInstanceAdd(matrices);

        return thinGrass;

    }


    // scene.useRightHandedSystem = true;
    // scene.freezeActiveMeshes();


    // create close up grass with good transparency rendering
    const fm = name => meshes.find(mesh => mesh.name === name);
    // todo: grid size
    let grassFull = fm('Grass_2').clone("grassFull");
    // createInstance("test");
    grassFull.parent = null;
    grassFull.position.x = 20;
    grassFull.position.y = 5;
    grassFull.position.z = 5;
    grassFull.scaling.y = -5;
    grassFull.material = grassShader;
    grassFull.INSTANCEDMESH_SORT_TRANSPARENT = true;
    // scatter(grassFull, -300, 300, 100, 300, 100);


    fm('Grass_2_Geo').material = grassThinShader;
    // create grass instance one 1 draw call in the distance
    let grassInstance = fm('Grass_2_Geo').clone("grassInstance");
    // createInstance("test");
    grassInstance.parent = null;
    grassInstance.position.x = 40;
    grassInstance.position.y = 5;
    grassInstance.position.z = 5;
    grassInstance.scaling.y = 5;
    grassInstance.material = grassThinShader;
    grassInstance.INSTANCEDMESH_SORT_TRANSPARENT = true;
    // scatter(grassInstance, -300, 300, 400, 600, 1000);
    // scatter(grassInstance, -300, 300, 100, 600, 1000);
    // scatter(grassInstance, -300, 300, 100, 1000, 2000);

    // let grassFlowerInstance = fm('Grass_3_Geo').clone("grassFlowerInstance");
    // // createInstance("test");
    // grassFlowerInstance.parent = null;
    // grassFlowerInstance.position.x = 40;
    // grassFlowerInstance.position.y = 5;
    // grassFlowerInstance.position.z = 5;
    // grassFlowerInstance.scaling.y = 5;
    // grassFlowerInstance.material = grassThinShader;
    // grassFlowerInstance.INSTANCEDMESH_SORT_TRANSPARENT = true;
    // scatter(grassInstance, -300, 300, 100, 600, 1000);

    // scatter(fm('Grass_1'), -300, 300, 100, 300, 100);
    // scatter(fm('Grass_2'), 0, 100, 100, 200, 100);
    // scatter(fm('Grass_3'), -300, 300, 100, 300, 100);

    // todo have radius around player to show grass


    // // var matrix = BABYLON.Matrix.Translation(30, 5, 5);
    // // var idx = meshes[0].thinInstanceAdd(matrix);

    // var matrix = BABYLON.Matrix.Translation(-2, 2, 0);
    // var idx = sphere.thinInstanceAdd(matrix);

    // Add thin instances

    // let grassThinAllInstances = scatterThin(grassInstance, -100, 100, -100, 100, 300);
    grassInfo.scene = scene;
    reloadGrass();
    // return grassThinAllInstances;

    // scatterThin(fm('Grass_2'), -300, 300, -300, 300, 30000);
    // scatterThin(fm('Grass_3'), -300, 300, -300, 300, 30000);
    // let box = fm('Grass_1');
    // box.material = grassThinShader;



    // Set thin instance buffer
    // box.thinInstanceSetBuffer("matrix", matrices.flatMap(m => m.asArray()), 16);



    // var box = BABYLON.BoxBuilder.CreateBox("root", { size: 1 });
    // var box = grasses.getChildMeshes()[0];

    // var numPerSide = 10, size = 1, ofst = size / (numPerSide - 1);

    // var m = BABYLON.Matrix.Identity();
    // var col = 0, index = 0;

    // let instanceCount = numPerSide * numPerSide * numPerSide;

    // let matricesData = new Float32Array(16 * instanceCount);
    // let colorData = new Float32Array(4 * instanceCount);

    // for (var x = 0; x < numPerSide; x++) {
    //     m.m[12] = -size / 2 + ofst * x;
    //     for (var y = 0; y < numPerSide; y++) {
    //         m.m[13] = -size / 2 + ofst * y;
    //         for (var z = 0; z < numPerSide; z++) {
    //             m.m[14] = -size / 2 + ofst * z;

    //             m.copyToArray(matricesData, index * 16);

    //             var coli = Math.floor(col);

    //             // colorData[index * 4 + 0] = ((coli & 0xff0000) >> 16) / 255;
    //             // colorData[index * 4 + 1] = ((coli & 0x00ff00) >> 8) / 255;
    //             // colorData[index * 4 + 2] = ((coli & 0x0000ff) >> 0) / 255;
    //             // colorData[index * 4 + 3] = 1.0;

    //             index++;
    //             col += 0xffffff / instanceCount;
    //         }
    //     }
    // }

    // box.thinInstanceSetBuffer("matrix", matricesData, 16);
    // box.thinInstanceSetBuffer("color", colorData, 4);

    // // box.material = new BABYLON.StandardMaterial("material");
    // box.material = grassThinShader;
    // box.material.disableLighting = true;
    // box.material.emissiveColor = BABYLON.Color3.White();
}
