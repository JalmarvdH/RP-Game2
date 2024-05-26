class Road {
  constructor(x, width, lanes = 3) {
    this.x = x
    this.width = width
    this.lanes = lanes

    const inf = 9999999
    this.top = -inf
    this.bottom = inf
    this.left = x - width / 2
    this.right = x + width / 2

    this.borders = [
      [
        { x: this.left, y: this.top },
        { x: this.left, y: this.bottom },
      ],
      [
        { x: this.right, y: this.top },
        { x: this.right, y: this.bottom },
      ],
    ]
  }

  draw(context) {
    context.lineWidth = 5
    context.strokeStyle = "white"

    for (let i = 0; i <= this.lanes; i++) {
      const x = lerp(this.left, this.right, i / this.lanes)
      if (i > 0 && i < this.lanes) {
        context.setLineDash([20, 20])
      } else {
        context.setLineDash([])
      }
      context.beginPath()
      context.moveTo(x, this.top)
      context.lineTo(x, this.bottom)
      context.stroke()
    }
  }

  getLaneCenter(lane) {
    // Should return the center of the lane, not the markings
    return lerp(this.left, this.right, lane / this.lanes) - this.width / 2 / this.lanes
  }
}

function lerp(start, end, t) {
  return start + (end - start) * t
}
