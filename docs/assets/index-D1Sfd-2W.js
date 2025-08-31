var bt=Object.defineProperty;var At=(o,e,n)=>e in o?bt(o,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):o[e]=n;var m=(o,e,n)=>At(o,typeof e!="symbol"?e+"":e,n);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))s(r);new MutationObserver(r=>{for(const t of r)if(t.type==="childList")for(const i of t.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&s(i)}).observe(document,{childList:!0,subtree:!0});function n(r){const t={};return r.integrity&&(t.integrity=r.integrity),r.referrerPolicy&&(t.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?t.credentials="include":r.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function s(r){if(r.ep)return;r.ep=!0;const t=n(r);fetch(r.href,t)}})();class _t{constructor(e){m(this,"rafId",0);m(this,"accumulator",0);m(this,"last",0);m(this,"dt");m(this,"running",!1);this.cb=e,this.dt=1/e.fixedHz}start(){if(this.running)return;this.running=!0,this.last=performance.now()/1e3;const e=()=>{if(!this.running)return;const n=performance.now()/1e3;let s=Math.min(.25,n-this.last);for(this.last=n,this.accumulator+=s;this.accumulator>=this.dt;)this.cb.update(this.dt),this.accumulator-=this.dt;const r=this.accumulator/this.dt;this.cb.render(r),this.rafId=requestAnimationFrame(e)};this.rafId=requestAnimationFrame(e)}stop(){this.running&&(this.running=!1,cancelAnimationFrame(this.rafId))}}class xt{constructor(e){m(this,"keys",new Set);m(this,"mouseDX",0);m(this,"mouseDY",0);m(this,"locked",!1);m(this,"buttons",new Set);m(this,"prevButtons",new Set);this.canvas=e,window.addEventListener("keydown",n=>this.keys.add(n.code)),window.addEventListener("keyup",n=>this.keys.delete(n.code)),window.addEventListener("blur",()=>this.keys.clear()),window.addEventListener("mousemove",n=>{document.pointerLockElement===this.canvas&&(this.mouseDX+=n.movementX,this.mouseDY+=n.movementY)}),document.addEventListener("pointerlockchange",()=>{this.locked=document.pointerLockElement===this.canvas,this.mouseDX=0,this.mouseDY=0}),window.addEventListener("mousedown",n=>{this.buttons.add(n.button)}),window.addEventListener("mouseup",n=>{this.buttons.delete(n.button)})}update(){}isDown(e){return this.keys.has(e)}consumeMouseDelta(){const e=this.mouseDX,n=this.mouseDY;return this.mouseDX=0,this.mouseDY=0,{dx:e,dy:n}}isLocked(){return this.locked}isMouseDown(e){return this.buttons.has(e)}wasMousePressed(e){return this.buttons.has(e)&&!this.prevButtons.has(e)}wasMouseReleased(e){return!this.buttons.has(e)&&this.prevButtons.has(e)}endFrame(){this.prevButtons=new Set(this.buttons)}}function J(o){return o[0]=1,o[1]=0,o[2]=0,o[3]=0,o[4]=0,o[5]=1,o[6]=0,o[7]=0,o[8]=0,o[9]=0,o[10]=1,o[11]=0,o[12]=0,o[13]=0,o[14]=0,o[15]=1,o}function st(o,e,n){const s=e[0],r=e[1],t=e[2],i=e[3],a=e[4],h=e[5],l=e[6],f=e[7],v=e[8],u=e[9],d=e[10],c=e[11],b=e[12],A=e[13],x=e[14],_=e[15],B=n[0],D=n[1],P=n[2],V=n[3],C=n[4],I=n[5],p=n[6],S=n[7],U=n[8],L=n[9],T=n[10],R=n[11],w=n[12],g=n[13],M=n[14],E=n[15];return o[0]=s*B+a*D+v*P+b*V,o[1]=r*B+h*D+u*P+A*V,o[2]=t*B+l*D+d*P+x*V,o[3]=i*B+f*D+c*P+_*V,o[4]=s*C+a*I+v*p+b*S,o[5]=r*C+h*I+u*p+A*S,o[6]=t*C+l*I+d*p+x*S,o[7]=i*C+f*I+c*p+_*S,o[8]=s*U+a*L+v*T+b*R,o[9]=r*U+h*L+u*T+A*R,o[10]=t*U+l*L+d*T+x*R,o[11]=i*U+f*L+c*T+_*R,o[12]=s*w+a*g+v*M+b*E,o[13]=r*w+h*g+u*M+A*E,o[14]=t*w+l*g+d*M+x*E,o[15]=i*w+f*g+c*M+_*E,o}function wt(o,e,n,s,r){const t=1/Math.tan(e/2),i=1/(s-r);return o[0]=t/n,o[1]=0,o[2]=0,o[3]=0,o[4]=0,o[5]=t,o[6]=0,o[7]=0,o[8]=0,o[9]=0,o[10]=(r+s)*i,o[11]=-1,o[12]=0,o[13]=0,o[14]=2*r*s*i,o[15]=0,o}function vt(o,e,n,s){const[r,t,i]=e;let a=r-n[0],h=t-n[1],l=i-n[2],f=Math.hypot(a,h,l);f===0?(a=0,h=0,l=1):(a/=f,h/=f,l/=f);let v=s[1]*l-s[2]*h,u=s[2]*a-s[0]*l,d=s[0]*h-s[1]*a;f=Math.hypot(v,u,d),f===0?(v=1,u=0,d=0):(v/=f,u/=f,d/=f);const c=h*d-l*u,b=l*v-a*d,A=a*u-h*v;return o[0]=v,o[1]=c,o[2]=a,o[3]=0,o[4]=u,o[5]=b,o[6]=h,o[7]=0,o[8]=d,o[9]=A,o[10]=l,o[11]=0,o[12]=-(v*r+u*t+d*i),o[13]=-(c*r+b*t+A*i),o[14]=-(a*r+h*t+l*i),o[15]=1,o}function gt(o,e,n,s,r,t,i){const a=1/(e-n),h=1/(s-r),l=1/(t-i);return o[0]=-2*a,o[1]=0,o[2]=0,o[3]=0,o[4]=0,o[5]=-2*h,o[6]=0,o[7]=0,o[8]=0,o[9]=0,o[10]=2*l,o[11]=0,o[12]=(e+n)*a,o[13]=(r+s)*h,o[14]=(i+t)*l,o[15]=1,o}class yt{constructor(e){m(this,"position",[0,1.6,5]);m(this,"yaw",0);m(this,"pitch",0);m(this,"fov",70*Math.PI/180);m(this,"near",.1);m(this,"far",100);m(this,"aspect",1);m(this,"view",new Float32Array(16));m(this,"proj",new Float32Array(16));m(this,"viewProj",new Float32Array(16));this.aspect=e,J(this.view),J(this.proj),J(this.viewProj),this.updateProjection(),this.updateView()}updateProjection(){wt(this.proj,this.fov,this.aspect,this.near,this.far),this.updateViewProj()}setAspect(e){this.aspect=e,this.updateProjection()}addYawPitch(e,n){this.yaw+=e,this.pitch+=n;const s=89*Math.PI/180;this.pitch>s&&(this.pitch=s),this.pitch<-s&&(this.pitch=-s),this.updateView()}updateView(){const e=Math.cos(this.pitch),n=Math.sin(this.pitch),s=Math.cos(this.yaw),r=Math.sin(this.yaw),t=e*r,i=n,a=-e*s,h=[this.position[0]+t,this.position[1]+i,this.position[2]+a];vt(this.view,this.position,h,[0,1,0]),this.updateViewProj()}sync(){this.updateView()}updateViewProj(){st(this.viewProj,this.proj,this.view)}getViewProj(){return this.viewProj}getView(){return this.view}getProj(){return this.proj}}function ct(o,e,n){const s=o.createShader(e);if(!s)throw new Error("Failed to create shader");if(o.shaderSource(s,n),o.compileShader(s),!o.getShaderParameter(s,o.COMPILE_STATUS)){const r=o.getShaderInfoLog(s)||"Unknown shader compile error";throw o.deleteShader(s),new Error(r)}return s}function X(o,e,n){const s=ct(o,o.VERTEX_SHADER,e),r=ct(o,o.FRAGMENT_SHADER,n),t=o.createProgram();if(!t)throw new Error("Failed to create program");if(o.attachShader(t,s),o.attachShader(t,r),o.linkProgram(t),o.deleteShader(s),o.deleteShader(r),!o.getProgramParameter(t,o.LINK_STATUS)){const i=o.getProgramInfoLog(t)||"Unknown link error";throw o.deleteProgram(t),new Error(i)}return t}const Rt=`#ifdef GL_ES
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

`,Lt=`#ifdef GL_ES
precision mediump float;
#endif

varying vec3 v_color;

void main() {
  gl_FragColor = vec4(v_color, 1.0);
}

`,Tt=`#version 300 es
precision mediump float;

layout(location=0) in vec3 a_position;
layout(location=1) in vec3 a_color;
uniform mat4 u_viewProj;
out vec3 v_color;

void main() {
  v_color = a_color;
  gl_Position = u_viewProj * vec4(a_position, 1.0);
}

`,Et=`#version 300 es
precision mediump float;

in vec3 v_color;
out vec4 outColor;

void main() {
  outColor = vec4(v_color, 1.0);
}

`,Pt=`#ifdef GL_ES
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
`,Mt=`#ifdef GL_ES
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
`,Ft=`#version 300 es
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
`,Bt=`#version 300 es
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
`,St=`#ifdef GL_ES
precision mediump float;
#endif

attribute vec2 a_position; // clip-space fullscreen triangle
uniform mat3 u_invViewRot;
uniform vec2 u_invProjScale; // (1/proj[0], 1/proj[5])
varying vec3 v_dir; // world-space direction

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  // Reconstruct view-space ray from NDC
  vec2 ndc = a_position; // already [-1,1]
  vec3 rayView = normalize(vec3(ndc.x * u_invProjScale.x, ndc.y * u_invProjScale.y, -1.0));
  v_dir = normalize(u_invViewRot * rayView);
}
`,Dt=`#ifdef GL_ES
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

`,Vt=`#version 300 es
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
`,Ut=`#version 300 es
precision mediump float;

in vec3 v_dir;
uniform sampler2D u_sky;
out vec4 outColor;

vec2 dirToEquirectUV(vec3 d) {
  d = normalize(d);
  float u = atan(d.z, d.x) / (2.0 * 3.14159265359) + 0.5;
  float v = asin(clamp(d.y, -1.0, 1.0)) / 3.14159265359 + 0.5;
  return vec2(u, v);
}

void main() {
  vec2 uv = dirToEquirectUV(v_dir);
  vec3 col = texture(u_sky, uv).rgb;
  outColor = vec4(col, 1.0);
}

`,Ct=`#version 300 es
precision highp float;

layout(location=0) in vec3 a_position;
uniform mat4 u_lightViewProj;

void main() {
  gl_Position = u_lightViewProj * vec4(a_position, 1.0);
}

`,Gt=`#version 300 es
precision highp float;

void main() {
  // depth only
}

`;function Z(o,e){const n=Math.sin(o*127.1+e*311.7)*43758.5453123;return n-Math.floor(n)}function Q(o,e,n){return o+(e-o)*n}function ht(o){return o*o*(3-2*o)}function It(o,e){const n=Math.floor(o),s=Math.floor(e),r=o-n,t=e-s,i=Z(n,s),a=Z(n+1,s),h=Z(n,s+1),l=Z(n+1,s+1),f=ht(r),v=ht(t),u=Q(i,a,f),d=Q(h,l,f);return Q(u,d,v)}function zt(o,e,n=4,s=2,r=.5){let t=.5,i=1,a=0;for(let h=0;h<n;h++)a+=t*It(o*i,e*i),i*=s,t*=r;return a}const kt=15.24,Ot=14.326,Wt=.0508,Nt=1.2192,Yt=.28,jt=3.048,Xt=[22,0,18],G=(()=>{const o=Xt,e=0,n=kt/2,s=Ot,r=o[2]-s/2,t=o[2]+s/2,i=r+Nt,a=i+Yt,h=[o[0],e+jt,a];return{center:o,y:e,halfWidth:n,length:s,lineWidth:Wt,baselineZ:r,midZ:t,hoopCenter:h,backboardZ:i}})(),lt=50,ut=.08,Ht=1.75;function rt(o,e){let s=(zt(o*ut,e*ut,5,2,.5)-.5)*2*Ht;const r=G.center[0],t=G.center[2],i=G.halfWidth,a=G.length/2,h=.6,l=2,f=Math.abs(o-r)-(i+h),v=Math.abs(e-t)-(a+h),u=Math.max(Math.max(f,v),0),d=u<=0?0:u>=l?1:u/l*(u/l)*(3-2*(u/l));return s=s*d,s}async function Zt(o,e){const n=await new Promise((r,t)=>{const i=new Image;i.onload=()=>r(i),i.onerror=t,i.src=e}),s=o.createTexture();if(!s)throw new Error("Failed to create texture");return o.bindTexture(o.TEXTURE_2D,s),o.pixelStorei(o.UNPACK_FLIP_Y_WEBGL,0),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MIN_FILTER,o.LINEAR_MIPMAP_LINEAR),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MAG_FILTER,o.LINEAR),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_S,o.REPEAT),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_T,o.REPEAT),o.texImage2D(o.TEXTURE_2D,0,o.RGBA,o.RGBA,o.UNSIGNED_BYTE,n),o.generateMipmap(o.TEXTURE_2D),o.bindTexture(o.TEXTURE_2D,null),s}function tt(o){return o/(1+o)}function et(o){return Math.pow(Math.max(0,o),1/2.2)}async function qt(o){const e=await fetch(o);if(!e.ok)throw new Error(`Failed to fetch ${o}`);return await e.arrayBuffer()}function Kt(o){let e=0;function n(){let v="";for(;e<o.length;){const u=o[e++];if(u===10)break;v+=String.fromCharCode(u)}return v}let s=n();if(!s.startsWith("#?RADIANCE")&&!s.startsWith("#?RGBE"))throw new Error("Invalid HDR header");for(;s=n(),s.length!==0;);const t=n().match(/([\-\+])Y\s+(\d+)\s+([\-\+])X\s+(\d+)/);if(!t)throw new Error("Invalid HDR resolution line");const i=parseInt(t[2],10),a=parseInt(t[4],10),h=new Float32Array(a*i*3),l=new Uint8Array(a*4);let f=0;for(let v=0;v<i;v++){const u=o[e++],d=o[e++],c=o[e++],b=o[e++];if(u!==2||d!==2||(c<<8|b)!==a)throw new Error("Unsupported HDR scanline format");for(let A=0;A<4;A++){let x=0;for(;x<a;){const _=o[e++];if(_>128){const B=_-128,D=o[e++];for(let P=0;P<B;P++)l[A*a+x++]=D}else for(let B=0;B<_;B++)l[A*a+x++]=o[e++]}}for(let A=0;A<a;A++){const x=l[A],_=l[a+A],B=l[2*a+A],D=l[3*a+A];if(D){const P=Math.pow(2,D-128)/256;h[f++]=x*P,h[f++]=_*P,h[f++]=B*P}else h[f++]=0,h[f++]=0,h[f++]=0}}return{width:a,height:i,rgb:h}}async function $t(o,e,n){const s=await qt(e),{width:r,height:t,rgb:i}=Kt(new Uint8Array(s)),a=1,h=new Uint8Array(r*t*4);for(let f=0,v=0;f<i.length;f+=3,v+=4){let u=i[f+0]*a,d=i[f+1]*a,c=i[f+2]*a;u=et(tt(u)),d=et(tt(d)),c=et(tt(c)),h[v+0]=Math.min(255,Math.max(0,Math.round(u*255))),h[v+1]=Math.min(255,Math.max(0,Math.round(d*255))),h[v+2]=Math.min(255,Math.max(0,Math.round(c*255))),h[v+3]=255}const l=o.createTexture();if(!l)throw new Error("Failed to create texture");return o.bindTexture(o.TEXTURE_2D,l),o.pixelStorei(o.UNPACK_FLIP_Y_WEBGL,0),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MIN_FILTER,o.LINEAR),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MAG_FILTER,o.LINEAR),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_S,o.CLAMP_TO_EDGE),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_T,o.CLAMP_TO_EDGE),o.texImage2D(o.TEXTURE_2D,0,o.RGBA,r,t,0,o.RGBA,o.UNSIGNED_BYTE,h),o.bindTexture(o.TEXTURE_2D,null),l}async function Jt(o,e){const n=document.createElement("canvas"),s=2048,r=s/(e.halfWidth*2),t=Math.max(1,Math.round(r*e.length));n.width=s,n.height=t;const i=n.getContext("2d"),a=y=>y*r,h=Math.max(1,Math.round(a(e.lineWidth))),l=e.halfWidth*2,f=e.length;i.fillStyle="#44484c",i.fillRect(0,0,n.width,n.height);const v=i.getImageData(0,0,n.width,n.height),u=v.data;for(let y=0;y<u.length;y+=4){const z=Math.random()*.12-.06;u[y]=nt(u[y]+z*255),u[y+1]=nt(u[y+1]+z*255),u[y+2]=nt(u[y+2]+z*255)}i.putImageData(v,0,0),i.globalAlpha=.05,i.fillStyle="#ffffff";for(let y=0;y<40;y++){const z=Math.random()*n.height;i.fillRect(0,z,n.width,1)}i.globalAlpha=1,i.lineWidth=h,i.strokeStyle="#f6f6f6",i.fillStyle="#f6f6f6",i.lineCap="butt",i.lineJoin="round";const d=n.width/2,c=0;ft(i,d-a(l/2),c,a(l),a(f));const b=1.2192,A=c+a(b);Qt(i,d-a(.915),A,d+a(.915),A);const x=4.877,B=b+4.572;ft(i,d-a(x/2),c,a(x),a(B));const D=1.829,P=c+a(B);te(i,d,P,a(D)),i.save(),i.setLineDash([h*2,h*2]),ot(i,d,P,a(D),Math.PI,2*Math.PI),i.restore();const V=1.219,C=c+a(b+.1524);ot(i,d,C,a(V),0,Math.PI);const I=7.239,p=6.706,S=e.lineWidth,U=I+S*.5,L=p+S*.5,T=Math.acos(Math.min(1,L/U)),R=Math.sqrt(Math.max(U*U-L*L,0)),w=d-a(L),g=d+a(L),M=C+a(R),E=h;i.fillStyle=i.strokeStyle,i.fillRect(Math.round(w-E/2),Math.round(c),Math.round(E),Math.round(M-c+E*.6)),i.fillRect(Math.round(g-E/2),Math.round(c),Math.round(E),Math.round(M-c+E*.6)),i.beginPath(),ot(i,d,C,a(U),0+T,Math.PI-T),i.stroke();const F=o.createTexture();return o.bindTexture(o.TEXTURE_2D,F),o.pixelStorei(o.UNPACK_FLIP_Y_WEBGL,0),o.texImage2D(o.TEXTURE_2D,0,o.RGBA,o.RGBA,o.UNSIGNED_BYTE,n),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MIN_FILTER,o.LINEAR),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MAG_FILTER,o.LINEAR),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_S,o.CLAMP_TO_EDGE),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_T,o.CLAMP_TO_EDGE),{tex:F,width:n.width,height:n.height}}function ft(o,e,n,s,r){o.strokeRect(Math.round(e)+.5,Math.round(n)+.5,Math.round(s),Math.round(r))}function Qt(o,e,n,s,r){o.beginPath(),o.moveTo(e,n),o.lineTo(s,r),o.stroke()}function te(o,e,n,s){o.beginPath(),o.arc(e,n,s,0,2*Math.PI),o.stroke()}function ot(o,e,n,s,r,t){o.beginPath(),o.arc(e,n,s,r,t),o.stroke()}function nt(o){return Math.max(0,Math.min(255,o|0))}class ee{constructor(e){m(this,"gl");m(this,"buffer",null);m(this,"vertexCount",0);m(this,"thickness",.0075);this.gl=e,this.buffer=e.createBuffer()}sync(e,n){const s=e.getPositions(),r=e.cols,t=e.rows,i=[],a=[.92,.92,.92],h=(u,d)=>(d*r+(u%r+r)%r)*3,l=(u,d)=>{const c=s[u],b=s[u+1],A=s[u+2],x=s[d],_=s[d+1],B=s[d+2],D=x-c,P=_-b,V=B-A;let C=n[0]-(c+x)*.5,I=n[1]-(b+_)*.5,p=n[2]-(A+B)*.5,S=P*p-V*I,U=V*C-D*p,L=D*I-P*C,T=Math.hypot(S,U,L);T<1e-5&&(C=0,I=1,p=0,S=P*p-V*I,U=V*C-D*p,L=D*I-P*C,T=Math.hypot(S,U,L)||1),S/=T,U/=T,L/=T;const R=this.thickness*.5,w=S*R,g=U*R,M=L*R,E=c+w,F=b+g,y=A+M,z=x+w,O=_+g,k=B+M,Y=x-w,W=_-g,N=B-M,q=c-w,j=b-g,K=A-M;i.push(E,F,y,...a),i.push(z,O,k,...a),i.push(Y,W,N,...a),i.push(E,F,y,...a),i.push(Y,W,N,...a),i.push(q,j,K,...a)};for(let u=0;u<t-1;u++)for(let d=0;d<r;d++){const c=h(d,u),b=h(d,u+1);l(c,b)}for(let u=0;u<t-1;u++)for(let d=0;d<r;d++){const c=h(d,u),b=h(d+1,u+1);l(c,b)}const f=this.gl,v=new Float32Array(i);this.vertexCount=v.length/6,this.buffer||(this.buffer=f.createBuffer()),f.bindBuffer(f.ARRAY_BUFFER,this.buffer),f.bufferData(f.ARRAY_BUFFER,v,f.DYNAMIC_DRAW)}render(e,n,s,r){if(!this.buffer||this.vertexCount===0)return;const t=this.gl;t.useProgram(e),t.uniformMatrix4fv(n,!1,s),t.bindBuffer(t.ARRAY_BUFFER,this.buffer);const i=6*4;if(r)t.enableVertexAttribArray(0),t.vertexAttribPointer(0,3,t.FLOAT,!1,i,0),t.enableVertexAttribArray(1),t.vertexAttribPointer(1,3,t.FLOAT,!1,i,3*4);else{const a=t.getAttribLocation(e,"a_position"),h=t.getAttribLocation(e,"a_color");t.enableVertexAttribArray(a),t.vertexAttribPointer(a,3,t.FLOAT,!1,i,0),t.enableVertexAttribArray(h),t.vertexAttribPointer(h,3,t.FLOAT,!1,i,3*4)}t.drawArrays(t.TRIANGLES,0,this.vertexCount)}}async function oe(o){const n=Math.round(597.3799890650629),s=document.createElement("canvas");s.width=1024,s.height=n;const r=s.getContext("2d");r.fillStyle="#e9eef2",r.fillRect(0,0,1024,n),r.strokeStyle="#d84a1b",r.fillStyle="#d84a1b";const t=.0508,i=1024/1.829,a=Math.max(2,Math.round(t*i));r.lineWidth=a,r.lineJoin="miter",r.lineCap="butt";const h=.6096,l=.4572,f=.1524,u=G.hoopCenter[1]+.305,d=1.067,c=1024/2,b=n/2,A=n/d,x=h*i,_=l*A,D=b-(G.hoopCenter[1]+f-u)*A-_,P=c-x/2;dt(r,P,D,x,_),r.strokeStyle="#cfd5db",r.lineWidth=Math.max(1,Math.round(a*.6)),dt(r,a,a,1024-2*a,n-2*a);const V=o.createTexture();return o.bindTexture(o.TEXTURE_2D,V),o.pixelStorei(o.UNPACK_FLIP_Y_WEBGL,0),o.texImage2D(o.TEXTURE_2D,0,o.RGBA,o.RGBA,o.UNSIGNED_BYTE,s),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MIN_FILTER,o.LINEAR),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MAG_FILTER,o.LINEAR),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_S,o.CLAMP_TO_EDGE),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_T,o.CLAMP_TO_EDGE),V}function dt(o,e,n,s,r){o.strokeRect(Math.round(e)+.5,Math.round(n)+.5,Math.round(s),Math.round(r))}const ne=`#ifdef GL_ES
precision mediump float;
#endif

attribute vec3 a_position;
attribute vec2 a_uv;
attribute vec3 a_normal;
uniform mat4 u_viewProj;
varying vec2 v_uv;
varying vec3 v_normal;

void main() {
  v_uv = a_uv;
  v_normal = a_normal;
  gl_Position = u_viewProj * vec4(a_position, 1.0);
}

`,se=`#ifdef GL_ES
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

`,re=`#version 300 es
precision mediump float;
layout(location=0) in vec3 a_position;
layout(location=1) in vec2 a_uv;
layout(location=2) in vec3 a_normal;
uniform mat4 u_viewProj;
out vec2 v_uv;
out vec3 v_normal;
void main() {
  v_uv = a_uv;
  v_normal = a_normal;
  gl_Position = u_viewProj * vec4(a_position, 1.0);
}

`,ie=`#version 300 es
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

`;class it{constructor(e){m(this,"program");m(this,"uViewProj");m(this,"buffer");m(this,"groundProgram");m(this,"uGroundViewProj");m(this,"uGroundTile");m(this,"uGroundSampler");m(this,"uGroundLightDir");m(this,"uGroundLightColor");m(this,"uGroundAmbient");m(this,"uGroundCameraPos");m(this,"uGroundShininess");m(this,"uGroundSpecColor");m(this,"uGroundBlobCenter0");m(this,"uGroundBlobRadius0");m(this,"uGroundBlobStrength0");m(this,"uGroundBlobCenter1");m(this,"uGroundBlobRadius1");m(this,"uGroundBlobStrength1");m(this,"groundBuffer");m(this,"groundVertexCount",0);m(this,"groundTex",null);m(this,"skyProgram");m(this,"uSkyInvViewRot");m(this,"uSkyInvProjScale");m(this,"uSkySampler");m(this,"skyTex",null);m(this,"skyBuffer");m(this,"isWebGL2");m(this,"shadowFBO",null);m(this,"shadowDepthTex",null);m(this,"shadowProgram",null);m(this,"uShadowLightViewProj",null);m(this,"shadowSize",1024);m(this,"lightView",new Float32Array(16));m(this,"lightProj",new Float32Array(16));m(this,"lightViewProj",new Float32Array(16));m(this,"playerShadowBuffer",null);m(this,"courtBuffer",null);m(this,"courtVertexCount",0);m(this,"courtTex",null);m(this,"hoopBuffer",null);m(this,"hoopVertexCount",0);m(this,"backboardTex",null);m(this,"backboardBuffer",null);m(this,"backboardVertexCount",0);m(this,"netRenderer",null);m(this,"ballProgram",null);m(this,"uBallViewProj",null);m(this,"uBallLightDir",null);m(this,"ballUnit",null);m(this,"ballBuffer",null);m(this,"sphereUnit",null);m(this,"sphereVertexCount",0);m(this,"sphereBuffer",null);m(this,"lineBuffer",null);this.gl=e,this.isWebGL2=typeof WebGL2RenderingContext<"u"&&e instanceof WebGL2RenderingContext;const n=this.isWebGL2?Tt:Rt,s=this.isWebGL2?Et:Lt;this.program=X(e,n,s),this.uViewProj=e.getUniformLocation(this.program,"u_viewProj");const r=this.isWebGL2?Ft:Pt,t=this.isWebGL2?Bt:Mt;this.groundProgram=X(e,r,t),this.uGroundViewProj=e.getUniformLocation(this.groundProgram,"u_viewProj"),this.uGroundTile=e.getUniformLocation(this.groundProgram,"u_tile"),this.uGroundSampler=e.getUniformLocation(this.groundProgram,"u_tex"),this.uGroundLightDir=e.getUniformLocation(this.groundProgram,"u_lightDir"),this.uGroundLightColor=e.getUniformLocation(this.groundProgram,"u_lightColor"),this.uGroundAmbient=e.getUniformLocation(this.groundProgram,"u_ambient"),this.uGroundCameraPos=e.getUniformLocation(this.groundProgram,"u_cameraPos"),this.uGroundShininess=e.getUniformLocation(this.groundProgram,"u_shininess"),this.uGroundSpecColor=e.getUniformLocation(this.groundProgram,"u_specColor"),this.uGroundBlobCenter0=e.getUniformLocation(this.groundProgram,"u_blobCenter0"),this.uGroundBlobRadius0=e.getUniformLocation(this.groundProgram,"u_blobRadius0"),this.uGroundBlobStrength0=e.getUniformLocation(this.groundProgram,"u_blobStrength0"),this.uGroundBlobCenter1=e.getUniformLocation(this.groundProgram,"u_blobCenter1"),this.uGroundBlobRadius1=e.getUniformLocation(this.groundProgram,"u_blobRadius1"),this.uGroundBlobStrength1=e.getUniformLocation(this.groundProgram,"u_blobStrength1");const i=this.isWebGL2?Vt:St,a=this.isWebGL2?Ut:Dt;this.skyProgram=X(e,i,a),this.uSkyInvViewRot=e.getUniformLocation(this.skyProgram,"u_invViewRot"),this.uSkyInvProjScale=e.getUniformLocation(this.skyProgram,"u_invProjScale"),this.uSkySampler=e.getUniformLocation(this.skyProgram,"u_sky");const h=e.createBuffer();if(!h)throw new Error("Failed to create buffer");this.buffer=h,e.bindBuffer(e.ARRAY_BUFFER,h),e.bufferData(e.ARRAY_BUFFER,it.cube(),e.STATIC_DRAW);const l=lt,f=20,v=128,u=[],d=v+1,c=new Float32Array(d),b=new Float32Array(d);for(let p=0;p<d;p++)c[p]=-l+p/v*(2*l),b[p]=-l+p/v*(2*l);const A=new Float32Array(d*d),x=(p,S)=>S*d+p;for(let p=0;p<d;p++){const S=b[p];for(let U=0;U<d;U++){const L=c[U];A[x(U,p)]=rt(L,S)}}const _=new Float32Array(d*d*3),B=(p,S)=>(S*d+p)*3;for(let p=0;p<d;p++){const S=p>0?p-1:p,U=p<v?p+1:p,L=b[U]-b[S]||1;for(let T=0;T<d;T++){const R=T>0?T-1:T,w=T<v?T+1:T,g=c[w]-c[R]||1,M=(A[x(w,p)]-A[x(R,p)])/g,E=(A[x(T,U)]-A[x(T,S)])/L;let F=-M,y=1,z=-E;const O=Math.hypot(F,y,z)||1;F/=O,y/=O,z/=O;const k=B(T,p);_[k+0]=F,_[k+1]=y,_[k+2]=z}}for(let p=0;p<v;p++){const S=b[p],U=b[p+1],L=p/v*f,T=(p+1)/v*f;for(let R=0;R<v;R++){const w=c[R],g=c[R+1],M=R/v*f,E=(R+1)/v*f,F=A[x(R,p)],y=A[x(R+1,p)],z=A[x(R+1,p+1)],O=A[x(R,p+1)],k=B(R,p),Y=B(R+1,p),W=B(R+1,p+1),N=B(R,p+1);u.push(w,F,S,M,L,_[k],_[k+1],_[k+2]),u.push(g,y,S,E,L,_[Y],_[Y+1],_[Y+2]),u.push(g,z,U,E,T,_[W],_[W+1],_[W+2]),u.push(w,F,S,M,L,_[k],_[k+1],_[k+2]),u.push(g,z,U,E,T,_[W],_[W+1],_[W+2]),u.push(w,O,U,M,T,_[N],_[N+1],_[N+2])}}const D=new Float32Array(u);this.groundVertexCount=D.length/8;const P=e.createBuffer();if(!P)throw new Error("Failed to create ground buffer");this.groundBuffer=P,e.bindBuffer(e.ARRAY_BUFFER,P),e.bufferData(e.ARRAY_BUFFER,D,e.STATIC_DRAW);const V="/first3dGame/";Zt(e,V+"textures/ground/diffuse.jpg").then(p=>{this.groundTex=p}).catch(()=>{}),$t(e,V+"textures/sky/sky.hdr").then(p=>{this.skyTex=p}).catch(()=>{}),Jt(e,G).then(({tex:p})=>{this.courtTex=p}).catch(()=>{});{const p=G.y+.01,S=G.halfWidth,U=G.length/2,L=G.center[0],T=G.center[2],R=L-S,w=L+S,g=T-U,M=T+U,E=new Float32Array([R,p,g,0,0,0,1,0,w,p,g,1,0,0,1,0,w,p,M,1,1,0,1,0,R,p,g,0,0,0,1,0,w,p,M,1,1,0,1,0,R,p,M,0,1,0,1,0]),F=e.createBuffer();F&&(this.courtBuffer=F,this.courtVertexCount=6,e.bindBuffer(e.ARRAY_BUFFER,F),e.bufferData(e.ARRAY_BUFFER,E,e.STATIC_DRAW))}const C=new Float32Array([-1,-1,3,-1,-1,3]),I=e.createBuffer();if(!I)throw new Error("Failed to create sky buffer");if(this.skyBuffer=I,e.bindBuffer(e.ARRAY_BUFFER,I),e.bufferData(e.ARRAY_BUFFER,C,e.STATIC_DRAW),this.isWebGL2){const p=e,S=p.createTexture();if(!S)throw new Error("Failed to create shadow depth texture");this.shadowDepthTex=S,p.bindTexture(p.TEXTURE_2D,S),p.texImage2D(p.TEXTURE_2D,0,p.DEPTH_COMPONENT16,this.shadowSize,this.shadowSize,0,p.DEPTH_COMPONENT,p.UNSIGNED_SHORT,null),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_MIN_FILTER,p.NEAREST),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_MAG_FILTER,p.NEAREST),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_WRAP_S,p.CLAMP_TO_EDGE),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_WRAP_T,p.CLAMP_TO_EDGE);const U=p.createFramebuffer();if(!U)throw new Error("Failed to create shadow FBO");this.shadowFBO=U,p.bindFramebuffer(p.FRAMEBUFFER,U),p.framebufferTexture2D(p.FRAMEBUFFER,p.DEPTH_ATTACHMENT,p.TEXTURE_2D,S,0),p.drawBuffers([p.NONE]),p.readBuffer(p.NONE);const L=p.checkFramebufferStatus(p.FRAMEBUFFER);L!==p.FRAMEBUFFER_COMPLETE&&console.warn("Shadow framebuffer incomplete:",L),p.bindFramebuffer(p.FRAMEBUFFER,null);const T=X(p,Ct,Gt);this.shadowProgram=T,this.uShadowLightViewProj=p.getUniformLocation(T,"u_lightViewProj");const R=p.createBuffer();if(!R)throw new Error("Failed to create player shadow buffer");this.playerShadowBuffer=R}{const p=this.buildHoopGeometry(),S=e.createBuffer();S&&(this.hoopBuffer=S,this.hoopVertexCount=p.length/6,e.bindBuffer(e.ARRAY_BUFFER,S),e.bufferData(e.ARRAY_BUFFER,p,e.STATIC_DRAW))}oe(e).then(p=>{this.backboardTex=p}).catch(()=>{});{const L=G.center[0],T=G.backboardZ,w=G.hoopCenter[1]+.305,g=w-1.067/2,M=w+1.067/2,E=L-1.829/2,F=L+1.829/2,y=T+.05/2+.002,z=new Float32Array([E,g,y,0,0,0,0,1,F,g,y,1,0,0,0,1,F,M,y,1,1,0,0,1,E,g,y,0,0,0,0,1,F,M,y,1,1,0,0,1,E,M,y,0,1,0,0,1]),O=e.createBuffer();O&&(this.backboardBuffer=O,this.backboardVertexCount=6,e.bindBuffer(e.ARRAY_BUFFER,O),e.bufferData(e.ARRAY_BUFFER,z,e.STATIC_DRAW))}this.netRenderer=new ee(e);try{const p=this.isWebGL2?re:ne,S=this.isWebGL2?ie:se,U=X(e,p,S);this.ballProgram=U,this.uBallViewProj=e.getUniformLocation(U,"u_viewProj"),this.uBallLightDir=e.getUniformLocation(U,"u_lightDir")}catch{}}static cube(){const e=[-1,-1,1,.9,.2,.2,1,-1,1,.9,.2,.2,1,1,1,.9,.2,.2,-1,-1,1,.9,.2,.2,1,1,1,.9,.2,.2,-1,1,1,.9,.2,.2,-1,-1,-1,.2,.2,.9,1,1,-1,.2,.2,.9,1,-1,-1,.2,.2,.9,-1,-1,-1,.2,.2,.9,-1,1,-1,.2,.2,.9,1,1,-1,.2,.2,.9,-1,-1,-1,.2,.9,.2,-1,-1,1,.2,.9,.2,-1,1,1,.2,.9,.2,-1,-1,-1,.2,.9,.2,-1,1,1,.2,.9,.2,-1,1,-1,.2,.9,.2,1,-1,-1,.9,.9,.2,1,1,1,.9,.9,.2,1,-1,1,.9,.9,.2,1,-1,-1,.9,.9,.2,1,1,-1,.9,.9,.2,1,1,1,.9,.9,.2,-1,1,-1,.2,.9,.9,-1,1,1,.2,.9,.9,1,1,1,.2,.9,.9,-1,1,-1,.2,.9,.9,1,1,1,.2,.9,.9,1,1,-1,.2,.9,.9,-1,-1,-1,.9,.2,.9,1,-1,1,.9,.2,.9,-1,-1,1,.9,.2,.9,-1,-1,-1,.9,.2,.9,1,-1,-1,.9,.2,.9,1,-1,1,.9,.2,.9];return new Float32Array(e)}render(e,n,s,r){const t=this.gl,i=new Float32Array(16);st(i,n,e);const a=new Float32Array([.4,1,.3]);{const c=Math.hypot(a[0],a[1],a[2])||1;a[0]/=c,a[1]/=c,a[2]/=c}const h=s?[s[0],0,s[2]]:[0,0,0],l=60,f=[h[0]-a[0]*l,h[1]-a[1]*l,h[2]-a[2]*l];vt(this.lightView,f,h,[0,1,0]);const v=Math.min(lt,25);if(gt(this.lightProj,-v,v,-v,v,1,200),st(this.lightViewProj,this.lightProj,this.lightView),this.isWebGL2&&this.shadowFBO&&this.shadowProgram&&this.shadowDepthTex){const c=t;if(c.bindFramebuffer(c.FRAMEBUFFER,this.shadowFBO),c.viewport(0,0,this.shadowSize,this.shadowSize),c.clearDepth(1),c.clear(c.DEPTH_BUFFER_BIT),c.colorMask(!1,!1,!1,!1),c.enable(c.DEPTH_TEST),c.enable(c.POLYGON_OFFSET_FILL),c.polygonOffset(1.1,4),c.enable(c.CULL_FACE),c.cullFace(c.FRONT),c.useProgram(this.shadowProgram),c.uniformMatrix4fv(this.uShadowLightViewProj,!1,this.lightViewProj),c.bindBuffer(c.ARRAY_BUFFER,this.buffer),c.enableVertexAttribArray(0),c.vertexAttribPointer(0,3,c.FLOAT,!1,6*4,0),c.drawArrays(c.TRIANGLES,0,36),r&&this.playerShadowBuffer){const b=this.buildPlayerCapsule(r.pos,r.radius,r.height);c.bindBuffer(c.ARRAY_BUFFER,this.playerShadowBuffer),c.bufferData(c.ARRAY_BUFFER,b,c.DYNAMIC_DRAW),c.enableVertexAttribArray(0),c.vertexAttribPointer(0,3,c.FLOAT,!1,3*4,0),c.drawArrays(c.TRIANGLES,0,b.length/3)}this.hoopBuffer&&(c.bindBuffer(c.ARRAY_BUFFER,this.hoopBuffer),c.enableVertexAttribArray(0),c.vertexAttribPointer(0,3,c.FLOAT,!1,6*4,0),c.drawArrays(c.TRIANGLES,0,this.hoopVertexCount)),c.bindFramebuffer(c.FRAMEBUFFER,null),c.colorMask(!0,!0,!0,!0),c.viewport(0,0,c.drawingBufferWidth,c.drawingBufferHeight),c.disable(c.POLYGON_OFFSET_FILL),c.disable(c.CULL_FACE)}if(this.skyTex){t.depthMask(!1),t.disable(t.DEPTH_TEST),t.useProgram(this.skyProgram);const c=e,b=new Float32Array([c[0],c[4],c[8],c[1],c[5],c[9],c[2],c[6],c[10]]);t.uniformMatrix3fv(this.uSkyInvViewRot,!1,b);const A=1/n[0],x=1/n[5];if(t.uniform2f(this.uSkyInvProjScale,A,x),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,this.skyTex),t.uniform1i(this.uSkySampler,0),t.bindBuffer(t.ARRAY_BUFFER,this.skyBuffer),this.isWebGL2)t.enableVertexAttribArray(0),t.vertexAttribPointer(0,2,t.FLOAT,!1,2*4,0);else{const _=t.getAttribLocation(this.skyProgram,"a_position");t.enableVertexAttribArray(_),t.vertexAttribPointer(_,2,t.FLOAT,!1,2*4,0)}t.drawArrays(t.TRIANGLES,0,3),t.enable(t.DEPTH_TEST),t.depthMask(!0)}if(t.useProgram(this.groundProgram),t.uniformMatrix4fv(this.uGroundViewProj,!1,i),t.uniform2f(this.uGroundTile,1,1),t.uniform3fv(this.uGroundLightDir,a),t.uniform3f(this.uGroundLightColor,1,.98,.92),t.uniform3f(this.uGroundAmbient,.22,.24,.26),s&&t.uniform3f(this.uGroundCameraPos,s[0],s[1],s[2]),t.uniform1f(this.uGroundShininess,64),t.uniform3f(this.uGroundSpecColor,.01,.01,.01),this.uGroundBlobCenter0&&t.uniform3f(this.uGroundBlobCenter0,0,0,0),this.uGroundBlobRadius0&&t.uniform1f(this.uGroundBlobRadius0,1.6),this.uGroundBlobStrength0&&t.uniform1f(this.uGroundBlobStrength0,.6),r?(this.uGroundBlobCenter1&&t.uniform3f(this.uGroundBlobCenter1,r.pos[0],0,r.pos[2]),this.uGroundBlobRadius1&&t.uniform1f(this.uGroundBlobRadius1,r.radius*1.8),this.uGroundBlobStrength1&&t.uniform1f(this.uGroundBlobStrength1,.6)):(this.uGroundBlobCenter1&&t.uniform3f(this.uGroundBlobCenter1,9999,0,9999),this.uGroundBlobRadius1&&t.uniform1f(this.uGroundBlobRadius1,0),this.uGroundBlobStrength1&&t.uniform1f(this.uGroundBlobStrength1,0)),this.isWebGL2&&this.shadowDepthTex){const c=t.getUniformLocation(this.groundProgram,"u_lightViewProj");c&&t.uniformMatrix4fv(c,!1,this.lightViewProj),t.activeTexture(t.TEXTURE1),t.bindTexture(t.TEXTURE_2D,this.shadowDepthTex);const b=t.getUniformLocation(this.groundProgram,"u_shadowMap");b&&t.uniform1i(b,1);const A=t.getUniformLocation(this.groundProgram,"u_shadowTexel");A&&t.uniform2f(A,1/this.shadowSize,1/this.shadowSize);const x=t.getUniformLocation(this.groundProgram,"u_shadowBias");x&&t.uniform1f(x,.02)}t.bindBuffer(t.ARRAY_BUFFER,this.groundBuffer);const u=8*4;if(this.isWebGL2)t.enableVertexAttribArray(0),t.vertexAttribPointer(0,3,t.FLOAT,!1,u,0),t.enableVertexAttribArray(1),t.vertexAttribPointer(1,2,t.FLOAT,!1,u,3*4),t.enableVertexAttribArray(2),t.vertexAttribPointer(2,3,t.FLOAT,!1,u,5*4);else{const c=t.getAttribLocation(this.groundProgram,"a_position"),b=t.getAttribLocation(this.groundProgram,"a_uv"),A=t.getAttribLocation(this.groundProgram,"a_normal");t.enableVertexAttribArray(c),t.vertexAttribPointer(c,3,t.FLOAT,!1,u,0),t.enableVertexAttribArray(b),t.vertexAttribPointer(b,2,t.FLOAT,!1,u,3*4),A!==-1&&(t.enableVertexAttribArray(A),t.vertexAttribPointer(A,3,t.FLOAT,!1,u,5*4))}if(this.groundTex&&(t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,this.groundTex),t.uniform1i(this.uGroundSampler,0)),t.drawArrays(t.TRIANGLES,0,this.groundVertexCount),this.courtBuffer&&this.courtTex){t.bindBuffer(t.ARRAY_BUFFER,this.courtBuffer);const c=8*4;if(this.isWebGL2)t.enableVertexAttribArray(0),t.vertexAttribPointer(0,3,t.FLOAT,!1,c,0),t.enableVertexAttribArray(1),t.vertexAttribPointer(1,2,t.FLOAT,!1,c,3*4),t.enableVertexAttribArray(2),t.vertexAttribPointer(2,3,t.FLOAT,!1,c,5*4);else{const b=t.getAttribLocation(this.groundProgram,"a_position"),A=t.getAttribLocation(this.groundProgram,"a_uv"),x=t.getAttribLocation(this.groundProgram,"a_normal");t.enableVertexAttribArray(b),t.vertexAttribPointer(b,3,t.FLOAT,!1,c,0),t.enableVertexAttribArray(A),t.vertexAttribPointer(A,2,t.FLOAT,!1,c,3*4),x!==-1&&(t.enableVertexAttribArray(x),t.vertexAttribPointer(x,3,t.FLOAT,!1,c,5*4))}t.uniform2f(this.uGroundTile,1,1),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,this.courtTex),t.uniform1i(this.uGroundSampler,0),t.drawArrays(t.TRIANGLES,0,this.courtVertexCount)}t.useProgram(this.program),t.uniformMatrix4fv(this.uViewProj,!1,i),t.bindBuffer(t.ARRAY_BUFFER,this.buffer);const d=6*4;if(this.isWebGL2)t.enableVertexAttribArray(0),t.vertexAttribPointer(0,3,t.FLOAT,!1,d,0),t.enableVertexAttribArray(1),t.vertexAttribPointer(1,3,t.FLOAT,!1,d,3*4);else{const c=t.getAttribLocation(this.program,"a_position"),b=t.getAttribLocation(this.program,"a_color");t.enableVertexAttribArray(c),t.vertexAttribPointer(c,3,t.FLOAT,!1,d,0),t.enableVertexAttribArray(b),t.vertexAttribPointer(b,3,t.FLOAT,!1,d,3*4)}if(t.drawArrays(t.TRIANGLES,0,36),this.hoopBuffer){t.bindBuffer(t.ARRAY_BUFFER,this.hoopBuffer);const c=6*4;if(this.isWebGL2)t.enableVertexAttribArray(0),t.vertexAttribPointer(0,3,t.FLOAT,!1,c,0),t.enableVertexAttribArray(1),t.vertexAttribPointer(1,3,t.FLOAT,!1,c,3*4);else{const b=t.getAttribLocation(this.program,"a_position"),A=t.getAttribLocation(this.program,"a_color");t.enableVertexAttribArray(b),t.vertexAttribPointer(b,3,t.FLOAT,!1,c,0),t.enableVertexAttribArray(A),t.vertexAttribPointer(A,3,t.FLOAT,!1,c,3*4)}t.drawArrays(t.TRIANGLES,0,this.hoopVertexCount)}if(this.backboardBuffer&&this.backboardTex){t.useProgram(this.groundProgram),t.uniformMatrix4fv(this.uGroundViewProj,!1,i),t.uniform2f(this.uGroundTile,1,1);const c=new Float32Array([.4,1,.3]);{const A=Math.hypot(c[0],c[1],c[2])||1;c[0]/=A,c[1]/=A,c[2]/=A}t.uniform3fv(this.uGroundLightDir,c),t.uniform3f(this.uGroundLightColor,1,.98,.92),t.uniform3f(this.uGroundAmbient,.22,.24,.26),s&&t.uniform3f(this.uGroundCameraPos,s[0],s[1],s[2]),t.uniform1f(this.uGroundShininess,64),t.uniform3f(this.uGroundSpecColor,.01,.01,.01),t.bindBuffer(t.ARRAY_BUFFER,this.backboardBuffer);const b=8*4;if(this.isWebGL2)t.enableVertexAttribArray(0),t.vertexAttribPointer(0,3,t.FLOAT,!1,b,0),t.enableVertexAttribArray(1),t.vertexAttribPointer(1,2,t.FLOAT,!1,b,3*4),t.enableVertexAttribArray(2),t.vertexAttribPointer(2,3,t.FLOAT,!1,b,5*4);else{const A=t.getAttribLocation(this.groundProgram,"a_position"),x=t.getAttribLocation(this.groundProgram,"a_uv"),_=t.getAttribLocation(this.groundProgram,"a_normal");t.enableVertexAttribArray(A),t.vertexAttribPointer(A,3,t.FLOAT,!1,b,0),t.enableVertexAttribArray(x),t.vertexAttribPointer(x,2,t.FLOAT,!1,b,3*4),_!==-1&&(t.enableVertexAttribArray(_),t.vertexAttribPointer(_,3,t.FLOAT,!1,b,5*4))}t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,this.backboardTex),t.uniform1i(this.uGroundSampler,0),t.drawArrays(t.TRIANGLES,0,this.backboardVertexCount)}this.netRenderer&&this.netRenderer.render(this.program,this.uViewProj,i,this.isWebGL2)}syncNet(e,n){this.netRenderer&&this.netRenderer.sync(e,n)}renderSphere(e,n,s,r){const t=this.gl;if(this.sphereUnit||this.buildSphereUnit(),!this.sphereBuffer){const l=t.createBuffer();if(!l)return;this.sphereBuffer=l}const i=this.sphereUnit,a=new Float32Array(i.length);for(let l=0;l<i.length;l+=6)a[l+0]=n[0]+i[l+0]*s,a[l+1]=n[1]+i[l+1]*s,a[l+2]=n[2]+i[l+2]*s,a[l+3]=r[0],a[l+4]=r[1],a[l+5]=r[2];t.useProgram(this.program),t.uniformMatrix4fv(this.uViewProj,!1,e),t.bindBuffer(t.ARRAY_BUFFER,this.sphereBuffer),t.bufferData(t.ARRAY_BUFFER,a,t.DYNAMIC_DRAW);const h=6*4;if(this.isWebGL2)t.enableVertexAttribArray(0),t.vertexAttribPointer(0,3,t.FLOAT,!1,h,0),t.enableVertexAttribArray(1),t.vertexAttribPointer(1,3,t.FLOAT,!1,h,3*4);else{const l=t.getAttribLocation(this.program,"a_position"),f=t.getAttribLocation(this.program,"a_color");t.enableVertexAttribArray(l),t.vertexAttribPointer(l,3,t.FLOAT,!1,h,0),t.enableVertexAttribArray(f),t.vertexAttribPointer(f,3,t.FLOAT,!1,h,3*4)}t.drawArrays(t.TRIANGLES,0,this.sphereVertexCount)}renderLineStrip(e,n,s){const r=this.gl;if(!this.lineBuffer){const h=r.createBuffer();if(!h)return;this.lineBuffer=h}const t=Math.floor(n.length/3);if(t<=1)return;const i=new Float32Array(t*6);for(let h=0;h<t;h++)i[h*6+0]=n[h*3+0],i[h*6+1]=n[h*3+1],i[h*6+2]=n[h*3+2],i[h*6+3]=s[0],i[h*6+4]=s[1],i[h*6+5]=s[2];r.useProgram(this.program),r.uniformMatrix4fv(this.uViewProj,!1,e),r.bindBuffer(r.ARRAY_BUFFER,this.lineBuffer),r.bufferData(r.ARRAY_BUFFER,i,r.DYNAMIC_DRAW);const a=6*4;if(this.isWebGL2)r.enableVertexAttribArray(0),r.vertexAttribPointer(0,3,r.FLOAT,!1,a,0),r.enableVertexAttribArray(1),r.vertexAttribPointer(1,3,r.FLOAT,!1,a,3*4);else{const h=r.getAttribLocation(this.program,"a_position"),l=r.getAttribLocation(this.program,"a_color");r.enableVertexAttribArray(h),r.vertexAttribPointer(h,3,r.FLOAT,!1,a,0),r.enableVertexAttribArray(l),r.vertexAttribPointer(l,3,r.FLOAT,!1,a,3*4)}r.lineWidth(2),r.drawArrays(r.LINE_STRIP,0,t)}renderLines(e,n){const s=this.gl;if(n.length===0)return;if(!this.lineBuffer){const t=s.createBuffer();if(!t)return;this.lineBuffer=t}s.useProgram(this.program),s.uniformMatrix4fv(this.uViewProj,!1,e),s.bindBuffer(s.ARRAY_BUFFER,this.lineBuffer),s.bufferData(s.ARRAY_BUFFER,n,s.DYNAMIC_DRAW);const r=6*4;if(this.isWebGL2)s.enableVertexAttribArray(0),s.vertexAttribPointer(0,3,s.FLOAT,!1,r,0),s.enableVertexAttribArray(1),s.vertexAttribPointer(1,3,s.FLOAT,!1,r,3*4);else{const t=s.getAttribLocation(this.program,"a_position"),i=s.getAttribLocation(this.program,"a_color");s.enableVertexAttribArray(t),s.vertexAttribPointer(t,3,s.FLOAT,!1,r,0),s.enableVertexAttribArray(i),s.vertexAttribPointer(i,3,s.FLOAT,!1,r,3*4)}s.lineWidth(2),s.drawArrays(s.LINES,0,n.length/6)}buildSphereUnit(){const s=[];for(let t=0;t<12;t++){const i=t/12,a=(t+1)/12,h=i*Math.PI,l=a*Math.PI;for(let f=0;f<18;f++){const v=f/18,u=(f+1)/18,d=v*Math.PI*2,c=u*Math.PI*2,b=r(d,h),A=r(c,h),x=r(c,l),_=r(d,l);s.push(b[0],b[1],b[2],1,1,1),s.push(A[0],A[1],A[2],1,1,1),s.push(x[0],x[1],x[2],1,1,1),s.push(b[0],b[1],b[2],1,1,1),s.push(x[0],x[1],x[2],1,1,1),s.push(_[0],_[1],_[2],1,1,1)}}function r(t,i){const a=Math.sin(i)*Math.cos(t),h=Math.cos(i),l=Math.sin(i)*Math.sin(t);return[a,h,l]}this.sphereUnit=new Float32Array(s),this.sphereVertexCount=s.length/6}buildBallUnit(){const s=[];for(let i=0;i<18;i++){const a=i/18,h=(i+1)/18,l=a*Math.PI,f=h*Math.PI;for(let v=0;v<36;v++){const u=v/36,d=(v+1)/36,c=u*Math.PI*2,b=d*Math.PI*2,A=r(c,l),x=r(b,l),_=r(b,f),B=r(c,f);t(A,[u,a]),t(x,[d,a]),t(_,[d,h]),t(A,[u,a]),t(_,[d,h]),t(B,[u,h])}}function r(i,a){const h=Math.sin(a)*Math.cos(i),l=Math.cos(a),f=Math.sin(a)*Math.sin(i);return[h,l,f]}function t(i,a){const h=i[0],l=i[1],f=i[2];s.push(i[0],i[1],i[2],a[0],a[1],h,l,f)}this.ballUnit=new Float32Array(s)}renderBasketball(e,n,s,r){if(!this.ballProgram)return this.renderSphere(e,n,s,[.92,.45,.1]);const t=this.gl;if(this.ballUnit||this.buildBallUnit(),!this.ballBuffer){const d=t.createBuffer();if(!d)return;this.ballBuffer=d}const i=this.ballUnit,a=i.length/8,h=new Float32Array(i.length),l=r;for(let d=0;d<a;d++){const c=d*8,b=i[c+0],A=i[c+1],x=i[c+2],_=l[0]*b+l[1]*A+l[2]*x,B=l[3]*b+l[4]*A+l[5]*x,D=l[6]*b+l[7]*A+l[8]*x;h[c+0]=n[0]+_*s,h[c+1]=n[1]+B*s,h[c+2]=n[2]+D*s,h[c+3]=i[c+3],h[c+4]=i[c+4];const P=i[c+5],V=i[c+6],C=i[c+7];h[c+5]=l[0]*P+l[1]*V+l[2]*C,h[c+6]=l[3]*P+l[4]*V+l[5]*C,h[c+7]=l[6]*P+l[7]*V+l[8]*C}t.useProgram(this.ballProgram),t.uniformMatrix4fv(this.uBallViewProj,!1,e);const f=new Float32Array([.4,1,.3]),v=Math.hypot(f[0],f[1],f[2])||1;f[0]/=v,f[1]/=v,f[2]/=v,t.uniform3fv(this.uBallLightDir,f),t.bindBuffer(t.ARRAY_BUFFER,this.ballBuffer),t.bufferData(t.ARRAY_BUFFER,h,t.DYNAMIC_DRAW);const u=8*4;if(this.isWebGL2)t.enableVertexAttribArray(0),t.vertexAttribPointer(0,3,t.FLOAT,!1,u,0),t.enableVertexAttribArray(1),t.vertexAttribPointer(1,2,t.FLOAT,!1,u,3*4),t.enableVertexAttribArray(2),t.vertexAttribPointer(2,3,t.FLOAT,!1,u,5*4);else{const d=t.getAttribLocation(this.ballProgram,"a_position"),c=t.getAttribLocation(this.ballProgram,"a_uv"),b=t.getAttribLocation(this.ballProgram,"a_normal");t.enableVertexAttribArray(d),t.vertexAttribPointer(d,3,t.FLOAT,!1,u,0),t.enableVertexAttribArray(c),t.vertexAttribPointer(c,2,t.FLOAT,!1,u,3*4),t.enableVertexAttribArray(b),t.vertexAttribPointer(b,3,t.FLOAT,!1,u,5*4)}t.drawArrays(t.TRIANGLES,0,a)}buildHoopGeometry(){const e=[.6,.6,.65],n=[.95,.95,.98],s=[.9,.45,.1],r=[],t=(L,T,R)=>{const[w,g,M]=L,[E,F,y]=T,z=[[[E,g,M],[E,g,y],[E,F,y],[E,g,M],[E,F,y],[E,F,M]],[[w,g,M],[w,F,y],[w,g,y],[w,g,M],[w,F,M],[w,F,y]],[[w,F,M],[E,F,y],[E,F,M],[w,F,M],[w,F,y],[E,F,y]],[[w,g,M],[E,g,M],[E,g,y],[w,g,M],[E,g,y],[w,g,y]],[[w,g,y],[w,F,y],[E,F,y],[w,g,y],[E,F,y],[E,g,y]],[[w,g,M],[E,F,M],[w,F,M],[w,g,M],[E,g,M],[E,F,M]]];for(const O of z)for(const k of O)r.push(k[0],k[1],k[2],R[0],R[1],R[2])},i=(L,T,R,w,g=24)=>{const M=G.backboardZ+.025+.002;for(let E=0;E<g;E++){const F=E/g*Math.PI*2,y=(E+1)/g*Math.PI*2,z=Math.cos(F),O=Math.sin(F),k=Math.cos(y),Y=Math.sin(y),W=L[0]+z*T;let N=L[2]+O*T;const q=L[0]+z*R;let j=L[2]+O*R;const K=L[0]+k*T;let $=L[2]+Y*T;const at=L[0]+k*R;let H=L[2]+Y*R;N<M&&(N=M),j<M&&(j=M),$<M&&($=M),H<M&&(H=M),r.push(W,w,N,...s),r.push(K,w,$,...s),r.push(at,w,H,...s),r.push(W,w,N,...s),r.push(at,w,H,...s),r.push(q,w,j,...s)}},a=G.center[0],h=G.baselineZ,l=G.backboardZ,f=G.hoopCenter[1],v=G.hoopCenter[2],u=.18,d=.18,c=3.4,b=h-.8-d/2;t([a-u/2,0,b-d/2],[a+u/2,c,b+d/2],e);const A=1.829,x=1.067,_=.05,B=f+.305;{const L=a-A/2,T=a+A/2,R=B-x/2,w=B+x/2,g=l-_/2,E=l+_/2-.002;(function(){const F=[[T,R,g],[T,R,E],[T,w,E],[T,R,g],[T,w,E],[T,w,g]];for(const y of F)r.push(y[0],y[1],y[2],...n)})(),function(){const F=[[L,R,g],[L,w,E],[L,R,E],[L,R,g],[L,w,g],[L,w,E]];for(const y of F)r.push(y[0],y[1],y[2],...n)}(),function(){const F=[[L,w,g],[T,w,E],[T,w,g],[L,w,g],[L,w,E],[T,w,E]];for(const y of F)r.push(y[0],y[1],y[2],...n)}(),function(){const F=[[L,R,g],[T,R,g],[T,R,E],[L,R,g],[T,R,E],[L,R,E]];for(const y of F)r.push(y[0],y[1],y[2],...n)}(),function(){const F=[[L,R,g],[T,w,g],[L,w,g],[L,R,g],[T,R,g],[T,w,g]];for(const y of F)r.push(y[0],y[1],y[2],...n)}()}const D=.1,P=.08,V=b+d/2,C=l-_/2;t([a-D/2,f+.2-P/2,V],[a+D/2,f+.2+P/2,C],e),t([a-D/2,f-.2-P/2,V],[a+D/2,f-.2+P/2,C],e);const I=.35,p=.08;return t([a-I-p/2,f-.2,C-.1],[a-I+p/2,f+.2,C+.02],e),t([a+I-p/2,f-.2,C-.1],[a+I+p/2,f+.2,C+.02],e),i([a,f,v],.205,.255,f),new Float32Array(r)}buildPlayerCapsule(e,n,s){const t=[],i=e[1],a=e[1]+s;for(let h=0;h<16;h++){const l=h/16*Math.PI*2,f=(h+1)/16*Math.PI*2,v=e[0]+Math.cos(l)*n,u=e[2]+Math.sin(l)*n,d=e[0]+Math.cos(f)*n,c=e[2]+Math.sin(f)*n;t.push(v,i,u,d,i,c,d,a,c),t.push(v,i,u,d,a,c,v,a,u)}for(let h=0;h<16;h++){const l=h/16*Math.PI*2,f=(h+1)/16*Math.PI*2,v=e[0]+Math.cos(l)*n,u=e[2]+Math.sin(l)*n,d=e[0]+Math.cos(f)*n,c=e[2]+Math.sin(f)*n;t.push(e[0],i,e[2],d,i,c,v,i,u)}for(let h=0;h<16;h++){const l=h/16*Math.PI*2,f=(h+1)/16*Math.PI*2,v=e[0]+Math.cos(l)*n,u=e[2]+Math.sin(l)*n,d=e[0]+Math.cos(f)*n,c=e[2]+Math.sin(f)*n;t.push(e[0],a,e[2],v,a,u,d,a,c)}return new Float32Array(t)}}function ae(o,e,n,s){const r=o[0],t=o[1]+e,i=o[1]+Math.max(e,n-e),a=o[2],h=mt(r,s.min[0],s.max[0]),l=mt(a,s.min[2],s.max[2]);let f=0;i<s.min[1]?f=s.min[1]-i:t>s.max[1]?f=t-s.max[1]:f=0;const v=r-h,u=a-l,d=v*v+u*u,c=Math.sqrt(d+f*f);if(c>=e||c===0)return null;const b=e-c,A=v/(c||1),x=f/(c||1),_=u/(c||1);return{correction:[A*b,x*b,_*b],normal:[A,x,_]}}function mt(o,e,n){return Math.max(e,Math.min(n,o))}class ce{constructor(){m(this,"pos",[0,0,5]);m(this,"vel",[0,0,0]);m(this,"eyeHeight",1.6);m(this,"grounded",!1);m(this,"radius",.35);m(this,"moveSpeed",6);m(this,"accel",40);m(this,"friction",10);m(this,"jumpSpeed",5);m(this,"gravity",9.81)}update(e,n,s,r){const t=Math.sin(s),i=Math.cos(s),a=t,h=-i,l=i,f=t;let v=0,u=0;(n.isDown("KeyW")||n.isDown("ArrowUp"))&&(v+=a,u+=h),(n.isDown("KeyS")||n.isDown("ArrowDown"))&&(v-=a,u-=h),(n.isDown("KeyD")||n.isDown("ArrowRight"))&&(v+=l,u+=f),(n.isDown("KeyA")||n.isDown("ArrowLeft"))&&(v-=l,u-=f);const d=Math.hypot(v,u);d>0&&(v/=d,u/=d);const c=v*this.moveSpeed,b=u*this.moveSpeed,A=c-this.vel[0],x=b-this.vel[2],_=this.accel*e,B=Math.hypot(A,x);if(B>0){const P=Math.min(1,_/B);this.vel[0]+=A*P,this.vel[2]+=x*P}if(this.grounded&&d===0){const P=Math.hypot(this.vel[0],this.vel[2]),V=Math.min(P,this.friction*e*P);if(P>1e-5){const I=(P-V)/P;this.vel[0]*=I,this.vel[2]*=I}else this.vel[0]=0,this.vel[2]=0}this.grounded&&n.isDown("Space")&&(this.vel[1]=this.jumpSpeed,this.grounded=!1),this.grounded||(this.vel[1]-=this.gravity*e),this.pos[0]+=this.vel[0]*e,this.pos[1]+=this.vel[1]*e,this.pos[2]+=this.vel[2]*e;const D=rt(this.pos[0],this.pos[2]);this.pos[1]<D?(this.pos[1]=D,this.vel[1]<0&&(this.vel[1]=0),this.grounded=!0):this.pos[1]-D<=.05&&this.vel[1]<=0?(this.pos[1]=D,this.vel[1]=0,this.grounded=!0):this.grounded=!1;for(const P of r){const V=ae(this.pos,this.radius,this.eyeHeight,P);if(V){const[C,I,p]=V.correction;this.pos[0]+=C,this.pos[1]+=I,this.pos[2]+=p;const S=this.vel[0]*V.normal[0]+this.vel[1]*V.normal[1]+this.vel[2]*V.normal[2];S<0&&(this.vel[0]-=V.normal[0]*S,this.vel[1]-=V.normal[1]*S,this.vel[2]-=V.normal[2]*S),V.normal[1]>.5&&(this.grounded=!0)}}}}const he=[{min:[-1,-1,-1],max:[1,1,1]},(()=>{const o=G.center[0],e=G.baselineZ,n=.18,s=.18,r=3.4,t=e-.8,i=[o-n/2,0,t-s/2],a=[o+n/2,r,t+s/2];return{min:i,max:a}})(),(()=>{const o=G.center[0],e=G.backboardZ,n=1.829,s=1.067,r=.05,i=G.hoopCenter[1]+.305,a=[o-n/2,i-s/2,e-r/2],h=[o+n/2,i+s/2,e+r/2];return{min:a,max:h}})()];class le{constructor(e){m(this,"cols");m(this,"rows");m(this,"length");m(this,"nodeRadius");m(this,"positions");m(this,"prev");m(this,"anchors");m(this,"restVert");m(this,"restRing");m(this,"gravity",9.81);m(this,"damping",.99);m(this,"iterations",3);m(this,"stiffness",.2);m(this,"ringStiffness",.1);const n={cols:18,rows:12,length:.55,attachRadius:.255,bottomRadius:.14,nodeRadius:.012,...e};this.cols=n.cols,this.rows=n.rows,this.length=n.length,this.nodeRadius=n.nodeRadius,this.restVert=n.length/(this.rows-1);const s=this.cols*this.rows;this.positions=new Float32Array(s*3),this.prev=new Float32Array(s*3),this.anchors=new Float32Array(this.cols*3),this.restRing=new Float32Array(this.rows);for(let a=0;a<this.rows;a++){const h=a/(this.rows-1);this.restRing[a]=ue(n.attachRadius*.98,n.bottomRadius,h)}const[r,t,i]=G.hoopCenter;for(let a=0;a<this.cols;a++){const h=a/this.cols*Math.PI*2,l=r+Math.cos(h)*this.restRing[0];let f=i+Math.sin(h)*this.restRing[0];const v=G.backboardZ+.05/2+.003;f<v&&(f=v);const u=a*3;this.anchors[u+0]=l,this.anchors[u+1]=t,this.anchors[u+2]=f}for(let a=0;a<this.rows;a++){const h=this.restRing[a],l=t-a*this.restVert;for(let f=0;f<this.cols;f++){const v=f/this.cols*Math.PI*2,u=r+Math.cos(v)*h,d=i+Math.sin(v)*h,c=this.index(f,a)*3;this.positions[c+0]=u,this.positions[c+1]=l,this.positions[c+2]=d,this.prev[c+0]=u,this.prev[c+1]=l,this.prev[c+2]=d}}}index(e,n){return n*this.cols+(e%this.cols+this.cols)%this.cols}getPositions(){return this.positions}update(e,n){const r=e/2;for(let t=0;t<2;t++){this.integrate(r);for(let i=0;i<this.iterations;i++)this.satisfyConstraints(),n&&this.ballCollide(n),this.enforceAnchors();this.applyDamping()}}integrate(e){const n=this.gravity;for(let s=0;s<this.positions.length;s+=3){const r=this.positions[s],t=this.positions[s+1],i=this.positions[s+2],a=this.prev[s],h=this.prev[s+1],l=this.prev[s+2],f=r-a,v=t-h,u=i-l;this.prev[s]=r,this.prev[s+1]=t,this.prev[s+2]=i,this.positions[s]=r+f,this.positions[s+1]=t+v-n*e*e,this.positions[s+2]=i+u}}satisfyConstraints(){for(let e=0;e<this.rows-1;e++)for(let n=0;n<this.cols;n++)this.enforceDistance(this.index(n,e),this.index(n,e+1),this.restVert,this.stiffness);for(let e=0;e<this.rows;e++){const n=this.restRing[e];for(let s=0;s<this.cols;s++)this.enforceDistance(this.index(s,e),this.index(s+1,e),2*n*Math.sin(Math.PI/this.cols),this.ringStiffness),e<this.rows-1&&this.enforceDistance(this.index(s,e),this.index(s+1,e+1),Math.sqrt(this.restVert*this.restVert+(2*this.restRingAvg(e,e+1)*Math.sin(Math.PI/this.cols))**2),.4)}}restRingAvg(e,n){return(this.restRing[e]+this.restRing[n])*.5}enforceDistance(e,n,s,r=.5){const t=this.positions,i=e*3,a=n*3,h=t[i],l=t[i+1],f=t[i+2],v=t[a],u=t[a+1],d=t[a+2];let c=v-h,b=u-l,A=d-f;const x=Math.hypot(c,b,A)||1,_=(x-s)/x,B=Math.min(Math.max(r,0),.5),D=c*B*_,P=b*B*_,V=A*B*_;t[i]+=D,t[i+1]+=P,t[i+2]+=V,t[a]-=D,t[a+1]-=P,t[a+2]-=V}enforceAnchors(){for(let e=0;e<this.cols;e++){const n=this.index(e,0)*3,s=e*3;this.positions[n+0]=this.anchors[s+0],this.positions[n+1]=this.anchors[s+1],this.positions[n+2]=this.anchors[s+2],this.prev[n+0]=this.anchors[s+0],this.prev[n+1]=this.anchors[s+1],this.prev[n+2]=this.anchors[s+2]}}applyDamping(){for(let e=0;e<this.positions.length;e+=3){const n=this.positions[e]-this.prev[e],s=this.positions[e+1]-this.prev[e+1],r=this.positions[e+2]-this.prev[e+2];this.prev[e]=this.positions[e]-n*this.damping,this.prev[e+1]=this.positions[e+1]-s*this.damping,this.prev[e+2]=this.positions[e+2]-r*this.damping}}ballCollide(e){const n=e.radius,s=this.positions,r=this.nodeRadius,t=n+r,i=t*t,a=.08;for(let h=0;h<s.length;h+=3){const l=e.pos[0]-s[h],f=e.pos[1]-s[h+1],v=e.pos[2]-s[h+2],u=l*l+f*f+v*v;if(u<i){const d=Math.sqrt(u)||1,c=l/d,b=f/d,A=v/d,x=t-d,_=.95,B=.25;s[h]-=c*x*_*.15,s[h+1]-=b*x*B*.15,s[h+2]-=A*x*_*.15,e.pos[0]+=c*x*_*.95,e.pos[1]+=b*x*B*.95,e.pos[2]+=A*x*_*.95;const D=e.vel[0]*c+e.vel[1]*b+e.vel[2]*A;if(D<0){const P=(1+a)*D;e.vel[0]-=P*c,e.vel[1]-=P*b,e.vel[2]-=P*A,e.vel[1]>0&&(e.vel[1]*=.2),e.vel[0]*=.997,e.vel[2]*=.997}}}}}function ue(o,e,n){return o+(e-o)*n}function fe(o,e=.3){const s=G.backboardZ+.025,r=.03;if(o.pos[2]-o.radius<s+r){const i=s+r+o.radius-o.pos[2];i>0&&(o.pos[2]+=i,o.vel[2]<0&&(o.vel[2]=-o.vel[2]*e),o.vel[0]*=.75,o.vel[1]*=.75)}}function de(o,e=.2){const t=G.hoopCenter[0],i=G.hoopCenter[1],a=G.hoopCenter[2],h=o.radius+.012,l=h*h;for(let f=0;f<24;f++){const v=f/24*Math.PI*2,u=t+Math.cos(v)*.23,d=a+Math.sin(v)*.23,c=o.pos[0]-u,b=o.pos[1]-i,A=o.pos[2]-d,x=c*c+b*b+A*A;if(x<l){const _=Math.sqrt(x)||1,B=c/_,D=b/_,P=A/_,V=h-_;o.pos[0]+=B*V,o.pos[1]+=D*V,o.pos[2]+=P*V;const C=o.vel[0]*B+o.vel[1]*D+o.vel[2]*P;C<0&&(o.vel[0]-=(1+e)*C*B,o.vel[1]-=(1+e)*C*D,o.vel[2]-=(1+e)*C*P,o.vel[0]*=.98,o.vel[1]*=.98,o.vel[2]*=.98);break}}}class me{constructor(e){m(this,"pos");m(this,"vel");m(this,"radius");m(this,"inHand",!1);m(this,"rot",new Float32Array([1,0,0,0,1,0,0,0,1]));m(this,"angVel",[0,0,0]);m(this,"gravity",9.81);this.radius=(e==null?void 0:e.radius)??.12,this.pos=e!=null&&e.pos?[...e.pos]:[0,2,0],this.vel=e!=null&&e.vel?[...e.vel]:[0,0,0]}reset(e){this.pos[0]=e[0],this.pos[1]=e[1],this.pos[2]=e[2],this.vel[0]=0,this.vel[1]=0,this.vel[2]=0,this.inHand=!1,this.rot.set([1,0,0,0,1,0,0,0,1]),this.angVel[0]=this.angVel[1]=this.angVel[2]=0}update(e){if(this.inHand)return;this.vel[1]-=this.gravity*e,this.pos[0]+=this.vel[0]*e,this.pos[1]+=this.vel[1]*e,this.pos[2]+=this.vel[2]*e,this.integrateRotation(e);const n=rt(this.pos[0],this.pos[2])+this.radius;this.pos[1]<n&&(this.pos[1]=n,this.vel[1]<0&&(this.vel[1]=-this.vel[1]*.45),this.vel[0]*=.8,this.vel[2]*=.8,Math.abs(this.vel[1])<.05&&(this.vel[1]=0),Math.hypot(this.vel[0],this.vel[2])<.02&&(this.vel[0]=0,this.vel[2]=0)),fe(this),de(this)}setInHand(e){this.inHand=e}integrateRotation(e){const n=this.angVel[0],s=this.angVel[1],r=this.angVel[2],t=Math.hypot(n,s,r);if(t<1e-4)return;const i=n/t,a=s/t,h=r/t,l=t*e,f=Math.cos(l),v=Math.sin(l),u=1-f,d=[u*i*i+f,u*i*a-v*h,u*i*h+v*a,u*i*a+v*h,u*a*a+f,u*a*h-v*i,u*i*h-v*a,u*a*h+v*i,u*h*h+f],c=this.rot,b=c[0],A=c[1],x=c[2],_=c[3],B=c[4],D=c[5],P=c[6],V=c[7],C=c[8],I=d[0],p=d[1],S=d[2],U=d[3],L=d[4],T=d[5],R=d[6],w=d[7],g=d[8];this.rot[0]=b*I+A*U+x*R,this.rot[1]=b*p+A*L+x*w,this.rot[2]=b*S+A*T+x*g,this.rot[3]=_*I+B*U+D*R,this.rot[4]=_*p+B*L+D*w,this.rot[5]=_*S+B*T+D*g,this.rot[6]=P*I+V*U+C*R,this.rot[7]=P*p+V*L+C*w,this.rot[8]=P*S+V*T+C*g;const M=Math.pow(.98,e*60);this.angVel[0]*=M,this.angVel[1]*=M,this.angVel[2]*=M}getRotationMatrix3(){return this.rot}}class pe{constructor(){m(this,"particles",[]);m(this,"gravity",9.81)}spawnBurst(e,n=100){for(let s=0;s<n;s++){const r=ve(),t=2+Math.random()*4;r[1]*=.6;const i=[r[0]*t,r[1]*t+2,r[2]*t],a=be(),h=1.2+Math.random()*.8;this.particles.push({p:[...e],v:i,c:a,t:0,ttl:h})}}update(e){const s=[];for(let r=0;r<this.particles.length;r++){const t=this.particles[r];t.v[1]-=this.gravity*e*.6,t.v[0]*=.995,t.v[1]*=.995,t.v[2]*=.995,t.p[0]+=t.v[0]*e,t.p[1]+=t.v[1]*e,t.p[2]+=t.v[2]*e,t.t+=e,t.t<t.ttl&&s.push(t)}this.particles=s}buildLineVertices(){const e=this.particles.length;if(e===0)return new Float32Array(0);const n=new Float32Array(e*2*6);let s=0;const r=.03;for(let t=0;t<e;t++){const i=this.particles[t],a=i.p[0],h=i.p[1],l=i.p[2],f=a-i.v[0]*r,v=h-i.v[1]*r,u=l-i.v[2]*r;n[s++]=a,n[s++]=h,n[s++]=l,n[s++]=i.c[0],n[s++]=i.c[1],n[s++]=i.c[2],n[s++]=f,n[s++]=v,n[s++]=u,n[s++]=i.c[0],n[s++]=i.c[1],n[s++]=i.c[2]}return n}forEach(e){for(const n of this.particles)e(n.p,n.c)}}function ve(o){const e=Math.random(),n=Math.random(),s=2*Math.PI*e,r=Math.sqrt(n),t=r*Math.cos(s),i=r*Math.sin(s),a=Math.sqrt(Math.max(0,1-r*r));return[t,a,i]}function be(){const o=[[.95,.3,.3],[.25,.65,.95],[.25,.85,.45],[.98,.85,.25],[.85,.4,.95],[.98,.55,.15]];return o[Math.random()*o.length|0]}class Ae{constructor(e){m(this,"gl");m(this,"loop");m(this,"inputs");m(this,"width",0);m(this,"height",0);m(this,"camera");m(this,"renderer");m(this,"player");m(this,"net");m(this,"ball");m(this,"showArc",!1);m(this,"aimStart",null);m(this,"aimVel",null);m(this,"confetti",new pe);m(this,"lastBallY",0);m(this,"lastBallTopY",0);m(this,"scoreCooldown",0);m(this,"enteredCylinderFromAbove",!1);m(this,"score",0);m(this,"scoreEl",document.getElementById("score"));this.canvas=e;const s=e.getContext("webgl2",{antialias:!0})??e.getContext("webgl",{antialias:!0});if(!s)throw new Error("WebGL not supported");this.gl=s,this.inputs=new xt(e),this.loop=new _t({fixedHz:60,update:r=>this.update(r),render:r=>this.render(r)}),this.handleResize(),this.camera=new yt(this.width/this.height),this.renderer=new it(this.gl),this.player=new ce,this.net=new le,this.ball=new me({pos:[G.center[0]+1.5,G.y+.15,G.center[2]-3]}),window.addEventListener("resize",()=>this.handleResize()),e.addEventListener("click",()=>{document.pointerLockElement!==e&&e.requestPointerLock()}),document.addEventListener("pointerlockchange",()=>{document.body.classList.toggle("locked",document.pointerLockElement===e)}),this.scoreEl=document.getElementById("score"),this.scoreEl&&(this.scoreEl.textContent=String(this.score))}start(){this.loop.start()}handleResize(){const e=Math.min(window.devicePixelRatio||1,2),n=Math.floor(window.innerWidth*e),s=Math.floor(window.innerHeight*e);(n!==this.width||s!==this.height)&&(this.width=n,this.height=s,this.canvas.width=n,this.canvas.height=s,this.canvas.style.width=`${Math.floor(n/e)}px`,this.canvas.style.height=`${Math.floor(s/e)}px`,this.gl.viewport(0,0,n,s),this.camera&&this.camera.setAspect(n/s))}update(e){if(this.inputs.update(),this.inputs.isLocked()){const{dx:n,dy:s}=this.inputs.consumeMouseDelta(),r=.0025;(n!==0||s!==0)&&this.camera.addYawPitch(n*r,-s*r)}this.player.update(e,this.inputs,this.camera.yaw,he),this.camera.position[0]=this.player.pos[0],this.camera.position[1]=this.player.pos[1]+this.player.eyeHeight,this.camera.position[2]=this.player.pos[2],this.camera.sync(),this.updateBall(e),this.ball.inHand?this.net.update(e):this.net.update(e,this.ball),this.confetti.update(e),this.detectScore(e),this.inputs.endFrame()}render(e){const n=this.gl;n.enable(n.DEPTH_TEST),n.clearColor(.05,.07,.1,1),n.clear(n.COLOR_BUFFER_BIT|n.DEPTH_BUFFER_BIT),this.renderer.syncNet(this.net,this.camera.position),this.renderer.render(this.camera.getView(),this.camera.getProj(),this.camera.position,{pos:this.player.pos,radius:this.player.radius,height:this.player.eyeHeight});const s=this.camera.getViewProj();if(this.ball.inHand){const r=this.heldBallWorldPos();if(this.renderer.renderBasketball(s,r,this.ball.radius,this.ball.getRotationMatrix3()),this.showArc&&this.aimStart&&this.aimVel){const t=this.computeTrajectoryPoints(this.aimStart,this.aimVel);this.renderer.renderLineStrip(s,t,[.2,.85,1])}}else this.renderer.renderBasketball(s,this.ball.pos,this.ball.radius,this.ball.getRotationMatrix3());this.confetti.forEach((r,t)=>{this.renderer.renderSphere(s,r,.03,t)})}updateBall(e){const n=this.ball;if(!n.inHand){const s=this.player.pos[0]-n.pos[0],r=this.player.pos[1]+this.player.eyeHeight*.5-n.pos[1],t=this.player.pos[2]-n.pos[2];Math.hypot(s,r,t)<.8&&n.setInHand(!0)}if(n.inHand){const s=this.heldBallWorldPos();if(n.pos[0]=s[0],n.pos[1]=s[1],n.pos[2]=s[2],n.vel[0]=0,n.vel[1]=0,n.vel[2]=0,n.angVel[0]=0,n.angVel[1]=0,n.angVel[2]=0,this.showArc=this.inputs.isMouseDown(0),this.showArc&&(this.aimStart=this.heldBallWorldPos(),this.aimVel=this.throwVelocity()),this.inputs.wasMouseReleased(0)){const r=this.aimStart??this.heldBallWorldPos(),t=this.aimVel??this.throwVelocity();n.setInHand(!1),n.pos[0]=r[0],n.pos[1]=r[1],n.pos[2]=r[2],n.vel[0]=t[0],n.vel[1]=t[1],n.vel[2]=t[2];const i=Math.cos(this.camera.yaw),a=Math.sin(this.camera.yaw),h=[i,0,a],l=12;n.angVel[0]=h[0]*l,n.angVel[1]=h[1]*l,n.angVel[2]=h[2]*l,this.showArc=!1,this.aimStart=null,this.aimVel=null}}else n.update(e)}heldBallWorldPos(){const e=Math.cos(this.camera.pitch),n=Math.sin(this.camera.pitch),s=Math.cos(this.camera.yaw),r=Math.sin(this.camera.yaw),t=[e*r,n,-e*s],i=[s,0,r],a=[0,1,0],h=.45,l=.28,f=-.22,v=this.camera.position[0],u=this.camera.position[1],d=this.camera.position[2];return[v+t[0]*h+i[0]*l+a[0]*f,u+t[1]*h+i[1]*l+a[1]*f,d+t[2]*h+i[2]*l+a[2]*f]}throwVelocity(){const n=Math.cos(this.camera.pitch),s=Math.sin(this.camera.pitch),r=Math.cos(this.camera.yaw),t=Math.sin(this.camera.yaw),i=[n*t,s+.05,-n*r],a=Math.hypot(i[0],i[1],i[2])||1;return i[0]/=a,i[1]/=a,i[2]/=a,[i[0]*9,i[1]*9,i[2]*9]}computeTrajectoryPoints(e,n){const r=[];for(let a=0;a<40;a++){const h=a*.05,l=e[0]+n[0]*h,f=e[1]+n[1]*h-.5*9.81*h*h,v=e[2]+n[2]*h;r.push(l,f,v)}return r}detectScore(e){if(this.scoreCooldown>0&&(this.scoreCooldown-=e),this.ball.inHand){this.lastBallY=this.ball.pos[1],this.enteredCylinderFromAbove=!1;return}const n=G.hoopCenter[0],s=G.hoopCenter[2],r=G.hoopCenter[1],t=this.ball,i=t.pos[0]-n,a=t.pos[2]-s,h=Math.hypot(i,a),l=.205,f=t.radius*.35,v=h<l-f,u=t.pos[1]+t.radius,d=t.pos[1]-t.radius,c=.01,b=.02;v&&u>r+c&&(this.enteredCylinderFromAbove=!0),this.enteredCylinderFromAbove&&u<r-b&&this.scoreCooldown<=0&&(this.confetti.spawnBurst([n,r-.05,s],160),this.scoreCooldown=.75,this.incrementScore(1),this.enteredCylinderFromAbove=!1),(!v||u<r-.05||u>r+.5)&&d<r-.05&&(this.enteredCylinderFromAbove=!1),this.lastBallY=t.pos[1],this.lastBallTopY=u}incrementScore(e){this.score+=e,this.scoreEl&&(this.scoreEl.textContent=String(this.score))}}function pt(){const o=document.getElementById("scene");if(!o)throw new Error("Canvas #scene not found");new Ae(o).start()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",pt):pt();
