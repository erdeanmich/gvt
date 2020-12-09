// eslint-disable-next-line no-unused-vars,import/prefer-default-export
export const plane = ((() => {
  function createVertexData() {
    const n = 100;
    const m = 100;

    // Positions.
    this.vertices = new Float32Array(3 * (n + 1) * (m + 1));
    const { vertices } = this;
    // Normals.
    this.normals = new Float32Array(3 * (n + 1) * (m + 1));
    const { normals } = this;
    // Index data.
    this.indicesLines = new Uint16Array(2 * 2 * n * m);
    const { indicesLines } = this;
    this.indicesTris = new Uint16Array(3 * 2 * n * m);
    const { indicesTris } = this;

    const rangeU = { min: -10, max: 10 };
    const rangeV = { min: -10, max: 10 };

    const du = (rangeU.max - rangeU.min) / n;
    const dv = (rangeV.max - rangeV.min) / m;

    // Counter for entries in index array.
    let iLines = 0;
    let iTris = 0;

    // Loop angle u.
    for (let u = rangeU.min, i = 0; i <= n; i++, u += du) {
      for (let v = rangeV.min, j = 0; j <= m; j++, v += dv) {
        const iVertex = i * (m + 1) + j;

        const x = u;
        const y = 0;
        const z = v;

        // Set vertex positions.
        vertices[iVertex * 3] = x;
        vertices[iVertex * 3 + 1] = y;
        vertices[iVertex * 3 + 2] = z;

        // Calc and set normals.
        normals[iVertex * 3] = 0;
        normals[iVertex * 3 + 1] = 1;
        normals[iVertex * 3 + 2] = 0;

        // Set index.
        // Line on beam.
        if (j > 0 && i > 0) {
          indicesLines[iLines++] = iVertex - 1;
          indicesLines[iLines++] = iVertex;
        }
        // Line on ring.
        if (j > 0 && i > 0) {
          indicesLines[iLines++] = iVertex - (m + 1);
          indicesLines[iLines++] = iVertex;
        }

        // Set index.
        // Two Triangles.
        if (j > 0 && i > 0) {
          indicesTris[iTris++] = iVertex;
          indicesTris[iTris++] = iVertex - 1;
          indicesTris[iTris++] = iVertex - (m + 1);
          //
          indicesTris[iTris++] = iVertex - 1;
          indicesTris[iTris++] = iVertex - (m + 1) - 1;
          indicesTris[iTris++] = iVertex - (m + 1);
        }
      }
    }
  }

  return {
    createVertexData,
  };
})());
