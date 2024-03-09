import * as THREE from "three";
import settings from "../core/settings";
import quadVertexShader from "../glsl/quad.vert";
import throughFragmentShader from "../glsl/through.frag";
import positionFragmentShader from "../glsl/position.frag";

const undef = undefined;

let _copyShader;
let _positionShader;
let _textureDefaultPosition;

let _renderer;
let _mesh;
let _scene;
let _camera;
let _followPoint;
let _followPointTime = 0;
let _initAnimation = 0;

export let positionRenderTarget;
export let prevPositionRenderTarget;
export const TEXTURE_WIDTH = settings.simulatorTextureWidth;
export const TEXTURE_HEIGHT = settings.simulatorTextureHeight;
export const AMOUNT = TEXTURE_WIDTH * TEXTURE_HEIGHT;

export function setInitAnimation(value) {
  _initAnimation = value;
}

export function init(renderer) {
  _renderer = renderer;
  _followPoint = new THREE.Vector3();

  const rawShaderPrefix =
    "precision " + renderer.capabilities.precision + " float;\n";

  const gl = _renderer.getContext();
  if (!gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS)) {
    alert("No support for vertex shader textures!");
    return;
  }

  _scene = new THREE.Scene();
  _camera = new THREE.Camera();
  _camera.position.z = 1;

  _copyShader = new THREE.RawShaderMaterial({
    uniforms: {
      resolution: {
        type: "v2",
        value: new THREE.Vector2(TEXTURE_WIDTH, TEXTURE_HEIGHT),
      },
      texture: { type: "t", value: undef },
    },
    vertexShader: rawShaderPrefix + quadVertexShader,
    fragmentShader: rawShaderPrefix + throughFragmentShader,
  });

  _positionShader = new THREE.RawShaderMaterial({
    uniforms: {
      resolution: {
        type: "v2",
        value: new THREE.Vector2(TEXTURE_WIDTH, TEXTURE_HEIGHT),
      },
      texturePosition: { type: "t", value: undef },
      textureDefaultPosition: { type: "t", value: undef },
      mouse3d: { type: "v3", value: new THREE.Vector3() },
      speed: { type: "f", value: 1 },
      dieSpeed: { type: "f", value: 0 },
      radius: { type: "f", value: 0 },
      curlSize: { type: "f", value: 0 },
      attraction: { type: "f", value: 0 },
      time: { type: "f", value: 0 },
      initAnimation: { type: "f", value: 0 },
    },
    vertexShader: rawShaderPrefix + quadVertexShader,
    fragmentShader: rawShaderPrefix + positionFragmentShader,
    blending: THREE.NoBlending,
    transparent: false,
    depthWrite: false,
    depthTest: false,
  });

  _mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), _copyShader);
  _scene.add(_mesh);

  positionRenderTarget = new THREE.WebGLRenderTarget(
    TEXTURE_WIDTH,
    TEXTURE_HEIGHT,
    {
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      depthWrite: false,
      depthBuffer: false,
      stencilBuffer: false,
    }
  );
  prevPositionRenderTarget = positionRenderTarget.clone();
  let texture = _createPositionTexture();
  _copyTexture(texture, positionRenderTarget);
  _copyTexture(texture, prevPositionRenderTarget);
}

function _copyTexture(input, output) {
  _mesh.material = _copyShader;
  _copyShader.uniforms.texture.value = input;
  _renderer.setRenderTarget(output);
  _renderer.render(_scene, _camera);
  _renderer.setRenderTarget(null);
}

function _updatePosition(dt) {
  // swap
  let tmp = positionRenderTarget;
  positionRenderTarget = prevPositionRenderTarget;
  prevPositionRenderTarget = tmp;

  _mesh.material = _positionShader;
  _positionShader.uniforms.textureDefaultPosition.value =
    _textureDefaultPosition;
  _positionShader.uniforms.texturePosition.value =
    prevPositionRenderTarget.texture;
  _positionShader.uniforms.time.value += dt * 0.001;
  _renderer.setRenderTarget(positionRenderTarget);
  _renderer.render(_scene, _camera);
  _renderer.setRenderTarget(null);
}

function _createPositionTexture() {
  let positions = new Float32Array(AMOUNT * 4);
  let i4;
  let r, phi, theta;
  for (let i = 0; i < AMOUNT; i++) {
    i4 = i * 4;
    r = (0.5 + Math.random() * 0.5) * 50;
    phi = (Math.random() - 0.5) * Math.PI;
    theta = Math.random() * Math.PI * 2;
    positions[i4 + 0] = r * Math.cos(theta) * Math.cos(phi);
    positions[i4 + 1] = r * Math.sin(phi);
    positions[i4 + 2] = r * Math.sin(theta) * Math.cos(phi);
    positions[i4 + 3] = Math.random();
  }
  let texture = new THREE.DataTexture(
    positions,
    TEXTURE_WIDTH,
    TEXTURE_HEIGHT,
    THREE.RGBAFormat,
    THREE.FloatType
  );
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.needsUpdate = true;
  texture.generateMipmaps = false;
  texture.flipY = false;
  _textureDefaultPosition = texture;
  return texture;
}

export function update(dt) {
  if (settings.speed || settings.dieSpeed) {
    let r = 200;
    let h = 60;
    if (settings.isMobile) {
      r = 100;
      h = 40;
    }

    let autoClearColor = _renderer.autoClearColor;
    let clearColor = _renderer.getClearColor(new THREE.Color()).getHex();
    let clearAlpha = _renderer.getClearAlpha();

    _renderer.autoClearColor = false;

    let deltaRatio = dt / 16.6667;

    _positionShader.uniforms.speed.value = settings.speed * deltaRatio;
    _positionShader.uniforms.dieSpeed.value = settings.dieSpeed * deltaRatio;
    _positionShader.uniforms.radius.value = settings.radius;
    _positionShader.uniforms.curlSize.value = settings.curlSize;
    _positionShader.uniforms.attraction.value = settings.attraction;
    _positionShader.uniforms.initAnimation.value = _initAnimation;

    if (settings.followMouse) {
      _positionShader.uniforms.mouse3d.value.copy(settings.mouse3d);
    } else {
      _followPointTime += dt * 0.001 * settings.speed;
      _followPoint.set(
        Math.cos(_followPointTime) * r,
        Math.cos(_followPointTime * 4.0) * h,
        Math.sin(_followPointTime * 2.0) * r
      );
      _positionShader.uniforms.mouse3d.value.lerp(_followPoint, 0.2);
    }

    _updatePosition(dt);

    _renderer.setClearColor(clearColor, clearAlpha);
    _renderer.autoClearColor = autoClearColor;
  }
}
