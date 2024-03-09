import * as THREE from "three";
import merge from "mout/object/merge";
import * as effectComposer from "./effectComposer";
import * as fboHelper from "../fboHelper";
import shaderMaterialQuadVertexShader from "../shaderMaterialQuad.vert";

const undef = undefined;

class Effect {
  init(cfg) {
    merge(
      this,
      {
        uniforms: {
          u_texture: { type: "t", value: undef },
          u_resolution: { type: "v2", value: effectComposer.resolution },
          u_aspect: { type: "f", value: 1 },
        },
        enabled: true,
        vertexShader: "",
        fragmentShader: "",
        isRawMaterial: true,
        addRawShaderPrefix: true,
      },
      cfg
    );

    if (!this.vertexShader) {
      this.vertexShader = this.isRawMaterial
        ? fboHelper.vertexShader
        : shaderMaterialQuadVertexShader;
    }

    if (this.addRawShaderPrefix && this.isRawMaterial) {
      this.vertexShader = fboHelper.rawShaderPrefix + this.vertexShader;
      this.fragmentShader = fboHelper.rawShaderPrefix + this.fragmentShader;
    }

    this.material = new THREE[
      this.isRawMaterial ? "RawShaderMaterial" : "ShaderMaterial"
    ]({
      uniforms: this.uniforms,
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
    });
  }

  resize(width, height) {}

  render(dt, renderTarget, toScreen) {
    this.uniforms.u_texture.value = renderTarget.texture;
    this.uniforms.u_aspect.value =
      this.uniforms.u_resolution.value.x / this.uniforms.u_resolution.value.y;

    return effectComposer.render(this.material, toScreen);
  }
}

export default Effect;
