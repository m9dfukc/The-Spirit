#define DISTANCE
#include <common>
#include <packing>

uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec4 vWorldPosition;

void main () {

	float dist = length( vWorldPosition.xyz - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist ); // clamp to [ 0, 1 ]

	gl_FragColor = packDepthToRGBA( dist);
}
