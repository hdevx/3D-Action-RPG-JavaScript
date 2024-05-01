export async function loadHeroModel(scene, character) {
    const result = await BABYLON.SceneLoader.ImportMeshAsync(null, "/assets/characters/human_basemesh/", "HumanBaseMesh_WithEquips.glb", scene);
    let hero = result.meshes[0];
    // hero.parent = character;
	character.addChild(hero);
	
    // // hero.scaling.scaleInPlace(0.7);
    hero.scaling.scaleInPlace(3.7);
    hero.position.y = -11;

	// Convert -90 degrees to radians
var degrees = -90;
var radians = degrees * (Math.PI / 180);
// console.log(hero._children[0]);
// Set rotation on the Y-axis
// hero._children[0].rotation.z = radians;




// make shadow under character

    // hero.isVisible = false;
    // const groundMat = new BABYLON.StandardMaterial("groundMat");
    
    // let jump = scene.getAnimationGroupByName("BreathingIdle");
    // jump.start(true, 1.0, jump.from, jump.to, false);
    var skeleton = result.skeletons[0];

	   // Assuming the root bone is the first bone
	   var rootBone = skeleton.bones[0];

	   rootBone.animations = [];

	   // Override the root bone's position updates
	   scene.onBeforeRenderObservable.add(() => {
		   rootBone.position = BABYLON.Vector3.Zero();  // Negate root motion
		   rootBone.rotationQuaternion = BABYLON.Quaternion.Identity();  // Optional: Negate root rotation
	   });



    // Find the root bone index if you don't already know it
    // var rootBone = skeleton.bones.filter(bone => bone.name === "mixamorig:Hips")[0];

    // var animation = rootBone.getAnimationRange("RunningSprint");
    // if (animation) {
    //     var keys = animation.getKeys();
    //     for (var key of keys) {
    //         key.value.position = BABYLON.Vector3.Zero(); // Remove position changes
    //         key.value.rotationQuaternion = BABYLON.Quaternion.Identity(); // Optional: Remove rotation changes
    //     }
    //     rootBone.animations[0].setKeys(keys);
    // }


    // result.meshes[1].material.transparencyMode = BABYLON.Material.MATERIAL_OPAQUE;
    result.meshes[0].getChildren()[0].getChildren().forEach(mesh => {
		if (mesh.material) mesh.material.transparencyMode = BABYLON.Material.MATERIAL_OPAQUE;
        // mesh.material = groundMat;
		// mesh.material.transparencyMode = BABYLON.Material.MATERIAL_OPAQUE;
    });
    // result.meshes[1].material.backFaceCulling = true;
    // result.meshes[1].flipNormal = groundMat;
    // result.meshes[1].flipNormal.isEnabled = true;
	// await loadArmor(scene, skeleton, character);
    return {hero: hero, skeleton: skeleton};
}

async function loadArmor(scene, skeleton, character){
	// const shirt = await BABYLON.SceneLoader.ImportMeshAsync(null, "/assets/characters/human_basemesh/shirt/", "NewSkeleton10anim_shirt.glb", scene);
	// let shirtMesh = shirt.meshes[1];
	// console.log(shirt);
	// shirtMesh.skeleton = skeleton;
	// character.addChild(shirtMesh);
	
    // shirtMesh.scaling.scaleInPlace(3.7);
    // shirtMesh.position.y = -11;

	// can use bablyon js outline for black outline, select, 
}
	// // Model by Mixamo
	// BABYLON.SceneLoader.ImportMesh("", "./scenes/", "Xbot.glb", scene, function (newMeshes) {
	// 	shadowGenerator.addShadowCaster(scene.meshes[0], true);
	// 	for (var index = 0; index < newMeshes.length; index++) {
	// 		newMeshes[index].receiveShadows = false;;
	// 	}

	// 	var helper = scene.createDefaultEnvironment({
	// 		enableGroundShadow: true
	// 	});
	// 	helper.setMainColor(BABYLON.Color3.Gray());
	// 	helper.ground.position.y += 0.01;

	// 	// Initialize override animations, turn on idle by default
	// 	var idleAnim = scene.animationGroups.find(a => a.name === 'idle');
	// 	var idleParam = { name: "Idle", anim: idleAnim, weight: 1 };
    //     idleAnim.weight = 1;
	// 	idleAnim.play(true);

	// 	var walkAnim = scene.animationGroups.find(a => a.name === 'walk');
	// 	var walkParam = { name: "Walk", anim: walkAnim, weight: 0 };
    //     walkAnim.weight = 0;
	// 	walkAnim.play(true);

	// 	var runAnim = scene.animationGroups.find(a => a.name === 'run');
	// 	var runParam = { name: "Run", anim: runAnim, weight: 0 };
    //     runAnim.weight = 0;
	// 	runAnim.play(true);

	// 	// Initialize additive poses. Slice of reference pose at first frame
	// 	var sadPoseAnim = BABYLON.AnimationGroup.MakeAnimationAdditive(scene.animationGroups.find(a => a.name === 'sad_pose'));
	// 	var sadPoseParam = { name: "Sad Pose", anim: sadPoseAnim, weight: 0. };
    //     sadPoseAnim.weight = 0;
	// 	sadPoseAnim.start(true, 1, 0.03333333507180214 * 60, 0.03333333507180214 * 60);

	// 	var sneakPoseAnim = BABYLON.AnimationGroup.MakeAnimationAdditive(scene.animationGroups.find(a => a.name === 'sneak_pose'));
	// 	var sneakPoseParam = { name: "Sneak Pose", anim: sneakPoseAnim, weight: 0. };
    //     sneakPoseAnim.weight = 0;
	// 	sneakPoseAnim.start(true, 1, 0.03333333507180214 * 60, 0.03333333507180214 * 60);

	// 	// Initialize additive animations
	// 	var headShakeAnim = BABYLON.AnimationGroup.MakeAnimationAdditive(scene.animationGroups.find(a => a.name === 'headShake'));
	// 	var headShakeParam = { name: "Head Shake", anim: headShakeAnim, weight: 0. };
    //     headShakeAnim.weight = 0;
	// 	headShakeAnim.play(true);

	// 	var agreeAnim = BABYLON.AnimationGroup.MakeAnimationAdditive(scene.animationGroups.find(a => a.name === 'agree'));
	// 	var agreeParam = { name: "Agree", anim: agreeAnim, weight: 0. };
    //     agreeAnim.weight = 0;
	// 	agreeAnim.play(true);

	// 	// UI
	// 	var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
	// 	var UiPanel = new BABYLON.GUI.StackPanel();
	// 	UiPanel.width = "220px";
	// 	UiPanel.fontSize = "14px";
	// 	UiPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
	// 	UiPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
	// 	advancedTexture.addControl(UiPanel);

	// 	// Keep track of the current override animation
	// 	var currentParam = idleParam;

	// 	function onBeforeAnimation() {
	// 		// Increment the weight of the current override animation
	// 		if (currentParam) {
	// 			currentParam.weight = BABYLON.Scalar.Clamp(currentParam.weight + 0.01, 0, 1);
	// 			currentParam.anim.weight = currentParam.weight;
	// 		}

	// 		// Decrement the weight of all override animations that aren't current
	// 		if (currentParam !== idleParam) {
	// 			idleParam.weight = BABYLON.Scalar.Clamp(idleParam.weight - 0.01, 0, 1);
	// 			idleParam.anim.weight = idleParam.weight;
	// 		}

	// 		if (currentParam !== walkParam) {
	// 			walkParam.weight = BABYLON.Scalar.Clamp(walkParam.weight - 0.01, 0, 1);
	// 			walkParam.anim.weight = walkParam.weight;
	// 		}

	// 		if (currentParam !== runParam) {
	// 			runParam.weight = BABYLON.Scalar.Clamp(runParam.weight - 0.01, 0, 1);
	// 			runParam.anim.weight = runParam.weight;
	// 		}

	// 		// Remove the callback the current animation weight reaches 1 or
	// 		// when all override animations reach 0 when current is undefined
	// 		if ((currentParam && currentParam.weight === 1)
	// 			|| (idleParam.weight === 0 && walkParam.weight === 0 && runParam.weight === 0)) {
	// 			scene.onBeforeAnimationsObservable.removeCallback(onBeforeAnimation);
	// 		}
	// 	};

	// 	// Button for blending to bind pose
	// 	var button = BABYLON.GUI.Button.CreateSimpleButton("but0", "None");
	// 	button.paddingTop = "10px";
	// 	button.width = "100px";
	// 	button.height = "50px";
	// 	button.color = "white";
	// 	button.background = "green";
	// 	button.onPointerDownObservable.add(function () {
	// 		// Remove current animation
	// 		currentParam = undefined;

	// 		// Restart animation observer
	// 		scene.onBeforeAnimationsObservable.removeCallback(onBeforeAnimation);
	// 		scene.onBeforeAnimationsObservable.add(onBeforeAnimation);
	// 	});
	// 	UiPanel.addControl(button);

	// 	// Button for blending to idle
	// 	var button = BABYLON.GUI.Button.CreateSimpleButton("but0", "Idle");
	// 	button.paddingTop = "10px";
	// 	button.width = "100px";
	// 	button.height = "50px";
	// 	button.color = "white";
	// 	button.background = "green";
	// 	button.onPointerDownObservable.add(function () {
	// 		// Do nothing if idle is already the current animation
	// 		if (currentParam === idleParam) {
	// 			return;
	// 		}

	// 		// Restart animation observer with idle set to current
	// 		scene.onBeforeAnimationsObservable.removeCallback(onBeforeAnimation);	
	// 		currentParam = idleParam;
	// 		scene.onBeforeAnimationsObservable.add(onBeforeAnimation);
	// 	});
	// 	UiPanel.addControl(button);

	// 	// Button for blending to walk
	// 	button = BABYLON.GUI.Button.CreateSimpleButton("but0", "Walk");
	// 	button.paddingTop = "10px";
	// 	button.width = "100px";
	// 	button.height = "50px";
	// 	button.color = "white";
	// 	button.background = "green";
	// 	button.onPointerDownObservable.add(function () {
	// 		// Do nothing if walk is already the current animation
	// 		if (currentParam === walkParam) {
	// 			return;
	// 		}

	// 		// Synchronize animations
	// 		if (currentParam) {
	// 			walkParam.anim.syncAllAnimationsWith(null);
	// 			currentParam.anim.syncAllAnimationsWith(walkParam.anim.animatables[0]);
	// 		}

	// 		// Restart animation observer with walk set to current
	// 		scene.onBeforeAnimationsObservable.removeCallback(onBeforeAnimation);	
	// 		currentParam = walkParam;
	// 		scene.onBeforeAnimationsObservable.add(onBeforeAnimation);
	// 	});
	// 	UiPanel.addControl(button);

	// 	// Button for blending to run
	// 	button = BABYLON.GUI.Button.CreateSimpleButton("but0", "Run");
	// 	button.paddingTop = "10px";
	// 	button.width = "100px";
	// 	button.height = "50px";
	// 	button.color = "white";
	// 	button.background = "green";
	// 	button.onPointerDownObservable.add(function () {
	// 		// Do nothing if run is already the current animation
	// 		if (currentParam === runParam) {
	// 			return;
	// 		}

	// 		// Synchronize animations
	// 		if (currentParam) {
	// 			runParam.anim.syncAllAnimationsWith(null);
	// 			currentParam.anim.syncAllAnimationsWith(runParam.anim.animatables[0]);
	// 		}

	// 		// Restart animation observer with run set to current
	// 		scene.onBeforeAnimationsObservable.removeCallback(onBeforeAnimation);	
	// 		currentParam = runParam;
	// 		scene.onBeforeAnimationsObservable.add(onBeforeAnimation);
	// 	});
	// 	UiPanel.addControl(button);

	// 	// Create a slider to control the weight of each additive pose/animation
	// 	var params = [
	// 		sadPoseParam,
	// 		sneakPoseParam,
	// 		headShakeParam,
	// 		agreeParam
	// 	]
	// 	params.forEach((param) => {
	// 		// Label
	// 		var header = new BABYLON.GUI.TextBlock();
	// 		header.text = param.name + ":" + param.weight.toFixed(2);
	// 		header.height = "40px";
	// 		header.color = "green";
	// 		header.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
	// 		header.paddingTop = "10px";
	// 		UiPanel.addControl(header);

	// 		// Slider
	// 		var slider = new BABYLON.GUI.Slider();
	// 		slider.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
	// 		slider.minimum = 0;
	// 		slider.maximum = 1;
	// 		slider.color = "green";
	// 		slider.value = param.anim.weight;
	// 		slider.height = "20px";
	// 		slider.width = "205px";
	// 		UiPanel.addControl(slider);

	// 		// Update animation weight value according to slider value
	// 		slider.onValueChangedObservable.add((v) => {
 	// 			param.anim.weight = v;
	// 			param.weight = v;
	// 			header.text = param.name + ":" + param.weight.toFixed(2);
	// 		})
	// 		param.anim._slider = slider;
	// 		slider.value = param.weight;
	// 	});

	// 	engine.hideLoadingUI();
	// }, function () {
	// });