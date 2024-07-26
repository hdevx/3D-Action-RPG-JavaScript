
export default class Tool {
    constructor(name, scene, meshes, grid, tools, imageSrc, subTools) {
        this.name = name;
        this.scene = scene;
        this.meshes = meshes;
        this.grid = grid;
        this.tools = tools;
        this.imageSrc = imageSrc;
        this.subTools = subTools;
        this.button = this.createButton(this.tools);

        // 
        this.option = 0;

    }

    createButton(tools) {
        const toolContainer = document.createElement('div');
        toolContainer.className = 'toolContainer';

        // Create a button element
        const button = document.createElement('button');
        // Set the class for the button
        button.className = 'toolButton';
        // Set the inner text of the button
        // button.innerText = this.name;

        const img = document.createElement('img');
        img.src = this.imageSrc;
        img.alt = this.name;
        img.className = 'toolIcon';

        // Set the onclick event for the button
        img.addEventListener('click', () => {
            const toolName = this.name.toLowerCase();
            this.tools.setSelectedTool(toolName);

            // add visual feedback for the selected tool
            const toolButtons = document.querySelectorAll('.toolIcon');
            toolButtons.forEach(btn => btn.classList.remove('selected'));
            img.classList.add('selected');
        });


        // Append the button to the toolbar
        // document.getElementById('toolBar').appendChild(button);
        toolContainer.appendChild(img);

        // Create sub-tool buttons
        if (this.subTools.length > 0) {
            const subToolContainer = document.createElement('div');
            subToolContainer.className = 'subToolContainer';

            this.subTools.forEach(subTool => {
                const subButton = document.createElement('button');
                subButton.className = 'subToolButton';
                subButton.textContent = subTool.name;
                subButton.addEventListener('click', () => {
                    if (subTool.name === 'Raise') { this.option = 0; }
                    if (subTool.name === 'Lower') { this.option = 1 }
                    if (subTool.name === 'Flatten') { this.option = 2; }
                    // Handle sub-tool selection here
                    // select the parent tool
                    const toolName = this.name.toLowerCase();
                    this.tools.setSelectedTool(toolName);

                    // add visual feedback for the selected tool
                    const toolButtons = document.querySelectorAll('.toolIcon');
                    toolButtons.forEach(btn => btn.classList.remove('selected'));
                    img.classList.add('selected');


                    console.log(`Sub-tool ${this.option} selected`);
                });
                subToolContainer.appendChild(subButton);
            });

            toolContainer.appendChild(subToolContainer);
        }
        document.getElementById('toolBar').appendChild(toolContainer);

        return button;
    }

    click(positions, currentPoint) {
        throw "modifyTerrain method must be implemented in subclasses";
    }

    drag(positions, currentPoint) {
        throw "modifyTerrain method must be implemented in subclasses";
    }

}
