import Tool from "../Tool.js";
export default class Raise extends Tool {

    click(xIndex, zIndex, gridTrackerIndex, gridTracker, pickedPoint) {
        // console.log("raise");
        // console.log(this);
        this.modifyTerrain(pickedPoint, pickedPoint, 0);
    }


    modifyTerrain(lastPoint, currentPoint, tool) {
        let brushSize = 50;
        const positions = GRID.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        const vertexCount = positions.length / 3;

        for (let i = 0; i < vertexCount; i++) {
            const vertexPosition = new BABYLON.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
            const distance = BABYLON.Vector3.Distance(vertexPosition, currentPoint);

            if (distance < brushSize) {
                switch (this.option) {
                    case 0:
                        positions[i * 3 + 1] += 10.1;  // Raise the terrain
                        // console.log(`Raising vertex at index ${i}, new y position: ${positions[i * 3 + 1]}`);
                        break;
                    case 1:
                        positions[i * 3 + 1] -= 10.1;  // Lower the terrain
                        // console.log(`Lowering vertex at index ${i}, new y position: ${positions[i * 3 + 1]}`);
                        break;
                    case 2:
                        positions[i * 3 + 1] = currentPoint.y;  // Flatten the terrain
                        // console.log(`Flattening vertex at index ${i}, new y position: ${positions[i * 3 + 1]}`);
                        break;
                }
            }
        }

        // Ensure the mesh is marked as updated
        let normals = [];
        BABYLON.VertexData.ComputeNormals(positions, GRID.getIndices(), normals, { useRightHandedSystem: true });
        GRID.setVerticesData(BABYLON.VertexBuffer.NormalKind, normals);
        GRID.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions, true);
        GRID.refreshBoundingInfo();
        GRID.markAsDirty();
        GRID.convertToFlatShadedMesh()
    }

    drag(positions, currentPoint) {
        throw "modifyTerrain method must be implemented in subclasses";
    }
}