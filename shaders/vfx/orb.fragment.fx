      precision highp float;

        #define saturate(oo) clamp(oo, 0.0, 1.0)

        #define MarchSteps 8
        #define ExpPosition vec3(0.0)
        // #define Radius 2.0
        // #define Background vec4(0.1, 0.0, 0.0, 0.0)
        // #define NoiseSteps 8
        // #define NoiseAmplitude 0.09
        // #define NoiseFrequency 1.2
        // #define Animation vec3(0.0, -2.0, 0.5)
        // #define Color1 vec4(1.0, 0.0, 0.0, 1.0)
        // #define Color2 vec4(1.0, 0.6, 0.0, 1.0)
        // #define Color3 vec4(1.0, 0.03, 0.0, 1.0)
        // #define Color4 vec4(0.05, 0.02, 0.02, 1.0)

        
uniform float Radius;
uniform vec4 Background;
uniform int NoiseSteps;
uniform float NoiseAmplitude;
uniform float NoiseFrequency;
uniform vec3 Animation;
uniform vec4 Color1;
uniform vec4 Color2;
uniform vec4 Color3;
uniform vec4 Color4;

        uniform float iTime;
        uniform vec2 iResolution;
        uniform vec2 iMouse;

        varying vec2 vUV;

        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
            const vec2 C = vec2(1.0/6.0, 1.0/3.0);
            const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

            vec3 i  = floor(v + dot(v, C.yyy));
            vec3 x0 = v - i + dot(i, C.xxx);

            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min(g.xyz, l.zxy);
            vec3 i2 = max(g.xyz, l.zxy);

            vec3 x1 = x0 - i1 + C.xxx;
            vec3 x2 = x0 - i2 + C.yyy;
            vec3 x3 = x0 - D.yyy;

            i = mod289(i);
            vec4 p = permute( permute( permute( i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

            float n_ = 0.142857142857;
            vec3  ns = n_ * D.wyz - D.xzx;

            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_);
            vec4 x = x_ *ns.x + ns.yyyy;
            vec4 y = y_ *ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);

            vec4 b0 = vec4(x.xy, y.xy);
            vec4 b1 = vec4(x.zw, y.zw);

            vec4 s0 = floor(b0) * 2.0 + 1.0;
            vec4 s1 = floor(b1) * 2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));

            vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
            vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

            vec3 p0 = vec3(a0.xy, h.x);
            vec3 p1 = vec3(a0.zw, h.y);
            vec3 p2 = vec3(a1.xy, h.z);
            vec3 p3 = vec3(a1.zw, h.w);

            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
            p0 *= norm.x;
            p1 *= norm.y;
            p2 *= norm.z;
            p3 *= norm.w;

            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m = m * m;
            return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        float Turbulence(vec3 position, float minFreq, float maxFreq, float qWidth) {
            float value = 0.0;
            float cutoff = clamp(0.5/qWidth, 0.0, maxFreq);
            float fade;
            float fOut = minFreq;
            for (int i = NoiseSteps; i >= 0; i--) {
                if (fOut >= 0.5 * cutoff) break;
                fOut *= 2.0;
                value += abs(snoise(position * fOut)) / fOut;
            }
            fade = clamp(2.0 * (cutoff - fOut) / cutoff, 0.0, 1.0);
            value += fade * abs(snoise(position * fOut)) / fOut;
            return 1.0 - value;
        }

        float SphereDist(vec3 position) {
            return length(position - ExpPosition) - Radius;
        }

        vec4 Shade(float distance) {
            float c1 = saturate(distance * 5.0 + 0.5);
            float c2 = saturate(distance * 5.0);
            float c3 = saturate(distance * 3.4 - 0.5);
            vec4 a = mix(Color1, Color2, c1);
            vec4 b = mix(a, Color3, c2);
            return mix(b, Color4, c3);
        }

        float RenderScene(vec3 position, out float distance) {
            float noise = Turbulence(position * NoiseFrequency + Animation * iTime, 0.1, 1.5, 0.03) * NoiseAmplitude;
            noise = saturate(abs(noise));
            distance = SphereDist(position) - noise;
            return noise;
        }

        vec4 March(vec3 rayOrigin, vec3 rayStep) {
            vec3 position = rayOrigin;
            float distance;
            float displacement;
            for (int step = MarchSteps; step >= 0; --step) {
                displacement = RenderScene(position, distance);
                if (distance < 0.05) break;
                position += rayStep * distance;
            }
            return mix(Shade(displacement), Background, float(distance >= 0.5));
        }

        void main(void) {
            vec2 p = (vUV * 2.0 - 1.0) * vec2(iResolution.x / iResolution.y, 1.0);
            vec3 ro = vec3(0.0, 0.0, 5.0);
            vec3 rd = normalize(vec3(p, -1.5));
            vec4 col = Background;
            vec3 origin;
            if (SphereDist(ro + rd * Radius) <= Radius) {
                col = March(ro, rd);
            }
            gl_FragColor = col;
        }