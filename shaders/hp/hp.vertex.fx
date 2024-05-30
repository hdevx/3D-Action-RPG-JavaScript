#ifdef GL_ES
    precision highp float;
#endif



attribute vec3 position;
uniform mat4 worldViewProjection;

void main() {
    gl_Position = worldViewProjection * vec4(position, 1.0);
}