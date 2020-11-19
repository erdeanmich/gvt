// eslint-disable-next-line import/prefer-default-export
export const sphere = ((() => {
  // Positions.
  let vertices = [];
  // Normals.
  let normals = [];
  // Index data.
  let indicesLines = [];
  let indicesTriangles = [];

  function createVertexData() {
    const tesselationLevel = document.getElementById('tesselation-level').value;

    vertices = [];
    normals = [];
    indicesLines = [];
    indicesTriangles = [];

    // create 12 vertices of a icosahedron
    const t = (1.0 + Math.sqrt(5.0)) / 2.0;

    addVertex({ x: -1, y: t, z: 0 });
    addVertex({ x: 1, y: t, z: 0 });
    addVertex({ x: -1, y: -t, z: 0 });
    addVertex({ x: 1, y: -t, z: 0 });

    addVertex({ x: 0, y: -1, z: t });
    addVertex({ x: 0, y: 1, z: t });
    addVertex({ x: 0, y: -1, z: -t });
    addVertex({ x: 0, y: 1, z: -t });

    addVertex({ x: t, y: 0, z: -1 });
    addVertex({ x: t, y: 0, z: 1 });
    addVertex({ x: -t, y: 0, z: -1 });
    addVertex({ x: -t, y: 0, z: 1 });

    addIndices(indicesTriangles, indicesLines, { x: 0, y: 11, z: 5 });
    addIndices(indicesTriangles, indicesLines, { x: 0, y: 5, z: 1 });
    addIndices(indicesTriangles, indicesLines, { x: 0, y: 1, z: 7 });
    addIndices(indicesTriangles, indicesLines, { x: 0, y: 7, z: 10 });
    addIndices(indicesTriangles, indicesLines, { x: 0, y: 10, z: 11 });

    addIndices(indicesTriangles, indicesLines, { x: 1, y: 5, z: 9 });
    addIndices(indicesTriangles, indicesLines, { x: 5, y: 11, z: 4 });
    addIndices(indicesTriangles, indicesLines, { x: 11, y: 10, z: 2 });
    addIndices(indicesTriangles, indicesLines, { x: 10, y: 7, z: 6 });
    addIndices(indicesTriangles, indicesLines, { x: 7, y: 1, z: 8 });

    addIndices(indicesTriangles, indicesLines, { x: 3, y: 9, z: 4 });
    addIndices(indicesTriangles, indicesLines, { x: 3, y: 4, z: 2 });
    addIndices(indicesTriangles, indicesLines, { x: 3, y: 2, z: 6 });
    addIndices(indicesTriangles, indicesLines, { x: 3, y: 6, z: 8 });
    addIndices(indicesTriangles, indicesLines, { x: 3, y: 8, z: 9 });

    addIndices(indicesTriangles, indicesLines, { x: 4, y: 9, z: 5 });
    addIndices(indicesTriangles, indicesLines, { x: 2, y: 4, z: 11 });
    addIndices(indicesTriangles, indicesLines, { x: 6, y: 2, z: 10 });
    addIndices(indicesTriangles, indicesLines, { x: 8, y: 6, z: 7 });
    addIndices(indicesTriangles, indicesLines, { x: 9, y: 8, z: 1 });

    // refine triangles
    for (let i = 0; i < tesselationLevel; i++) {
      const _triangles = [];
      const _newLines = [];

      for (let j = 0; j < indicesTriangles.length; j += 3) {
        const middle1 = calculateMiddleVertex(indicesTriangles[j], indicesTriangles[j + 1]);
        const middle2 = calculateMiddleVertex(indicesTriangles[j + 1], indicesTriangles[j + 2]);
        const middle3 = calculateMiddleVertex(indicesTriangles[j + 2], indicesTriangles[j]);

        addIndices(_triangles, _newLines, { x: indicesTriangles[j], y: middle1, z: middle3 });
        addIndices(_triangles, _newLines, { x: indicesTriangles[j + 1], y: middle2, z: middle1 });
        addIndices(_triangles, _newLines, { x: indicesTriangles[j + 2], y: middle3, z: middle2 });
        addIndices(_triangles, _newLines, { x: middle1, y: middle2, z: middle3 });
      }

      indicesTriangles = _triangles;
      indicesLines = _newLines;
    }

    this.vertices = new Float32Array(vertices);
    this.normals = new Float32Array(normals);
    this.indicesLines = new Uint16Array(indicesLines);
    this.indicesTris = new Uint16Array(indicesTriangles);

    function addVertex(vertex) {
      const vertexLength = Math.sqrt(vertex.x ** 2 + vertex.y ** 2 + vertex.z ** 2);
      const normX = vertex.x / vertexLength;
      const normY = vertex.y / vertexLength;
      const normZ = vertex.z / vertexLength;

      vertices.push(normX, normY, normZ);
      normals.push(normX, normY, normZ);

      // return number of actual vertices
      return (vertices.length / 3) - 1;
    }

    function calculateMiddleVertex(indexVertex1, indexVertex2) {
      // Calculate coordinates of mid.
      const vertex1 = getVertexFromArray(indexVertex1);
      const vertex2 = getVertexFromArray(indexVertex2);

      const middle = getMiddleOfVertices(vertex1, vertex2);

      for (let i = 0; i < vertices.length; i += 3) {
        // eslint-disable-next-line max-len
        if ((vertices[i] === middle.x) && (vertices[i + 1] === middle.y) && (vertices[i + 2] === middle.z)) {
          return i / 3;
        }
      }

      return addVertex(middle);
    }

    function getMiddleOfVertices(vertex1, vertex2) {
      return {
        x: (vertex1.x + vertex2.x) / 2.0,
        y: (vertex1.y + vertex2.y) / 2.0,
        z: (vertex1.z + vertex2.z) / 2.0,
      };
    }

    function getVertexFromArray(index) {
      return {
        x: vertices[3 * index],
        y: vertices[3 * index + 1],
        z: vertices[3 * index + 2],
      };
    }

    function addIndices(_triangles, _lines, vertex) {
      _triangles.push(vertex.x, vertex.y, vertex.z);
      _lines.push(vertex.x, vertex.y, vertex.y, vertex.z, vertex.z, vertex.x);
    }
  }

  return {
    createVertexData,
  };
})());
