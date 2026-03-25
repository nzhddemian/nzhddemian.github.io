






#ifdef GL_ES
    precision highp float;
    precision mediump int;
    #endif
      uniform float u_time;
        uniform vec2 u_resolution;
      varying vec2 sfragCoord;
      // Let's define PI constant
      #define pi 3.1415926535
    float t;
 uniform float u_scale;



const float lineThickness = 0.00001;
const float neonRadius = 0.;
const vec3 neonColor = vec3(1.0, 1.0, 1.0);




float hash21(vec2 p)  // replace this by something better
{
    p  = 50.0*fract( p*0.3183099 + vec2(0.71,0.113));
    return vec2(-1.0+2.0*fract( p.x*p.y*(p.x+p.y) )).x;
}

//MARK: MATH
float hashh21(vec2 p) {
    return fract(sin(dot(p.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

//MARK: MATH
float noise( vec2 p )
{
    
    vec2 i = floor( p );
    vec2 f = fract( p );
    vec2 u = f*f*(3.0-2.0*f);
    return mix( mix(hash21( i + vec2(0.0,0.0) ),
                    hash21( i + vec2(1.0,0.0) ), u.x),
                mix(hash21( i + vec2(0.0,1.0) ),
                    hash21( i + vec2(1.0,1.0) ), u.x), u.y)*0.5 + 0.5;

}

float perlinNoise(vec2 uv){
    mat2 m = mat2( 1.6,  1.2, -1.2,  1.6 );
    float f  = 0.5000*noise( uv ); uv = m*uv;
    f += 0.2500*noise( uv ); uv = m*uv;
    f += 0.1250*noise( uv ); uv = m*uv;
    f += 0.0625*noise( uv ); uv = m*uv;
    return f;
}

vec3 colorNoise( vec2 p )
{
    
    float r = perlinNoise(p*1.1);
    float g = perlinNoise(p);
    float b = perlinNoise(p*1.2);
    
    return vec3(r,g,b);
}

vec3 colorGrain(vec2 noiseUV,float u_t){

     vec3 noiseCol = vec3(0.0);
    noiseCol.r  = noise(vec2(noiseUV.x + sin(u_t*2. )*2.,noiseUV.y + sin(u_t*3. )*2.)*1100.);
    noiseCol.g  = noise(vec2(noiseUV.x + sin(u_t*2. )*2.,noiseUV.y + sin(u_t/2. )*2.)*1100.);
    noiseCol.b  = noise(vec2(noiseUV.x + sin(u_t*2. )*2.,noiseUV.y + sin(u_t*1.2)*2.)*1100.);
    noiseCol += 0.05;
    return noiseCol;
}
vec3 bwGrain(vec2 noiseUV,float u_t){

     
    float noiseBw  = noise(vec2(noiseUV.x + sin(u_t*2. )*2.,noiseUV.y + sin(u_t*3. )*2.)*1100.);
    
    
    return vec3(noiseBw);
}
void main()
{
vec2 uv = sfragCoord.xy / u_resolution.xy-0.5;
// vec2 uv = gl_FragCoord.xy / u_resolution.xy-0.5;
uv.x *= u_resolution.x/u_resolution.y;


float d = length(uv);
d = smoothstep(0.22,0.2,d);
vec3 col = vec3(d);
float u_t = tan(u_time*112.);
    vec2 noiseUV = uv*1112.;
    // noiseUV *= 1.0 + hashh21(vec2(u_t/123.));
    noiseUV.y += u_t*62.;
    
 vec3 noiseCol = vec3(perlinNoise(noiseUV)*0.4);
float uvMask = smoothstep(0.,.5,uv.y + 0.35);
noiseCol *= uvMask;
noiseCol *= bwGrain(uv,u_t*112.);
noiseCol = smoothstep(0.2,0.3 + abs(sin(u_scale/2.))/12. ,noiseCol);
float sun = pow(uv.y,5.)*34.;
noiseCol -= smoothstep(0.6,0.7 ,sun);
noiseCol.r = 1.0;
gl_FragColor = vec4(noiseCol,1.0);
}