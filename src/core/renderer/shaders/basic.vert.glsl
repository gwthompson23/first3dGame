#ifdef GL_ES
precision mediump float;
#endif

attribute vec3 a_position;
attribute vec3 a_color;
uniform mat4 u_viewProj;
varying vec3 v_color;

void main() {
  v_color = a_color;
  gl_Position = u_viewProj * vec4(a_position, 1.0);
}

