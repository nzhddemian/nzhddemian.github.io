#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D logo_texture;
varying vec2 fragCoord;

// uniform vec3 theme_colors[4];


// uniform float phasor_whole;
// uniform float narration_amplitude;
// uniform float beat_amplitude;

#ifdef GL_ES
    precision highp float;
    precision mediump int;
    #endif
    //   uniform float u_time; 
      uniform float u_startTime;

#define resolution u_resolution
#define session_time u_time
 vec3 theme_color = vec3(0.1,1.0,0.6);
   vec3 theme_colors[4]; 
 #define THEME_COLORS \
  theme_colors[0] = vec3(0.1, 1.0, 0.6); \
  theme_colors[1] = vec3(1.0, 0.5961, 0.102); \
  theme_colors[2] = vec3(0.102, 0.7294, 1.0); \
  theme_colors[3] = vec3(0.8039, 0.102, 1.0);

  float NS11(float x) {
    float fractX = fract(x);
    float intX = floor(x);
    float r0 = fract(sin(intX) * 43758.5453);
    float r1 = fract(sin(intX + 1.0) * 43758.5453);
    return mix(r0, r1, fractX);
}
#define beat_amplitude NS11((u_time)*2.)/2.
#define narration_amplitude beat_amplitude//(sin(u_time*(12.07))/12.)






#define pi 3.141592653589793238
#define full_time session_time/(12.07)
#define phasor_whole_one fract(session_time/(12.07))
#define phasor_whole_two fract(session_time/(12.07*2.0)) 
#define phasor_whole_sine  (sin(session_time/(12.07)) + 1.0)/2.0 
#define phasor_rev (0.5 - abs(phasor_whole_one - 0.5))*2.0
#define phasor_rev_two (0.5 - abs(phasor_whole_two - 0.5))*2.0

// #define c_phase_whole fract(session_time/(12.07))
 #define audioSignal (beat_amplitude + narration_amplitude)

#define HASH21(p) (vec2(-1.0+2.0*fract((50.0*fract( (p)*0.3183099 + vec2(0.71,0.113) )).x * (50.0*fract( (p)*0.3183099 + vec2(0.71,0.113) )).y * ((50.0*fract( (p)*0.3183099 + vec2(0.71,0.113) )).x + (50.0*fract( (p)*0.3183099 + vec2(0.71,0.113) )).y)))).x
float sparkles(vec2 uv,float time){
    uv *= 1.;
    float n = HASH21(uv+sin(-time*112.)*212.);
    n *= HASH21(uv + cos(-time*112.)*212.);
  return (n)+0.5;
}
//color mixer to smoothly change colors during each phasor_whole cycle
vec3 shapeColorMixer(){
 
    float colorMixer =  clamp(phasor_whole_one*4.,0.0,1.0);
    vec3 color1 = mix(theme_colors[3] ,theme_colors[0] ,colorMixer);
          colorMixer =  clamp(phasor_whole_one*4. - 1.0,0.0,1.0);
    vec3 color2 = mix(color1,theme_colors[1] , colorMixer);
          colorMixer =  clamp(phasor_whole_one*4. - 2.0,0.0,1.0);
    vec3 color3 = mix(color2 ,theme_colors[2] , colorMixer);
          colorMixer =  clamp(phasor_whole_one*4. - 3.0,0.0,1.0);
    return mix(color3, theme_colors[3] ,colorMixer);
 }
 vec3 shapeColorMixer2(){
  
       float colorMixer =  clamp(phasor_whole_one*4.,0.0,1.0);
    vec3 color1 = mix(theme_colors[2] ,theme_colors[1] ,colorMixer);
          colorMixer =  clamp(phasor_whole_one*4. - 1.0,0.0,1.0);
    vec3 color2 = mix(color1,theme_colors[0] , colorMixer);
          colorMixer =  clamp(phasor_whole_one*4. - 2.0,0.0,1.0);
    vec3 color3 = mix(color2 ,theme_colors[3] , colorMixer);
          colorMixer =  clamp(phasor_whole_one*4. - 3.0,0.0,1.0);
    return mix(color3, theme_colors[2] ,colorMixer);
 }

float noise11(float x) {
    float fractX = fract(x);
    float intX = floor(x);
    float r0 = fract(sin(intX) * 43758.5453);
    float r1 = fract(sin(intX + 1.0) * 43758.5453);
    return mix(r0, r1, fractX);
}

// tools to smooth breathe value if needed
float easyIn(float val){
   return pow(val, 2.0);
}
float easyOut(float val){
   return 1.0 - pow(1.0 - val, 2.0);
}
float easyInEasyOut(float val){
   return (val < 0.5) ? easyIn(val * 2.0) / 2.0 : easyOut(val * 2.0 - 1.0) / 2.0 + 0.5;
}


//set logo position here
#define logoPosition vec2(0.1,0.88)
 //set logo position here
 
 vec3 addRGBLogo(vec3 tintCol,vec3 inColor,vec3 inColor2 ){
            vec2 logoUV = fragCoord/u_resolution.xy ;
            //flip logo
            logoUV = 1.0 - logoUV;
            //flip logo X
            logoUV.x = 1.0 - logoUV.x;
            //move logo X
            logoUV.x -= 0.7;
            //applying logo position here 
           logoUV-= logoPosition;
           //managing the logo aspect ratio and scale    
            if(u_resolution.x<u_resolution.y) {
            //aspect ratio
                logoUV.y *= u_resolution.y/u_resolution.x;
            //scale    
                logoUV *= 9.0;
            }else{
                       //aspect ratio
                logoUV.x *= u_resolution.x/u_resolution.y;
                            //scale   
                logoUV *= 9.0;
            }
            float phase = (sin(phasor_rev*pi*2. - pi / 2.) + 1.0)/2.;
            vec3 logoS = texture2D(logo_texture,logoUV).rgb;
            vec3 logo = vec3(0.);
            logoUV.x -= 0.07 * phase + 0.01;
        logo = texture2D(logo_texture,logoUV).r * inColor;
            logoUV.x += 0.14 * phase + 0.02;
        logo += texture2D(logo_texture,logoUV).r * inColor2;
        //applying color
        // logo *= tintCol;
        logo = mix(logo,logoS,logoS);
        //setting logo transparency
        logo*0.16;
        
        return logo*(0.7 + sparkles(logoUV*2.,112.)/3.);
        }
         vec3 addLogo(vec3 tintCol){
            vec2 logoUV = fragCoord/u_resolution.xy ;
            //flip logo
            logoUV = 1.0 - logoUV;
            //flip logo X
            logoUV.x = 1.0 - logoUV.x;
            //move logo X
            logoUV.x -= 0.7;
            //applying logo position here 
           logoUV-= logoPosition;
           //managing the logo aspect ratio and scale
            if(u_resolution.x<u_resolution.y) {
            //aspect ratio
                logoUV.y *= u_resolution.y/u_resolution.x;
            //scale    
                logoUV *= 9.0;
            }else{
                       //aspect ratio
                logoUV.x *= u_resolution.x/u_resolution.y;
                            //scale   
                logoUV *= 9.0;
            }
        vec3 logo = texture2D(logo_texture,logoUV).rgb;
        //applying color
        logo *= tintCol;
        
        //setting logo transparency
        logo*0.6;
        
        return logo;
        }

        vec2 rotateUV(vec2 uv, float angle){
            vec2 rv;
            rv.x = uv.x*cos(angle) + uv.y*sin(angle);
            rv.y = uv.x*sin(angle) - uv.y*cos(angle);
            return rv;
        }


      float line(vec2 uv, vec2 a, vec2 b){
   vec2 pa = uv-a;
   vec2 ba = b-a;
    float t = clamp(dot(pa, ba)/dot(ba,ba),0.,1.0);
    vec2 cv = pa - ba*t;
    cv.y *= resolution.y/resolution.x;
    float d = length(cv);
    if(distance(a, b)>2.){return 2.;}else{
    return ( d);
    }
}
//this funcion to draw a line
float lineB(vec2 p, vec2 a, vec2 b){
    vec2 pa = p-a;
    vec2 ba = b-a;

    float t = clamp(dot(pa, ba)/dot(ba,ba),0.,1.0);
    vec2 cv = pa - ba*t;
    
    float d = length(cv);
    if(distance(a, b)>2.){return 2.;}else{
    return ( d);
    }
}
        


        vec2 hash12(float i){
            float x = fract(sin(i*123.123)*543.2); 
            float y = fract(sin(i*312.123)*345.2);
            return vec2(x,y);
        } 

// noise functions
float hash11( float n )
 {
return fract(sin(n)*43758.5453);
 }
 float hash21(vec2 p) 
{
p  = 50.0*fract( p*0.3183099 + vec2(0.71,0.113)); 
 return vec2(-1.0+2.0*fract( p.x*p.y*(p.x+p.y) )).x;
 }
float noise21(vec2 p,float u_time){
	vec2 ip = floor(p+(u_time/21.));
	vec2 u = fract(p+(u_time/21.));
	u = u*u*(3.0-2.0*u);
	
	float res = mix(
		mix(hash21(ip),hash21(ip+vec2(1.0,0.0)),u.x),
		mix(hash21(ip+vec2(0.0,1.0)),hash21(ip+vec2(1.0,1.0)),u.x),u.y);
	return res*res;
}

  float bump(float t, float center, float width) {
            float d = min(abs(t - center), 1.0 - abs(t - center)); // wrap-around distance
            float x = d / width;
            return 1.0 - exp(-x * x); // Gaussian-style bump
        }
        
        float curvedTime2(float new_phase, vec2 points,float w,float strength){

            float curveTime = new_phase ;

            for(int i = 0; i < 2; i++){
                curveTime -= strength * bump(new_phase, points[i], w);
            }
 

            // Wrap to [0, 1]
            curveTime = fract(curveTime);
            return curveTime ;
        }
        //  float w = 0.07;  // width of each slowdown zone
    // float strength = 0.03;  // how much to slow down

    float curvedTime4(float new_phase, vec4 points,float w ,float strength){

            float curveTime = new_phase ;
 
            for(int i = 0; i < 4; i++){
                curveTime -= strength * bump(new_phase, points[i], w);
            }
 

            // Wrap to [0, 1]
            curveTime = fract(curveTime);
            return curveTime ;
        }


//rotation function
vec2 rotateMatrix(vec2 uv, float rotation)
{
    return vec2(
        cos(rotation) * uv.x + sin(rotation) * uv.y,
        cos(rotation) * uv.y - sin(rotation) * uv.x
    );
}

vec2 swirl(float phase){
  float effectRadius = .3;

    float effectAngle = phase*2. * pi;
    
    vec2 center = vec2(0.5);
    center = center == vec2(0., 0.) ? vec2(.5, .5) : center;
    
    vec2 uv = fragCoord.xy / resolution.xy - center;
    
    float len = length(uv * vec2(resolution.x / resolution.y, 1.));
    float angle = atan(uv.y, uv.x) + effectAngle * smoothstep(effectRadius, 0., len);
    float radius = length(uv);
    vec2 uvOut = vec2(radius * cos(angle), radius * sin(angle)) + center;
    return uvOut;
    }

    float modd(float a, float b)
{
    return a - b * floor(a / b);
}
float rand (in vec2 uv) { return fract(sin(dot(uv,vec2(12.4124,48.4124)))*48512.41241); }

const vec2 O = vec2(0.,1.);
float noise (in vec2 uv) {
	vec2 b = floor(uv);
	return mix(mix(rand(b),rand(b+O.yx),.5),mix(rand(b+O),rand(b+O.yy),.5),.5);
}

vec2 sdBezier(vec2 pos, vec2 A, vec2 B, vec2 C)
{    
    vec2 a = B - A;
    vec2 b = A - 2.0*B + C;
    vec2 c = a * 2.0;
    vec2 d = A - pos;

    float kk = 1.0 / dot(b,b);
    float kx = kk * dot(a,b);
    float ky = kk * (2.0*dot(a,a)+dot(d,b)) / 3.0;
    float kz = kk * dot(d,a);      

    vec2 res;

    float p = ky - kx*kx;
    float p3 = p*p*p;
    float q = kx*(2.0*kx*kx - 3.0*ky) + kz;
    float h = q*q + 4.0*p3;

    h = sqrt(h);
    vec2 x = (vec2(h, -h) - q) / 2.0;
    vec2 uv = sign(x)*pow(abs(x), vec2(1.0/3.0));
    float t = clamp(uv.x+uv.y-kx, 0.0, 1.0);

    return vec2(length(d+(c+b*t)*t),t);
}

float phaseDebug(float scale, vec2 pos){
    
    vec2 uv = (fragCoord.xy / resolution.xy)-pos;
    uv.x *= resolution.x/resolution.y;
    float d = length(uv);
    d = smoothstep(0.011 + scale,0.01 + scale,d);
    return d;

}




vec4 hash42(vec2 p)
{
	vec4 p4 = fract(vec4(p.xyxy) * vec4(.1031, .1030, .0973, .1099));
    p4 += dot(p4, p4.wzxy+19.19);
    return fract((p4.xxyz+p4.yzzw)*p4.zywx) - 0.5;
}

vec2 hash22(vec2 p)
{
	vec3 p3 = fract(vec3(p.xyx) * vec3(443.897, 441.423, 437.195));
    p3 += dot(p3, p3.yzx+19.19);
    return -1.0+2.0*fract((p3.xx+p3.yz)*p3.zy);
}

// IQ's Gradient Noise
float Gradient2D( in vec2 p )
{
    vec2 i = floor( p );
    vec2 f = fract( p );
	vec2 u = f*f*(3.0-2.0*f);

    return mix( mix( dot( hash22( i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ), 
                     dot( hash22( i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                mix( dot( hash22( i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ), 
                     dot( hash22( i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
}


const vec3 cold = vec3(255.0, 244.0, 189.0)/255.0;
const vec3 hot  = vec3(181.0, 236.0, 255.0)/255.0;

vec3 StarFieldLayer(vec2 p, float du, float count, float brightness, float size)
{
    // Tiling:
    vec2 piV;
    du *= count;    p *= count;
    piV  = floor(p); p  = fract(p)-0.5;
  
    // Randomize position, brightness and spectrum:
    vec4 h = hash42(piV);

    // Resolution independent radius:
    float s = brightness*(0.7+0.6*h.z)*smoothstep(0.8*du, -0.2*du, length(p+0.9*h.xy) - size*du);

    return s*mix(mix(vec3(1.), cold, min(1.,-2.*h.w)), hot, max(0.,2.*h.w));
}

vec3 StarField(vec2 p, float du)
{
    vec3 c;
    c  = StarFieldLayer(p, du, 25.0, 0.18, 0.5); 
    c += StarFieldLayer(p, du, 15.0, 0.25, 0.5); 
    c += StarFieldLayer(p, du, 12.0, 0.50, 0.5); 
    c += StarFieldLayer(p, du,  5.0, 1.00, 0.5); 
    c += StarFieldLayer(p, du,  3.0, 1.00, 0.9); 

    // Cluster:
    float s = 3.5*(max(0.2, Gradient2D(2.0*p*vec2(1.2,1.9)))-0.2)/(1.0-0.2);
    c += s*StarFieldLayer(p, du, 160.0, 0.10, 0.5); 
    c += s*StarFieldLayer(p, du,  80.0, 0.15, 0.5); 
    c += s*StarFieldLayer(p, du,  40.0, 0.25, 0.5); 
    c += s*StarFieldLayer(p, du,  30.0, 0.50, 0.5); 
    c += s*StarFieldLayer(p, du,  20.0, 1.00, 0.5); 
    c += s*StarFieldLayer(p, du,  10.0, 1.00, 0.9); 

    c *= 1.3;
    
    // Resolution independent brightness:
    float f = 1.0 / sqrt(660.0*du);

    return f*min(c, 1.0);
}
vec3 stars(){
float du = 1.0 / resolution.y;
 vec2  uv = du*(fragCoord-0.5*resolution.xy) + 1.33;
 uv.x +=  u_time/130.0;
uv.x *= resolution.x/resolution.y;
   return StarField(uv/1.1, du);
}


































    #define TWO_PI 6.2831853072
    float signedAngle(vec2 a, vec2 b){
        // atan(y, x) returns the angle whose arctangent is y / x. Value in [-pi, pi]
        return atan(a.x*b.y - a.y*b.x, dot(a, b));
    }




    vec2 getLemniscate(float t,vec2 r){
        
        vec2 outV = vec2(sin(t)*r.x,cos(t)*r.y);
        return outV;
    }
    float lemniscate(vec2 uv, float phase, float u_time){
    
        uv *= 4.0;
        
        float angle = 0.0;
        float segments = 16.0;

        float delta = (0.25 * (TWO_PI)) / segments;
        
        float speed = 2.0;
        float radius = 1.0;
        
        
        
            segments = 32.0;
            speed = 2.5;
            float phaseVal = phase;
            // phaseVal *= (cos(u_time + pi)/12.);
            delta = ((  0.25) * (TWO_PI)) / segments;

        vec2 c0;
        vec2 c1;
        float t = u_time/2. + pi/2.;
        float linees = 0.0;
     for(float i = 0.0; i < 6.; i += 1.){
            // delta = (delta / (1.0 + i/32.)/.);

                float line = 1.2;
                radius = 0.8;
                vec2 scale = hash12(i); 
                // scale.y *= 0.5;
                scale.y = clamp(scale.y,0.0,.5);
                uv.y -= 0.25;
                uv.x -= 0.01;
                vec2 v1 = (vec2(-1.25,0.0 )*scale);
                c0 =  line * radius * getLemniscate(  (i ) * (2.2 * delta  ),v1);
                c1 = line * radius * getLemniscate(  (i + 1.0) * (2.2 * delta ),v1);
                angle += signedAngle(c0-uv, c1-uv)/2.;
                uv.y += 0.25;
                uv.x += 0.01;
                vec2 v2 = vec2(0.5,mix(.25,.7,phase))*scale;
                c0 =  line * radius * getLemniscate( t + pi/2. + (i ) * (line * delta*1.5  ),v2);
                c1 = line * radius * getLemniscate( t + pi/2. + (i + 1.0) * (line * delta*1.5 ),v2);
                angle += signedAngle(c0-uv, c1-uv)/2.;

                vec2 v3 = vec2(.5,mix(.25,0.5,phase))*scale;
                c0 =  line * radius * getLemniscate( t - pi*.5 + (i ) * (line * delta  ),v3);
                c1 = line * radius * getLemniscate( t - pi*.5 + (i + 1.0) * (line * delta ),v3);
                angle += signedAngle(c0-uv, c1-uv)/2.;
                 vec2 v4 = vec2(.25,mix(.125,0.25,phase))*scale;
                c0 =  line * radius * getLemniscate( t + pi*1.25 + (i ) * (line * delta  ),v4);
                c1 = line * radius * getLemniscate( t + pi*1.25 + (i + 1.0) * (line * delta ),v4);
                angle += signedAngle(c0-uv, c1-uv)/2.;
                vec2 v5 = vec2(.15,mix(.075,0.15,phase))*scale;
                c0 =  line * radius * getLemniscate( t + pi*2.25 + (i ) * (line * delta  ),v5);
                c1 = line * radius * getLemniscate( t + pi*2.25 + (i + 1.0) * (line * delta ),v5);
                angle += signedAngle(c0-uv, c1-uv)/2.;
        }
        float d1 = (angle / TWO_PI);
        float d2 = (-angle / TWO_PI);
        d1 = clamp(d1, 0.0, 1.0);
        d2 = clamp(d2, 0.0, 1.0);
        
        d1 = smoothstep(-0.0, 1.5, d1);
        d2 = smoothstep(-0.0, 1.5, d2);
        return (d1+d2)*sparkles(uv*52.,u_time/12.)/2. + (d1+d2)/2.;
    }

    void main()
    {
        vec2 uv = fragCoord/resolution.xy;
        uv -= 0.5;

        // if(resolution.x < resolution.y) {
        //     uv.y *= resolution.y/resolution.x;
        // } else {
            uv.x /= resolution.y/resolution.x;
        // }
        uv /= 16.6;
        
        vec3 col = vec3(0.);
        uv = uv.yx;
        uv *= 1.6;
        
        float shape = lemniscate(uv, 0.0, u_time) * 4.;
        vec3 inColor = vec3(0.7255, 0.8745, 1.0);
        
        col = inColor * shape;
        // col += addLogo(inColor + 0.2);
        uv.x *= 2.0;
        float d = length(uv );
        d = smoothstep(0.0,0.1,d);
        col += (d*inColor*sparkles(uv*52.,u_time/12.)/2. + d*inColor/2.)/3.;
        gl_FragColor = vec4(col, 1.0);
    }
