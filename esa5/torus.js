// eslint-disable-next-line no-unused-vars,import/prefer-default-export
export const torus = ((() => {
  function createVertexData() {
    const n = 16;
    const m = 32;

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

    const rangeU = { min: 0, max: (Math.PI * 2) };
    const rangeV = { min: 0, max: (Math.PI * 2) };

    const du = (rangeU.max - rangeU.min) / n;
    const dv = (rangeV.max - rangeV.min) / m;

    const r = 0.3;
    const R = 0.5;
    // Counter for entries in index array.
    let iLines = 0;
    let iTris = 0;

    for (let u = rangeU.min, i = 0; i <= n; i++, u += du) {
      for (let v = rangeV.min, j = 0; j <= m; j++, v += dv) {
        const iVertex = i * (m + 1) + j;

        const x = (R + r * Math.cos(u)) * Math.cos(v);
        const y = (R + r * Math.cos(u)) * Math.sin(v);
        const z = r * Math.sin(u);

        // Set vertex positions.
        vertices[iVertex * 3] = x;
        vertices[iVertex * 3 + 1] = y + 0.8;
        vertices[iVertex * 3 + 2] = z - 2;

        // Calc and set normals.
        const nx = Math.cos(u) * Math.cos(v);
        const ny = Math.cos(u) * Math.sin(v);
        const nz = Math.sin(u);
        normals[iVertex * 3] = nx;
        normals[iVertex * 3 + 1] = ny;
        normals[iVertex * 3 + 2] = nz;

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
