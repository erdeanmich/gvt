import { mat3, mat4, vec4 } from '../common/ext/index.js';
import { torus } from './torus.js';
import { sphere } from './sphere.js';
import { plane } from './plane.js';

window.onload = () => {
  app.start();
};

const app = ((() => {
  let gl;

  // The shader program object is also used to
  // store attribute and uniform locations.
  let prog;

  // Array of model objects.
  const models = [];

  const deltaRotate = Math.PI / 36;
  const deltaTranslate = 0.05;
  let lightRotation = 0;

  const camera = {
    // Initial position of the camera.
    eye: [0, 1, 4],
    // Point to look at.
    center: [0, 0, 0],
    // Roll and pitch of the camera.
    up: [0, 1, 0],
    // Opening angle given in radian.
    // radian = degree*2*PI/360.
    fovy: 60.0 * (Math.PI / 180),
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

  const illumination = {
    ambientLight: [0.5, 0.5, 0.5],
    light: [
      {
        isOn: true,
        position: [3.0, 1.0, 1],
        color: [1.0, 1.0, 1.0],
      },
    ],
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
    initPipline();
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
  function initPipline() {
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

    // Normal-matrix
    prog.nMatrixUniform = gl.getUniformLocation(prog, 'uNMatrix');

    // color
    prog.colorUniform = gl.getUniformLocation(prog, 'uColor');

    // Light
    prog.ambientLightUniform = gl.getUniformLocation(prog, 'ambientLight');
    prog.lightUniform = [];

    for (let j = 0; j < illumination.light.length; j++) {
      const lightNb = `light[${j}]`;
      // Store one object for every light source.
      const l = {};
      l.isOn = gl.getUniformLocation(prog, `${lightNb}.isOn`);
      l.position = gl.getUniformLocation(prog, `${lightNb}.position`);
      l.color = gl.getUniformLocation(prog, `${lightNb}.color`);
      prog.lightUniform[j] = l;
    }

    // Material
    prog.materialKaUniform = gl.getUniformLocation(prog, 'material.ka');
    prog.materialKdUniform = gl.getUniformLocation(prog, 'material.kd');
    prog.materialKsUniform = gl.getUniformLocation(prog, 'material.ks');
    prog.materialKeUniform = gl.getUniformLocation(prog, 'material.ke');
  }

  function createPhongMaterial(material) {
    material = material || {};
    material.ka = material.ka || [0.3, 0.3, 0.3];
    material.kd = material.kd || [0.6, 0.6, 0.6];
    material.ks = material.ks || [0.8, 0.8, 0.8];
    material.ke = material.ke || 10.0;
    return material;
  }

  function initModels() {
    // const defaultMaterial = createPhongMaterial();
    const redMaterial = createPhongMaterial({ kd: [1.0, 0.0, 0.0] });
    const greenMaterial = createPhongMaterial({ kd: [0.0, 1.0, 0.0] });
    const blueMaterial = createPhongMaterial({ kd: [0.0, 0.0, 1.0] });
    const whiteMaterial = createPhongMaterial({
      ka: [1.0, 1.0, 1.0],
      kd: [0.5, 0.5, 0.5],
      ks: [0.0, 0.0, 0.0],
    });

    createModel(torus, 'fill', [1, 0, 0, 1], [0, 0.75, 0], [0, 0, 0], [1, 1, 1], redMaterial);
    createModel(sphere, 'fill', [0, 0, 1, 1], [-1.25, 0.5, 0], [0, 0, 0], [1, 1, 1], greenMaterial);
    createModel(sphere, 'fill', [0, 1, 0, 1], [1.25, 0.5, 0], [0, 0, 0], [1, 1, 1], blueMaterial);
    createModel(plane, 'fill', [1, 1, 1, 1], [0, 0, 0], [0, 0, 0], [1, 1, 1], whiteMaterial);
  }

  /**
   * Create model object, fill it and push it in models array.
   *
   * @parameter geometry: geometry.
   * @parameter fillstyle: wireframe, fill, fillwireframe.
   */
  function createModel(geometry, fillstyle, color, translate, rotate, scale, material) {
    const model = {};
    model.fillstyle = fillstyle;
    model.color = color;
    initDataAndBuffers(model, geometry);
    initTransformations(model, translate, rotate, scale);
    model.material = material;

    models.push(model);
  }

  /**
   * Set scale, rotation and transformation for model.
   */
  function initTransformations(model, translate, rotate, scale) {
    // Store transformation vectors.
    model.translate = translate;
    model.rotate = rotate;
    model.scale = scale;

    // Create and initialize Model-Matrix.
    model.mMatrix = mat4.create();

    // Create and initialize Model-View-Matrix.
    model.mvMatrix = mat4.create();

    // create and iniialize Normal-Matrix
    model.nMatrix = mat3.create();
  }

  /**
   * Init data and buffers for model object.
   *
   * @parameter model: a model object to augment with data.
   * @parameter geometryname: string with name of geometry.
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
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indicesLines,
      gl.STATIC_DRAW);
    model.iboLines.numberOfElements = model.indicesLines.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    // Setup triangle index buffer object.
    model.iboTris = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboTris);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indicesTris,
      gl.STATIC_DRAW);
    model.iboTris.numberOfElements = model.indicesTris.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  }

  function initEventHandler() {
    window.onkeydown = (evt) => {
      const c = evt.key.toLowerCase();

      // Use shift key to change sign.
      const sign = evt.shiftKey ? -1 : 1;
      if (c === 'p') {
        camera.projectionType = 'projection';
      }
      // Camera move and orbit.
      if (c === 'c') { // Orbit camera.
        camera.zAngle += sign * deltaRotate;
      }
      if (c === 'h') { // Move camera up and down.
        camera.eye[1] += sign * deltaTranslate;
      }
      if (c === 'o') { // Camera distance to center.
        camera.distance += sign * deltaTranslate;
      }
      if (c === 'v') { // Camera fovy in radian.
        camera.fovy += sign * 5 * (Math.PI / 180);
      }
      if (c === 'b') { // Camera near plane dimensions.
        camera.lrtb += sign * 0.1;
      }

      if (c === 'a') {
        camera.zAngle -= deltaRotate;
      }

      if (c === 'd') {
        camera.zAngle += deltaRotate;
      }

      if (c === 'w') {
        moveCameraVertically(true);
      }

      if (c === 's') {
        moveCameraVertically(false);
      }

      if (c === 'l') {
        moveLights();
      }

      // Render the scene again on any key pressed.
      render();
    };
  }

  function moveLights() {
    const radius = 3;
    lightRotation += deltaRotate;
    illumination.light[0].position[0] = Math.cos(lightRotation) * radius;
    illumination.light[0].position[2] = Math.sin(lightRotation) * radius;
  }

  function moveCameraVertically(upwards) {
    const direction = upwards ? 1 : -1;
    const targetRotation = Math.abs(camera.yAngle + deltaRotate * direction);
    const rotation90 = Math.PI / 2;
    const rotation360 = 2 * Math.PI;
    const rotation270 = rotation360 - rotation90;

    // eslint-disable-next-line max-len
    if (targetRotation <= rotation90 || (targetRotation > rotation270 && targetRotation < rotation360)) {
      camera.up = [0, 1, 0];
      camera.yAngle += deltaRotate * direction;
      return;
    }

    if (targetRotation > rotation90 && targetRotation < rotation270) {
      camera.up = [0, -1, 0];
      camera.yAngle += deltaRotate * direction;
      return;
    }

    camera.yAngle = 0;
  }

  /**
   * Run the rendering pipeline.
   */
  function render() {
    // Clear framebuffer and depth-/z-buffer.
    // eslint-disable-next-line no-bitwise
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    setProjection();
    calculateCameraOrbit();

    // Set view matrix depending on camera.
    mat4.lookAt(camera.vMatrix, camera.eye, camera.center, camera.up);

    // set light uniforms
    gl.uniform3fv(prog.ambientLightUniform, illumination.ambientLight);
    // Loop over light sources.
    for (let j = 0; j < illumination.light.length; j++) {
      // bool is transferred as integer.
      gl.uniform1i(prog.lightUniform[j].isOn, illumination.light[j].isOn);
      // Tranform light postion in eye coordinates.
      // Copy current light position into a new array.
      const lightPos = [].concat(illumination.light[j].position);
      // Add homogenious coordinate for transformation.
      lightPos.push(1.0);
      vec4.transformMat4(lightPos, lightPos, camera.vMatrix);
      // Remove homogenious coordinate.
      lightPos.pop();
      gl.uniform3fv(prog.lightUniform[j].position, lightPos);
      gl.uniform3fv(prog.lightUniform[j].color, illumination.light[j].color);
    }

    // Loop over models.
    models.forEach((model) => {
      // Update modelview for model.
      updateTransformations(model);

      // Set uniforms for model.
      gl.uniformMatrix4fv(prog.mvMatrixUniform, false, model.mvMatrix);
      gl.uniformMatrix3fv(prog.nMatrixUniform, false, model.nMatrix);
      gl.uniform4fv(prog.colorUniform, model.color);

      gl.uniform3fv(prog.materialKaUniform, model.material.ka);
      gl.uniform3fv(prog.materialKdUniform, model.material.kd);
      gl.uniform3fv(prog.materialKsUniform, model.material.ks);
      gl.uniform1f(prog.materialKeUniform, model.material.ke);

      draw(model);
    });
  }

  function calculateCameraOrbit() {
    // Calculate x,z position/eye of camera orbiting the center.
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

  function setProjection() {
    // Set projection Matrix.
    const { projectionType } = camera;
    const v = camera.lrtb;
    if (projectionType === 'ortho') {
      mat4.ortho(camera.pMatrix, -v, v, -v, v, -10, 10);
      return;
    }

    if (projectionType === 'frustrum') {
      mat4.frustum(camera.pMatrix, -v / 2, v / 2, -v / 2, v / 2, 1, 10);
      return;
    }

    if (projectionType === 'projection') {
      mat4.perspective(camera.pMatrix, camera.fovy, camera.aspect, 1, 10);
    }

    // Set projection uniform.
    gl.uniformMatrix4fv(prog.pMatrixUniform, false, camera.pMatrix);
  }

  /**
   * Update model-view matrix for model.
   */
  function updateTransformations(model) {
    // Use shortcut variables.
    const { mMatrix } = model;
    const { mvMatrix } = model;

    // Reset matrices to identity.
    mat4.identity(mMatrix);
    mat4.identity(mvMatrix);

    // Translate.
    mat4.translate(mMatrix, mMatrix, model.translate);

    // Rotate
    mat4.rotateX(mMatrix, mMatrix, model.rotate[0]);
    mat4.rotateY(mMatrix, mMatrix, model.rotate[1]);
    mat4.rotateZ(mMatrix, mMatrix, model.rotate[2]);

    // Scale
    mat4.scale(mMatrix, mMatrix, model.scale);

    // Combine view and model matrix
    // by matrix multiplication to mvMatrix.
    mat4.multiply(mvMatrix, camera.vMatrix, mMatrix);

    mat3.normalFromMat4(model.nMatrix, mvMatrix);
  }

  function draw(model) {
    // Setup position VBO.
    gl.bindBuffer(gl.ARRAY_BUFFER, model.vboPos);
    gl.vertexAttribPointer(prog.positionAttrib, 3, gl.FLOAT, false,
      0, 0);

    // Setup normal VBO.
    gl.bindBuffer(gl.ARRAY_BUFFER, model.vboNormal);
    gl.vertexAttribPointer(prog.normalAttrib, 3, gl.FLOAT, false, 0, 0);

    // Setup rendering tris.
    const fill = (model.fillstyle.search(/fill/) !== -1);
    if (fill) {
      gl.enableVertexAttribArray(prog.normalAttrib);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboTris);
      gl.drawElements(gl.TRIANGLES, model.iboTris.numberOfElements,
        gl.UNSIGNED_SHORT, 0);
    }

    // Setup rendering lines.
    const wireframe = (model.fillstyle.search(/wireframe/) !== -1);
    if (wireframe) {
      gl.uniform4fv(prog.colorUniform, [0, 0, 0, 1]);
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
