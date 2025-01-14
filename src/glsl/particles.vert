#include <common>
#include <normal_pars_vertex>
#include <shadowmap_pars_vertex>
#include <fog_pars_vertex>

uniform sampler2D texturePosition;

varying float vLife;
// chunk(shadowmap_pars_vertex);

void main() {
    vec4 positionInfo = texture2D( texturePosition, position.xy );

    vec4 worldPosition = modelMatrix * vec4( positionInfo.xyz, 1.0 );
    vec4 mvPosition = viewMatrix * worldPosition;

    // #include <shadowmap_vertex>
    // chunk(shadowmap_vertex);

    vLife = positionInfo.w;
    gl_PointSize = 1300.0 / length( mvPosition.xyz ) * smoothstep(0.0, 0.2, positionInfo.w);

    gl_Position = projectionMatrix * mvPosition;

    // #include <normal_vertex>
	// #include <shadowmap_vertex>
}
