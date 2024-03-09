import * as THREE from "three";
import quadVertexShader from "./quad.vert";
import quadFragmentShader from "./quad.frag";

const undef = undefined;

let _renderer;
let _mesh;
let _scene;
let _camera;

export let rawShaderPrefix;
export let vertexShader;
export let copyMaterial;

export function init(renderer) {
  // ensure it wont initialized twice
  if (_renderer) return;

  _renderer = renderer;

  rawShaderPrefix =
    "precision " + _renderer.capabilities.precision + " float;\n";

  _scene = new THREE.Scene();
  _camera = new THREE.Camera();
  _camera.position.z = 1;

  vertexShader = rawShaderPrefix + quadVertexShader;
  const fragmentShader = rawShaderPrefix + quadFragmentShader;

  copyMaterial = new THREE.RawShaderMaterial({
    uniforms: {
      u_texture: { type: "t", value: undef },
    },
    vertexShader,
    fragmentShader,
  });

  _mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), copyMaterial);
  _scene.add(_mesh);
}

export function copy(inputTexture, ouputTexture) {
  _mesh.material = copyMaterial;
  copyMaterial.uniforms.u_texture.value = inputTexture;
  if (ouputTexture) {
    _renderer.setRenderTarget(ouputTexture);
    _renderer.render(_scene, _camera);
    _renderer.setRenderTarget(null);
  } else {
    _renderer.render(_scene, _camera);
  }
}
export function render(material, renderTarget) {
  _mesh.material = material;
  if (renderTarget) {
    _renderer.setRenderTarget(renderTarget);
    _renderer.render(_scene, _camera);
    _renderer.setRenderTarget(null);
  } else {
    _renderer.render(_scene, _camera);
  }
}

export function createRenderTarget(
  width,
  height,
  format,
  type,
  minFilter,
  magFilter
) {
  const renderTarget = new THREE.WebGLRenderTarget(width || 1, height || 1, {
    format: format || THREE.RGBFormat,
    type: type || THREE.UnsignedByteType,
    minFilter: minFilter || THREE.LinearFilter,
    magFilter: magFilter || THREE.LinearFilter,
    // depthBuffer: false,
    // stencilBuffer: false
  });

  renderTarget.texture.generateMipMaps = false;

  return renderTarget;
}

export function getColorState() {
  return {
    autoClearColor: _renderer.autoClearColor,
    clearColor: _renderer.getClearColor(new THREE.Color()).getHex(),
    clearAlpha: _renderer.getClearAlpha(),
  };
}

export function setColorState(state) {
  _renderer.setClearColor(state.clearColor, state.clearAlpha);
  _renderer.autoClearColor = state.autoClearColor;
}
