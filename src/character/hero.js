export async function loadHeroModel(scene, character) {
	const result = await BABYLON.SceneLoader.ImportMeshAsync(null, "./assets/characters/human_basemesh/", "HumanBaseMesh_WithEquips.glb", scene);

	// 	result.meshes.forEach(mesh => {
	// 		if (mesh.material) mesh.material.dispose();
	// 	});

	let hero = result.meshes[0];
	// hero.parent = character;
	character.addChild(hero);

	// // hero.scaling.scaleInPlace(0.7);
	hero.scaling.scaleInPlace(3.7);
	hero.position.y = -11;

	// Convert -90 degrees to radians
	var degrees = -90;
	var radians = degrees * (Math.PI / 180);

	var skeleton = result.skeletons[0];

	// Assuming the root bone is the first bone
	var rootBone = skeleton.bones[0];

	rootBone.animations = [];

	// Override the root bone's position updates
	scene.onBeforeRenderObservable.add(() => {
		rootBone.position = BABYLON.Vector3.Zero();  // Negate root motion
		rootBone.rotationQuaternion = BABYLON.Quaternion.Identity();  // Optional: Negate root rotation
	});




	result.meshes[0].getChildren()[0].getChildren().forEach(mesh => {
		if (mesh.material) mesh.material.transparencyMode = BABYLON.Material.MATERIAL_OPAQUE;
	});
	// result.meshes[1].material.backFaceCulling = true;
	// result.meshes[1].flipNormal = groundMat;
	// result.meshes[1].flipNormal.isEnabled = true;
	// await loadArmor(scene, skeleton, character);
	return { hero: hero, skeleton: skeleton };
}
