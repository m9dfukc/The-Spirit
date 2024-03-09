import Effect from "../Effect";
import lowFxaaVertexShader from "./lowFxaa.vert";
import lowFxaaFragmentShader from "./lowFxaa.frag";
import fxaaFragmentShader from "./fxaa.frag";

let exports = new Effect();
let _super = Effect.prototype;

exports.init = init;

function init(isLow) {
  let vs = isLow ? lowFxaaVertexShader : "";
  let fs = isLow ? lowFxaaFragmentShader : fxaaFragmentShader;

  _super.init.call(this, {
    uniforms: {},
    vertexShader: vs,
    fragmentShader: fs,
  });
}

export default exports;
