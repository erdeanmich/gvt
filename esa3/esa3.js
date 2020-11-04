// Get the WebGL context

let canvas = document.getElementById('canvas');

// set canvas resolution according to css properties
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

let gl = canvas.getContext('experimental-webgl');


// Pipeline setup
gl.clearColor(0, 0, 0, 1);
//Backface culling
gl.frontFace(gl.CCW);
gl.enable(gl.CULL_FACE);
gl.cullFace(gl.BACK);


// Compile a vertex shader
let vsSource = 'attribute vec2 pos;'+
    'void main(){gl_Position = vec4(pos, 0, 1); }';
let vs = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vs, vsSource);
gl.compileShader(vs);

// Compile a fragment shader
fsSouce =  'void main() { gl_FragColor = vec4(1, 1, 1, 1); }';
let fs = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fs, fsSouce);
gl.compileShader(fs);

// Link together into a program
let prog = gl.createProgram();
gl.attachShader(prog, vs);
gl.attachShader(prog, fs);
gl.linkProgram(prog);
gl.useProgram(prog);

// Load vertex data into a buffer
let vertices = new Float32Array([
    0, -0.5, // blade middle line
    0, 1,
    -0.1, 0.9, // blade left side
    -0.1, -0.5,
    0.1, 0.9, // blade right side
    0.1, -0.5,
    0.1, 0.9, // blade tip right side
    0, 1,
    -0.1, 0.9, // blade tip left side
    0, 1,
    -0.1, -0.5, // blade bottom
    0.1, -0.5,
    -0.3, -0.6, // handle bottom
    0.3, -0.6,
    -0.3, -0.6, // handle left side
    -0.3, -0.4,
    0.3, -0.6, // handle left side
    0.3, -0.4,
    -0.3, -0.4, // handle left side tip
    -0.2, -0.5,
    0.3, -0.4, // handle right side tip
    0.2, -0.5,
    -0.2, -0.5, // handle top left
    -0.1, -0.5,
    0.2, -0.5, // handle top right
    0.1, -0.5,
    -0.1, -0.6, // grip outer left
    -0.1, -0.9,
    0.1, -0.6, // grip outer right
    0.1, -0.9,
    0.1, -0.9, //grip tip right
    0, -1,
    -0.1, -0.9, //grip tip left
    0, -1,
    -0.1, -0.9, //grip bottom
    0.1, -0.9,
    0.1, -0.9, //grip diagonal bottom
    -0.1, -0.8,
    0.1, -0.8, //grip middle bottom
    -0.1, -0.7,
    0.1, -0.7, //grip top bottom
    -0.1, -0.6
]);
let vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// Bind vertex buffer to attribute variable
let posAttrib = gl.getAttribLocation(prog, 'pos');
gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(posAttrib);

// Clear framebuffer and render primitives
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.LINES, 0, vertices.length/2);