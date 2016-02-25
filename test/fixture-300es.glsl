#version 300 es
out vec4 fragColor;
in vec2 uv;
uniform usampler2DArray uSampler;

void main () {
  vec4 gl_FragColor = vec4(1.0); // not a builtin!
  fragColor = textureLod(uSampler, uv, 0.0);
}
