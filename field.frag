#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D logo_texture;
varying vec2 fragCoord;

const float TWO_PI = 6.2831853072;

float hash21(vec2 p)
{
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float sparkles(vec2 uv, float time)
{
    vec2 t = vec2(sin(-time * 112.0), cos(-time * 112.0)) * 212.0;
    float n = hash21(uv + t);
    n *= hash21(uv + t.yx * 0.73);
    return n + 0.5;
}

float signedAngle(vec2 a, vec2 b)
{
    return atan(a.x * b.y - a.y * b.x, dot(a, b));
}

const float HALF_PI = 1.57079632679;

vec2 roundedRectPoint(float t, vec2 halfSize, float cornerRadius)
{
    vec2 h = halfSize;
    float r = min(max(cornerRadius, 1e-5), min(h.x, h.y));
    float hx = h.x - r;
    float hy = h.y - r;
    float arcLen = r * HALF_PI;
    float P = 4.0 * hx + 4.0 * hy + 4.0 * arcLen;
    float u = fract(t / TWO_PI) * P;
    if (u < 2.0 * hx)
    {
        return vec2(-hx + u, -h.y);
    }
    u -= 2.0 * hx;
    if (u < arcLen)
    {
        float a = -HALF_PI + u / r;
        return vec2(hx, -hy) + r * vec2(cos(a), sin(a));
    }
    u -= arcLen;
    if (u < 2.0 * hy)
    {
        return vec2(h.x, -hy + u);
    }
    u -= 2.0 * hy;
    if (u < arcLen)
    {
        float a = u / r;
        return vec2(hx, hy) + r * vec2(cos(a), sin(a));
    }
    u -= arcLen;
    if (u < 2.0 * hx)
    {
        return vec2(hx - u, h.y);
    }
    u -= 2.0 * hx;
    if (u < arcLen)
    {
        float a = HALF_PI + u / r;
        return vec2(-hx, hy) + r * vec2(cos(a), sin(a));
    }
    u -= arcLen;
    if (u < 2.0 * hy)
    {
        return vec2(-h.x, hy - u);
    }
    u -= 2.0 * hy;
    float a = 3.14159265359 + u / r;
    return vec2(-hx, -hy) + r * vec2(cos(a), sin(a));
}
vec3 palett(float v ) {
    return vec3(0.26) + tan(1.09)*sin(1.09)*0.26 * cos(3.18318 * (v + vec3(0.0,0.333,0.567)));
}
#define clp(x) clamp(x, 0.0, 1.0)
vec2 lemniscate(vec2 uv, float time)
{
    float angle = 0.0;
    float delta = 0.25 * TWO_PI;
    float radius = 0.1;
    vec2 axis = vec2(.25, 0.5);
    float scale = 0.01;
    float scaleUV = 0.01;
    // uv.x = sin(uv.x*TWO_PI ) * scaleUV;
    // uv.y = cos(uv.y*TWO_PI ) * scaleUV;
    vec2 c0 = vec2(0.0);
    vec2 c1 = vec2(0.0);
    float speed = .1;
    vec2 halfSize = axis * radius;
    float cornerR = min(halfSize.x, halfSize.y) * 0.35;
    for (float i = 0.0; i < 32.0; i += 1.0)
    {
        delta += 0.1;
        time *= -1.0;
        c0 = roundedRectPoint((i + time * i * speed + 0.04) * delta, halfSize, cornerR);
        c1 = roundedRectPoint((i + time * i * speed) * delta, halfSize, cornerR);
        angle += signedAngle(c0 - uv, c1 - uv) / 1.3;
        
    }
    float d1 = smoothstep(.0, 1.5, clamp(angle / TWO_PI, 0.0, 1.0));
    float d2 = smoothstep(0.0, 1.5, clamp(-angle / TWO_PI, 0.0, 1.0));
    float shape = d2 ;
    return vec2(d2* 2.0, d1* 2.0)  ;
}

    void main()
    {
        vec2 uv = fragCoord/u_resolution.xy;
        uv -= 0.5;
    uv.x *= u_resolution.x / u_resolution.y;
    uv /= 6.6;
    uv = uv.yx * 1.6;
    float d = length(uv);
    d = 1.0;
    vec2 shape = lemniscate(uv, u_time/12.) ;
    vec3 col1 = vec3(0.7255, 0.8745, 1.0);
    col1 *= palett(clp(shape.x*2.75)*4.0  - u_time) * shape.x*d + shape.x*d;
    // d= 1.0 - d;
     vec3 col2 = vec3(0.7255, 0.8745, 1.0)*shape.x;
        gl_FragColor = vec4(col2, 1.0);
    }
