  precision highp float;
  attribute vec3 position;
  attribute vec2 uv;
  attribute vec4 color; // Vertex color attribute
  attribute vec4 color2; // Vertex color attribute

//  attribute vec4 world0;
//     attribute vec4 world1;
//     attribute vec4 world2;
//     attribute vec4 world3;

  uniform mat4 worldViewProjection;
  uniform float time; // Add a time uniform to control the waving effect
uniform float frequency;
uniform float amplitude;

  varying vec2 vUV;
  varying vec4 vColor; // Varying to pass color to the fragment shader
  varying vec4 vColor2; // Varying to pass color to the fragment shader

 uniform mat4 view;
   varying float fFogDistance;

 #include<instancesDeclaration>
 uniform mat4 viewProjection;

  void main(void) {
  #include<instancesVertex>

 vec4 worldPosition = world * vec4(position, 1.0);
    fFogDistance = (view * worldPosition).z;

    float heightThreshold = 0.0;
    float wave = 0.0;
    
    if (color.r > 0.1) {
    // if (position.y > heightThreshold) {
        wave = sin(position.x * 1.0 + time) * 0.5  * ((color.r + 0.1) / 2.0) ; // Adjust frequency and amplitude of the wave
    // }
    }
    
    vColor = color; // Pass vertex color to the fragment shader
    vColor2 = color2;
    vec3 displacedPosition = position + vec3(0.0, wave, 0.0);
    







    vUV = uv;

    // gl_Position = worldViewProjection * vec4(position, 1.0);
    // gl_Position = worldViewProjection * finalWorld * vec4(displacedPosition, 1.0);
    // gl_Position = worldViewProjection * finalWorld * vec4(displacedPosition, 1.0);

// gl_Position = worldViewProjection * finalWorld * vec4(displacedPosition, 1.0);

// worldPosition
     gl_Position = viewProjection * finalWorld * vec4(displacedPosition, 1.0);

 
  }

