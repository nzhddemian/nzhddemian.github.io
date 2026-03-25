#ifdef GL_ES
 precision mediump float;
 precision mediump int;
 #endif


uniform float u_time;
// uniform vec2 u_mouse;
uniform vec2 u_resolution;





const float lineThickness = 0.005;
const float neonRadius = 0.2;
const vec3 neonColor = vec3(0.0, 1.0, 1.0);

void main()
{
   	
	 float col;
    float t = u_time*.1;
   vec2 uv = gl_FragCoord.xy / u_resolution.xy-0.5+vec2(t,t*2.0);
        float factor = 1.5;
        for(int i=0;i<9;i++)
        {
            uv *= -factor*factor;
            uv += sin(uv.yx/factor)/factor;
            col += sin(uv.x-uv.y+col)+cos(uv.y-uv.x);
        }
    gl_FragColor = vec4(vec3(col/5.0),1.0);
    // gl_FragColor = vec4(color * lines, 1.0);
}

