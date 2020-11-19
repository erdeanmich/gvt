import { mat4 } from './ext/index.js';
import { torus } from './torus.js';
import { plane } from './plane.js';
import { coneLeft } from './coneLeft.js';
import { coneRight } from './coneRight.js';
import { sphere } from './sphere.js';

window.onload = () => {
  app.start();
};

// eslint-disable-next-line no-var,no-unused-vars
const app = ((() => {
  let gl;

  // The shader program object is also used to
  // store attribute and uniform locations.
  let prog;

  // Array of model objects.
  let models = [];
  const deltaRotate = Math.PI / 36;
  const deltaTranslate = 0.05;

  const camera = {

    // Initial position of the camera.
    eye: [0, 1, 4],

    // Point to look at.
    center: [0, 0, 0],

    // Roll and pitch of the camera.
    up: [0, 1, 0],

    // Opening angle given in radian.
    // radian = degree*2*PI/360.
    fovy: (60.0 * Math.PI) / 180,

    // Camera near plane dimensions:
    // value for left right top bottom in projection.
    lrtb: 2.0,

    // View matrix.
    vMatrix: mat4.create(),

    // Projection matrix.
    pMatrix: mat4.create(),

    // Projection types: ortho, perspective, frustum.
    projectionType: 'projection',

    // Angle to Z-Axis for camera when orbiting the center
    // given in radian.
    zAngle: 0,
    yAngle: deltaRotate * 2,
    xAngle: 0,

    // Distance in XZ-Plane from center when orbiting.
    distance: 4,

  };

  function start() {
    init();
    render();
  }

  function init() {
    initWebGL();
    initShaderProgram();
    initUniforms();
    initModels();
    initEventHandler();
    initPipeline();
  }

  function initWebGL() {
    // Get canvas and WebGL context.
    const canvas = document.getElementById('canvas');
    gl = canvas.getContext('experimental-webgl');
    // set width & height according to css
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
  }

  /**
   * Init pipeline parameters that will not change again.
   * If projection or viewport change, their setup must
   * be in render function.
   */
  function initPipeline() {
    gl.clearColor(0.95, 0.95, 0.95, 1);

    // Backface culling.
    gl.frontFace(gl.CCW);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    // Depth(Z)-Buffer.
    gl.enable(gl.DEPTH_TEST);

    // Polygon offset of rastered Fragments.
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(0.5, 0);

    // Set viewport.
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

    // Init camera.
    // Set projection aspect ratio.
    camera.aspect = gl.viewportWidth / gl.viewportHeight;
  }

  function initShaderProgram() {
    // Init vertex shader.
    const vs = initShader(gl.VERTEX_SHADER, 'vertexshader');

    // Init fragment shader.
    const fs = initShader(gl.FRAGMENT_SHADER, 'fragmentshader');

    // Link shader into a shader program.
    prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.bindAttribLocation(prog, 0, 'aPosition');
    gl.linkProgram(prog);
    gl.useProgram(prog);
  }

  /**
   * Create and init shader from source.
   *
   * @parameter shaderType: openGL shader type.
   * @parameter SourceTagId: Id of HTML Tag with shader source.
   * @returns shader object.
   */

  function initShader(shaderType, SourceTagId) {
    const shader = gl.createShader(shaderType);
    const shaderSource = document.getElementById(SourceTagId).text;

    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.log(`${SourceTagId}: ${gl.getShaderInfoLog(shader)}`);
      return null;
    }

    return shader;
  }

  function initUniforms() {
    // Projection Matrix.
    prog.pMatrixUniform = gl.getUniformLocation(prog, 'uPMatrix');

    // Model-View-Matrix.
    prog.mvMatrixUniform = gl.getUniformLocation(prog, 'uMVMatrix');
  }

  function initModels() {
    // fill-style
    const fillWireframe = 'fillwireframe';
    const wireframe = 'wireframe';
    createModel(plane, wireframe);
    createModel(torus, fillWireframe);
    createModel(coneLeft, fillWireframe);
    createModel(coneRight, fillWireframe);
    createModel(sphere, fillWireframe);
  }

  /**
   * Create model object, fill it and push it in models array.
   *
   * @parameter geometry: geometry
   * @parameter fillstyle: wireframe, fill, fillwireframe.
   */

  function createModel(geometry, fillstyle) {
    const model = {};
    model.fillstyle = fillstyle;

    initDataAndBuffers(model, geometry);

    // Create and initialize Model-View-Matrix.
    model.mvMatrix = mat4.create();
    models.push(model);
  }

  /**
   * Init data and buffers for model object.
   *
   * @parameter model: a model object to augment with data.
   * @parameter geometry: geometry object

   */

  function initDataAndBuffers(model, geometry) {
    // Provide model object with vertex data arrays.
    // Fill data arrays for Vertex-Positions, Normals, Index data:
    // vertices, normals, indicesLines, indicesTris;
    // Pointer this refers to the window.
    geometry.createVertexData.apply(model);

    // Setup position vertex buffer object.

    model.vboPos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, model.vboPos);
    gl.bufferData(gl.ARRAY_BUFFER, model.vertices, gl.STATIC_DRAW);

    // Bind vertex buffer to attribute variable.
    prog.positionAttrib = gl.getAttribLocation(prog, 'aPosition');
    gl.enableVertexAttribArray(prog.positionAttrib);

    // Setup normal vertex buffer object.
    model.vboNormal = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, model.vboNormal);
    gl.bufferData(gl.ARRAY_BUFFER, model.normals, gl.STATIC_DRAW);

    // Bind buffer to attribute variable.
    prog.normalAttrib = gl.getAttribLocation(prog, 'aNormal');
    gl.enableVertexAttribArray(prog.normalAttrib);

    // Setup lines index buffer object.
    model.iboLines = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboLines);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indicesLines, gl.STATIC_DRAW);
    model.iboLines.numberOfElements = model.indicesLines.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    // Setup triangle index buffer object.
    model.iboTris = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboTris);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indicesTris, gl.STATIC_DRAW);

    model.iboTris.numberOfElements = model.indicesTris.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  }

  function initEventHandler() {
    window.onkeydown = (evt) => {
      const c = evt.key;

      if (c === 'o') {
        camera.projectionType = 'ortho';
        camera.lrtb = 2;
      }

      if (c === 'p') {
        camera.projectionType = 'projection';
      }

      if (c === 'a') {
        camera.zAngle -= deltaRotate;
      }

      if (c === 'd') {
        camera.zAngle += deltaRotate;
      }

      if (c === 'w') {
        camera.yAngle += deltaRotate;
      }

      if (c === 's') {
        camera.yAngle -= deltaRotate;
      }

      if (c === 'ArrowUp') {
        camera.eye[1] += deltaTranslate;
      }

      if (c === 'ArrowDown') {
        camera.eye[1] -= deltaTranslate;
      }

      // Render the scene again on any key pressed.
      render();
    };

    document.getElementById('tesselation-level').addEventListener('change', () => {
      models = [];
      initModels();
      render();
    });
  }

  function calculateCameraPosition() {
    const indexX = 0;
    const indexY = 1;
    const indexZ = 2;

    camera.eye[indexX] = camera.center[indexX];
    camera.eye[indexY] = camera.center[indexY];
    camera.eye[indexZ] = camera.center[indexZ];

    camera.eye[indexX] += camera.distance * Math.sin(camera.zAngle) * Math.cos(camera.yAngle);
    camera.eye[indexY] += camera.distance * Math.sin(camera.yAngle);
    camera.eye[indexZ] += camera.distance * Math.cos(camera.zAngle) * Math.cos(camera.yAngle);
  }

  /**
   * Run the rendering pipeline.
   */

  function render() {
    // Clear framebuffer and depth-/z-buffer.
    // eslint-disable-next-line no-bitwise
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    setProjection();

    calculateCameraPosition();
    mat4.lookAt(camera.vMatrix, camera.eye, camera.center, camera.up);

    // Loop over models.
    models.forEach((model) => {
      // Update modelview for model.
      mat4.copy(model.mvMatrix, camera.vMatrix);

      // Set uniforms for model.
      gl.uniformMatrix4fv(prog.mvMatrixUniform, false, model.mvMatrix);
      draw(model);
    });
  }

  function setProjection() {
    // Set projection Matrix.

    const v = camera.lrtb;

    if (camera.projectionType === 'ortho') {
      mat4.ortho(camera.pMatrix, -v, v, -v, v, -10, 10);
    }

    if (camera.projectionType === 'projection') {
      mat4.perspective(camera.pMatrix, camera.fovy, camera.aspect, 1, 10);
    }

    // Set projection uniform.
    gl.uniformMatrix4fv(prog.pMatrixUniform, false, camera.pMatrix);
  }

  function draw(model) {
    // Setup position VBO.
    gl.bindBuffer(gl.ARRAY_BUFFER, model.vboPos);
    gl.vertexAttribPointer(prog.positionAttrib, 3, gl.FLOAT, false, 0, 0);

    // Setup normal VBO.
    gl.bindBuffer(gl.ARRAY_BUFFER, model.vboNormal);
    gl.vertexAttribPointer(prog.normalAttrib, 3, gl.FLOAT, false, 0, 0);

    // Setup rendering tris.

    const fill = (model.fillstyle.search(/fill/) !== -1);

    if (fill) {
      gl.enableVertexAttribArray(prog.normalAttrib);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboTris);
      gl.drawElements(gl.TRIANGLES, model.iboTris.numberOfElements, gl.UNSIGNED_SHORT, 0);
    }

    // Setup rendering lines.

    const wireframe = (model.fillstyle.search(/wireframe/) !== -1);
    if (wireframe) {
      gl.disableVertexAttribArray(prog.normalAttrib);
      gl.vertexAttrib3f(prog.normalAttrib, 0, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboLines);
      gl.drawElements(gl.LINES, model.iboLines.numberOfElements, gl.UNSIGNED_SHORT, 0);
    }
  }

  // App interface.

  return {

    start,

  };
})());
