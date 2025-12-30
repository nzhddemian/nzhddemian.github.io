@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4<f32> {
    let x = f32((vertexIndex << 1u) & 2u) * 2.0 - 1.0;
    let y = f32(vertexIndex & 2u) * 2.0 - 1.0;
    return vec4<f32>(x, y, 0.0, 1.0);
}

@group(0) @binding(0) var<uniform> resolution: vec2<f32>;

@fragment
fn fs_main(@builtin(position) position: vec4<f32>) -> @location(0) vec4<f32> {
    let uv = position.xy / resolution;
    var d = length(uv - vec2<f32>(0.5, 0.5));
    d = sin(d * 20.0) * 0.5 + 0.5;
    return vec4<f32>(d, d, d, 1.0);
}

