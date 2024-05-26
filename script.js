const canvas = document.getElementById("canvas")
canvas.height = window.innerHeight
canvas.width = 200

const context = canvas.getContext("2d")

let currentLevel = 1

// SETTINGS
let population = 1
let sensorAmount = JSON.parse(localStorage.getItem("bestCar"))?.levels?.[0]?.inputs?.length || 5
let sensorAngle = Math.PI / 2
let useBest = false
let mutationRate = 0.3
let sensorRange = 200

// SETTING HANDLERS
const handlePopulationChange = (e) => {
  population = e.target.value
  populationDisplay.innerText = population
}
const handleSensorAmountChange = (e) => {
  deleteBestCar()
  sensorAmount = parseInt(e.target.value)
  sensorAmountDisplay.innerText = sensorAmount
}
const handleSensorAngleChange = (e) => {
  // parse the value to radians
  sensorAngle = parseInt(e.target.value) * (Math.PI / 180)
  sensorAngleDisplay.innerText = e.target.value + "°"
}
const handleMutationRateChange = (e) => {
  mutationRate = e.target.value / 100
  mutationRateDisplay.innerText = e.target.value + "%"
}
const handleSensorRangeChange = (e) => {
  sensorRange = e.target.value
  sensorRangeDisplay.innerText = sensorRange
}

// HTML ELEMENTS
const levelDivs = Array.from(document.getElementsByClassName("level"))
const saveButton = document.getElementById("save")
const deleteButton = document.getElementById("delete")
const settings = document.getElementById("settings")

const sensorAmountSettings = document.getElementById("setting-sensor-amount")
const sensorAmountInput = document.getElementById("sensor-amount")
const sensorAmountDisplay = document.getElementById("sensor-amount-display")

const sensorAngleSettings = document.getElementById("setting-sensor-angle")
const sensorAngleInput = document.getElementById("sensor-angle")
const sensorAngleDisplay = document.getElementById("sensor-angle-display")

const populationInput = document.getElementById("population")
const populationDisplay = document.getElementById("population-display")

const mutationRateSettings = document.getElementById("setting-mutation-rate")
const mutationRateInput = document.getElementById("mutation-rate")
const mutationRateDisplay = document.getElementById("mutation-rate-display")

const sensorRangeSettings = document.getElementById("setting-sensor-range")
const sensorRangeInput = document.getElementById("sensor-range")
const sensorRangeDisplay = document.getElementById("sensor-range-display")

// HIDE EVERYTHING EXCEPT THE FIRST LEVEL
sensorAmountDisplay.innerText = sensorAmount
sensorAmountInput.value = sensorAmount
saveButton.style.display = "none"
deleteButton.style.display = "none"
settings.style.display = "none"
sensorAmountSettings.style.display = "none"
sensorAngleSettings.style.display = "none"
mutationRateSettings.style.display = "none"
sensorRangeSettings.style.display = "none"

const hideNonCurrentLevels = () => {
  for (const levelDiv of levelDivs) {
    if (levelDiv.id !== `level-${currentLevel}`) {
      levelDiv.style.display = "none"
    } else {
      levelDiv.style.display = "block"
    }
  }
}
hideNonCurrentLevels()

let cars = [new Car(100, 100, false, false)]
let traffic = []
const resetTraffic = () => {
  traffic = [
    new Car(road.getLaneCenter(2), -300, true),
    new Car(road.getLaneCenter(1), -600, true),
    new Car(road.getLaneCenter(3), -600, true),
    new Car(road.getLaneCenter(2), -900, true),
    new Car(road.getLaneCenter(1), -1200, true),
    new Car(road.getLaneCenter(3), -1200, true),
  ]
}
const saveBestCar = () => {
  localStorage.setItem("bestCar", JSON.stringify(cars[farthestcar].network))
}

const getBestCar = () => {
  return localStorage.getItem("bestCar")
}

const deleteBestCar = () => {
  localStorage.removeItem("bestCar")
}

let farthestcar = 0
let playing = false

const level = () => {
  cars = []

  for (let i = 0; i < population; i++) {
    cars.push(new Car(100, 100, false, true, sensorAmount, sensorAngle, sensorRange))
  }

  if (useBest) {
    const bestCar = getBestCar()
    if (JSON.parse(bestCar).levels[0].inputs.length !== sensorAmount) return
    if (bestCar) {
      cars[0].network = JSON.parse(bestCar)
    }
    if (population < 2) return
    for (car of cars.slice(1)) {
      car.network = Network.tweak(JSON.parse(bestCar), mutationRate)
    }
  }
}

const road = new Road(100, 180, 3)

const generateRandomTraffic = () => {
  const amount = Math.floor(Math.random() * 3) + 1
  const lane = Math.floor(Math.random() * 3) + 1
  const x = road.getLaneCenter(lane)

  traffic.push(new Car(x, cars[farthestcar].y - 1000, true))
  if (amount === 2) {
    traffic.push(new Car(road.getLaneCenter((lane % 3) + 1), cars[farthestcar].y - 1000, true))
  }
}

const next = () => {
  currentLevel++
  hideNonCurrentLevels()
  switch (currentLevel) {
    case 2:
      playing = true
      break
    case 3:
      settings.style.display = "flex"
      break
    case 4:
      sensorAmountSettings.style.display = "flex"
      sensorAngleSettings.style.display = "flex"
      sensorRangeSettings.style.display = "flex"
      break
    case 5:
      saveButton.style.display = "unset"
      deleteButton.style.display = "unset"
      useBest = true
      break
    case 6:
      mutationRateSettings.style.display = "flex"
      break
    default:
      break
  }
  reset()
}

const reset = () => {
  resetTraffic()
  if (currentLevel === 1) {
    cars = [new Car(100, 100, false, false)]
    return
  }
  level()
}

reset()

// EVENT LISTENERS
document.getElementById("next").addEventListener("click", next)
document.getElementById("reset").addEventListener("click", reset)
saveButton.addEventListener("click", saveBestCar)
deleteButton.addEventListener("click", deleteBestCar)
populationInput.addEventListener("input", handlePopulationChange)
sensorAmountInput.addEventListener("input", handleSensorAmountChange)
sensorAngleInput.addEventListener("input", handleSensorAngleChange)
mutationRateInput.addEventListener("input", handleMutationRateChange)
sensorRangeInput.addEventListener("input", handleSensorRangeChange)

animate()

function animate() {
  if (-traffic[traffic.length - 1].y - -cars[farthestcar].y < 800) {
    generateRandomTraffic()
  }

  const allBorders = [...road.borders, ...traffic.map((t) => t.carBorders).flat()]
  context.clearRect(0, 0, canvas.width, canvas.height)

  context.save()
  context.translate(0, -cars[farthestcar].y + (3 * canvas.height) / 4)

  road.draw(context)
  if (!playing && cars?.[0]?.y === 100) {
    for (const t of traffic) {
      t.draw(context)
    }
  } else {
    for (const t of traffic) {
      t.update([])
      t.draw(context)
    }
  }

  // set all cars transparent
  context.globalAlpha = 0.2
  for (let i = 0; i < cars.length; i++) {
    cars[i].update(allBorders)
    cars[i].draw(context, false)
    if (cars[i].y < cars[farthestcar].y) {
      farthestcar = i
    }
  }
  context.globalAlpha = 1
  cars[farthestcar].draw(context)
  // car.draw(context)

  context.restore()
  requestAnimationFrame(animate)
}
