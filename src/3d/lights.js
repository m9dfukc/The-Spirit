import * as THREE from "three";
import settings from "../core/settings";

export let mesh;
export let pointLight;
export let ambient;

let _shadowDarkness = 0.45;
let _renderer;

export function init(renderer) {
  _renderer = renderer;

  mesh = new THREE.Object3D();
  mesh.position.set(0, 500, 0);

  ambient = new THREE.AmbientLight(0x333333);
  mesh.add(ambient);

  pointLight = new THREE.PointLight(0xffffff, 0.5);
  pointLight.castShadow = true;
  pointLight.shadow.camera.near = 10;
  pointLight.shadow.camera.far = 700;
  pointLight.shadow.mapSize.width = 4096;
  pointLight.shadow.mapSize.height = 2048;
  // pointLight.shadow.bias = 0.01;
  // pointLight.shadow.normalBias = 0.1;
  // pointLight.intensity = 0.9;
  mesh.add(pointLight);

  const directionalLight = new THREE.DirectionalLight(0xba8b8b, 0.5);
  directionalLight.position.set(1, 1, 1);
  mesh.add(directionalLight);

  const directionalLight2 = new THREE.DirectionalLight(0x8bbab4, 0.3);
  directionalLight2.position.set(1, 1, -1);
  mesh.add(directionalLight2);
}

export function update(dt) {
  // _renderer.shadowMap.needsUpdate = true;
  _shadowDarkness += (settings.shadowDarkness - _shadowDarkness) * 0.1;
  ambient.intensity = (1.0 - _shadowDarkness) * 50.0;
}
