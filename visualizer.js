function VisualizeNetwork(context, layers) {
  // Layers will be an array of ints representing the number of nodes in each layer
  // For example, [2, 3, 1] would represent a network with 2 input nodes, 3 hidden nodes, and 1 output node
  // Context is a 2d canvas context of size 300 x 150
  // We will simply draw a circle for each node, and lines connecting them
  const layerYs = []
  context.fillStyle = "black"
  for (let i = 0; i < layers.length; i++) {
    layerYs.push(lerp(20, context.canvas.height, i / (layers.length - 1)) - 10)
  }
  for (let i = 0; i < layers.length; i++) {
    drawLayer(context, layers[i], layers[i + 1] ?? 0, layerYs[i], layerYs[i + 1] ?? 0)
  }
}

function drawNode(context, x, y, radius) {
  context.beginPath()
  context.arc(x, y, radius, 0, 2 * Math.PI)
  context.fill()
  context.stroke()
}

function drawLine(context, x1, y1, x2, y2) {
  context.beginPath()
  context.moveTo(x1, y1)
  context.lineTo(x2, y2)
  context.stroke()
}

function drawLayer(context, inputCount, outputCount, yInput, yOutput) {
  const inputNodeXs = []
  for (let i = 0; i < inputCount; i++) {
    inputNodeXs.push(lerp(10, context.canvas.width, i / inputCount))
  }

  const outputNodeXs = []
  for (let i = 0; i < outputCount; i++) {
    outputNodeXs.push(lerp(10, context.canvas.width, i / outputCount))
  }

  for (let i = 0; i < inputCount; i++) {
    drawNode(context, inputNodeXs[i], yInput, 7)
    if (outputCount === 0) continue
    for (let j = 0; j < outputCount; j++) {
      drawLine(context, inputNodeXs[i], yInput, outputNodeXs[j], yOutput)
    }
  }
}

function lerp(start, end, t) {
  return start + (end - start) * t
}
