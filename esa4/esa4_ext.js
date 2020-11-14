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

// // Depth(Z)-Buffer.
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);

// Polygon offset of rastered Fragments.
gl.enable(gl.POLYGON_OFFSET_FILL);
gl.polygonOffset(1.0, 1.0);

// Compile vertex shader.
const vsSource = ''
  + 'attribute vec3 pos;'
  + 'attribute vec4 col;'
  + 'varying vec4 color;'
  + 'void main(){'
  + 'color = col;'
  + 'gl_Position = vec4(pos * 0.3, 1);'
  + '}';

const vs = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vs, vsSource);
gl.compileShader(vs);

// Compile fragment shader.
const fsSouce = 'precision mediump float;'
  + 'varying vec4 color;'
  + 'void main() {'
  + 'gl_FragColor = color;'
  + '}';

const fs = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fs, fsSouce);
gl.compileShader(fs);

// Link shader together into a program.

const prog = gl.createProgram();
gl.attachShader(prog, vs);
gl.attachShader(prog, fs);
gl.bindAttribLocation(prog, 0, 'pos');
gl.linkProgram(prog);
gl.useProgram(prog);

const {
  vertices, indicesLines, indicesTriangles,
} = createSnailSurfaceVertexData();

// Setup position vertex buffer object.
const vboPos = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vboPos);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// Bind vertex buffer to attribute variable.
const posAttrib = gl.getAttribLocation(prog, 'pos');
gl.vertexAttribPointer(posAttrib, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(posAttrib);

// Setup constant color.
const colAttrib = gl.getAttribLocation(prog, 'col');

// Setup lines index buffer object.
const iboLines = createIBO(indicesLines);

// Setup tris index buffer object.
const iboTriangles = createIBO(indicesTriangles);

// Clear framebuffer and render primitives.
// eslint-disable-next-line no-bitwise
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

const linesColor = {
  r: 0, g: 1, b: 0, a: 1,
};

const trianglesColor = {
  r: 0.5, g: 0.5, b: 0.5, a: 1,
};

setupIboRendering(colAttrib, iboTriangles, gl.TRIANGLES, trianglesColor);
setupIboRendering(colAttrib, iboLines, gl.LINES, linesColor);

function createSnailSurfaceVertexData() {
  const _vertices = [];
  const _indicesLines = [];
  const _indicesTriangles = [];

  const m = 64;
  const n = 64;

  const rangeU = { min: (-Math.PI), max: (Math.PI) };
  const rangeV = { min: (-Math.PI), max: (Math.PI) };

  const du = (rangeU.max - rangeU.min) / n;
  const dv = (rangeV.max - rangeV.min) / m;

  // Counter for entries in index array.
  let counterLines = 0;
  let counterTriangles = 0;

  for (let u = rangeU.min, i = 0; i <= n; i++, u += du) {
    for (let v = rangeV.min, j = 0; j <= m; j++, v += dv) {
      const iVertex = i * (m + 1) + j;

      // Snail Surface
      const x = (2 * Math.cos(3 * u)) / (2 + Math.sin(v));
      const y = (2 * (Math.cos(u) + 2 * Math.cos(2 * u))) / (2 + Math.cos(v + ((2 * Math.PI) / 3)));
      const z = (Math.cos(u) - 2 * Math.cos(2 * u)) * (2 + Math.cos(v)) * (2 + Math.cos(v + ((2 * Math.PI) / 3) / 4));

      // Set vertex positions.
      _vertices[iVertex * 3] = x;
      _vertices[iVertex * 3 + 1] = y;
      _vertices[iVertex * 3 + 2] = z;

      // Set index.
      // Line on beam.
      if (j > 0 && i > 0) {
        _indicesLines[counterLines++] = iVertex - 1;
        _indicesLines[counterLines++] = iVertex;
      }

      // Line on ring.
      if (j > 0 && i > 0) {
        _indicesLines[counterLines++] = iVertex - (m + 1);
        _indicesLines[counterLines++] = iVertex;
      }

      // Set index.
      // Two Triangles.

      if (j > 0 && i > 0) {
        _indicesTriangles[counterTriangles++] = iVertex;
        _indicesTriangles[counterTriangles++] = iVertex - 1;
        _indicesTriangles[counterTriangles++] = iVertex - (m + 1);

        _indicesTriangles[counterTriangles++] = iVertex - 1;
        _indicesTriangles[counterTriangles++] = iVertex - (m + 1) - 1;
        _indicesTriangles[counterTriangles++] = iVertex - (m + 1);
      }
    }
  }

  return {
    vertices: new Float32Array(_vertices),
    indicesLines: new Uint16Array(_indicesLines),
    indicesTriangles: new Uint16Array(_indicesTriangles),
  };
}

function setupIboRendering(colorAttribute, ibo, renderingType, color) {
  const {
    r, g, b, a,
  } = color;

  // eslint-disable-next-line no-restricted-globals,max-len
  if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a) || ![gl.TRIANGLES, gl.LINES].includes(renderingType)) {
    console.error('Pay attention to the rendering attributes', color, renderingType);
    return;
  }

  gl.vertexAttrib4f(colorAttribute, r, g, b, a);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.drawElements(renderingType, ibo.numberOfElements, gl.UNSIGNED_SHORT, 0);
}

function createIBO(indices) {
  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  ibo.numberOfElements = indices.length;
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  return ibo;
}
