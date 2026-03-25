#ifdef GL_ES
precision mediump float;
#endif

varying vec2 fragCoord;
uniform vec2 u_resolution;

void main() {
    fragCoord = uv * u_resolution;
    gl_Position = vec4(position, 1.0);
} 
 
 
 
 
 
 