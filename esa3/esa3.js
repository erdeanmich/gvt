function createColors(triangles) {
  const yellow = [0.92, 0.84, 0.2, 1];
  const red = [0.66, 0.13, 0.05, 1];
  const green = [0.12, 0.13, 0.81, 1];
  const colorsTemp = [];

  for (let i = 0; i < triangles - 4; i++) {
    for (let j = 0; j < 3; j++) {
      yellow.forEach((y) => colorsTemp.push(y));
    }
  }

  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 3; j++) {
      red.forEach((y) => colorsTemp.push(y));
    }
  }

  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 3; j++) {
      green.forEach((y) => colorsTemp.push(y));
    }
  }

  return new Float32Array(colorsTemp);
}

function createVertices() {
// pay attention to the winding order --> only counter clock wise will be front facing
  return new Float32Array([
    -1, 0.2,
    -0.8, -0.6,
    -0.4, -0.1,

    -0.8, -0.6,
    0, -0.6,
    -0.4, -0.1,

    -0.4, -0.1,
    0.4, -0.1,
    0, 0.4,

    -0.4, -0.1,
    0, -0.6,
    0.4, -0.1,

    0, -0.6,
    0.8, -0.6,
    0.4, -0.1,

    0.4, -0.1,
    0.8, -0.6,
    1, 0.2,

    0, 0.4,
    0.1, 0.5,
    0, 0.6,

    0, 0.4,
    0, 0.6,
    -0.1, 0.5,

    0, -0.3,
    0.2, -0.1,
    0, 0.1,

    0, -0.3,
    0, 0.1,
    -0.2, -0.1,

  ]);
}

// Get the WebGL context
const canvas = document.getElementById('canvas');

// set canvas resolution according to css properties
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const gl = canvas.getContext('experimental-webgl');

// Pipeline setup
gl.clearColor(0, 0, 0, 1);
// Backface culling
gl.frontFace(gl.CCW);
gl.enable(gl.CULL_FACE);
gl.cullFace(gl.BACK);

// Compile a vertex shader
const vsSource = ''
  + 'attribute vec2 pos;'
  + 'attribute vec4 col;'
  + 'varying vec4 color;'
  + 'void main(){'
  + 'color = col;'
  + 'gl_Position = vec4(pos, 0, 1); '
  + '}';
const vs = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vs, vsSource);
gl.compileShader(vs);

// Compile a fragment shader
const fsSource = ''
  + 'precision mediump float;'
  + 'varying vec4 color;'
  + 'void main() {'
  + ' gl_FragColor = color; '
  + '}';
const fs = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fs, fsSource);
gl.compileShader(fs);

// Link together into a program
const prog = gl.createProgram();
gl.attachShader(prog, vs);
gl.attachShader(prog, fs);
gl.linkProgram(prog);
gl.useProgram(prog);

const vertices = createVertices();

const vertexCount = vertices.length / 2;
const triangleCount = vertexCount / 3;

const colors = createColors(triangleCount);

// setup position vbo
const posVbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, posVbo);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// setup position attribute variable
const posAttrib = gl.getAttribLocation(prog, 'pos');
gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(posAttrib);

// setup color vbo
const colorVbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorVbo);
gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

// setup color attribute variable
const colorAttrib = gl.getAttribLocation(prog, 'col');
gl.vertexAttribPointer(colorAttrib, 4, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(colorAttrib);

// Clear framebuffer and render primitives
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
