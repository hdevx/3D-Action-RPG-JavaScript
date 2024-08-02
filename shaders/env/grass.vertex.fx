  precision highp float;
  attribute vec3 position;
  attribute vec2 uv;
  attribute vec4 color; // Vertex color attribute

  uniform mat4 worldViewProjection;
  uniform mat4 viewProjection;
  uniform float time; // Add a time uniform to control the waving effect
uniform float frequency;
uniform float amplitude;

  varying vec2 vUV;
  varying vec4 vColor; // Varying to pass color to the fragment shader

// // Instancing attributes
// attribute vec4 world0;
// attribute vec4 world1;
// attribute vec4 world2;
// attribute vec4 world3;

// uncomment for instanced
//  #include<instancesDeclaration>
 
  void main(void) {

    float heightThreshold = 0.0;
    float wave = 0.0;
    
    if (color.r > 0.1) {
    // if (position.y > heightThreshold) {
        wave = sin(position.x * 1.0 + time) * 0.5; // Adjust frequency and amplitude of the wave
    // }
    }
    
    vColor = color; // Pass vertex color to the fragment shader

    vec3 displacedPosition = position + vec3(0.0, wave, 0.0);
    
    
    vUV = uv;
    // gl_Position = worldViewProjection * vec4(position, 1.0);
    gl_Position = worldViewProjection * vec4(displacedPosition, 1.0);

// gl_Position = viewProjection * worldMatrix * vec4(displacedPosition, 1.0);

//  uncomment for instanced
//  #include<instancesVertex>
    // gl_Position = worldViewProjection * finalWorld * vec4(displacedPosition, 1.0);
    

  }
