#version 300 es
precision mediump float;

in vec2 v_uv;
uniform sampler2D u_tex;
uniform vec2 u_tile;
out vec4 outColor;

void main() {
  vec2 uv = v_uv * u_tile;
  outColor = texture(u_tex, uv);
}

