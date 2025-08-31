#ifdef GL_ES
precision mediump float;
#endif

varying vec2 v_uv;
varying vec3 v_normal;
uniform vec3 u_lightDir;

float seamMask(vec2 uv) {
  // uv in [0,1]
  float u = uv.x;
  float v = uv.y;
  // distance to nearest vertical seams at u=0, 0.5, 1
  float du = min(min(abs(u-0.0), abs(u-0.5)), abs(u-1.0));
  // equator around v=0.5
  float dv = abs(v - 0.5);
  float w = 0.008; // seam half-width
  float seamV = 1.0 - smoothstep(w, w*2.0, du);
  float seamH = 1.0 - smoothstep(w, w*2.0, dv);
  return max(seamV, seamH);
}

void main() {
  // base color
  vec3 base = vec3(0.90, 0.45, 0.12);
  // fake pebble: gentle variation with uv
  float pebble = fract(sin(dot(v_uv, vec2(127.1, 311.7))) * 43758.5453);
  float grain = smoothstep(0.4, 0.6, pebble) * 0.06;
  base *= 1.0 + grain;

  // seams
  float seam = seamMask(v_uv);
  vec3 col = mix(base, vec3(0.05, 0.04, 0.04), clamp(seam, 0.0, 1.0));

  // simple lambert
  vec3 n = normalize(v_normal);
  float ndl = max(dot(n, normalize(u_lightDir)), 0.0);
  float amb = 0.25;
  float diff = max(ndl, 0.0);
  vec3 lit = col * (amb + diff * 0.9);
  gl_FragColor = vec4(lit, 1.0);
}

