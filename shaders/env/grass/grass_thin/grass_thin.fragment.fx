  precision highp float;


   #define FOGMODE_NONE 0.
    #define FOGMODE_EXP 1.
    #define FOGMODE_EXP2 2.
    #define FOGMODE_LINEAR 3.
    #define E 2.71828

    uniform vec4 vFogInfos;
    uniform vec3 vFogColor;
    varying float fFogDistance;

 float CalcFogFactor()
    {
        float fogCoeff = 1.0;
        float fogStart = vFogInfos.y;
        float fogEnd = vFogInfos.z;
        float fogDensity = vFogInfos.w;

        if (FOGMODE_LINEAR == vFogInfos.x)
        {
            fogCoeff = (fogEnd - fFogDistance) / (fogEnd - fogStart);
        }
        else if (FOGMODE_EXP == vFogInfos.x)
        {
            fogCoeff = 1.0 / pow(E, fFogDistance * fogDensity);
        }
        else if (FOGMODE_EXP2 == vFogInfos.x)
        {
            fogCoeff = 1.0 / pow(E, fFogDistance * fFogDistance * fogDensity * fogDensity);
        }

        return clamp(fogCoeff, 0.0, 1.0);
    }

  varying vec2 vUV;
  uniform sampler2D textureSampler;
  void main(void) {
    // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
     
// gl_FragColor = texture2D(textureSampler, vUV);

    vec2 flippedUV = vec2(vUV.x, 1.0 - vUV.y);
    vec4 textureColor = texture2D(textureSampler, flippedUV);
    gl_FragColor = textureColor;

    vec4 defaultColor = vec4(1.0, 0.0, 0.0, 1.0);
    float fog = CalcFogFactor();
    vec4 vFogColor4 = vec4(vFogColor, 1.0); 
    // vFogColor4 = vFogColor4 * 1.0;
     gl_FragColor = fog * gl_FragColor + (1.0 - fog) * vFogColor4;    
    // gl_FragColor = (fog * 2.) * defaultColor;    

       // Alpha testing
        if (gl_FragColor.a < 0.5) {
            discard;
        }
     
    
    gl_FragColor.r = gl_FragColor.r * 0.4;
    gl_FragColor.g = gl_FragColor.g * 0.4;
    gl_FragColor.b = gl_FragColor.b * 0.4;
    gl_FragColor.a = gl_FragColor.a;

//   gl_FragColor = vec4(textureColor.rgb, textureColor.a);
    
  }

   