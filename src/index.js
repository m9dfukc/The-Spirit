import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import dat from "dat-gui";
import settings from "./core/settings";
import * as postprocessing from "./3d/postprocessing/postprocessing";
import motionBlur from "./3d/postprocessing/motionBlur/motionBlur";
import fxaa from "./3d/postprocessing/fxaa/fxaa";
import bloom from "./3d/postprocessing/bloom/bloom";
import * as ease from "./utils/ease";
import * as math from "./utils/math";
import * as fboHelper from "./3d/fboHelper";
import * as simulator from "./3d/simulator";
import * as particles from "./3d/particles";
import * as lights from "./3d/lights";
import * as floor from "./3d/floor";

let _gui;
let _stats;

let _width = window.innerWidth;
let _height = window.innerHeight;

let _control;
let _camera;
let _scene;
let _renderer;

let _time = 0;
let _ray = new THREE.Ray();

let _initAnimation = 0;

let _bgColor;

function init() {
  if (settings.useStats) {
    _stats = new Stats();
    _stats.domElement.style.position = "absolute";
    _stats.domElement.style.left = "0px";
    _stats.domElement.style.top = "0px";
    _stats.domElement.style.zIndex = 2048;

    document.body.appendChild(_stats.domElement);
  }

  _bgColor = new THREE.Color(settings.bgColor);
  settings.mouse = new THREE.Vector2(0, 0);
  settings.mouse3d = _ray.origin;

  _renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  _renderer.shadowIntensity = 0;
  _renderer.setClearColor(settings.bgColor);
  _renderer.setSize(_width, _height);

  _renderer.shadowMap.enabled = true;
  _renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.getElementById("root").appendChild(_renderer.domElement);

  _scene = new THREE.Scene();
  _scene.fog = new THREE.FogExp2(settings.bgColor, 0.001);

  _camera = new THREE.PerspectiveCamera(45, 1, 10, 3000);
  _camera.position.set(300, 60, 300).normalize().multiplyScalar(1000);

  settings.camera = _camera;
  settings.cameraPosition = _camera.position;

  fboHelper.init(_renderer);
  postprocessing.init(_renderer, _scene, _camera);

  simulator.init(_renderer);
  particles.init(_renderer, simulator);
  _scene.add(particles.container);

  lights.init(_renderer);
  _scene.add(lights.mesh);

  floor.init(_renderer);
  floor.mesh.position.y = -100;
  _scene.add(floor.mesh);

  _control = new OrbitControls(_camera, _renderer.domElement);
  _control.target.y = 50;
  _control.maxDistance = 1000;
  _control.minPolarAngle = 0.3;
  _control.maxPolarAngle = Math.PI / 2 - 0.1;
  _control.noPan = true;
  _control.update();

  _gui = new dat.GUI();

  if (settings.isMobile) {
    _gui.close();
    _control.enabled = false;
  }

  const simulatorGui = _gui.addFolder("Simulator");
  simulatorGui
    .add(settings.query, "amount", settings.amountList)
    .onChange(function () {
      const { amount, motionBlurQuality } = settings.query;
      if (confirm("It will restart the demo")) {
        window.location.href =
          "#amount=" + amount + "&motionBlurQuality=" + motionBlurQuality;
        window.location.reload();
      }
    });
  simulatorGui.add(settings, "speed", 0, 3).listen();
  simulatorGui.add(settings, "dieSpeed", 0.0005, 0.05).listen();
  simulatorGui.add(settings, "radius", 0.2, 3);
  simulatorGui.add(settings, "curlSize", 0.001, 0.05).listen();
  simulatorGui.add(settings, "attraction", -2, 2);
  simulatorGui.add(settings, "followMouse").name("follow mouse");
  simulatorGui.open();

  const renderingGui = _gui.addFolder("Rendering");
  renderingGui.add(settings, "shadowDarkness", 0, 1).name("shadow");
  renderingGui.add(settings, "useTriangleParticles").name("new particle");
  renderingGui.addColor(settings, "color1").name("base Color");
  renderingGui.addColor(settings, "color2").name("fade Color");
  renderingGui.addColor(settings, "bgColor").name("background Color");
  renderingGui.open();

  const postprocessingGui = _gui.addFolder("Post-Processing");
  postprocessingGui.add(settings, "fxaa").listen();
  motionBlur.maxDistance = 120;
  motionBlur.motionMultiplier = 7;
  motionBlur.linesRenderTargetScale =
    settings.motionBlurQualityMap[settings.query.motionBlurQuality];
  const motionBlurControl = postprocessingGui.add(settings, "motionBlur");
  const motionMaxDistance = postprocessingGui
    .add(motionBlur, "maxDistance", 1, 300)
    .name("motion distance")
    .listen();
  const motionMultiplier = postprocessingGui
    .add(motionBlur, "motionMultiplier", 0.1, 15)
    .name("motion multiplier")
    .listen();
  const motionQuality = postprocessingGui
    .add(settings.query, "motionBlurQuality", settings.motionBlurQualityList)
    .name("motion quality")
    .onChange(function (val) {
      motionBlur.linesRenderTargetScale = settings.motionBlurQualityMap[val];
      motionBlur.resize();
    });
  let controlList = [motionMaxDistance, motionMultiplier, motionQuality];
  motionBlurControl.onChange(enableGuiControl.bind(this, controlList));
  enableGuiControl(controlList, settings.motionBlur);

  const bloomControl = postprocessingGui.add(settings, "bloom");
  const bloomRadiusControl = postprocessingGui
    .add(bloom, "blurRadius", 0, 3)
    .name("bloom radius");
  const bloomAmountControl = postprocessingGui
    .add(bloom, "amount", 0, 3)
    .name("bloom amount");
  controlList = [bloomRadiusControl, bloomAmountControl];
  bloomControl.onChange(enableGuiControl.bind(this, controlList));
  enableGuiControl(controlList, settings.bloom);
  postprocessingGui.open();

  function enableGuiControl(controls, flag) {
    controls = controls.length ? controls : [controls];
    let control;
    for (let i = 0, len = controls.length; i < len; i++) {
      control = controls[i];
      control.__li.style.pointerEvents = flag ? "auto" : "none";
      control.domElement.parentNode.style.opacity = flag ? 1 : 0.1;
    }
  }

  const preventDefault = function (evt) {
    evt.preventDefault();
    this.blur();
  };
  Array.prototype.forEach.call(
    _gui.domElement.querySelectorAll('input[type="checkbox"],select'),
    function (elem) {
      elem.onkeyup = elem.onkeydown = preventDefault;
      elem.style.color = "#000";
    }
  );

  window.addEventListener("resize", _onResize);
  window.addEventListener("mousemove", _onMove);
  window.addEventListener("touchmove", _bindTouch(_onMove));
  window.addEventListener("keyup", _onKeyUp);

  _time = Date.now();
  _onResize();
  _loop();
}

function _onKeyUp(evt) {
  if (evt.keyCode === 32) {
    settings.speed = settings.speed === 0 ? 1 : 0;
    settings.dieSpeed = settings.dieSpeed === 0 ? 0.015 : 0;
  }
}

function _bindTouch(func) {
  return function (evt) {
    if (settings.isMobile && evt.preventDefault) {
      evt.preventDefault();
    }
    func(evt.changedTouches[0]);
  };
}

function _onMove(evt) {
  settings.mouse.x = (evt.clientX / _width) * 2 - 1;
  settings.mouse.y = (-evt.clientY / _height) * 2 + 1;
}

function _onResize() {
  _width = window.innerWidth;
  _height = window.innerHeight;

  postprocessing.resize(_width, _height);
}

function _loop() {
  const newTime = Date.now();
  requestAnimationFrame(_loop);
  if (settings.useStats) _stats.begin();
  _render(newTime - _time, newTime);
  if (settings.useStats) _stats.end();
  _time = newTime;
}

function _render(dt, newTime) {
  motionBlur.skipMatrixUpdate =
    !(settings.dieSpeed || settings.speed) && settings.motionBlurPause;

  _bgColor.setStyle(settings.bgColor);
  let tmpColor = floor.mesh.material.color;
  tmpColor = _bgColor;
  _scene.fog.color.copy(tmpColor);
  _renderer.setClearColor(tmpColor.getHex());

  _initAnimation = Math.min(_initAnimation + dt * 0.00025, 1);
  simulator.setInitAnimation(_initAnimation);

  _control.maxDistance =
    _initAnimation === 1
      ? 1000
      : math.lerp(1000, 450, ease.easeOutCubic(_initAnimation));
  _control.update();
  lights.update(dt, _camera);

  // update mouse3d
  _camera.updateMatrixWorld();
  _ray.origin.setFromMatrixPosition(_camera.matrixWorld);
  _ray.direction
    .set(settings.mouse.x, settings.mouse.y, 0.5)
    .unproject(_camera)
    .sub(_ray.origin)
    .normalize();
  const distance =
    _ray.origin.length() /
    Math.cos(Math.PI - _ray.direction.angleTo(_ray.origin));
  _ray.origin.add(_ray.direction.multiplyScalar(distance * 1.0));
  simulator.update(dt);
  particles.update(dt);

  fxaa.enabled = !!settings.fxaa;
  motionBlur.enabled = !!settings.motionBlur;
  bloom.enabled = !!settings.bloom;

  // _renderer.render(_scene, _camera);
  postprocessing.render(dt, newTime);
}

init();
