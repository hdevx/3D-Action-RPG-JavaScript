export async function loadingAnim(scene, urls) {

    const mesh = scene.getMeshByName("Dungeon_primitive0");
    // console.log(mesh);
    if (!mesh) {
        return;
    }


    if (mesh.instances && mesh.instances.length > 0) {
        console.log("Regular instances:", mesh.instances.length);
    } else if (mesh.hasThinInstances) {
        console.log("Thin instances:", mesh.thinInstanceCount);
    } else {
        console.log("No instances found. This might be a regular mesh.");
    }

    const allInstances = scene.meshes.filter(mesh => mesh instanceof BABYLON.InstancedMesh);
    allInstances.forEach(instances => {
        console.log("Instanced mesh name:", instances.name);
        console.log("Number of instances:", instances.instances.length);
    });
}

function playAnim() {

}

