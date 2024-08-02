  precision highp float;
  varying vec2 vUV;
  uniform sampler2D textureSampler;

  void main(void) {
    // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    
    vec2 flippedUV = vec2(vUV.x, 1.0 - vUV.y);
    // vec2 flippedUV = vec2(vUV.x, vUV.y);

    gl_FragColor = texture2D(textureSampler, flippedUV);
    gl_FragColor.r = gl_FragColor.r * 0.4;
    gl_FragColor.g = gl_FragColor.g * 0.4;
    gl_FragColor.b = gl_FragColor.b * 0.4;
    gl_FragColor.a = gl_FragColor.a;
  }

   