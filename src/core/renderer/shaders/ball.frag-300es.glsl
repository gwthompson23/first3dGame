#version 300 es
precision mediump float;
in vec2 v_uv;
in vec3 v_normal;
uniform vec3 u_lightDir;
out vec4 fragColor;

float seamMask(vec2 uv) {
  float u = uv.x;
  float v = uv.y;
  float du = min(min(abs(u-0.0), abs(u-0.5)), abs(u-1.0));
  float dv = abs(v - 0.5);
  float w = 0.008;
  float seamV = 1.0 - smoothstep(w, w*2.0, du);
  float seamH = 1.0 - smoothstep(w, w*2.0, dv);
  return max(seamV, seamH);
}

void main() {
  vec3 base = vec3(0.90, 0.45, 0.12);
  float pebble = fract(sin(dot(v_uv, vec2(127.1, 311.7))) * 43758.5453);
  float grain = smoothstep(0.4, 0.6, pebble) * 0.06;
  base *= 1.0 + grain;
  float seam = seamMask(v_uv);
  vec3 col = mix(base, vec3(0.05, 0.04, 0.04), clamp(seam, 0.0, 1.0));
  vec3 n = normalize(v_normal);
  float ndl = max(dot(n, normalize(u_lightDir)), 0.0);
  float amb = 0.25;
  float diff = max(ndl, 0.0);
  vec3 lit = col * (amb + diff * 0.9);
  fragColor = vec4(lit, 1.0);
}

