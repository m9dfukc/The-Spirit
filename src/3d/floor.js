import * as THREE from "three";

export let mesh;

export function init() {
  let geometry = new THREE.PlaneGeometry(4000, 4000, 10, 10);
  let planeMaterial = new THREE.MeshStandardMaterial({
    roughness: 0.7,
    color: 0x000000,
    emissive: 0x000000,
  });
  mesh = new THREE.Mesh(geometry, planeMaterial);
  mesh.rotation.x = -1.57;
  mesh.receiveShadow = true;
}
