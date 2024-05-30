import { attachHealthBar, createDamagePopup } from "./damagePopup.js";

export class Health {
    constructor(name, health, parent) {
        this.name = name;
        this.health = health;
        this.maxHealth = health;
        this.parent = parent;
        this.isAlive = true;
        this.healthBar = null;
        this.originScale = parent.scaling;

        if (name !== "Hero") {
            setTimeout(() => {
                this.healthBar = attachHealthBar(parent);
            }, 2000);
            this.setupTimeout();
        }



    }

    takeDamage(amount) {
        if (!this.isAlive) { return; }
        this.health -= amount;
        createDamagePopup(amount, this.parent.position);

        // createDamagePopup(amount, damagePopupPosition);
        if (this.health <= 0) {
            this.health = 0;
            this.isAlive = false;
            this.die();
        }
        this.healthBar.update(this.health, this.maxHealth);
        if (this.name !== "Hero") {
            // this.parent.scaling.y = 3.55;
            // this.setupTimeout();
        }
    }

    setupTimeout() {
        setTimeout(() => {
            this.parent.scaling.y = this.originScale.y;
            // console.log(this.originScale.y);
        }, 50);
    }

    die() {
        console.log(`${this.name} has died.`);
        // Additional death logic
        this.parent.scaling.y = 0.9;
    }

    update() {
        // Update logic for each frame (animations, etc.)
    }
}