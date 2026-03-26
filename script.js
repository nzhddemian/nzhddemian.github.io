import * as THREE from 'three';

/**
 * After editing field.frag / field.vert, bump this before deploy so CDN/browsers
 * fetch the new files. On localhost, a fresh timestamp is used every load.
 */
const SHADER_REVISION = '1';

function shaderUrl(filename) {
    const host = typeof location !== 'undefined' ? location.hostname : '';
    const isLocal =
        host === 'localhost' ||
        host === '127.0.0.1' ||
        host === '0.0.0.0' ||
        host.endsWith('.local');
    const q = isLocal ? `t=${Date.now()}` : `v=${SHADER_REVISION}`;
    return `${filename}?${q}`;
}

let scene;
let renderer;
let material;
let camera;
let isReady = false;
let svert;
let sfrag;

init();

function init() {
    const loader = new THREE.FileLoader();
    loader.load(shaderUrl('field.frag'), (data) => {
        sfrag = data;
        runMoreIfDone();
    }, undefined, onShaderError);
    loader.load(shaderUrl('field.vert'), (data) => {
        svert = data;
        runMoreIfDone();
    }, undefined, onShaderError);

    let numFilesLeft = 2;
    function runMoreIfDone() {
        numFilesLeft -= 1;
        if (numFilesLeft === 0) {
            setupScene();
            isReady = true;
            animate();
        }
    }
}

function setupScene() {
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const geometry = new THREE.PlaneGeometry(2, 2, 1, 1);
    material = new THREE.ShaderMaterial({
        vertexShader: svert,
        fragmentShader: sfrag,
        uniforms: {
            u_time: { value: 0 },
            u_resolution: { value: new THREE.Vector2(width, height) }
        },
        precision: 'mediump',
        depthTest: false,
        depthWrite: false,
        transparent: false
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    renderer = new THREE.WebGLRenderer({
        alpha: false,
        antialias: false,
        powerPreference: 'high-performance',
        stencil: false,
        depth: false
    });

    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height);
    renderer.domElement.classList.add('webgl-canvas');
    renderer.domElement.setAttribute('aria-hidden', 'true');
    renderer.setClearColor(0x080b12, 1);
    document.body.prepend(renderer.domElement);

    renderer.render(scene, camera);

    let resizeTimeout;
    window.addEventListener('resize', () => {
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        }
        resizeTimeout = setTimeout(onWindowResize, 100);
    });
}

function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    renderer.setSize(width, height);
    if (material && material.uniforms) {
        material.uniforms.u_resolution.value.set(width, height);
    }
}

let lastTime = 0;
function animate(time = 0) {
    if (!isReady) return;

    const delta = (time - lastTime) / 1000;
    lastTime = time;

    requestAnimationFrame(animate);
    render(delta);
}

function render(delta) {
    if (!material || !material.uniforms) return;

    material.uniforms.u_time.value += delta;
    renderer.render(scene, camera);
}

function onShaderError() {
    console.error('Failed to load shader files.');
}
