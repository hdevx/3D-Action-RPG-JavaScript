precision highp float;

// Varying
varying vec2 vUV;

// Uniforms
uniform float time;

// Permutation function
vec3 permute(vec3 x) {
    return mod(((x * 34.0) + 1.0) * x, 289.0);
}

// 2D Simplex noise
float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, // (3.0-sqrt(3.0))/6.0
                        0.366025403784439, // 0.5*(sqrt(3.0)-1.0)
                        -0.577350269189626, // -1.0 + 2.0 * C.x
                        0.024390243902439); // 1.0 / 41.0

    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);

    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec2 x1 = x0.xy + C.xx - i1;
    vec2 x2 = x0.xy + C.zz;

    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));

    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x1, x1), dot(x2, x2)), 0.0);
    m = m * m;
    m = m * m;

    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;

    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);

    vec3 g0 = vec3(a0.x * x0.x + h.x * x0.y,
                   a0.y * x1.x + h.y * x1.y,
                   a0.z * x2.x + h.z * x2.y);

    return 130.0 * dot(m, g0);
}

void main(void) {
    vec2 uv = vUV;
    // uv.y = time * 0.9; // Scroll the noise over time
    // uv.x = time * 0.1;
    float noise = snoise(uv * 2.5);
    vec4 color = vec4(10.0, 0.2, 0.0, 1.0); // Fireball color
    gl_FragColor = color * noise;
}
