import { cellSize, gridSize } from "../../constants.js";
import Tool from "../Tool.js";

export default class Settings extends Tool {
    constructor(name, scene, meshes, grid, tools, imageSrc, subTools) {
        // Call the parent constructor
        super(name, scene, meshes, grid, tools, imageSrc, subTools);

    }

    click(xIndex, zIndex, gridTrackerIndex, gridTracker, pickedPoint) {
        // console.log("export");
        // BABYLON.GLTF2Export.GLTFAsync(this.scene, "fileName").then((gltf) => {
        //     gltf.downloadFiles();
        // });
    }


}