import * as THREE from "three";
import mixIn from "mout/object/mixIn";
import fillIn from "mout/object/fillIn";
import motionBlurMotionVertexShader from "./motionBlurMotion.vert";
import motionBlurMotionFragmentShader from "./motionBlurMotion.frag";

function MeshMotionMaterial(parameters) {
  parameters = parameters || {};

  let uniforms = parameters.uniforms || {};
  let vertexShader = motionBlurMotionVertexShader;
  let fragmentShader = motionBlurMotionFragmentShader;
  this.motionMultiplier = parameters.motionMultiplier || 1;

  return new THREE.ShaderMaterial(
    mixIn(
      {
        uniforms: fillIn(uniforms, {
          u_prevModelViewMatrix: { type: "m4", value: new THREE.Matrix4() },
          u_motionMultiplier: { type: "f", value: 1 },
        }),
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
      },
      parameters
    )
  );
}

let _p = (MeshMotionMaterial.prototype = Object.create(
  THREE.ShaderMaterial.prototype
));
_p.constructor = MeshMotionMaterial;
export default MeshMotionMaterial;
