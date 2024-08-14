

import { updateGrassThin } from "../../../../../../utils/plants/plants.js";
import { disposeAnimation, entryAnimationFloor } from "../../animations.js";
import { cellSize } from "../../constants.js";
import { removeAllWalls, updateCellAndSurronding } from "../../gridTracker.js";
import { createFloor } from "../../place/floorM.js";
import Tool from "../Tool.js";


export default class Add extends Tool {

    click(xIndex, zIndex, gridTrackerIndex, gridTracker, clicked) {
        let floor = this.scene.getMeshByName(`floor_${xIndex}_${zIndex}`);
        if (!floor) {
            let removeFunction = () => {
                disposeAnimation(this.scene, floor);
                gridTracker[gridTrackerIndex.x][gridTrackerIndex.z].f = false;
                removeAllWalls(gridTrackerIndex.x, gridTrackerIndex.z);
                updateCellAndSurronding(gridTrackerIndex, this.meshes);
            };
            floor = createFloor(this.scene, xIndex, zIndex, cellSize, this.meshes, removeFunction);
            floor.parent = gridTracker.parentNode;
            // Position at the exact center of the cell
            floor.position = new BABYLON.Vector3((xIndex + 0.5) * cellSize - cellSize / 2, 0.1, (zIndex + 0.5) * cellSize - cellSize / 2);

            let completeFunction = function () {

                gridTracker[gridTrackerIndex.x][gridTrackerIndex.z].f = true;
                gridTracker[gridTrackerIndex.x][gridTrackerIndex.z].dirty = true;

                setTimeout(() => {
                    updateCellAndSurronding(gridTrackerIndex);
                }, 2000);
            }
            floor.completeFunction = completeFunction;
            entryAnimationFloor(this.scene, floor, this.meshes);


        }

    }

    mouseUp() {
        updateGrassThin();

        // snap player above new construction
        // this.snapPlayer();
    }



    drag(positions, currentPoint) {
        throw "modifyTerrain method must be implemented in subclasses";
    }
}