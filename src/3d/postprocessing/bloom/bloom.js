import * as THREE from "three";
import Effect from "../Effect";
import * as effectComposer from "../effectComposer";
import * as fboHelper from "../../fboHelper";
import bloomFragmentShader from "./bloom.frag";
import bloomBlurFragmentShader from "./bloomBlur.frag";

const undef = undefined;

let exports = new Effect();
let _super = Effect.prototype;

exports.init = init;
exports.render = render;

exports.blurRadius = 3.0;
exports.amount = 0.3;

let _blurMaterial;

let BLUR_BIT_SHIFT = 1;

function init() {
  _super.init.call(this, {
    uniforms: {
      u_blurTexture: { type: "t", value: undef },
      u_amount: { type: "f", value: 0 },
    },
    fragmentShader: bloomFragmentShader,
  });

  _blurMaterial = new THREE.RawShaderMaterial({
    uniforms: {
      u_texture: { type: "t", value: undef },
      u_delta: { type: "v2", value: new THREE.Vector2() },
    },
    vertexShader: fboHelper.vertexShader,
    fragmentShader: fboHelper.rawShaderPrefix + bloomBlurFragmentShader,
  });
}

function render(dt, renderTarget, toScreen) {
  var tmpRenderTarget1 = effectComposer.getRenderTarget(BLUR_BIT_SHIFT);
  var tmpRenderTarget2 = effectComposer.getRenderTarget(BLUR_BIT_SHIFT);
  effectComposer.releaseRenderTarget(tmpRenderTarget1, tmpRenderTarget2);

  var blurRadius = exports.blurRadius;
  _blurMaterial.uniforms.u_texture.value = renderTarget.texture;
  _blurMaterial.uniforms.u_delta.value.set(
    blurRadius / effectComposer.resolution.x,
    0
  );

  fboHelper.render(_blurMaterial, tmpRenderTarget1);

  blurRadius = exports.blurRadius;
  _blurMaterial.uniforms.u_texture.value = tmpRenderTarget1.texture;
  _blurMaterial.uniforms.u_delta.value.set(
    0,
    blurRadius / effectComposer.resolution.y
  );
  fboHelper.render(_blurMaterial, tmpRenderTarget2);

  this.uniforms.u_blurTexture.value = tmpRenderTarget2.texture;
  this.uniforms.u_amount.value = exports.amount;
  _super.render.call(this, dt, renderTarget, toScreen);
}

export default exports;
