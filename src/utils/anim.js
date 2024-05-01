
export  function setupAnim(scene) {
    let anim = {};
    // anim.BreathingIdle = scene.beginWeightedAnimation(skeleton, scene.getAnimationGroupByName("BreathingIdle").from, scene.getAnimationGroupByName("BreathingIdle").to, 0.0, true);
    // anim.Running = scene.beginWeightedAnimation(skeleton, scene.getAnimationGroupByName("RunningSprint").from, scene.getAnimationGroupByName("RunningSprint").to, 0.0, true);
    // anim.Running.weight = 1.0;
    // anim.BreathingIdle.syncWith(anim.Running);

    anim.BreathingIdle = scene.getAnimationGroupByName("BreathingIdle");
    anim.Running = scene.getAnimationGroupByName("RunningSprint");
    anim.Jump = scene.getAnimationGroupByName("Jump");
    anim.Roll = scene.getAnimationGroupByName("SprintingForwardRollInPlace");
    anim.SelfCast = scene.getAnimationGroupByName('Standing 2H Magic Area Attack 02');
    anim.Combo = scene.getAnimationGroupByName('OneHandClubCombo');
    anim.Attack = scene.getAnimationGroupByName('Sword And Shield Attack');
    
    scene.animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride();
    scene.animationPropertiesOverride.enableBlending = true;
    scene.animationPropertiesOverride.blendingSpeed = 0.15;
    // scene.animationPropertiesOverride.loopMode = 0;
    // for (let aniCounter = 0; aniCounter < scene.animationGroups.length; aniCounter++) {
    //     for (let index = 0; index < scene.animationGroups[aniCounter].targetedAnimations.length; index++) {
    //       let animation = scene.animationGroups[aniCounter].targetedAnimations[index].animation
    //       animation.enableBlending = true
    //       animation.blendingSpeed = 0.02;
    //     }
    //   }

    // anim.runAnim = scene.beginWeightedAnimation(hero, anim.Running.from, anim.Running.to, 0, true);

    return anim;
}