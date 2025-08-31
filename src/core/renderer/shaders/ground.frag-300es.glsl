#version 300 es
precision mediump float;

in vec2 v_uv;
in vec3 v_normal;
in vec3 v_worldPos;
uniform sampler2D u_tex;
uniform vec2 u_tile;
uniform vec3 u_lightDir;
uniform vec3 u_lightColor;
uniform vec3 u_ambient;
uniform vec3 u_cameraPos;
uniform float u_shininess;
uniform vec3 u_specColor;
uniform mat4 u_lightViewProj;
uniform sampler2D u_shadowMap;
uniform vec2 u_shadowTexel; // 1/size
uniform float u_shadowBias;
uniform vec3 u_blobCenter0;
uniform float u_blobRadius0;
uniform float u_blobStrength0;
uniform vec3 u_blobCenter1;
uniform float u_blobRadius1;
uniform float u_blobStrength1;
out vec4 outColor;

void main() {
  vec2 uv = v_uv * u_tile;
  // Decode sRGB to linear for lighting
  vec3 base = pow(texture(u_tex, uv).rgb, vec3(2.2));
  vec3 N = normalize(v_normal);
  vec3 L = normalize(u_lightDir);
  vec3 V = normalize(u_cameraPos - v_worldPos);
  vec3 H = normalize(L + V);
  float ndotl = max(dot(N, L), 0.0);
  float ndoth = max(dot(N, H), 0.0);
  float spec = pow(ndoth, u_shininess);
  spec *= ndotl;
  // Shadowing via PCF
  vec4 ls = u_lightViewProj * vec4(v_worldPos + N * u_shadowBias, 1.0);
  vec3 sh = ls.xyz / ls.w; // NDC
  vec2 suv = sh.xy * 0.5 + 0.5;
  float sdepth = sh.z * 0.5 + 0.5;
  float shadow = 1.0;
  if (suv.x >= 0.0 && suv.x <= 1.0 && suv.y >= 0.0 && suv.y <= 1.0) {
    // 3x3 PCF
    shadow = 0.0;
    for (int dy = -1; dy <= 1; dy++) {
      for (int dx = -1; dx <= 1; dx++) {
        vec2 o = vec2(float(dx), float(dy)) * u_shadowTexel;
        float d = texture(u_shadowMap, suv + o).r;
        shadow += sdepth - 0.001 > d ? 0.0 : 1.0;
      }
    }
    shadow /= 9.0;
  }

  vec3 colorLin = base * (u_ambient + u_lightColor * ndotl * shadow) + u_specColor * spec * shadow;
  // Also apply soft blob shadows to make effect more visible or when depth shadows disabled
  float d0 = length(v_worldPos.xz - u_blobCenter0.xz);
  float f0 = clamp(1.0 - d0 / max(u_blobRadius0, 0.0001), 0.0, 1.0);
  float d1 = length(v_worldPos.xz - u_blobCenter1.xz);
  float f1 = clamp(1.0 - d1 / max(u_blobRadius1, 0.0001), 0.0, 1.0);
  float blob = 1.0;
  blob *= mix(1.0, 1.0 - u_blobStrength0, f0 * f0);
  blob *= mix(1.0, 1.0 - u_blobStrength1, f1 * f1);
  colorLin *= blob;
  vec3 colorSRGB = pow(max(colorLin, vec3(0.0)), vec3(1.0 / 2.2));
  outColor = vec4(colorSRGB, 1.0);
}
