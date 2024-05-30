 #ifdef GL_ES
    precision highp float;
#endif

uniform float iTime;
uniform vec2 iResolution;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;


void main() {
    vec2 uv = gl_FragCoord.xy / iResolution;
    vec2 warpUV = 2.0 * uv;

    float d = length(warpUV);
    vec2 st = warpUV * 0.1 + 0.2 * vec2(cos(0.071 * iTime * 2.0 + d),
                                        sin(0.073 * iTime * 2.0 - d));

    vec3 warpedCol = texture2D(iChannel0, st).xyz * 2.0;
    float w = max(warpedCol.r, 0.85);

    vec2 offset = 0.01 * cos(warpedCol.rg * 3.14159);
    vec3 col = texture2D(iChannel1, uv + offset).rgb * vec3(0.8, 0.8, 1.5);
    col *= w * 1.2;

    gl_FragColor = vec4(mix(col, texture2D(iChannel1, uv + offset).rgb, 0.5), 1.0);
}