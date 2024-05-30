
export function SlashEffect() {
    // get active scene manager,
    // get weapon
    // let slashEffect = createSlashEffect(scene, sword);

    // Trigger effect, for example, during an animation event
    // triggerSlashEffect(slashEffect);
}

function triggerSlashEffect(particleSystem, duration = 300) {
    particleSystem.start();

    // Stop the particle system after a short duration (duration of the slash)
    setTimeout(() => {
        particleSystem.stop();
    }, duration);
}



function createSlashEffect(scene, emitterObject) {
    // Create a particle system
    let particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);

    // Texture of particles
    particleSystem.particleTexture = new BABYLON.Texture("textures/flare.png", scene);

    // Where the particles come from
    particleSystem.emitter = emitterObject; // the starting object, the sword or similar
    particleSystem.minEmitBox = new BABYLON.Vector3(0, 0, 0); // Starting all from
    particleSystem.maxEmitBox = new BABYLON.Vector3(0, 0, 0); // To...

    // Colors of all particles
    particleSystem.color1 = new BABYLON.Color4(1, 0.5, 0.5, 1.0);
    particleSystem.color2 = new BABYLON.Color4(1, 0.5, 0, 1.0);
    particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);

    // Size of each particle
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.5;

    // Life time of each particle (random between...)
    particleSystem.minLifeTime = 0.2;
    particleSystem.maxLifeTime = 0.5;

    // Emission rate
    particleSystem.emitRate = 500;

    // Blend mode : BLENDMODE_ONEONE, BLENDMODE_STANDARD
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

    // Set the gravity of all particles
    particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);

    // Direction of each particle after it has been emitted
    particleSystem.direction1 = new BABYLON.Vector3(-1, 1, -1);
    particleSystem.direction2 = new BABYLON.Vector3(1, 1, 1);

    // Angular speed, in radians
    particleSystem.minAngularSpeed = 0;
    particleSystem.maxAngularSpeed = Math.PI;

    // Speed
    particleSystem.minEmitPower = 1;
    particleSystem.maxEmitPower = 3;
    particleSystem.updateSpeed = 0.005;

    return particleSystem;
}