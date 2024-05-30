import { Projectile } from "./visual/projectile.js";
// contains list of spells
// each spell has a list of effects

// self cast (apply affect to self)
// cause damage to target (apply affect to target)
// cause damage in area (apply affect to area

export class Spell {
    constructor(name, effects, animation, vfx, range) {
        this.name = name;
        this.effects = effects; // Array of effects
        this.animation = animation; // Animation object or string
        this.vfx = vfx; // Visual effects object or string
        this.range = range;
        this.facingThreshold = 0.507; // 0.707, 45 degrees threshold 
    }

    canCast(caster, target) {

        if (caster.parent && caster.name != 'Hero') {
            caster.rotationCheck = caster.parent;
            caster.rangeCheck = caster.parent;
        }
        else {

        }

        target = target.parent;


        // console.log(caster);
        let range = BABYLON.Vector3.Distance(caster.rangeCheck.position, target.position);
        if (range > this.range) return false;
        //   Calculate the vector from the caster to the target
        let directionToTarget = target.position.subtract(caster.rangeCheck.position);
        directionToTarget.normalize();

        // Check if the caster is facing the target
        let dotProduct = BABYLON.Vector3.Dot(caster.rotationCheck.forward, directionToTarget);
        //   console.log(caster.rotationCheck.forward);
        if (dotProduct < this.facingThreshold) {
            console.log("Caster is not facing the target.");
            return false;
        }
        return true;
    }

    cast(caster, target) {
        if (!this.canCast(caster, target)) return false;
        this.playVFX(caster, target);
        this.playAnimation(caster);
        // on animation end or projectile hit, play effect
        this.effects.forEach(effect => {
            effect.apply(target);
        });
    }

    playAnimation(caster) {

        // console.log(`Playing animation: ${this.animation}`);
        // Animation logic here
    }



    playVFX(caster, target) {
        // console.log(VFX[this.vfx()]);

        const fireProjectile = new Projectile(5000, 1000, new BABYLON.Vector3(100, 0, 0));
        fireProjectile.launch(caster, target);
        // this.vfx();
        // console.log(`Playing VFX: ${this.vfx}`);
        // VFX logic here
    }
}

