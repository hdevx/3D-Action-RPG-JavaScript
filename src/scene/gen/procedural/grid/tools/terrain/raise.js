import { cellSize, gridSize } from "../../constants.js";
import Tool from "../Tool.js";

import { reloadGrass, updateGrassThin } from "../../../../../../utils/plants/plants.js";

export default class Raise extends Tool {
    constructor(name, scene, meshes, grid, tools, imageSrc, subTools) {
        // Call the parent constructor
        super(name, scene, meshes, grid, tools, imageSrc, subTools);

        // Add collision-specific properties
        this.terrain = GRID;
        let options = { width: gridSize * cellSize, height: gridSize * cellSize, subdivisions: gridSize };
        // this.terrainShape = this.createTerrainShape(options);
        this.terrainBody = this.createTerrainBody();
        this.lastPoint = null;
        this.targetY = null;
        this.currentX = null;
        this.currentZ = null;
    }

    click(xIndex, zIndex, gridTrackerIndex, gridTracker, pickedPoint) {
        this.modifyTerrain(pickedPoint, pickedPoint);
    }




    modifyTerrain(lastPoint, currentPoint) {
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
                        // todo: get point at the start of the drag
                        // positions[i * 3 + 1] = lastPoint.y;  // Flatten the terrain
                        positions[i * 3 + 1] = currentPoint.y;  // Flatten the terrain
                        // console.log(`Flattening vertex at index ${i}, new y position: ${positions[i * 3 + 1]}`);
                        break;
                }
                this.currentX = positions[i * 3 + 0];
                this.currentZ = positions[i * 3 + 2];
                this.targetY = positions[i * 3 + 1];
                // this.editGrasses(brushSize);
            }
        }

        // Ensure the mesh is marked as updated
        let normals = [];
        BABYLON.VertexData.ComputeNormals(positions, GRID.getIndices(), normals, { useRightHandedSystem: true });
        GRID.setVerticesData(BABYLON.VertexBuffer.NormalKind, normals);
        GRID.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions, true);
        GRID.refreshBoundingInfo();
        GRID.markAsDirty();
        GRID.convertToFlatShadedMesh();


        // if GRAPHICS.HIGH
        // updateGrassThin();

    }

    mouseUp() {



        // const body = new BABYLON.PhysicsBody(GRID, BABYLON.PhysicsMotionType.STATIC, false, this.scene);
        // const updatedMeshShape = new BABYLON.PhysicsShapeMesh(GRID, this.scene);
        // GRID.groundAggregate.shape = updatedMeshShape;
        GRID.groundAggregate.dispose();
        GRID.groundAggregate = new BABYLON.PhysicsAggregate(GRID, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution: 0.0, friction: 1000000000.8 }, this.scene);

        // this.snapGrasses();
        // reloadGrass();

        updateGrassThin();
    }


    snapGrasses() {

        const positions = GRID.getVerticesData(BABYLON.VertexBuffer.PositionKind);



        const vertexCount = positions.length / 3;

        let gridSnapWidth = 30; //should be cell size/2
        for (let i = 0; i < vertexCount; i++) {

            this.scene.meshes.forEach((mesh) => {
                if (mesh.name.toLowerCase().includes("grass")) {
                    if (Math.abs(mesh.position.x - positions[i * 3 + 0]) < gridSnapWidth
                        && Math.abs(mesh.position.z - positions[i * 3 + 2]) < gridSnapWidth) {
                        mesh.position.y = positions[i * 3 + 1] + 5;

                        // getHeightAtPoint(mesh.position.x, mesh.position.z);

                        // const height = getHeightAtPoint(positions[i * 3 + 0], positions[i * 3 + 2]);
                        // mesh.position.y = height + 5;

                        // const x = 5; // Your x coordinate
                        // const z = 7; // Your z coordinate
                        // const triangle = findTriangleContainingPoint(x, z);

                        // if (triangle) {
                        //     const height = interpolateHeight(x, z, triangle.p1, triangle.p2, triangle.p3);
                        //     console.log(`Height at (${x}, ${z}) is ${height}`);
                        // } else {
                        //     console.log('Point is not inside any triangle.');
                        // }
                    }
                }
            });
        }

    }

    editGrasses(brushSize) {
        brushSize = brushSize / 2;
        this.scene.meshes.forEach((mesh) => {
            // Check if the mesh name contains "grass"
            if (mesh.name.toLowerCase().includes("grass")) {
                // Preserve the current x and z coordinates
                var currentX = mesh.position.x;
                var currentZ = mesh.position.z;

                if (Math.abs(currentX - this.currentX) < brushSize && Math.abs(currentZ - this.currentZ) > brushSize)

                    // console.log(mesh.name);
                    // Move the mesh to the new terrain's y-coordinate
                    mesh.position.y = this.targetY;

                // Log the position change (optional)
                // console.log(`Moved mesh ${mesh.name} to position (${currentX}, ${newTerrainY}, ${currentZ})`);
            }
        });
    }


    createTerrainShape(options) {
        this.terrainHeightData = new Float32Array(options.subdivisions * options.subdivisions);

        // Initialize height data
        for (let i = 0; i < this.terrainHeightData.length; i++) {
            this.terrainHeightData[i] = 0; // Set initial height to 0
        }

        return new BABYLON.HeightfieldShape({
            heights: this.terrainHeightData,
            rowCount: options.subdivisions,
            columnCount: options.subdivisions,
            scaling: new BABYLON.Vector3(options.width / options.subdivisions, 1, options.height / options.subdivisions)
        });
    }


    createTerrainBody() {
        const body = new BABYLON.PhysicsBody(GRID, BABYLON.PhysicsMotionType.STATIC, false, this.scene);
        // body.shape = this.terrainShape;
        return body;
    }

    // Function to update terrain collision when height is painted
    updateTerrainCollision() {
        // Get the updated vertex data from your terrain
        const vertexData = BABYLON.VertexData.ExtractFromMesh(terrain);
        const positions = vertexData.positions;

        // Update the heightfield data
        for (let i = 0; i < terrainSubdivisions; i++) {
            for (let j = 0; j < terrainSubdivisions; j++) {
                const index = (i * terrainSubdivisions + j) * 3 + 1; // Y component
                terrainHeightData[i * terrainSubdivisions + j] = positions[index];
            }
        }

        // Update the HeightfieldShape
        terrainShape.updateHeights(terrainHeightData);

        // Update the physics body
        terrainBody.computeWorldMatrices();
    }


    drag(positions, currentPoint) {
        throw "modifyTerrain method must be implemented in subclasses";
    }
}