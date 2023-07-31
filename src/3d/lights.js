var settings = require('../core/settings');
var THREE = require('three');

var undef;

var mesh = exports.mesh = undef;
var pointLight = exports.pointLight = undef;
var ambient = exports.ambient = undef;
exports.init = init;
exports.update = update;

var _shadowDarkness = 0.45;

function init() {

    mesh = exports.mesh = new THREE.Object3D();
    mesh.position.set(0, 500, 0);

    ambient = new THREE.AmbientLight( 0x333333, 1);
    mesh.add( ambient );

    pointLight = exports.pointLight = new THREE.PointLight( 0xffffff, 50, 700 );
    pointLight.castShadow = true;
    pointLight.shadow.camera.near = 10;
    pointLight.shadow.camera.far = 700;
    // pointLight.shadowCameraFov = 90;
    //pointLight.shadow.bias = 0.1;
	//pointLight.shadow.normalBias = 0.1;
    // pointLight.shadowDarkness = 0.45;
	if (settings.isMobile)
		pointLight.shadow.mapSize = new THREE.Vector2(1024, 512);
	else
		pointLight.shadow.mapSize = new THREE.Vector2(4096, 2048);
    mesh.add( pointLight );

    var directionalLight = new THREE.DirectionalLight( 0xba8b8b, 0.5 );
    directionalLight.position.set( 1, 1, 1 );
    mesh.add( directionalLight );

    var directionalLight2 = new THREE.DirectionalLight( 0x8bbab4, 0.3 );
    directionalLight2.position.set( 1, 1, -1 );
    mesh.add( directionalLight2 );

}

function update(dt) {
    _shadowDarkness += (settings.shadowDarkness - _shadowDarkness) * 0.1;
	ambient.intensity = (1.0 - _shadowDarkness) * 50.0;
}
