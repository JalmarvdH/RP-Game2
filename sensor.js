function distance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function intersection(a, b) {
  const x1 = a[0].x
  const y1 = a[0].y
  const x2 = a[1].x
  const y2 = a[1].y
  const x3 = b[0].x
  const y3 = b[0].y
  const x4 = b[1].x
  const y4 = b[1].y
  const uA =
    ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) /
    ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
  const uB =
    ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) /
    ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
  if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
    return {
      x: x1 + uA * (x2 - x1),
      y: y1 + uA * (y2 - y1),
    }
  }
  return null
}

class Sensor {
  constructor(car, rayCount = 5, range = 300, spread = Math.PI / 1.5) {
    this.car = car
    this.rayCount = rayCount
    this.range = range
    this.spread = spread

    this.rays = []
    this.readings = []
  }

  read(ray, borders) {
    let touches = []
    for (const border of borders) {
      const i = intersection(ray, border)
      if (i) {
        touches.push(i)
      }
    }
    if (touches.length === 0) {
      return ray[1]
    }
    let closest = touches[0]
    for (const touch of touches) {
      if (distance(ray[0], touch) < distance(ray[0], closest)) {
        closest = touch
      }
    }
    return closest
  }

  update(borders) {
    this.rays = []
    for (let i = 0; i < this.rayCount; i++) {
      const angle = lerp(-this.spread / 2, this.spread / 2, i / (this.rayCount - 1))
      this.rays.push([
        {
          x: this.car.x,
          y: this.car.y,
        },
        {
          x: this.car.x - this.range * Math.sin(this.car.angle + angle),
          y: this.car.y - this.range * Math.cos(this.car.angle + angle),
        },
      ])
    }
    this.readings = []
    for (const ray of this.rays) {
      this.readings.push(this.read(ray, borders))
    }
  }

  draw(context) {
    context.strokeStyle = "black"
    for (const ray of this.rays) {
      context.lineWidth = 1
      context.beginPath()
      context.moveTo(ray[0].x, ray[0].y)
      context.lineTo(ray[1].x, ray[1].y)
      context.stroke()
    }
    context.strokeStyle = "yellow"
    for (const reading of this.readings) {
      context.lineWidth = 3
      context.beginPath()
      context.moveTo(this.car.x, this.car.y)
      context.lineTo(reading.x, reading.y)
      context.stroke()
    }
  }
}
