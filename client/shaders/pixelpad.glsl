#extension GL_OES_standard_derivatives : enable

precision highp float;

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;


float line(float x, float offset, float width){
	return exp(-pow(x-offset, 2.)/(0.01*width+0.000001));
}

void main( void ) {

	vec2 pos = ( gl_FragCoord.xy / resolution.xy * 2.) - 1.;
	vec3 color = vec3(1.7,0.7,0.1);
	float c = 0.;
	for(float i=0.;i<6.;i++){
		c += line(pos.x, sin(time * (i*0.3+1.)), 0.1);
	}
	color *= c;

	gl_FragColor = vec4( color, color.y );

}