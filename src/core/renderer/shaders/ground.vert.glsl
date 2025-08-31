#ifdef GL_ES
precision mediump float;
#endif

attribute vec3 a_position;
attribute vec2 a_uv;
attribute vec3 a_normal;
uniform mat4 u_viewProj;
varying vec2 v_uv;
varying vec3 v_normal;
varying vec3 v_worldPos;

void main() {
  v_uv = a_uv;
  v_normal = a_normal; // already in world space
  v_worldPos = a_position;
  gl_Position = u_viewProj * vec4(a_position, 1.0);
}
