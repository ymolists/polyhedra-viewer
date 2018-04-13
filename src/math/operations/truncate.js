import _ from 'lodash'

import Polyhedron from 'math/Polyhedron'
import { replace } from 'util.js'
import { vec } from 'math/linAlg'
import { prevVertex, nextVertex } from 'math/solidUtils'
import { removeExtraneousVertices, deduplicateVertices } from './operationUtils'

function directedAdjacentFaceIndices(polyhedron, vIndex) {
  const { faces } = polyhedron
  const touchingFaceIndices = _.clone(polyhedron.adjacentFaceIndices(vIndex))
  const result = []
  let next = touchingFaceIndices[0]
  const checkVertex = f =>
    prevVertex(faces[next], vIndex) === nextVertex(faces[f], vIndex)
  do {
    result.push(next)
    next = _.find(touchingFaceIndices, checkVertex)
  } while (result.length < touchingFaceIndices.length)
  return result
}

function truncateVertex(
  newPolyhedron,
  polyhedron,
  vIndex,
  { mock, rectify } = {},
) {
  // const touchingFaces = polyhedron.adjacentFaces(vIndex)
  const touchingFaceIndices = directedAdjacentFaceIndices(polyhedron, vIndex)
  const touchingFaces = _.at(polyhedron.faces, touchingFaceIndices)
  // const touchingFaceIndices = polyhedron.adjacentFaceIndices(vIndex)
  let verticesToAdd = touchingFaces.map(face => {
    if (mock) {
      return polyhedron.vertices[vIndex]
    }
    const next = nextVertex(face, vIndex)
    const p1 = vec(polyhedron.vertices[vIndex])
    const p2 = vec(polyhedron.vertices[next])
    const sideLength = p1.distanceTo(p2)
    if (rectify) {
      return p1.add(p2.sub(p1).scale(1 / 2)).toArray()
    }
    const n = face.length
    const apothem =
      Math.cos(Math.PI / n) * sideLength / (2 * Math.sin(Math.PI / n))
    const n2 = 2 * n
    const newSideLength =
      2 * Math.sin(Math.PI / n2) * apothem / Math.cos(Math.PI / n2)
    return p1
      .add(p2.sub(p1).scale((sideLength - newSideLength) / 2 / sideLength))
      .toArray()
  })

  const newVertices = newPolyhedron.vertices.concat(verticesToAdd)

  const mod = (a, b) => (a >= 0 ? a % b : a % b + b)

  const newFaces = newPolyhedron.faces
    .map((face, faceIndex) => {
      if (!_.includes(touchingFaceIndices, faceIndex)) return face
      const touchingFaceIndex = touchingFaceIndices.indexOf(faceIndex)
      return replace(
        face,
        face.indexOf(vIndex),
        newPolyhedron.vertices.length +
          mod(touchingFaceIndex + 1, touchingFaces.length),
        newPolyhedron.vertices.length + touchingFaceIndex,
      )
    })
    .concat([_.range(newPolyhedron.vertices.length, newVertices.length)])
  return Polyhedron.of(newVertices, newFaces)
}

function doTruncate(polyhedron, options = {}) {
  let newPolyhedron = polyhedron
  _.forEach(polyhedron.vertices, (vertex, index) => {
    newPolyhedron = truncateVertex(newPolyhedron, polyhedron, index, options)
  })
  // FIXME deduplicating fails
  return options.mock
    ? removeExtraneousVertices(newPolyhedron)
    : deduplicateVertices(newPolyhedron)
}

export function truncate(polyhedron, options, mock) {
  return doTruncate(polyhedron, { mock })
}

export function rectify(polyhedron) {
  return doTruncate(polyhedron, { rectify: true })
}