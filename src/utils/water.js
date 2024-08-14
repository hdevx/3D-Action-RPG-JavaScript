export function setupWater(scene, ground, engine, player, y, size) {
    //use terrain width and height
    var water = BABYLON.MeshBuilder.CreateGround("water", { width: size, height: size }, scene);
    water.position.y = y;


    var underWaterBackground = BABYLON.MeshBuilder.CreateGround("underwaterBackground", { width: size, height: size }, scene);
    underWaterBackground.position.y = y - 11;
    underWaterBackground.material = ground.material;

    scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;

    // Set the start and end distances for the linear fog
    scene.fogStart = 600.0; // Where the fog starts
    scene.fogEnd = 6000.0;   // Where the fog completely obscures everything

    // Set the color of the fog 106, 131, 156
    // 214 234 255
    scene.fogColor = new BABYLON.Color3(0.769, 0.86, 1); // Light grey fog

    // var gizmoManager = new BABYLON.GizmoManager(scene);
    // gizmoManager.positionGizmoEnabled = true;
    // gizmoManager.attachableMeshes = [water];
    // stylized water shader
    BABYLON.Effect.ShadersStore["customVertexShader"] = "\r\n" +
        "precision highp float;\r\n" +

        // Attributes
        "attribute vec3 position;\r\n" +
        "attribute vec2 uv;\r\n" +

        // Uniforms
        "uniform mat4 worldViewProjection;\r\n" +
        "uniform float time;\r\n" +

        // Varying
        "varying vec3 vPosition;\r\n" +
        "varying vec4 vClipSpace;\r\n" +

        // Uniforms for fog
        "#ifdef FOG\r\n" +
        "varying float vFogDistance;\r\n" +
        "#endif\r\n" +




        "void main(void) {\r\n" +
        "float scale = 1.0;\r\n" +
        // calc new position
        "float newY = (sin(position.x * 1.0 / scale + time * 1.0));\r\n" +
        // new model position
        "vec3 newPositionM = vec3(position.x,newY,position.z);\r\n" +
        "gl_Position = worldViewProjection * vec4(newPositionM, 1.0);\r\n" +
        //"gl_Position = worldViewProjection * vec4(position, 1.0);\r\n"+
        // grab vertex position in world space
        "vPosition = position;\r\n" +
        // grab vertex position in view space
        "vClipSpace = gl_Position;\r\n" +

        // "  vec4 worldPosition = worldViewProjection * vec4(position, 1.0);\r\n"+
        // "gl_Position = projection * worldViewProjection * worldPosition;\r\n"+
        "#ifdef FOG\r\n" +
        // "  vFogDistance =  -(vClipSpace * vPosition).z;\r\n"+
        "#endif\r\n" +

        "}\r\n";

    BABYLON.Effect.ShadersStore["customFragmentShader"] = "\r\n" +
        "precision highp float;\r\n" +

        // Varyings
        "varying vec3 vPosition;\r\n" +
        // world distance, camera to water
        "varying vec4 vClipSpace;\r\n" +

        // Uniforms
        "uniform sampler2D depthTex;\r\n" +
        "uniform sampler2D refractionSampler;\r\n" +
        "uniform float camMinZ;\r\n" +
        "uniform float camMaxZ;\r\n" +
        "uniform float maxDepth;\r\n" +
        // water colors
        "uniform vec4 wDeepColor;\r\n" +
        "uniform vec4 wShallowColor;\r\n" +
        "uniform float time;\r\n" +
        "uniform float wNoiseScale;\r\n" +
        "uniform float wNoiseOffset;\r\n" +
        "uniform float fNoiseScale;\r\n" +

        "uniform vec4 vFogInfos;\r\n" +
        "uniform vec3 vFogColor;\r\n" +

        "#ifdef FOG\r\n" +
        "varying float vFogDistance;\r\n" +
        "float CalcFogFactor() {\r\n" +
        "float fogCoeff = 1.0;\r\n" +
        "        float fogStart = vFogInfos.y;\r\n" +
        "float fogEnd = vFogInfos.z;\r\n" +
        "float fogDensity = vFogInfos.w;\r\n" +
        " if (vFogInfos.x == 1.) {\r\n" +
        " fogCoeff = (fogEnd - vFogDistance) / (fogEnd - fogStart);\r\n" +
        "} else if (vFogInfos.x == 2.) {\r\n" +
        "fogCoeff = exp(-vFogDistance * fogDensity);\r\n" +
        "} else if (vFogInfos.x == 3.) {\r\n" +
        " fogCoeff = exp(-pow(vFogDistance * fogDensity, 2.0));\r\n" +
        "  }\r\n" +
        " return clamp(fogCoeff, 0.0, 1.0);\r\n" +
        " }\r\n" +
        "#endif\r\n" +

        "float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}\r\n" +
        "vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}\r\n" +
        "vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}\r\n" +



        "float noise(vec3 p){\r\n" +
        "vec3 a = floor(p);\r\n" +
        "vec3 d = p - a;\r\n" +
        "d = d * d * (3.0 - 2.0 * d);\r\n" +

        "vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);\r\n" +
        "vec4 k1 = perm(b.xyxy);\r\n" +
        "vec4 k2 = perm(k1.xyxy + b.zzww);\r\n" +

        "vec4 c = k2 + a.zzzz;\r\n" +
        "vec4 k3 = perm(c);\r\n" +
        "vec4 k4 = perm(c + 1.0);\r\n" +

        "vec4 o1 = fract(k3 * (1.0 / 41.0));\r\n" +
        "vec4 o2 = fract(k4 * (1.0 / 41.0));\r\n" +

        "vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);\r\n" +
        "vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);\r\n" +

        "return o4.y * d.y + o4.x * (1.0 - d.y);\r\n" +
        "}\r\n" +

        "void main(void) {\r\n" +
        // init baseColor
        "vec4 baseColor = vec4(0.0);\r\n" +
        // generate noise value
        "float waveNoise = noise(vec3(0., time, 0.)+vPosition*wNoiseScale)*wNoiseOffset;\r\n" +
        // remap frag screen space coords to ndc (-1 to +1)
        "vec2 ndc = (vClipSpace.xy / vClipSpace.w) / 2.0 + 0.5;\r\n" +
        // grab depth value (0 to 1) at ndc for object behind water
        "float depthOfObjectBehindWater = texture2D(depthTex, vec2(ndc.x, ndc.y)+waveNoise).r;\r\n" +
        // get depth of water plane
        "float linearWaterDepth = (vClipSpace.z + camMinZ) / (camMaxZ + camMinZ);\r\n" +
        // calculate water depth scaled to camMaxZ since camMaxZ >> camMinZ
        "float waterDepth = camMaxZ*(depthOfObjectBehindWater - linearWaterDepth);\r\n" +
        // get water depth as a ratio of maxDepth
        "float wdepth = clamp((waterDepth/maxDepth), 0.0, 1.0);\r\n" +
        // mix water colors based on depth
        "baseColor = mix(wShallowColor, wDeepColor, wdepth);\r\n" +
        // mix colors with scene render
        "vec4 refractiveColor = texture2D(refractionSampler, vec2(ndc.x, ndc.y)+waveNoise);\r\n" +
        "baseColor = mix(refractiveColor, baseColor, baseColor.a);\r\n" +
        // decide the amount of foam 
        // "float foam = 1.0-smoothstep(0.1, 0.2, wdepth);\r\n"+
        // make the foam effect using noise
        // "float foamEffect = smoothstep( 0.1, 0.2, noise(vec3(0., time, 0.)+vPosition*fNoiseScale*0.3)*foam);\r\n"+
        // "baseColor.rgba += vec4(foamEffect);\r\n"+
        // final result
        "gl_FragColor = baseColor;\r\n" +

        "#ifdef FOG\r\n" +
        "float fogFactor = CalcFogFactor();\r\n" +
        "vec3 finalColor = mix(baseColor.rgb, vFogColor, 1.0 - fogFactor);\r\n" +
        "gl_FragColor = vec4(finalColor, baseColor.a);\r\n" +
        "#else\r\n" +
        "gl_FragColor = baseColor;\r\n" +
        "#endif;\r\n" +



        "}\r\n";

    var shaderMaterial = new BABYLON.ShaderMaterial("shader", scene, { vertex: "custom", fragment: "custom" },
        {
            attributes: ["position", "normal", "uv"],
            uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"],
        });

    // linear depth only!! I dun want to work with non-linear depth map!
    var depthRenderer = scene.enableDepthRenderer(scene.activeCamera, false);
    var depthTex = depthRenderer.getDepthMap();
    depthTex.renderList = [ground, underWaterBackground];

    var _refractionRTT = new BABYLON.RenderTargetTexture("water_refraction", { width: 1024, height: 1024 }, scene, false, true);
    _refractionRTT.wrapU = BABYLON.Constants.TEXTURE_MIRROR_ADDRESSMODE;
    _refractionRTT.wrapV = BABYLON.Constants.TEXTURE_MIRROR_ADDRESSMODE;
    _refractionRTT.ignoreCameraViewport = true;
    _refractionRTT.renderList.push(ground, underWaterBackground);
    _refractionRTT.refreshRate = 1;

    scene.customRenderTargets.push(_refractionRTT);

    // set shader parameters
    shaderMaterial.setTexture("depthTex", depthTex);
    shaderMaterial.setTexture("refractionSampler", _refractionRTT);
    shaderMaterial.setFloat("camMinZ", scene.activeCamera.minZ); //scene.activeCamera.minZ
    shaderMaterial.setFloat("camMaxZ", scene.activeCamera.maxZ); //scene.activeCamera.maxZ
    shaderMaterial.setFloat("time", 0);
    shaderMaterial.setFloat("wNoiseScale", 0.1);
    shaderMaterial.setFloat("wNoiseOffset", 0.01);
    shaderMaterial.setFloat("fNoiseScale", 0.3);
    shaderMaterial.setFloat("maxDepth", 20.0);
    shaderMaterial.setVector4("wDeepColor", new BABYLON.Vector4(0.1, 0.2, 0.3, 0.85));
    shaderMaterial.setVector4("wShallowColor", new BABYLON.Vector4(0.1, 0.2, 0.3, 0.1)); //0.4

    shaderMaterial.setColor3("vFogColor", scene.fogColor);
    shaderMaterial.setVector4("vFogInfos", new BABYLON.Vector4(
        scene.fogMode,
        scene.fogStart,
        scene.fogEnd,
        scene.fogDensity
    ));

    var time = 0;
    scene.registerBeforeRender(function () {
        time += engine.getDeltaTime() * 0.001;
        shaderMaterial.setFloat("time", time);
    });

    water.material = shaderMaterial;
}


export function setupBuilderWater(scene, ground, engine, player, y, size, background) {
    //use terrain width and height
    var water = BABYLON.MeshBuilder.CreateGround("water", { width: size, height: size }, scene);
    water.position.y = y;


    // var underWaterBackground = BABYLON.MeshBuilder.CreateGround("underwaterBackground", { width: size, height: size }, scene);
    // underWaterBackground.position.y = y - 11;
    // underWaterBackground.material = ground.material;

    scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;

    // Set the start and end distances for the linear fog
    scene.fogStart = 600.0; // Where the fog starts
    scene.fogEnd = 6000.0;   // Where the fog completely obscures everything

    // Set the color of the fog 106, 131, 156
    // 214 234 255
    scene.fogColor = new BABYLON.Color3(0.769, 0.86, 1); // Light grey fog

    // var gizmoManager = new BABYLON.GizmoManager(scene);
    // gizmoManager.positionGizmoEnabled = true;
    // gizmoManager.attachableMeshes = [water];
    // stylized water shader
    BABYLON.Effect.ShadersStore["customVertexShader"] = "\r\n" +
        "precision highp float;\r\n" +

        // Attributes
        "attribute vec3 position;\r\n" +
        "attribute vec2 uv;\r\n" +

        // Uniforms
        "uniform mat4 worldViewProjection;\r\n" +
        "uniform float time;\r\n" +

        // Varying
        "varying vec3 vPosition;\r\n" +
        "varying vec4 vClipSpace;\r\n" +

        // Uniforms for fog
        "#ifdef FOG\r\n" +
        "varying float vFogDistance;\r\n" +
        "#endif\r\n" +




        "void main(void) {\r\n" +
        "float scale = 1.0;\r\n" +
        // calc new position
        "float newY = (sin(position.x * 1.0 / scale + time * 1.0));\r\n" +
        // new model position
        "vec3 newPositionM = vec3(position.x,newY,position.z);\r\n" +
        "gl_Position = worldViewProjection * vec4(newPositionM, 1.0);\r\n" +
        //"gl_Position = worldViewProjection * vec4(position, 1.0);\r\n"+
        // grab vertex position in world space
        "vPosition = position;\r\n" +
        // grab vertex position in view space
        "vClipSpace = gl_Position;\r\n" +

        // "  vec4 worldPosition = worldViewProjection * vec4(position, 1.0);\r\n"+
        // "gl_Position = projection * worldViewProjection * worldPosition;\r\n"+
        "#ifdef FOG\r\n" +
        // "  vFogDistance =  -(vClipSpace * vPosition).z;\r\n" +
        "#endif\r\n" +

        "}\r\n";

    BABYLON.Effect.ShadersStore["customFragmentShader"] = "\r\n" +
        "precision highp float;\r\n" +

        // Varyings
        "varying vec3 vPosition;\r\n" +
        // world distance, camera to water
        "varying vec4 vClipSpace;\r\n" +

        // Uniforms
        "uniform sampler2D depthTex;\r\n" +
        "uniform sampler2D refractionSampler;\r\n" +
        "uniform float camMinZ;\r\n" +
        "uniform float camMaxZ;\r\n" +
        "uniform float maxDepth;\r\n" +
        // water colors
        "uniform vec4 wDeepColor;\r\n" +
        "uniform vec4 wShallowColor;\r\n" +
        "uniform float time;\r\n" +
        "uniform float wNoiseScale;\r\n" +
        "uniform float wNoiseOffset;\r\n" +
        "uniform float fNoiseScale;\r\n" +

        "uniform vec4 vFogInfos;\r\n" +
        "uniform vec3 vFogColor;\r\n" +

        "#ifdef FOG\r\n" +
        "varying float vFogDistance;\r\n" +
        "float CalcFogFactor() {\r\n" +
        "float fogCoeff = 1.0;\r\n" +
        "        float fogStart = vFogInfos.y;\r\n" +
        "float fogEnd = vFogInfos.z;\r\n" +
        "float fogDensity = vFogInfos.w;\r\n" +
        " if (vFogInfos.x == 1.) {\r\n" +
        " fogCoeff = (fogEnd - vFogDistance) / (fogEnd - fogStart);\r\n" +
        "} else if (vFogInfos.x == 2.) {\r\n" +
        "fogCoeff = exp(-vFogDistance * fogDensity);\r\n" +
        "} else if (vFogInfos.x == 3.) {\r\n" +
        " fogCoeff = exp(-pow(vFogDistance * fogDensity, 2.0));\r\n" +
        "  }\r\n" +
        " return clamp(fogCoeff, 0.0, 1.0);\r\n" +
        " }\r\n" +
        "#endif\r\n" +

        "float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}\r\n" +
        "vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}\r\n" +
        "vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}\r\n" +



        "float noise(vec3 p){\r\n" +
        "vec3 a = floor(p);\r\n" +
        "vec3 d = p - a;\r\n" +
        "d = d * d * (3.0 - 2.0 * d);\r\n" +

        "vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);\r\n" +
        "vec4 k1 = perm(b.xyxy);\r\n" +
        "vec4 k2 = perm(k1.xyxy + b.zzww);\r\n" +

        "vec4 c = k2 + a.zzzz;\r\n" +
        "vec4 k3 = perm(c);\r\n" +
        "vec4 k4 = perm(c + 1.0);\r\n" +

        "vec4 o1 = fract(k3 * (1.0 / 41.0));\r\n" +
        "vec4 o2 = fract(k4 * (1.0 / 41.0));\r\n" +

        "vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);\r\n" +
        "vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);\r\n" +

        "return o4.y * d.y + o4.x * (1.0 - d.y);\r\n" +
        "}\r\n" +

        "void main(void) {\r\n" +
        // init baseColor
        "vec4 baseColor = vec4(0.0);\r\n" +
        // generate noise value
        "float waveNoise = noise(vec3(0., time, 0.)+vPosition*wNoiseScale)*wNoiseOffset;\r\n" +
        // remap frag screen space coords to ndc (-1 to +1)
        "vec2 ndc = (vClipSpace.xy / vClipSpace.w) / 2.0 + 0.5;\r\n" +
        // grab depth value (0 to 1) at ndc for object behind water
        "float depthOfObjectBehindWater = texture2D(depthTex, vec2(ndc.x, ndc.y)+waveNoise).r;\r\n" +
        // get depth of water plane
        "float linearWaterDepth = (vClipSpace.z + camMinZ) / (camMaxZ + camMinZ);\r\n" +
        // calculate water depth scaled to camMaxZ since camMaxZ >> camMinZ
        "float waterDepth = camMaxZ*(depthOfObjectBehindWater - linearWaterDepth);\r\n" +
        // get water depth as a ratio of maxDepth
        "float wdepth = clamp((waterDepth/maxDepth), 0.0, 1.0);\r\n" +
        // mix water colors based on depth
        "baseColor = mix(wShallowColor, wDeepColor, wdepth);\r\n" +
        // mix colors with scene render
        "vec4 refractiveColor = texture2D(refractionSampler, vec2(ndc.x, ndc.y)+waveNoise);\r\n" +
        "baseColor = mix(refractiveColor, baseColor, baseColor.a);\r\n" +
        // decide the amount of foam 
        "float foam = 1.0-smoothstep(0.1, 0.2, wdepth);\r\n" +
        // make the foam effect using noise
        "float foamEffect = smoothstep( 0.1, 0.2, noise(vec3(0., time, 0.)+vPosition*fNoiseScale*0.3)*foam);\r\n" +
        // "baseColor.rgba += vec4(foamEffect);\r\n" +
        // final result
        "gl_FragColor = baseColor;\r\n" +

        "#ifdef FOG\r\n" +
        "float fogFactor = CalcFogFactor();\r\n" +
        "fogFactor = fogFactor + 0.01;\r\n" + // 0.01 no fog,  //-0.1 blended fog horizon, minus is stronger
        // "vec3 finalColor = mix(baseColor.rgb, vFogColor, 1.0 - fogFactor);\r\n" +
        "vec3 finalColor = baseColor.rgb;\r\n" +
        "gl_FragColor = vec4(finalColor, baseColor.a);\r\n" +
        "#else\r\n" +
        "gl_FragColor = baseColor;\r\n" +
        "#endif;\r\n" +



        "}\r\n";

    var shaderMaterial = new BABYLON.ShaderMaterial("shader", scene, { vertex: "custom", fragment: "custom" },
        {
            attributes: ["position", "normal", "uv"],
            uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"],
        });

    // linear depth only!! I dun want to work with non-linear depth map!
    var depthRenderer = scene.enableDepthRenderer(scene.activeCamera, false);
    var depthTex = depthRenderer.getDepthMap();
    depthTex.renderList = [ground, background];

    var _refractionRTT = new BABYLON.RenderTargetTexture("water_refraction", { width: 1024, height: 1024 }, scene, false, true);
    _refractionRTT.wrapU = BABYLON.Constants.TEXTURE_MIRROR_ADDRESSMODE;
    _refractionRTT.wrapV = BABYLON.Constants.TEXTURE_MIRROR_ADDRESSMODE;
    _refractionRTT.ignoreCameraViewport = true;
    _refractionRTT.renderList.push(ground, background);
    _refractionRTT.refreshRate = 1;

    scene.customRenderTargets.push(_refractionRTT);

    // set shader parameters
    shaderMaterial.setTexture("depthTex", depthTex);
    shaderMaterial.setTexture("refractionSampler", _refractionRTT);
    shaderMaterial.setFloat("camMinZ", scene.activeCamera.minZ); //scene.activeCamera.minZ
    shaderMaterial.setFloat("camMaxZ", scene.activeCamera.maxZ); //scene.activeCamera.maxZ
    shaderMaterial.setFloat("time", 0);
    shaderMaterial.setFloat("wNoiseScale", 0.1);
    shaderMaterial.setFloat("wNoiseOffset", 0.01);
    shaderMaterial.setFloat("fNoiseScale", 0.3);
    shaderMaterial.setFloat("maxDepth", 20.0);
    shaderMaterial.setVector4("wDeepColor", new BABYLON.Vector4(0.1, 0.2, 0.3, 0.85));
    shaderMaterial.setVector4("wShallowColor", new BABYLON.Vector4(0.1, 0.2, 0.3, 0.1)); //0.4

    shaderMaterial.setColor3("vFogColor", scene.fogColor);
    shaderMaterial.setVector4("vFogInfos", new BABYLON.Vector4(
        scene.fogMode,
        scene.fogStart,
        scene.fogEnd,
        scene.fogDensity
    ));

    var time = 0;
    scene.registerBeforeRender(function () {
        time += engine.getDeltaTime() * 0.001;
        shaderMaterial.setFloat("time", time);
    });

    water.material = shaderMaterial;
}
