let systemPrompt = `Only respond in valid JSON. Given this orientation function 
Don't place walls on corner
For Example:

  `;
export async function createCastle(scene) {
    let userPrompt = "I have castle walls and roofs. Give me JSON on a grid how to place them."
    // let placement = await getLLMJSON(systemPrompt, userPrompt);
    let placement = await getLLMJSONDummyData();
    console.log(placement);

    let gridSize = 60;
    placeInGrid(scene, placement, gridSize);
}

async function getLLMJSONDummyData() {
    const jsonString = `
[
    {"position": [1, 0, 0], "type": "wall", "orientation": "E"},
    {"position": [2, 0, 0], "type": "gate", "orientation": "E"},
    {"position": [3, 0, 0], "type": "wall", "orientation": "E"},
    {"position": [4, 0, 0], "type": "wall", "orientation": "E"},
    {"position": [0, 0, 1], "type": "wall", "orientation": "N"},
    {"position": [4, 0, 1], "type": "wall", "orientation": "N"},
    {"position": [0, 0, 2], "type": "tower", "orientation": "N"},
    {"position": [4, 0, 2], "type": "tower", "orientation": "N"},
    {"position": [0, 0, 3], "type": "wall", "orientation": "N"},
    {"position": [4, 0, 3], "type": "wall", "orientation": "N"},
    {"position": [0, 0, 4], "type": "wall", "orientation": "W"},
    {"position": [1, 0, 4], "type": "wall", "orientation": "W"},
    {"position": [2, 0, 4], "type": "wall", "orientation": "W"},
    {"position": [3, 0, 4], "type": "wall", "orientation": "W"},
    {"position": [4, 0, 4], "type": "wall", "orientation": "W"},
    {"position": [0, 0, 0], "type": "round_corner", "orientation": "SW"},
    {"position": [4, 0, 0], "type": "round_corner", "orientation": "SE"},
    {"position": [0, 0, 4], "type": "round_corner", "orientation": "NW"},
    {"position": [4, 0, 4], "type": "round_corner", "orientation": "NE"},
    {"position": [0, 1, 0], "type": "roof", "orientation": "N"},
    {"position": [4, 1, 0], "type": "roof", "orientation": "N"},
    {"position": [0, 1, 4], "type": "roof", "orientation": "S"},
    {"position": [4, 1, 4], "type": "roof", "orientation": "S"}
]
    `;
    const jsonObject = JSON.parse(jsonString);
    return jsonObject;
}

//Use your own but be careful to not commit the key
const groqApiKey = 'your_key_here';
async function getLLMJSON(systemPrompt, userPrompt) {
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${groqApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [{
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: userPrompt
                },],
                model: 'llama3-8b-8192'
            })
        });

        const data = await response.json(); // Parses the JSON response into a JavaScript object
        return data.choices[0].message.content; // This returns the data to where the function was called
    } catch (error) {
        console.error('Error:', error);
        throw error; // Re-throw the error if you want to handle it later or let the caller know something went wrong
    }
}


async function placeInGrid(scene, tiles, gridSize) {

    const castle = await BABYLON.SceneLoader.ImportMeshAsync(null, "./assets/env/night/", "CastleParts.glb", scene);
    const wall = castle.meshes[0].getChildMeshes()[0];
    const corner = castle.meshes[0].getChildMeshes()[1];
    const gate = castle.meshes[0].getChildMeshes()[2];
    const tileTypes = {
        'wall': { color: '#808080', mesh: wall }, // gray
        'roof': { color: '#8B4513', mesh: wall },  // saddle brown
        'round_corner': { color: '#809080', mesh: corner },
        'gate': { color: '#909080', mesh: gate },
        'tower': { color: '#909080', mesh: gate }
    };

    let gridYOffset = -1000; //todo use terrain raycast;
    tiles.forEach(tile => {
        const position = new BABYLON.Vector3(tile.position[0] * gridSize, tile.position[1] * gridSize + gridYOffset, tile.position[2] * gridSize);
        // createTile(scene, tile.type, position, tileTypes[tile.type].color, gridSize);
        createTileMesh(scene, tile.type, position, tile, tileTypes, gridSize);
    });
}

function createTile(scene, type, position, color, gridSize) {
    const box = BABYLON.MeshBuilder.CreateBox(type, { size: gridSize }, scene);
    box.position = position;
    box.material = new BABYLON.StandardMaterial(type + 'Mat', scene);
    box.material.diffuseColor = new BABYLON.Color3.FromHexString(color);
    box.material.emissiveColor = new BABYLON.Color3.FromHexString(color);
}

function createTileMesh(scene, type, position, tile, tileTypes, gridSize) {
    let box = tileTypes[tile.type].mesh.clone('wall');
    box.scaling.scaleInPlace(gridSize / 2);
    // const box = BABYLON.MeshBuilder.CreateBox(type, { size: gridSize }, scene);
    box.position = position;
    const rotationDegrees = rotate(tile.orientation);
    box.rotation = new BABYLON.Vector3(0, BABYLON.Tools.ToRadians(rotationDegrees), 0);
    // box.material = new BABYLON.StandardMaterial(tile.type + 'Mat', scene);
    // box.material.diffuseColor = new BABYLON.Color3.FromHexString(color);
    // box.material.emissiveColor = new BABYLON.Color3.FromHexString(tileTypes[tile.type].color);
}


function rotate(orientation) {
    switch (orientation) {
        case 'N': return 0;
        case 'NE': return 45;
        case 'E': return 90;
        case 'SE': return 135;
        case 'S': return 180;
        case 'SW': return 225;
        case 'W': return 270;
        case 'NW': return 315;
        default: return 0;
    }
}