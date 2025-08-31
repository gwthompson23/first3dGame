#ifdef GL_ES
precision mediump float;
#endif

varying vec2 v_uv;
uniform sampler2D u_tex;
uniform vec2 u_tile;

void main() {
  vec2 uv = v_uv * u_tile;
  vec4 color = texture2D(u_tex, uv);
  gl_FragColor = color;
}

