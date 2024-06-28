export async function setupPhysics(scene, spawnPoint) {
    const normalGravity = new BABYLON.Vector3(0, -100.81, 0);
    const heavyGravity = new BABYLON.Vector3(0, -200, 0);

    // scene.enablePhysics(normalGravity, new BABYLON.CannonJSPlugin());
    // scene.physicsEnabled = false;
    const havokInstance = await HavokPhysics();
    const havokPlugin = new BABYLON.HavokPlugin(true, havokInstance);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), havokPlugin);
    scene.physicsEnabled = false;


    let dummyPhysicsRoot = BABYLON.MeshBuilder.CreateCapsule("dummyPhysicsRoot", { radius: 4, height: 22, width: 100 }, scene);
    // var dummyPhysicsRoot = new BABYLON.MeshBuilder.create("dummyPhysicsRoot", {size: 1, height: 2, width: 1}, scene);
    // dummyPhysicsRoot.addChild(newMeshes[0]);
    // DummyPhysicsRoot Visibility Change to 0 to Hide
    // dummyPhysicsRoot.visibility = 0.8;
    dummyPhysicsRoot.visibility = 0.0;
    dummyPhysicsRoot.position.y = 100;

    var dummyAggregate = new BABYLON.PhysicsAggregate(dummyPhysicsRoot, BABYLON.PhysicsShapeType.CAPSULE, { mass: 500, restitution: 0.0, friction: 1.0 }, scene);
    dummyAggregate.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
    // movePlayer(dummyAggregate);
    dummyAggregate.body.setCollisionCallbackEnabled(true);
    dummyAggregate.body.setMassProperties({
        inertia: new BABYLON.Vector3(0, 0, 0)
    });
    dummyAggregate.body.setGravityFactor(20);
    // dummyAggregate.body.setLinearDamping(0.9);


    havokInstance.HP_Body_SetPosition(dummyAggregate.body._pluginData.hpBodyId, [spawnPoint.x, spawnPoint.y, spawnPoint.z]);

    // dummyAggregate.body.setAxisFriction(BABYLON.HavokPlugin.LockConstraint, BABYLON.HavokPlugin.LINEAR_Y, 0);
    // camera.position.copyFrom(dummyPhysicsRoot.position)
    // dummyPhysicsRoot.setDirection(camera.getForwardRay().direction)

    // const observable = dummyAggregate.body.getCollisionObservable();
    // const observer = observable.add((collisionEvent) => {
    //     if(lflag){
    //          console.log(collisionEvent)
    //         lflag = false;
    //     }
    // });



    return {
        character: dummyPhysicsRoot,
        dummyAggregate: dummyAggregate
    };

    // return {dummyPhysicsRoot, dummyAggregate};


    // character.physicsImpostor.registerOnPhysicsCollide(ground.physicsImpostor, function(main, collided) {
    //     characterCanJump = true; // Enable jumping again when touching the ground
    // });
}