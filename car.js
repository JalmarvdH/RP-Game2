function calculateDamage(carBorders, borders) {
  for (const border of borders) {
    for (const carBorder of carBorders) {
      if (intersection(carBorder, border)) {
        return true
      }
    }
  }
  return false
}

class Car {
  constructor(
    x,
    y,
    isDummy = false,
    isAi = false,
    rayCount = 5,
    raySpread = Math.PI / 2,
    rayRange = 200,
    hiddenLayers = 1,
    neuronCount = 4,
    width = 35,
    height = 50
  ) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.angle = 0
    this.speed = 0
    this.damaged = false
    this.isDummy = isDummy
    this.isAi = isAi

    this.controls =
      isDummy || isAi
        ? {
            up: true,
            down: false,
            left: false,
            right: false,
          }
        : new Controls()

    this.ROTATE_SPEED = 0.03
    this.MAX_SPEED = isDummy ? 1 : 3
    this.ACCELERATION = 0.02
    this.rayCount = rayCount

    const hiddenLayer = Array(hiddenLayers).fill(neuronCount)

    this.sensors = isDummy || !isAi ? null : new Sensor(this, this.rayCount, rayRange, raySpread)
    this.network = !isAi ? null : new Network([this.rayCount, ...hiddenLayer, 4])

    this.updateBorders()
  }

  update(borders) {
    if (this.isAi) this.sensors.update(borders)
    if (this.isAi && !this.damaged) {
      let input = this.sensors.readings.map((r) => {
        const dist = distance(r, { x: this.x, y: this.y })
        return dist / this.sensors.range
      })
      Network.feedForward(this.network, input)
      const outputs = this.network.levels[this.network.levels.length - 1].outputs
      this.controls.up = outputs[0] > 0.5
      this.controls.down = outputs[1] > 0.5
      this.controls.left = outputs[2] > 0.5
      this.controls.right = outputs[3] > 0.5
    }

    this.updateBorders()
    this.damaged = this.damaged || calculateDamage(this.carBorders, borders)
    if (this.damaged) return
    if (this.controls.up) {
      this.speed += this.ACCELERATION
      if (this.speed > this.MAX_SPEED) {
        this.speed = this.MAX_SPEED
      }
    }
    if (this.controls.down) {
      this.speed -= this.ACCELERATION
      if (this.speed < -this.MAX_SPEED) {
        this.speed = -this.MAX_SPEED
      }
    }
    if (!this.controls.up && !this.controls.down) {
      if (this.speed > 0) {
        this.speed -= this.ACCELERATION / 2
      } else if (this.speed < 0) {
        this.speed += this.ACCELERATION / 2
      }
      if (Math.abs(this.speed) < this.ACCELERATION / 2) {
        this.speed = 0
      }
    }
    this.x -= this.speed * Math.sin(this.angle)
    this.y -= this.speed * Math.cos(this.angle)
    if (this.speed !== 0) {
      const flip = this.speed < 0 ? -1 : 1
      if (this.controls.left) {
        this.angle += this.ROTATE_SPEED * flip
      }
      if (this.controls.right) {
        this.angle -= this.ROTATE_SPEED * flip
      }
    }
  }

  updateBorders() {
    this.carBorders = [
      [
        {
          x:
            this.x -
            (this.width / 2) * Math.cos(this.angle) -
            (this.height / 2) * Math.sin(this.angle),
          y:
            this.y -
            (this.width / 2) * Math.sin(this.angle) +
            (this.height / 2) * Math.cos(this.angle),
        },
        {
          x:
            this.x +
            (this.width / 2) * Math.cos(this.angle) -
            (this.height / 2) * Math.sin(this.angle),
          y:
            this.y +
            (this.width / 2) * Math.sin(this.angle) +
            (this.height / 2) * Math.cos(this.angle),
        },
      ],
      [
        {
          x:
            this.x +
            (this.width / 2) * Math.cos(this.angle) -
            (this.height / 2) * Math.sin(this.angle),
          y:
            this.y +
            (this.width / 2) * Math.sin(this.angle) +
            (this.height / 2) * Math.cos(this.angle),
        },
        {
          x:
            this.x +
            (this.width / 2) * Math.cos(this.angle) +
            (this.height / 2) * Math.sin(this.angle),
          y:
            this.y +
            (this.width / 2) * Math.sin(this.angle) -
            (this.height / 2) * Math.cos(this.angle),
        },
      ],
      [
        {
          x:
            this.x +
            (this.width / 2) * Math.cos(this.angle) +
            (this.height / 2) * Math.sin(this.angle),
          y:
            this.y +
            (this.width / 2) * Math.sin(this.angle) -
            (this.height / 2) * Math.cos(this.angle),
        },
        {
          x:
            this.x -
            (this.width / 2) * Math.cos(this.angle) +
            (this.height / 2) * Math.sin(this.angle),
          y:
            this.y -
            (this.width / 2) * Math.sin(this.angle) -
            (this.height / 2) * Math.cos(this.angle),
        },
      ],
      [
        {
          x:
            this.x -
            (this.width / 2) * Math.cos(this.angle) +
            (this.height / 2) * Math.sin(this.angle),
          y:
            this.y -
            (this.width / 2) * Math.sin(this.angle) -
            (this.height / 2) * Math.cos(this.angle),
        },
        {
          x:
            this.x -
            (this.width / 2) * Math.cos(this.angle) -
            (this.height / 2) * Math.sin(this.angle),
          y:
            this.y -
            (this.width / 2) * Math.sin(this.angle) +
            (this.height / 2) * Math.cos(this.angle),
        },
      ],
    ]
  }

  draw(context, drawSensors = true) {
    if (this.isAi && drawSensors) this.sensors.draw(context)
    context.save()
    context.translate(this.x, this.y)
    context.rotate(-this.angle)
    if (this.isDummy) {
      context.fillStyle = "black"
    } else {
      context.fillStyle = "blue"
    }
    if (this.damaged) {
      context.fillStyle = "#cc0000"
    }
    context.fillRect(-this.width / 2, -this.height / 2, this.width, this.height)
    context.restore()
  }
}
