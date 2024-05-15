
export default function addSword(scene, sword) {
    let childMeshes = sword.getChildMeshes();

    // To find a specific child by name
    let specificChild = childMeshes.find(mesh => mesh.name === "mesh");
    if (specificChild.material && specificChild.material instanceof BABYLON.PBRMaterial) {
        specificChild.material._albedoColor = new BABYLON.Color3(2.7, 2.7, 2.7);
        specificChild.material.metallic = 1;
        specificChild.material.roughness = 1;
        // specificChild.material.roughness = 0.1; // looked cool, consider displacement maps 
        console.log(specificChild.material);
    } else {
        console.error("Sword material is not a PBRMaterial or is not assigned");
    }

    const rightHand = findAllMeshesByName(scene.meshes, "mixamorig:RightHand")[0];
    attachSwordToBone(specificChild, rightHand);

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

function attachSwordToBone(sword, rightHand) {
    let position = new BABYLON.Vector3(0, 26, 10);
    let scaling = new BABYLON.Vector3(500, 500, 500);
    let rotation = BABYLON.Quaternion.FromEulerAngles(
        degreesToRadians(0),    // 0 degrees in radians
        degreesToRadians(100),  // 100 degrees in radians
        degreesToRadians(180)   // 180 degrees in radians
    );
    attachToBone(sword, rightHand, position, scaling, rotation);
}


const degreesToRadians = (degrees) => degrees * Math.PI / 180;

function attachToBone(mesh, bone, position, scaling, rotation) {
    if (bone) {
        mesh.parent = bone;
        mesh.position = position; // Adjust position relative to the bone as needed
        mesh.scaling = scaling;
        mesh.rotationQuaternion = rotation;
    } else {
        console.error("Bone not found");
    }
}
