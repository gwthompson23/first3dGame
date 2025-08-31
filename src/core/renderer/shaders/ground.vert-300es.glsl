#version 300 es
precision mediump float;

layout(location=0) in vec3 a_position;
layout(location=1) in vec2 a_uv;
layout(location=2) in vec3 a_normal;
uniform mat4 u_viewProj;
out vec2 v_uv;
out vec3 v_normal;
out vec3 v_worldPos;

void main() {
  v_uv = a_uv;
  v_normal = a_normal; // world space
  v_worldPos = a_position;
  gl_Position = u_viewProj * vec4(a_position, 1.0);
}
