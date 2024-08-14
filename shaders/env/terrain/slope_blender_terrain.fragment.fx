precision highp float;

// Uniforms
uniform sampler2D grassTexture;
uniform sampler2D rockTexture;
uniform sampler2D transitionTexture;
uniform sampler2D pathTexture;
uniform float slopeThreshold;
uniform float transitionSmoothness;
uniform vec2 grassScale;
uniform vec2 rockScale;
uniform vec2 transitionScale;
// Varying
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUV;
varying vec4 vColor;
uniform float transitionExtent; 

void main(void) {
    // Calculate slope
    float slope = 1.0 - dot(vNormal, vec3(0.0, 1.0, 0.0));
    
    // Scale UVs for grass and rock textures
    vec2 scaledGrassUV = vUV * grassScale;
    vec2 scaledRockUV = vUV * rockScale;
     vec2 scaledTransitionMask = vUV * transitionScale;
    
    // Sample textures
    vec4 grassColor = texture2D(grassTexture, scaledGrassUV);
    vec4 rockColor = texture2D(rockTexture, scaledRockUV);
    vec4 transitionMask = texture2D(transitionTexture, scaledTransitionMask);
    vec4 pathColor = texture2D(pathTexture, scaledGrassUV);


    // Calculate blend factor
    // float blend = smoothstep(slopeThreshold - transitionExtent, 
    //                          slopeThreshold + transitionExtent, 
    //                          slope);
    
    // // Apply transition mask within the transition zone
    // float maskedBlend = mix(blend, blend * transitionMask.r, 
    //                         smoothstep(slopeThreshold - transitionExtent,
    //                                    slopeThreshold + transitionExtent,
    //                                    slope));
    
    // // Smooth the transition
    // maskedBlend = smoothstep(0.0, transitionSmoothness, maskedBlend);
    
    // // Ensure complete transition to rock beyond the threshold + extent
    // maskedBlend = max(maskedBlend, step(slopeThreshold + transitionExtent, slope));
    
    // // Mix grass and rock textures
    // vec4 finalColor = mix(grassColor, rockColor, maskedBlend);

    //   // Calculate basic blend factor
    // float basicBlend = smoothstep(slopeThreshold, slopeThreshold + transitionSmoothness, slope);
    
    // // Calculate transition zone
    // float transitionZone = smoothstep(slopeThreshold - transitionSmoothness, slopeThreshold + transitionSmoothness, slope);
    
    // // Apply transition mask only in the transition zone
    // float maskedBlend = mix(basicBlend, basicBlend * transitionMask.r, transitionZone);
    
    // // Mix grass and rock textures
    // vec4 finalColor = mix(grassColor, rockColor, maskedBlend);

    // Calculate blend factor
    float blend = smoothstep(slopeThreshold, slopeThreshold + transitionSmoothness, slope);
    
    // Apply transition mask
    // blend *= transitionMask.r;
    
    // Mix grass and rock textures
    vec4 finalColor = mix(grassColor, rockColor, blend);
    

     float maskValue = transitionMask.r;
    float pathBlend = smoothstep(slopeThreshold, slopeThreshold + transitionSmoothness, vColor.b);
    //    float pathBlend = smoothstep(slopeThreshold - 0.1, slopeThreshold + 0.1, maskValue * vColor.b);
    
    
    // finalColor = mix(finalColor, pathColor * transitionMask.r, pathBlend);
    finalColor = mix(finalColor, pathColor, pathBlend * maskValue);
    
    finalColor.rgb *= 0.2;

    finalColor.rgb *= vColor.g;


    gl_FragColor = finalColor;
  
}