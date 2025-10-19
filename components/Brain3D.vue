<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const props = defineProps<{ tilt?: number; roll?: number }>();
const container = ref<HTMLDivElement | null>(null);

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
const logoGroup: THREE.Group = new THREE.Group();
let animationFrameId = 0;

onMounted(async () => {
  await nextTick();
  if (!container.value) return;

  scene = new THREE.Scene();
  scene.add(logoGroup);

  const width = container.value.clientWidth;
  const height = container.value.clientHeight || width;

  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
  camera.position.set(0, 0, 200);

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height, false); // 👈 use false to prevent style overwriting
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  container.value.appendChild(renderer.domElement);

  // Lights
  const pinkLight = new THREE.DirectionalLight(0xff69b4, 5);
  pinkLight.position.set(0, -50, 0);
  scene.add(pinkLight);

  const purpleLight = new THREE.DirectionalLight(0x800080, 5);
  purpleLight.position.set(50, 50, 50);
  scene.add(purpleLight);

  const blueLight = new THREE.DirectionalLight(0x00bfff, 5);
  blueLight.position.set(-50, 50, 50);
  scene.add(blueLight);

  const whiteLight = new THREE.DirectionalLight(0xffffff, 1);
  whiteLight.position.set(0, 50, -50);
  scene.add(whiteLight);

  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 3));

  const loader = new GLTFLoader();

  const loadModel = (path: string) =>
      new Promise<THREE.Group>((resolve, reject) => {
        loader.load(path, (gltf) => resolve(gltf.scene), undefined, reject);
      });

  try {
    const [brain, text] = await Promise.all([
      loadModel('/models/logo_brain.glb'),
      loadModel('/models/logo_text.glb'),
    ]);

    logoGroup.add(brain);
    logoGroup.add(text);

    const groupBox = new THREE.Box3().setFromObject(logoGroup);
    const groupCenter = groupBox.getCenter(new THREE.Vector3());
    logoGroup.position.sub(groupCenter);

    const scaleFactor = window.innerWidth < 640 ? 1.1 : 1.2; // 👈 smaller on mobile
    logoGroup.scale.set(scaleFactor, scaleFactor, scaleFactor);

    const size = groupBox.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    const cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.4;
    camera.position.set(0, 0, cameraZ);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  } catch (e) {
    console.error(e);
  }

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
  if (!container.value || !renderer) return;
  const width = container.value.clientWidth;
  const height = container.value.clientHeight || width;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}
</script>

<template>
  <div ref="container" class="relative w-full h-full max-h-[60vh] sm:max-h-[70vh] overflow-hidden"></div>
</template>