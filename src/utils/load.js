export async function loadModels(scene, urls) {
    const loadModelPromises = urls.map(url => loadModel(scene, url)); // Create an array of promises
    const modelsArray = await Promise.all(loadModelPromises); // Await all promises in parallel
    const modelsDict = modelsArray.reduce((acc, result, index) => {
        let selector = urls[index].split("/").pop().replace('.glb', '');
        acc[selector] = result.meshes[0]; // Store the first mesh in the dictionary with the URL as key
        return acc;
    }, {});
    return modelsDict; // Return the dictionary containing all the models
}

async function loadModel(scene, url) {
    const result = await BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", url, scene);
    console.log(`Loaded ${url}`);
    return result;
}
