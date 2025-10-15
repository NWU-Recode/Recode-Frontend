<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const props = defineProps<{ tilt?: number; roll?: number }>();

const container = ref<HTMLDivElement | null>(null);

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
const logoGroup: THREE.Group = new THREE.Group();
let animationFrameId = 0;

onMounted(() => {
  if (!container.value) return;

  // Scene + renderer setup
  scene = new THREE.Scene();
  scene.add(logoGroup);

  const width = container.value.clientWidth || 800;
  const height = container.value.clientHeight || 800;

  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
  camera.position.set(0, 0, 200);

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.value.appendChild(renderer.domElement);

  // Remove previous colored PointLights

// Pink from bottom
  const pinkLight = new THREE.DirectionalLight(0xff69b4, 5);
  pinkLight.position.set(0, -50, 0);
  scene.add(pinkLight);

// Purple from right/top
  const purpleLight = new THREE.DirectionalLight(0x800080, 5);
  purpleLight.position.set(50, 50, 50);
  scene.add(purpleLight);

// Blue from left/top
  const blueLight = new THREE.DirectionalLight(0x00bfff, 5);
  blueLight.position.set(-50, 50, 50);
  scene.add(blueLight);

// White from back/top
  const whiteLight = new THREE.DirectionalLight(0xffffff, 1);
  whiteLight.position.set(0, 50, -50);
  scene.add(whiteLight);

// Keep ambient + hemisphere for softer shadows
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 3);
  hemi.position.set(0, 50, 0);
  scene.add(hemi);

  const loader = new GLTFLoader();

  const loadModel = (path: string): Promise<THREE.Group> =>
      new Promise((resolve, reject) => {
        loader.load(
            path,
            (gltf) => {
              const model = gltf.scene;

              model.traverse((node) => {
                if ((node as THREE.Mesh).isMesh) {
                  const mesh = node as THREE.Mesh;
                  mesh.material.side = THREE.DoubleSide;

                  if (Array.isArray(mesh.material)) {
                    mesh.material.forEach((mat: any) => {
                      if (mat.map) mat.map.encoding = THREE.sRGBEncoding;
                      if (mesh.geometry.attributes.color) mat.vertexColors = true;
                      mat.needsUpdate = true;
                    });
                  } else {
                    const matAny = mesh.material as any;
                    if (matAny.map) matAny.map.encoding = THREE.sRGBEncoding;
                    if (mesh.geometry.attributes.color) matAny.vertexColors = true;
                    matAny.needsUpdate = true;
                  }
                }
              });

              resolve(model);
            },
            undefined,
            reject
        );
      });

  Promise.all([
    loadModel('/models/logo_brain.glb'),
    loadModel('/models/logo_text.glb'),
  ])
      .then(([brain, text]) => {
        logoGroup.add(brain);
        logoGroup.add(text);

        const groupBox = new THREE.Box3().setFromObject(logoGroup);
        const groupCenter = groupBox.getCenter(new THREE.Vector3());
        logoGroup.position.sub(groupCenter);

        const scaleFactor = 1.3; // increase size by 50%
        logoGroup.scale.set(scaleFactor, scaleFactor, scaleFactor);

        // Fit camera distance
        const size = groupBox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        const cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.4;
        camera.position.set(0, 0, cameraZ);
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
      })
      .catch(console.error);

  // Animate slight parallax rotation
  const animate = () => {
    const targetX = -(props.tilt || 0) * 0.9;
    const targetY = (props.roll || 0) * 0.9;
    logoGroup.rotation.x += (targetX - logoGroup.rotation.x) * 0.12;
    logoGroup.rotation.y += (targetY - logoGroup.rotation.y) * 0.12;
    renderer.render(scene, camera);
    animationFrameId = requestAnimationFrame(animate);
  };
  animate();

  window.addEventListener('resize', onResize);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrameId);
  window.removeEventListener('resize', onResize);
  if (renderer) renderer.dispose();
});

function onResize() {
  if (!container.value) return;
  const width = container.value.clientWidth || 600;
  const height = container.value.clientHeight || 600;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
</script>

<template>
  <div ref="container" class="w-full h-full"></div>
</template>