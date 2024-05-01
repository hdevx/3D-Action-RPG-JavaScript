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
                    target.takeDamage(this.value);
                    break;
                case 'heal':
                    target.heal(this.value);
                    break;
                // Add other effects as necessary
            }
        }
    }
}