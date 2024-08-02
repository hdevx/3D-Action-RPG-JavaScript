
function loadShaders() {

}

function setupMeshes() {

}

let grassInfo = {};
export function reloadGrass() {

    const fm = name => grassMeshes.find(mesh => mesh.name === name);
    let grassInstance = fm('Grass_2_Geo').clone("grassInstance");
    // createInstance("test");
    grassInstance.parent = null;
    grassInstance.position.x = 40;
    grassInstance.position.y = 5;
    grassInstance.position.z = 5;
    grassInstance.scaling.y = 5;
    // grassInstance.material = grassThinShader;
    grassInstance.INSTANCEDMESH_SORT_TRANSPARENT = true;
    // scatterThin(grassInstance, -100, 100, -100, 100, 3);
    scatterThin(grassInstance, -100, 100, -100, 100, 1000);
}
function getRandomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

function getHeightOnGridAtPoint(x, z) {
    x = (x + 8) * 5;
    z = (z + 1) * 5;
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
    const maxIterations = grassInfo.grass.bufferMatrices.length / 16;


    for (let i = 0; i < maxIterations; i++) {
        // Perform your operations here
        let cords = getCoordinatesFromMatrix(grassInfo.grass.bufferMatrices, i);
        // console.log(array[i]);
        // console.log(cords.y);
        let newY = getHeightOnGridAtPoint(cords.x, cords.z);
        grassInfo.grass.bufferMatrices[i * 16 + 13] = newY;
    }

    grassInfo.grass.parent.thinInstanceSetBuffer("matrix", grassInfo.grass.bufferMatrices, 16, true); // matrix buffer is updateable, static is false

}

function scatterThin(grass_1, minX, maxX, minZ, maxZ, instanceCount) {

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
    scale.x = 1.2;
    scale.y = 1.2;
    scale.z = 1.2;

    let matrices = [];
    var bufferMatrices = new Float32Array(16 * numInstances);
    for (let i = 0; i < numInstances; i++) {
        const matrix = BABYLON.Matrix.Identity();

        // Random position on the plane
        let x = getRandomInRange(minX, maxX);
        let z = getRandomInRange(minZ, maxZ);

        // Random rotation around Y axis
        // const noRotation = BABYLON.Quaternion.Identity();
        const fixedRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, -Math.PI / 2); // 90 degrees
        const randomRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, Math.random() * Math.PI * 2);
        const combinedRotation = fixedRotation.multiply(randomRotation);


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
            needAlphaBlending: true
        });


    var grassThinTexture = new BABYLON.Texture("./assets/env/exterior/grass/grass_transparent_shadow.png", scene);
    grassThinShader.setTexture("textureSampler", grassThinTexture);
    // grassThinShader.backFaceCulling = false;
    grassThinShader.imageProcessingConfiguration = new BABYLON.ImageProcessingConfiguration();
    grassThinShader.imageProcessingConfiguration.exposure = 0.0; // Set to default exposure
    grassThinShader.imageProcessingConfiguration.contrast = 0.0; // Set to default contrast
    grassThinShader.imageProcessingConfiguration.vignetteWeight = 0; // Disable vignette
    grassThinShader.imageProcessingConfiguration.colorGradingTexture = null; // Remove color grading
    grassThinShader.imageProcessingConfiguration.toneMappingEnabled = false; // Disable tone mapping
    // grassThinShader.disableDepthWrite = true;
    grassThinShader.setArray4("world0", [1, 0, 0, 0]);
    grassThinShader.setArray4("world1", [0, 1, 0, 0]);
    grassThinShader.setArray4("world2", [0, 0, 1, 0]);
    grassThinShader.setArray4("world3", [0, 0, 0, 1]);
    grassThinShader.backFaceCulling = false;
    grassThinShader.needDepthPrePass = true;
    grassThinShader.transparencyMode = BABYLON.Material.MATERIAL_OPAQUE;
    grassThinShader.transparencyMode = BABYLON.Material.MATERIAL_ALPHATESTANDBLEND;

    grassThinShader.onBind = function (mesh) {
        const effect = grassThinShader.getEffect();
        effect.setMatrix("view", scene.getViewMatrix());
        effect.setFloat4("vFogInfos", scene.fogMode, scene.fogStart, scene.fogEnd, scene.fogDensity);
        effect.setColor3("vFogColor", scene.fogColor);
    };

    scene.onBeforeRenderObservable.add(() => {
        const time = performance.now() * 0.001; // Current time in seconds
        grassThinShader.setFloat("time", time);
    });





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
        if (mesh.name.toLowerCase().includes("grass") || mesh.name.toLowerCase().includes("leaves")) {
            mesh.material = grassShader;
        }
        if (mesh.name.toLowerCase().includes("trunk")) {
            mesh.material = treeShader;
            mesh.useVertexColors = false;
            mesh.refreshBoundingInfo();
            // mesh.renderingGroupId = 2;
            mesh.material.transparencyMode = BABYLON.Material.MATERIAL_OPAQUE;
        }
        if (mesh.name.toLowerCase().includes("leaves")) {
            mesh.material = grassShader;
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

            var newInstance = grassType.createInstance("grass" + i);

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
    // grassFull.INSTANCEDMESH_SORT_TRANSPARENT = true;
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
