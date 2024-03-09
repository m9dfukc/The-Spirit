import * as THREE from "three";
import settings from "../core/settings";
import particlesVertexShader from "../glsl/particles.vert";
import particlesFragmentShader from "../glsl/particles.frag";
import particlesDistanceVertexShader from "../glsl/particlesDistance.vert";
import particlesDistanceFragmentShader from "../glsl/particlesDistance.frag";
import particlesMotionVertexShader from "../glsl/particlesMotion.vert";
import motionBlurMotionFragmentShader from "./postprocessing/motionBlur/motionBlurMotion.frag";
import trianglesVertexShader from "../glsl/triangles.vert";
import trianglesDistanceVertexShader from "../glsl/trianglesDistance.vert";
import trianglesMotionVertexShader from "../glsl/trianglesMotion.vert";
import MeshMotionMaterial from "./postprocessing/motionBlur/MeshMotionMaterial";

const undef = undefined;
export let container;

let _renderer;
let _simulator;

let _particleMesh;
let _triangleMesh;
let _meshes;

let _color1;
let _color2;
let _tmpColor;

const TEXTURE_WIDTH = settings.simulatorTextureWidth;
const TEXTURE_HEIGHT = settings.simulatorTextureHeight;
const AMOUNT = TEXTURE_WIDTH * TEXTURE_HEIGHT;

export function init(renderer, simulator) {
  container = new THREE.Object3D();

  _tmpColor = new THREE.Color();
  _color1 = new THREE.Color(settings.color1);
  _color2 = new THREE.Color(settings.color2);

  _meshes = [
    (_triangleMesh = _createTriangleMesh()),
    (_particleMesh = _createParticleMesh()),
  ];
  // console.log("_triangleMesh:", _triangleMesh);
  // console.log("_particleMesh:", _particleMesh);
  _triangleMesh.visible = false;
  _particleMesh.visible = false;

  _renderer = renderer;
  _simulator = simulator;
}

function _createParticleMesh() {
  let position = new Float32Array(AMOUNT * 3);
  let i3;
  for (let i = 0; i < AMOUNT; i++) {
    i3 = i * 3;
    position[i3 + 0] = (i % TEXTURE_WIDTH) / TEXTURE_WIDTH;
    position[i3 + 1] = ~~(i / TEXTURE_WIDTH) / TEXTURE_HEIGHT;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));

  const material = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib.lights,
      THREE.UniformsLib.fog,
      {
        texturePosition: { type: "t", value: undef },
        color1: { type: "c", value: undef },
        color2: { type: "c", value: undef },
      },
    ]),
    vertexShader: particlesVertexShader,
    fragmentShader: particlesFragmentShader,
    blending: THREE.NoBlending,
    side: THREE.DoubleSide,
    lights: true,
    fog: true,
  });

  material.uniforms.color1.value = _color1;
  material.uniforms.color2.value = _color2;

  const mesh = new THREE.Points(geometry, material);

  mesh.customDistanceMaterial = new THREE.ShaderMaterial({
    uniforms: {
      lightPos: { type: "v3", value: new THREE.Vector3(0, 0, 0) },
      texturePosition: { type: "t", value: undef },
    },
    vertexShader: particlesDistanceVertexShader,
    fragmentShader: particlesDistanceFragmentShader,
    depthTest: true,
    depthWrite: true,
    side: THREE.BackSide,
    blending: THREE.NoBlending,
  });

  mesh.motionMaterial = new THREE.ShaderMaterial({
    uniforms: {
      u_prevModelViewMatrix: { type: "m4", value: new THREE.Matrix4() },
      u_motionMultiplier: { type: "f", value: 1 },
      texturePosition: { type: "t", value: undef },
      texturePrevPosition: { type: "t", value: undef },
    },
    vertexShader: particlesMotionVertexShader,
    fragmentShader: motionBlurMotionFragmentShader,
    depthTest: true,
    depthWrite: true,
    side: THREE.DoubleSide,
    blending: THREE.NoBlending,
  });
  mesh.motionMaterial.motionMultiplier = 1;

  mesh.castShadow = true;
  mesh.receiveShadow = true;
  container.add(mesh);

  return mesh;
}

function _createTriangleMesh() {
  let position = new Float32Array(AMOUNT * 3 * 3);
  let positionFlip = new Float32Array(AMOUNT * 3 * 3);
  let fboUV = new Float32Array(AMOUNT * 2 * 3);

  const PI = Math.PI;
  const angle = (PI * 2) / 3;
  const angles = [
    Math.sin(angle * 2 + PI),
    Math.cos(angle * 2 + PI),
    Math.sin(angle + PI),
    Math.cos(angle + PI),
    Math.sin(angle * 3 + PI),
    Math.cos(angle * 3 + PI),
    Math.sin(angle * 2),
    Math.cos(angle * 2),
    Math.sin(angle),
    Math.cos(angle),
    Math.sin(angle * 3),
    Math.cos(angle * 3),
  ];
  let i6, i9;
  for (let i = 0; i < AMOUNT; i++) {
    i6 = i * 6;
    i9 = i * 9;
    if (i % 2) {
      position[i9 + 0] = angles[0];
      position[i9 + 1] = angles[1];
      position[i9 + 3] = angles[2];
      position[i9 + 4] = angles[3];
      position[i9 + 6] = angles[4];
      position[i9 + 7] = angles[5];

      positionFlip[i9 + 0] = angles[6];
      positionFlip[i9 + 1] = angles[7];
      positionFlip[i9 + 3] = angles[8];
      positionFlip[i9 + 4] = angles[9];
      positionFlip[i9 + 6] = angles[10];
      positionFlip[i9 + 7] = angles[11];
    } else {
      positionFlip[i9 + 0] = angles[0];
      positionFlip[i9 + 1] = angles[1];
      positionFlip[i9 + 3] = angles[2];
      positionFlip[i9 + 4] = angles[3];
      positionFlip[i9 + 6] = angles[4];
      positionFlip[i9 + 7] = angles[5];

      position[i9 + 0] = angles[6];
      position[i9 + 1] = angles[7];
      position[i9 + 3] = angles[8];
      position[i9 + 4] = angles[9];
      position[i9 + 6] = angles[10];
      position[i9 + 7] = angles[11];
    }

    fboUV[i6 + 0] =
      fboUV[i6 + 2] =
      fboUV[i6 + 4] =
        (i % TEXTURE_WIDTH) / TEXTURE_WIDTH;
    fboUV[i6 + 1] =
      fboUV[i6 + 3] =
      fboUV[i6 + 5] =
        ~~(i / TEXTURE_WIDTH) / TEXTURE_HEIGHT;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
  geometry.setAttribute(
    "positionFlip",
    new THREE.BufferAttribute(positionFlip, 3)
  );
  geometry.setAttribute("fboUV", new THREE.BufferAttribute(fboUV, 2));

  const material = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib.fog,
      THREE.UniformsLib.lights,
      {
        texturePosition: { type: "t", value: undef },
        flipRatio: { type: "f", value: 0 },
        color1: { type: "c", value: undef },
        color2: { type: "c", value: undef },
        cameraMatrix: { type: "m4", value: undef },
      },
    ]),
    vertexShader: trianglesVertexShader,
    fragmentShader: particlesFragmentShader,
    blending: THREE.NoBlending,
    side: THREE.DoubleSide,
    lights: true,
    fog: true,
  });
  material.uniforms.color1.value = _color1;
  material.uniforms.color2.value = _color2;
  material.uniforms.cameraMatrix.value = settings.camera.matrixWorld;

  const mesh = new THREE.Mesh(geometry, material);

  mesh.customDistanceMaterial = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib.common,
      {
        referencePosition: { value: /*@__PURE__*/ new THREE.Vector3() },
        nearDistance: { value: 1 },
        farDistance: { value: 1000 },
      },
      {
        texturePosition: { type: "t", value: undef },
        flipRatio: { type: "f", value: 0 },
      },
    ]),
    vertexShader: trianglesDistanceVertexShader,
    fragmentShader: particlesDistanceFragmentShader,
    depthTest: true,
    depthWrite: true,
    side: THREE.BackSide,
    blending: THREE.NoBlending,
  });

  mesh.customDistanceMaterial.isMeshDistanceMaterial = true;

  mesh.motionMaterial = new THREE.ShaderMaterial({
    uniforms: {
      u_prevModelViewMatrix: { type: "m4", value: new THREE.Matrix4() },
      u_motionMultiplier: { type: "f", value: 1 },
      texturePosition: { type: "t", value: undef },
      texturePrevPosition: { type: "t", value: undef },
      flipRatio: { type: "f", value: 0 },
      cameraMatrix: { type: "m4", value: undef },
    },
    vertexShader: trianglesMotionVertexShader,
    fragmentShader: motionBlurMotionFragmentShader,
    depthTest: true,
    depthWrite: true,
    side: THREE.DoubleSide,
    blending: THREE.NoBlending,
  });
  mesh.motionMaterial.motionMultiplier = 1;
  mesh.motionMaterial.uniforms.cameraMatrix.value = settings.camera.matrixWorld;

  mesh.castShadow = true;
  mesh.receiveShadow = true;
  container.add(mesh);

  return mesh;
}

export function update(dt) {
  let mesh;

  _triangleMesh.visible = settings.useTriangleParticles;
  _particleMesh.visible = !settings.useTriangleParticles;

  _tmpColor.setStyle(settings.color1);
  _color1.lerp(_tmpColor, 0.05);

  _tmpColor.setStyle(settings.color2);
  _color2.lerp(_tmpColor, 0.05);

  for (let i = 0; i < 2; i++) {
    mesh = _meshes[i];
    mesh.material.uniforms.texturePosition.value =
      _simulator.positionRenderTarget.texture;
    mesh.customDistanceMaterial.uniforms.texturePosition.value =
      _simulator.positionRenderTarget.texture;
    mesh.motionMaterial.uniforms.texturePosition.value =
      _simulator.positionRenderTarget.texture;
    mesh.motionMaterial.uniforms.texturePrevPosition.value =
      _simulator.prevPositionRenderTarget.texture;
    if (mesh.material.uniforms.flipRatio) {
      mesh.material.uniforms.flipRatio.value ^= 1;
      mesh.customDistanceMaterial.uniforms.flipRatio.value ^= 1;
      mesh.motionMaterial.uniforms.flipRatio.value ^= 1;
    }
  }
}
