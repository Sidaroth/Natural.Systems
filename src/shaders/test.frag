precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_type;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    uv += 0.5;

    float inCircle = 1.0 - step(0.5, length(uv));
    vec3 color = vec3(1.0, 1.0, 0.0) * inCircle;
    gl_FragColor = vec4(color, 1.0);
}