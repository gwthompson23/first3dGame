#version 300 es
precision mediump float;

layout(location=0) in vec2 a_position; // clip-space fullscreen triangle
uniform mat3 u_invViewRot;
uniform vec2 u_invProjScale; // (1/proj[0], 1/proj[5])
out vec3 v_dir; // world-space direction

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  vec2 ndc = a_position;
  vec3 rayView = normalize(vec3(ndc.x * u_invProjScale.x, ndc.y * u_invProjScale.y, -1.0));
  v_dir = normalize(u_invViewRot * rayView);
}
