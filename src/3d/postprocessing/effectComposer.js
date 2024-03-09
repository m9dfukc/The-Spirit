import * as THREE from "three";
import * as fboHelper from "../fboHelper";
import merge from "mout/object/merge";
import { _ } from "mout/function/partial";

const undef = undefined;

export let queue = [];
export let fromRenderTarget;
export let toRenderTarget;
export let resolution;
export let renderer;
export let scene;
export let camera;

let _renderTargetLists = {};
let _renderTargetCounts = {};
let _renderTargetDefaultState = {
  depthBuffer: false,
  texture: {
    generateMipmaps: false,
  },
};

export function init(__renderer, __scene, __camera) {
  fromRenderTarget = fboHelper.createRenderTarget();
  toRenderTarget = fboHelper.createRenderTarget();

  resolution = new THREE.Vector2();

  renderer = __renderer;
  scene = __scene;
  camera = __camera;
}

export function resize(width, height) {
  resolution.set(width, height);

  fromRenderTarget.setSize(width, height);
  toRenderTarget.setSize(width, height);

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);

  for (let i = 0, len = queue.length; i < len; i++) {
    queue[i].resize(width, height);
  }
}

function _filterQueue(effect) {
  return effect.enabled;
}

export function renderQueue(dt) {
  var renderableQueue = queue.filter(_filterQueue);

  if (renderableQueue.length) {
    toRenderTarget.depthBuffer = true;
    toRenderTarget.stencilBuffer = true;

    renderer.setRenderTarget(toRenderTarget);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);

    // toRenderTarget.depthBuffer = false;
    // toRenderTarget.stencilBuffer = false;
    swapRenderTarget();

    let effect;
    for (var i = 0, len = renderableQueue.length; i < len; i++) {
      effect = renderableQueue[i];
      effect.render(dt, fromRenderTarget, i === len - 1);
    }
  } else {
    renderer.render(scene, camera);
  }
}

export function renderScene(renderTarget, __scene, __camera) {
  scene = __scene || scene;
  camera = __camera || camera;
  if (renderTarget) {
    renderer.setRenderTarget(renderTarget);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
  } else {
    renderer.render(scene, camera);
  }
}

export function render(material, toScreen) {
  fboHelper.render(material, toScreen ? undef : toRenderTarget);
  swapRenderTarget();
  return fromRenderTarget;
}

export function swapRenderTarget() {
  let tmp = toRenderTarget;
  toRenderTarget = fromRenderTarget;
  fromRenderTarget = tmp;
}

export function getRenderTarget(bitShift, isRGBA) {
  bitShift = bitShift || 0;
  isRGBA = +(isRGBA || 0);

  var width = resolution.x >> bitShift;
  var height = resolution.y >> bitShift;
  var id = bitShift + "_" + isRGBA;
  var list = _getRenderTargetList(id);
  var renderTarget;
  if (list.length) {
    renderTarget = list.pop();
    merge(renderTarget, _renderTargetDefaultState);
  } else {
    renderTarget = fboHelper.createRenderTarget(
      width,
      height,
      isRGBA ? THREE.RGBAFormat : THREE.RGBFormat
    );
    renderTarget._listId = id;
    _renderTargetCounts[id] = _renderTargetCounts[id] || 0;
  }
  _renderTargetCounts[id]++;

  if (renderTarget.width !== width || renderTarget.height !== height) {
    renderTarget.setSize(width, height);
  }

  return renderTarget;
}

export function releaseRenderTarget(renderTarget) {
  var renderTargets = arguments;
  var found, j, jlen, id, list;

  for (var i = 0, len = renderTargets.length; i < len; i++) {
    renderTarget = renderTargets[i];
    id = renderTarget._listId;
    list = _getRenderTargetList(id);
    found = false;
    _renderTargetCounts[id]--;
    for (j = 0, jlen = list.length; j < jlen; j++) {
      if (list[j] === renderTarget) {
        found = true;
        break;
      }
    }
    if (!found) {
      list.push(renderTarget);
    }
  }
}

function _getRenderTargetList(id) {
  return _renderTargetLists[id] || (_renderTargetLists[id] = []);
}
