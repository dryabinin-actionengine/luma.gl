import {AnimationLoop, ClipSpace} from '@luma.gl/core';

const INFO_HTML = `
<p>
  <code>Animating Quasicrystals</code>
<p>
  Crystal patterns generated by wavefront interference patterns.
  Rendered by a custom fragment shader in a luma.gl <code>ClipSpace</code> model.
  A luma.gl port (of the PhiloGL port) of the work of
  <a href="http://www.jasondavies.com/animated-quasicrystals/">Jason Davies</a>
</p>
<div>
  Wavefronts
  <input id="wavefronts" type="range" value="7.0" min="1" max="10" step="0.1">
</div>
`;

const FRAGMENT_SHADER = `\
precision highp float;

#define PI 3.1415926535

uniform float uTime;
uniform float uRatio;

varying vec2 position;

void main(void) {
  vec2 defpixel = (position - vec2( 0.5 ) ) * 170.;

  float step = PI / uRatio;

  // Sum up total of all waves
  float total;
  for (float i = 0.; i < 100.; i++) {
    if ( i < uRatio ) {
      float value = i * step;
      float s = sin( value );
      float c = cos( value );
      total += ( cos( c * defpixel.x + s * defpixel.y + uTime ) + 1. ) / 2.;
    }
  }

  float v = mod(total, 1.);
  float k = total - v;
  total = ( mod( abs( k ), 2. ) ) <= 0.0001 ? v : 1. - v;

  gl_FragColor =
    vec4( total * (1. - (uRatio / 20.)), total * (uRatio / 10.), total * (uRatio / 5.), 1. );
}
`;

function readHTMLControls() {
  /* global document */
  if (typeof document === 'undefined') {
    return {uRatio: 7.0};
  }
  const wavefronts = document.getElementById('wavefronts');

  const uRatio = wavefronts ? parseFloat(wavefronts.value) : 7.0;
  return {uRatio};
}

export default class AppAnimationLoop extends AnimationLoop {
  onInitialize({gl}) {
    return {clipSpace: new ClipSpace(gl, {fs: FRAGMENT_SHADER})};
  }

  onRender({gl, canvas, time, clipSpace}) {
    const {uRatio} = readHTMLControls();
    clipSpace.draw({
      uniforms: {
        uTime: (time / 600) % (Math.PI * 2),
        uRatio
      }
    });
  }

  static getInfo() {
    return INFO_HTML;
  }
}

/* global window */
if (typeof window !== 'undefined' && !window.website) {
  const animationLoop = new AppAnimationLoop();
  animationLoop.start();
}