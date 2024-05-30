export class Projectile {
    constructor(growthDuration, moveToTargetDuration, offset) {
        this.growthDuration = growthDuration;
        this.moveToTargetDuration = moveToTargetDuration;
        this.offset = offset;
    }

    launch(caster, target) {
        let fireorb = VFX['fireBall'];
        const clonedFireorb = this.cloneProjectile(fireorb, caster);
        this.growObject(clonedFireorb, () => {
            this.moveToTarget(clonedFireorb, target.parent);
        });
    }

    cloneProjectile(fireorb, caster) {
        const clonedProjectile = fireorb.clone("clonedFireorb");
        SCENE_MANAGER.activeScene.addMesh(clonedProjectile);
        clonedProjectile.position = caster.parent.transformNode._absolutePosition;
        clonedProjectile.position.x = clonedProjectile.position.x + this.offset.x;
        clonedProjectile.position.y = clonedProjectile.position.y + this.offset.y;
        clonedProjectile.position.z = clonedProjectile.position.z + this.offset.z;


        return clonedProjectile;
    }

    addTrail() {

    }



    growObject(object, onComplete) {
        const initialScaling = object.scaling.clone();
        const finalScaling = initialScaling.scale(2); // Scaling the object to twice its size

        const animation = new BABYLON.Animation("growAnimation", "scaling", 30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

        const keys = [
            { frame: 0, value: initialScaling },
            { frame: 30, value: finalScaling }
        ];

        animation.setKeys(keys);

        object.animations = [];
        object.animations.push(animation);

        const scene = object.getScene();
        scene.beginAnimation(object, 0, 30, false, 1, onComplete);
    }

    moveToTarget(object, target) {
        const trail = new BABYLON.TrailMesh("trail", object, SCENE_MANAGER.activeScene, 0.5, 120, true);
        trail.diameter = 0.5;
        trail.material = SHADERS['fireTrailShader'];
        trail.alphaIndex = 0;

        const initialPosition = object.position.clone();
        const finalPosition = target.position.clone();

        const animation = new BABYLON.Animation("moveAnimation", "position", 30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

        const keys = [
            { frame: 0, value: initialPosition },
            { frame: 10, value: finalPosition }
        ];

        animation.setKeys(keys);

        object.animations = [];
        object.animations.push(animation);

        const scene = object.getScene();
        scene.beginAnimation(object, 0, 45, false);
    }
}
