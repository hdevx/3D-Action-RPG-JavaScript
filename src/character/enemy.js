import { attachHealthBar } from './damagePopup.js';
import { Health } from './health.js';

export function setupEnemies(scene, player, terrain, amount, mesh, hpbar) {
    let enemies = [];

    let enemyAttackDistance = 12;
    for (let i = 0; i < amount; i++) {
        let enemy = createEnemy(scene, mesh, hpbar);
        enemies.push(enemy);
        addRandomMovement(enemy, scene, terrain);
        attackIfClose(scene, enemy, player, enemyAttackDistance);
        // setTimeout(() => {
        //     attachHealthBar(enemy);
        // }, 1000);
    }

    addEnemyOutline(scene, player);
    // setTimeout(() => {
    //     attachHealthBar(enemies[0]);
    // }, 1000);
    return enemies;
}

function createEnemy(scene, mesh) {
    let enemy = mesh.clone("enemyClone");
    enemy.name = "enemy";
    // let enemy = BABYLON.MeshBuilder.CreateSphere("enemy", {segments: 3, diameter: 14}, scene);
    enemy.position = new BABYLON.Vector3(Math.random() * 100 - 50, 1, Math.random() * 100 - 50);
    enemy.scaling.scaleInPlace(5.7);
    // hero.position.y = -11;
    let health = new Health("Enemy", 50, enemy);
    enemy.health = health;
    return enemy;
}

function addRandomMovement(enemy, scene, terrain) {
    let targetPosition = enemy.position.clone();

    // Update the target position every second
    setInterval(() => {
        let randomX = Math.random() * 100 - 50;
        let randomZ = Math.random() * 100 - 50;

        // Calculate new target position
        targetPosition = enemy.position.add(new BABYLON.Vector3(randomX, 0, randomZ));

        // Get the terrain height at the new target position
        let terrainHeight = terrain.getHeightAtCoordinates(targetPosition.x, targetPosition.z);

        // Update the target's Y position to match the terrain height
        targetPosition.y = terrainHeight + 5;
    }, 3000);

    // Smoothly move enemy towards target position
    scene.onBeforeRenderObservable.add(() => {
        if (enemy.health.isAlive) {
            // Interpolate towards the target position
            enemy.position = BABYLON.Vector3.Lerp(enemy.position, targetPosition, 0.003);

            // Check for collisions if necessary, or adjust using moveWithCollisions
            // This is useful if the terrain or other objects have collision enabled
            if (enemy.moveWithCollisions) {
                let moveDirection = targetPosition.subtract(enemy.position).normalize().scale(0.1);
                enemy.moveWithCollisions(moveDirection);
            }
        }
    });
}

function getTerrainHeightAt(x, z) {
    // Assuming 'terrain' is your heightmap mesh
    return terrain.getHeightAtCoordinates(x, z);
}



function attackIfClose(scene, enemy, player, enemyAttackDistance) {
    scene.registerBeforeRender(() => {
        if (!enemy.isAlive) return;
        if (BABYLON.Vector3.Distance(enemy.position, player.position) < enemyAttackDistance) {
            console.log("Enemy is attacking!");
            // Implement attack logic here
        }
    });
}


function addEnemyOutline(scene, player) {

    scene.registerBeforeRender(() => {
        let closestEnemy = null;
        let minDistance = Infinity;
        scene.meshes.forEach(mesh => {
            if (mesh.name === "enemy" && mesh.health.isAlive) {
                // todo move to shared method range and facing check
                let distance = BABYLON.Vector3.Distance(mesh.position, player.position);
                let directionToTarget = mesh.position.subtract(player.position);
                directionToTarget.normalize();

                // Check if the caster is facing the target
                let dotProduct = BABYLON.Vector3.Dot(player.health.rotationCheck.forward, directionToTarget);
                // console.log(caster.rotationCheck.forward);
                if (dotProduct < 0.5) {
                    // console.log("Caster is not facing the target.");
                    return false;
                }

                if (distance < minDistance) {
                    minDistance = distance;
                    closestEnemy = mesh;
                }
            }
        });

        scene.meshes.forEach(mesh => {
            if (mesh.name === "enemy") {
                mesh.renderOutline = false;
                if (mesh.getChildren) {
                    mesh.getChildren().forEach(child => {
                        child.renderOutline = false;
                    });
                }
            }
        });

        if (closestEnemy) {
            applyOutlineToMeshAndChildren(closestEnemy, 0.02, BABYLON.Color3.Red());
            player.target = closestEnemy;
        }
    });
}

function applyOutlineToMeshAndChildren(mesh, outlineWidth, outlineColor) {
    mesh.renderOutline = true;
    mesh.outlineWidth = outlineWidth;
    mesh.outlineColor = outlineColor;

    if (mesh.getChildren) {
        mesh.getChildren().forEach(child => {
            child.renderOutline = true;
            child.outlineWidth = outlineWidth;
            child.outlineColor = outlineColor;
        });
    }
}


