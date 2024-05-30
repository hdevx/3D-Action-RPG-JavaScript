import { placeOnTerrain } from "../place.js";
export async function placeVeg(scene) {
    // const transformNode = new BABYLON.TransformNode("gen");
    // transformNode.scaling.z = -1;
    // tree.parent = transformNode;

    const result = await BABYLON.SceneLoader.ImportMeshAsync(null, "./assets/env/", "springruins.glb", scene);
    let bush = result.meshes[0];
    let tree = result.meshes[4];

    tree.parent.scaling.z = 1;

    tree.material.transparencyMode = BABYLON.Material.MATERIAL_ALPHATEST;
    tree.material.albedoTexture.hasAlpha = true;
    tree.material.environmentIntensity = 0;
    // let allMeshes = env.getChildMeshes();

    for (let i = 0; i < 10; i++) {
        const x = (Math.random() * 1000 - 500) + 40;
        const z = (Math.random() * 1000 - 500) + 200;
        let treeC = tree.clone('tree');
        let scaleSize = 0.5;
        let minSize = 1.5;
        let treeScale = Math.random() * (2 * scaleSize) - (1 * scaleSize) + minSize;
        // let treeScaleY = Math.random() * (2 * scaleSize) - (1 * scaleSize) + (minSize + minSize);
        // console.log(treeScale);
        treeC.scaling = new BABYLON.Vector3(treeScale, treeScale, treeScale * 2.0);
        placeOnTerrain(scene, treeC, x, z, -10);
    }

}