precision highp float;

// Attributes
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
attribute vec4 color; // Vertex color attribute

// Uniforms
uniform mat4 worldViewProjection;
uniform mat4 world;
uniform vec3 cameraPosition;

// Varying
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUV;
varying vec4 vColor; // Varying to pass color to the fragment shader

void main(void) {
    vec4 worldPosition = world * vec4(position, 1.0);
    gl_Position = worldViewProjection * vec4(position, 1.0);
    
    vPosition = worldPosition.xyz;
    vNormal = normalize(vec3(world * vec4(normal, 0.0)));
    vUV = uv;
    vColor = color;
}