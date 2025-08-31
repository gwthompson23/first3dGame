#ifdef GL_ES
precision mediump float;
#endif

varying vec2 v_uv;
varying vec3 v_normal;
varying vec3 v_worldPos;
uniform sampler2D u_tex;
uniform vec2 u_tile;
uniform vec3 u_lightDir;   // world-space, normalized
uniform vec3 u_lightColor; // rgb
uniform vec3 u_ambient;    // rgb
uniform vec3 u_cameraPos;  // world-space
uniform float u_shininess; // e.g., 32-64
uniform vec3 u_specColor;  // rgb strength
uniform vec3 u_blobCenter0; // xz used
uniform float u_blobRadius0;
uniform float u_blobStrength0; // 0..1
uniform vec3 u_blobCenter1;
uniform float u_blobRadius1;
uniform float u_blobStrength1;
// WebGL1: no shadows (requires WebGL2). We'll ignore shadow uniforms here.

void main() {
  vec2 uv = v_uv * u_tile;
  // Decode sRGB texture to linear
  vec3 base = pow(texture2D(u_tex, uv).rgb, vec3(2.2));

  vec3 N = normalize(v_normal);
  vec3 L = normalize(u_lightDir);
  vec3 V = normalize(u_cameraPos - v_worldPos);
  vec3 H = normalize(L + V);
  float ndotl = max(dot(N, L), 0.0);
  float ndoth = max(dot(N, H), 0.0);
  float spec = pow(ndoth, u_shininess);
  // Gate and soften specular by diffuse term to reduce glints
  spec *= ndotl;
  
  vec3 colorLin = base * (u_ambient + u_lightColor * ndotl) + u_specColor * spec;
  // Encode back to sRGB
  // Blob shadows (WebGL1 fallback): two soft circles on ground
  float d0 = length(v_worldPos.xz - u_blobCenter0.xz);
  float f0 = clamp(1.0 - d0 / max(u_blobRadius0, 0.0001), 0.0, 1.0);
  float d1 = length(v_worldPos.xz - u_blobCenter1.xz);
  float f1 = clamp(1.0 - d1 / max(u_blobRadius1, 0.0001), 0.0, 1.0);
  float blob = 1.0;
  blob *= mix(1.0, 1.0 - u_blobStrength0, f0 * f0);
  blob *= mix(1.0, 1.0 - u_blobStrength1, f1 * f1);
  colorLin *= blob;

  vec3 colorSRGB = pow(max(colorLin, vec3(0.0)), vec3(1.0 / 2.2));
  gl_FragColor = vec4(colorSRGB, 1.0);
}
