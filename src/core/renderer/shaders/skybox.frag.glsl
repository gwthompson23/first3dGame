#ifdef GL_ES
precision mediump float;
#endif

varying vec3 v_dir;
uniform sampler2D u_sky;

// Map direction to equirectangular UV
vec2 dirToEquirectUV(vec3 d) {
  d = normalize(d);
  float u = atan(d.z, d.x) / (2.0 * 3.14159265359) + 0.5;
  float v = asin(clamp(d.y, -1.0, 1.0)) / 3.14159265359 + 0.5;
  return vec2(u, v);
}

void main() {
  vec2 uv = dirToEquirectUV(v_dir);
  vec3 col = texture2D(u_sky, uv).rgb;
  gl_FragColor = vec4(col, 1.0);
}

