import { attachHealthBar, createDamagePopup } from "./damagePopup.js";

export class Health {
    constructor(name, health, parent) {
        this.name = name;
        this.health = health;
        this.maxHealth = health;
        this.parent = parent;
        this.isAlive = true;
        this.healthBar = null;

        if(name !== "Hero") {

        setTimeout(() => {
        this.healthBar = attachHealthBar(parent);
        }, 2000);
  
    }
    else {
        this.parent = null;
    }

    }

    takeDamage(amount) {
        if(!this.isAlive) {return;}
        this.health -= amount;
        createDamagePopup(amount, this.parent.position);
        if (this.health <= 0) {
            this.health = 0;
            this.isAlive = false;
            this.die();
        } 
        this.healthBar.update(this.health, this.maxHealth);
    }

    die() {
        console.log(`${this.name} has died.`);
        // Additional death logic
    }

    update() {
        // Update logic for each frame (animations, etc.)
    }
}