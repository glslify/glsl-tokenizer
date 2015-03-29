@class Thing {
  vec4 Thing(Light a) {
    return vec4(1.0);
  }

  string y() {
    return 'hello world'
  }
}


Thing x = new Thing();
x.y();

void main() {
  gl_FragColor = vec4(1.0);
}
