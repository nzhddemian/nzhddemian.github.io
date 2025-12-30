async function initWebGPU() {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    if (!canvas) {
        throw new Error('Canvas not found');
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const adapter = await navigator.gpu?.requestAdapter();
    if (!adapter) {
        throw new Error('WebGPU not supported');
    }

    const device = await adapter.requestDevice();
    const context = canvas.getContext('webgpu');
    if (!context) {
        throw new Error('WebGPU context not available');
    }

    const format = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
        device,
        format,
    });

    const shaderCode = await fetch('/src/shader.wgsl').then(r => r.text());

    const shaderModule = device.createShaderModule({
        code: shaderCode,
    });

    const resolutionBuffer = device.createBuffer({
        size: 8,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const resolutionData = new Float32Array([canvas.width, canvas.height]);
    device.queue.writeBuffer(resolutionBuffer, 0, resolutionData);

    const bindGroup = device.createBindGroup({
        layout: device.createBindGroupLayout({
            entries: [{
                binding: 0,
                visibility: GPUShaderStage.FRAGMENT,
                buffer: { type: 'uniform' },
            }],
        }),
        entries: [{
            binding: 0,
            resource: { buffer: resolutionBuffer },
        }],
    });

    const pipeline = device.createRenderPipeline({
        layout: device.createPipelineLayout({
            bindGroupLayouts: [device.createBindGroupLayout({
                entries: [{
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: { type: 'uniform' },
                }],
            })],
        }),
        vertex: {
            module: shaderModule,
            entryPoint: 'vs_main',
        },
        fragment: {
            module: shaderModule,
            entryPoint: 'fs_main',
            targets: [{ format }],
        },
        primitive: {
            topology: 'triangle-list',
        },
    });

    const commandEncoder = device.createCommandEncoder();
    const renderPass = commandEncoder.beginRenderPass({
        colorAttachments: [{
            view: context.getCurrentTexture().createView(),
            clearValue: { r: 0, g: 0, b: 0, a: 1 },
            loadOp: 'clear',
            storeOp: 'store',
        }],
    });

    renderPass.setPipeline(pipeline);
    renderPass.setBindGroup(0, bindGroup);
    renderPass.draw(3);
    renderPass.end();

    device.queue.submit([commandEncoder.finish()]);
}

initWebGPU().catch(err => {
    console.error('WebGPU initialization failed:', err);
    document.body.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: monospace; color: #ff4444;">WebGPU not available</div>';
});

