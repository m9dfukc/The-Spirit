import * as effectComposer from "./effectComposer";
// import * as fxaa from "./fxaa/fxaa";
// import * as bloom from "./bloom/bloom";
import motionBlur from "./motionBlur/motionBlur";
import * as fboHelper from "../fboHelper";

let _renderer, _scene, _camera;

export let visualizeTarget = null;

export function init(renderer, scene, camera) {
  _renderer = renderer;
  _scene = scene;
  _camera = camera;

  effectComposer.init(renderer, scene, camera);

  // for less power machine, pass true
  // fxaa.init(true);

  // fxaa.init();
  // effectComposer.queue.push(fxaa);

  motionBlur.init();
  effectComposer.queue.push(motionBlur);

  // bloom.init();
  // effectComposer.queue.push(bloom);
}

export function resize(width, height) {
  effectComposer.resize(width, height);
}

export function render(dt) {
  effectComposer.renderQueue(dt);

  if (visualizeTarget) {
    fboHelper.copy(visualizeTarget);
  }
}
