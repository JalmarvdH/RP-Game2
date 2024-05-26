function sigmoid(x) {
  return 1 / (1 + Math.exp(-x))
}

class Network {
  constructor(layerSizes) {
    this.levels = []

    for (let i = 0; i < layerSizes.length - 1; i++) {
      this.levels.push(new Level(layerSizes[i], layerSizes[i + 1]))
    }
  }

  static feedForward(network, inputs) {
    for (let i = 0; i < network.levels.length; i++) {
      Level.feedForward(network.levels[i], inputs)
      inputs = network.levels[i].outputs
    }
  }

  static tweak(network, percentage) {
    for (let i = 0; i < network.levels.length; i++) {
      for (let j = 0; j < network.levels[i].outputs.length; j++) {
        network.levels[i].biases[j] += (Math.random() * 2 - 1) * percentage
        for (let k = 0; k < network.levels[i].inputs.length; k++) {
          network.levels[i].weights[j][k] += (Math.random() * 2 - 1) * percentage
        }
      }
    }
    return network
  }
}

class Level {
  constructor(inputCount, outputCount) {
    this.inputs = new Array(inputCount)
    this.outputs = new Array(outputCount)
    this.biases = new Array(outputCount)

    this.weights = []

    for (let i = 0; i < outputCount; i++) {
      this.weights.push(new Array(inputCount))
    }

    Level.randomize(this)
  }

  static randomize(level) {
    for (let i = 0; i < level.outputs.length; i++) {
      for (let j = 0; j < level.inputs.length; j++) {
        level.weights[i][j] = Math.random() * 2 - 1
      }
      level.biases[i] = Math.random() * 2 - 1
    }
  }

  static feedForward(level, inputs) {
    if (inputs.length !== level.inputs.length) {
      throw new Error("Input count mismatch")
    }
    for (let i = 0; i < inputs.length; i++) {
      level.inputs[i] = inputs[i]
    }
    for (let i = 0; i < level.outputs.length; i++) {
      let sum = 0
      for (let j = 0; j < level.inputs.length; j++) {
        sum += level.inputs[j] * level.weights[i][j]
      }
      level.outputs[i] = sum + level.biases[i] > 0 ? 1 : 0
      // level.outputs[i] = sigmoid(sum + level.biases[i])
    }
  }
}
