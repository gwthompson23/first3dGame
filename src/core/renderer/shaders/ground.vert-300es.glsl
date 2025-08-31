#version 300 es
precision mediump float;

layout(location=0) in vec3 a_position;
layout(location=1) in vec2 a_uv;
uniform mat4 u_viewProj;
out vec2 v_uv;

void main() {
  v_uv = a_uv;
  gl_Position = u_viewProj * vec4(a_position, 1.0);
}

