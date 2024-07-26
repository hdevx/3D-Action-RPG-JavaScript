export default class Place {
    constructor(scene, meshes, cellSize) {
        this.scene = scene;
        this.meshes = meshes;
        this.cellSize = cellSize;
    }

    createObject(x, z) {
        // To be implemented by subclasses
    }

    createAnimation(object) {
        // To be implemented by subclasses
    }

    onAnimationComplete(object) {
        // To be implemented by subclasses
    }

    place(x, z) {
        const object = this.createObject(x, z);
        const animation = this.createAnimation(object);

        object.animations = [animation];

        this.scene.beginAnimation(object, 0, 30, false, 1, () => {
            this.onAnimationComplete(object);
        });

        return object;
    }
}