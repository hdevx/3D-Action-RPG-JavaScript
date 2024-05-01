// Function to batch load multiple GLB files and store them
export async function loadModels(scene, urls) {
    const modelsDict = {}; // Dictionary to hold the loaded models
    for (let url of urls) {
        await loadModel(scene, url, modelsDict);
    }
    return modelsDict; // Return the dictionary containing all the models
}

async function loadModel(scene, url, modelsDict) {
    const result = await BABYLON.SceneLoader.ImportMeshAsync("", "/assets/", url, scene);
    console.log(`Loaded ${url}`);
    let selector = url.split("/").pop().replace('.glb', ''); // "slime1.glb"
    modelsDict[selector] = result.meshes[0]; // Store the first mesh in the dictionary with the URL as key
    return result.meshes[0];
}

