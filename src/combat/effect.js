import { Health } from '../character/health.js';

export class Effect {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }

    apply(target) {
        if (target instanceof Health) {
            switch (this.type) {
                case 'damage':
                    const randomValue = Math.floor(Math.random() * 3);
                    // Add this random value to 'this.value' and pass it to the 'takeDamage' method
                    target.takeDamage(this.value + randomValue);
                    break;
                case 'heal':
                    target.heal(this.value);
                    break;
                // Add other effects as necessary
            }
        }
    }
}