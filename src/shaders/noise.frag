precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_type;
uniform vec2 u_mouse;
uniform float u_time;

// void main() {
//     vec2 uv = gl_FragCoord.xy / u_resolution.xy;
//     uv.x *= u_resolution.x / u_resolution.y;

//     float scale = 2.0;
//     uv *= scale;

//     vec3 color = vec3(.0);

//     // Cell positions
//     vec2 point[5];
//     point[0] = vec2(0.83,0.75);
//     point[1] = vec2(0.60,0.07);
//     point[2] = vec2(0.28,0.64);
//     point[3] =  vec2(0.31,0.26);
//     point[4] = u_mouse / u_resolution * scale;

//     float m_dist = 1.;  // minimum distance
//     vec2 m_point;        // minimum position

//     // Iterate through the points positions
//     for (int i = 0; i < 5; i++) {
//         float dist = distance(uv, point[i]);
//         if ( dist < m_dist ) {
//             // Keep the closer distance
//             m_dist = dist;

//             // Kepp the position of the closer point
//             m_point = point[i];
//         }
//     }

//     // Add distance field to closest point center
//     color += m_dist*2.;

//     // tint acording the closest point position
//     color.rg = m_point;

//     // Show isolines
//     // color -= abs(sin(80.0*m_dist))*0.07;

//     // Draw point center
//     color += 1.-step(.02, m_dist);

//     gl_FragColor = vec4(color,1.0);
// }

// // Some useful functions
// vec3 mod289(vec3 x) {
//     return x - floor(x * (1.0 / 289.0)) * 289.0;
// }

// vec2 mod289(vec2 x) {
//     return x - floor(x * (1.0 / 289.0)) * 289.0;
// }

// vec3 permute(vec3 x) {
//     return mod289(((x*34.0)+1.0)*x);
// }

// float snoise(vec2 uv) {
//     // Precompute values for skewed triangular grid
//     const vec4 C = vec4(0.211324865405187,
//                         // (3.0-sqrt(3.0))/6.0
//                         0.366025403784439,
//                         // 0.5*(sqrt(3.0)-1.0)
//                         -0.577350269189626,
//                         // -1.0 + 2.0 * C.x
//                         0.024390243902439);
//                         // 1.0 / 41.0

//     // First corner (x0)
//     vec2 i  = floor(uv + dot(uv, C.yy));
//     vec2 x0 = uv - i + dot(i, C.xx);

//     // Other two corners (x1, x2)
//     vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
//     vec2 x1 = x0.xy + C.xx - i1;
//     vec2 x2 = x0.xy + C.zz;

//     // Do some permutations to avoid
//     // truncation effects in permutation
//     i = mod289(i);
//     vec3 p = permute(
//             permute( i.y + vec3(0.0, i1.y, 1.0))
//                 + i.x + vec3(0.0, i1.x, 1.0 ));

//     vec3 m = max(0.5 - vec3(
//                         dot(x0,x0),
//                         dot(x1,x1),
//                         dot(x2,x2)
//                         ), 0.0);

//     m = m*m ;
//     m = m*m ;

//     // Gradients:
//     //  41 pts uniformly over a line, mapped onto a diamond
//     //  The ring size 17*17 = 289 is close to a multiple
//     //      of 41 (41*7 = 287)

//     vec3 x = 2.0 * fract(p * C.www) - 1.0;
//     vec3 h = abs(x) - 0.5;
//     vec3 ox = floor(x + 0.5);
//     vec3 a0 = x - ox;

//     // Normalise gradients implicitly by scaling m
//     // Approximation of: m *= inversesqrt(a0*a0 + h*h);
//     m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0+ h * h);

//     // Compute final noise value at P
//     vec3 g = vec3(0.0);
//     g.x  = a0.x  * x0.x  + h.x  * x0.y;
//     g.yz = a0.yz * vec2(x1.x, x2.x) + h.yz * vec2(x1.y, x2.y);
//     return 130.0 * dot(m, g);
// }

// void main() {
//     vec2 uv = gl_FragCoord.xy/u_resolution.xy;
//     uv.x *= u_resolution.x/u_resolution.y;

//     vec3 color = vec3(0.0);

//     uv *= 20.;

//     float noiseVal = snoise(uv) *.5 + .5;
//     color = vec3(noiseVal, noiseVal, noiseVal);

//     gl_FragColor = vec4(color,1.0);
// }
