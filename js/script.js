/* CONFIG */

/* TODO: add max amount of same mutation */

const query = document.querySelector.bind(document)
const queryAll = document.querySelectorAll.bind(document)

const main = query('main')
const mainWidth = main.offsetWidth
const mainHeight = main.offsetHeight
const maxDots = 200
const initialSpawnAmount = 100
const namesEnabled = true
const moveIncrement = 15
const safeZoneWidth = 350
const safeZoneHeight = 350
let round = 0
let alive = 0
let dead = 0
let gameRunning = true
let timer = 7
let activeTimer = timer

let mutationsList = [
  {
    name: 'god',
    speed: 0.06, // seconds it takes to move one step. low is fast
    mutationRate: 0.5,
    directions: '01234567'

    // Up = 0, Right = 1, Down = 2, Left = 3
    // UpLeft = 4, UpRight = 5, DownRight = 6, DownLeft = 7
  }
]

function makeElementDraggable(element) {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0
  element.onmousedown = dragMouseDown

  function dragMouseDown(e) {
    e = e || window.event

    // Get the mouse position relative to the element
    let mouseX = e.clientX - element.getBoundingClientRect().left
    let mouseY = e.clientY - element.getBoundingClientRect().top

    // Define the size of the area in the corners where resizing happens
    let resizeAreaSize = 20

    // If the mouse down event occurred in the resize area, return early
    if (
      mouseX < resizeAreaSize ||
      mouseY < resizeAreaSize ||
      mouseX > element.offsetWidth - resizeAreaSize ||
      mouseY > element.offsetHeight - resizeAreaSize
    ) {
      return
    }

    e.preventDefault()

    pos3 = e.clientX
    pos4 = e.clientY
    document.onmouseup = closeDragElement
    document.onmousemove = elementDrag
  }

  function elementDrag(e) {
    e = e || window.event
    e.preventDefault()
    pos1 = pos3 - e.clientX
    pos2 = pos4 - e.clientY
    pos3 = e.clientX
    pos4 = e.clientY

    element.style.top = `${minMaxValue(
      element.offsetTop - pos2,
      0,
      mainHeight - element.offsetHeight
    )}px`

    element.style.left = `${minMaxValue(
      element.offsetLeft - pos1,
      0,
      mainWidth - element.offsetWidth
    )}px`
  }

  function closeDragElement() {
    document.onmouseup = null
    document.onmousemove = null
  }
}

setTimeout(function () {
  queryAll('.safe-zone').forEach((safeZone) => {
    makeElementDraggable(safeZone)
  })
}, 200)

function checkCollisionTwoElements(element1, element2) {
  const rect1 = element1.getBoundingClientRect()
  const rect2 = element2.getBoundingClientRect()

  return (
    rect1.top < rect2.bottom &&
    rect1.bottom > rect2.top &&
    rect1.left < rect2.right &&
    rect1.right > rect2.left
  )
}

function checkCollisionsReturnElements(safeZones, listOfDotElements) {
  const collisionElements = []

  safeZones.forEach((safeZone) => {
    listOfDotElements.forEach((dot) => {
      if (checkCollisionTwoElements(safeZone, dot)) {
        collisionElements.push(dot)
      }
    })
  })

  return collisionElements
}

function findMutation(name) {
  const mutation = mutationsList.find((mutation) => mutation.name === name)
  return mutation ? mutation : false
}

const updateInnerText = (element, value) =>
  (query(`${element}`).innerText = value)

function updateInfo(element) {
  const dotName = element.getAttribute('name')
  const currentMutation = findMutation(dotName)

  query('#info').classList.remove('hidden')

  updateInnerText('#dotNameValue', currentMutation.name)
  updateInnerText('#dotSizeValue', currentMutation.size)
  updateInnerText('#dotSpeedValue', currentMutation.speed)
  updateInnerText('#dotMutationRateValue', currentMutation.mutationRate)
  updateInnerText('#directionsValue', getWeights(currentMutation.directions))
}

function minMaxValue(value, min, max) {
  value = value < min ? min : value
  return value > max ? max : value
}

/* RANDOM */

function randomNumber(type, min, max, not) {
  const randomNumberReturn =
    type === 'int'
      ? Math.floor(Math.random() * (max - min + 1)) + min
      : (Math.random() * (max - min) + min).toFixed(1)
  if (!not) {
    return randomNumberReturn
  } else {
    return not === randomNumberReturn
      ? randomNumber(type, min, max, not)
      : randomNumberReturn
  }
}

function probability(decimal) {
  return !!decimal && Math.random() <= decimal
}

function randomRGBColour() {
  return [
    randomNumber('int', 0, 255),
    randomNumber('int', 0, 255),
    randomNumber('int', 0, 255)
  ]
}

function randomRGBChange(colors) {
  return colors.map((color) => {
    const incrementColor = randomNumber('int', 0, 50)

    return minMaxValue(
      probability(0.5) ? color + incrementColor : color - incrementColor,
      0,
      255
    )
  })
}

function randomBorderRadius() {
  return Array.from(
    { length: 4 },
    () => `${randomNumber('int', 0, 30)}px`
  ).join(' ')
}

function cuteName(length = 4) {
  let cuteName = []
  const c = 'bcdfghjklmnpqrstvwxyz'.split('')
  const v = 'aeiou'.split('')

  for (let i = 0; i < length; i++) {
    cuteName.push(
      i % 2 === 0
        ? c[randomNumber('int', 0, c.length - 1)]
        : v[randomNumber('int', 0, v.length - 1)]
    )
  }

  return cuteName.join('')
}

function getRandomDirections() {
  return Array.from({ length: 7 }, () => randomNumber('int', 0, 7)).join('')
}

/* MOVING THE AI AROUND */

function checkBounds(left, top) {
  top = top < 0 ? 0 : top // top
  top = top > mainHeight - 35 ? mainHeight - 35 : top // bottom
  left = left < 0 ? 0 : left // left
  left = left > mainWidth - 35 ? mainWidth - 35 : left // right
  return [left, top]
}

function animateDot(dot) {
  const currentMutation = findMutation(dot.getAttribute('name'))
  if (!currentMutation || currentMutation.alive === false) return false

  let directions = currentMutation.directions

  directions = [
    directions[randomNumber('int', 0, directions.length - 1)]
    /* directions[randomNumber('int', 0, directions.length - 1)],
    directions[randomNumber('int', 0, directions.length - 1)] */
  ] // 2 random directions from mutation

  const speed = currentMutation.speed / 1.5
  const position = getTransformXY(dot)
  let transformX = position[0]
  let transformY = position[1]

  directions.forEach((dir) => {
    switch (dir) {
      case '0':
        transformY -= moveIncrement
        break
      case '1':
        transformX += moveIncrement
        break
      case '2':
        transformY += moveIncrement
        break
      case '3':
        transformX -= moveIncrement
        break
      case '4':
        transformX -= moveIncrement
        transformY -= moveIncrement
        break
      case '5':
        transformX += moveIncrement
        transformY -= moveIncrement
        break
      case '6':
        transformX += moveIncrement
        transformY += moveIncrement
        break
      case '7':
        transformX -= moveIncrement
        transformY += moveIncrement
        break
    }
  })

  const positions = checkBounds(transformX, transformY)
  dot.style.transition = `transform ${speed}s ease-in-out`

  moveObject(dot, positions[0], positions[1], speed)
  requestAnimationFrame(() => animateDot(dot))
}

function getTransformXY(element) {
  const style = window.getComputedStyle(element)
  const matrix = new WebKitCSSMatrix(style.transform)
  return [matrix.m41, matrix.m42]
}

/* KILL & REWARD */

function killDots() {
  const safeZones = queryAll('.safe-zone')

  queryAll('.dot').forEach((dot) => {
    const dotName = dot.getAttribute('name')

    const amountCollisionsOfType = checkCollisionsReturnElements(
      safeZones,
      queryAll(`.dot[name="${dotName}"]`)
    )

    if (amountCollisionsOfType.length === 0) {
      // extinct species
      findMutation(dotName).alive = false
      mutationsList = mutationsList.filter((item) => item.alive !== false)
    }

    if (checkCollisionsReturnElements(safeZones, [dot]).length === 0) {
      // dead dot
      dot.remove()
      dead++
    }

    if (amountCollisionsOfType.length > 5) {
      amountCollisionsOfType.forEach((dot, index) => {
        if (index > 5) {
          dot.remove()
          dead++
        }
      })
    }

    if (probability(0.1)) {
      dot.remove()
      dead++
    }
  })
}

function rewardDots() {
  queryAll('.dot').forEach((dot) => {
    const currentMutation = findMutation(dot.getAttribute('name'))

    if (probability(currentMutation.mutationRate)) {
      mutate(currentMutation)
    } else {
      spawn(currentMutation)
    }
  })
}

function updateTimer() {
  activeTimer--
  updateInnerText('#timerValue', activeTimer.toString().padStart(2, '0'))

  if (activeTimer === 0) {
    gameRunning = false
    activeTimer = timer + 1

    killDots()

    setTimeout(function () {
      rewardDots()

      queryAll('.dot').forEach((dot) => {
        moveObject(dot, 'default')
      })
    }, 1000)
  } else if (!gameRunning) {
    gameRunning = true
  }
}

function changeValueUpDown(value, min, max, increment) {
  value = Number(value)
  increment = Number(increment)

  const newValue = (
    probability(0.5) ? value + increment : value - increment
  ).toFixed(2)

  return minMaxValue(newValue, Number(min), Number(max))
}

/* SPAWNING & MUTATING */

function spawn(mutation) {
  if (queryAll('.dot').length >= maxDots) return

  mutation.alive = true

  const dot = document.createElement('div')
  dot.setAttribute('class', 'dot')
  dot.setAttribute('name', mutation.name)
  dot.style.height = `${mutation.size}px`
  dot.style.width = `${mutation.size}px`
  dot.style.background = `rgb(${mutation.innerColor})`
  dot.style.border = `${mutation.borderPx}px solid rgb(${mutation.borderColor})`
  dot.style.outline = `${mutation.outlinePx}px solid rgb(${mutation.outlineColor})`
  dot.style.borderRadius = mutation.borderRadius

  main.appendChild(dot)

  dot.addEventListener('mouseover', function () {
    updateInfo(this)
  })

  moveObject(dot, 'default')

  if (namesEnabled) {
    dot.setAttribute('seeNames', 'true')
  }

  animateDot(dot)
}

function mutate(previous) {
  if (queryAll('.dot').length >= maxDots) return

  const newName = cuteName(4)

  mutationsList.push({
    name: newName,
    speed: changeValueUpDown(previous.speed, 0, 10, 0.01),
    mutationRate: changeValueUpDown(previous.mutationRate, 0, 1, 0.1),
    size: randomNumber('int', 10, 20),
    innerColor: previous.innerColor
      ? randomRGBChange(previous.innerColor)
      : randomRGBColour(),
    borderColor: previous.borderColor
      ? randomRGBChange(previous.borderColor)
      : randomRGBColour(),
    borderPx: randomNumber('int', 0, 10),
    outlineColor: previous.outlineColor
      ? randomRGBChange(previous.outlineColor)
      : randomRGBColour(),
    outlinePx: randomNumber('int', 0, 10),
    borderRadius: randomBorderRadius(),
    directions: previous.directions + getRandomDirections()
  })

  spawn(findMutation(newName))
}

/* INTERVALS & TIMEOUTS */

setInterval(function () {
  updateTimer()
}, 1000)

setInterval(function () {
  updateInnerText('#roundValue', round)
  updateInnerText('#aliveValue', `${queryAll('.dot').length} / ${maxDots}`)
  updateInnerText('#deadValue', dead)
}, 300)

/* OTHER */

updateInnerText('#timerValue', activeTimer.toString().padStart(2, '0'))

Array.from(
  { length: initialSpawnAmount < maxDots ? initialSpawnAmount : maxDots },
  (_, index) => index
).map((index) => {
  mutate(mutationsList[0])
  // animateDot(queryAll('.dot')[index])
})

function moveObject(element, x, y, speed) {
  if (x === 'default') {
    element.style.transition = 'transform 0s'
    element.style.transform = `translate(${mainWidth / 2}px, ${
      mainHeight / 2
    }px)`
  } else if (gameRunning) {
    element.style.transform = `translate(${x}px, ${y}px)`
  }
}

function getWeights(number) {
  const weights = Array(8).fill(0)

  number.split('').forEach((digit) => {
    if (digit >= '0' && digit <= '7') {
      weights[parseInt(digit, 10)]++
    }
  })

  return `Up: ${weights[0]} Right: ${weights[1]} Down: ${weights[2]} Left: ${weights[3]} UpLeft: ${weights[4]} UpRight: ${weights[5]} DownRight: ${weights[6]} DownLeft: ${weights[7]}`
}

function createSafeZone(
  left,
  top,
  width = safeZoneWidth,
  height = safeZoneHeight
) {
  /* 
  width: 350px;
  height: 350px;
   */
  const safeZone = document.createElement('div')
  safeZone.setAttribute('class', 'safe-zone')

  safeZone.style.left =
    typeof left === 'number'
      ? `${left}px`
      : `${mainWidth / 2 - safeZoneWidth / 2}px`

  safeZone.style.top =
    typeof top === 'number'
      ? `${top}px`
      : `${mainHeight / 2 - safeZoneHeight / 2}px`
  safeZone.style.width = `${width}px`
  safeZone.style.height = `${height}px`

  query('#safe-zones').appendChild(safeZone)
  makeElementDraggable(safeZone)
}

query('#create-safe-zone').addEventListener('click', function () {
  createSafeZone()
})

query('#info-close').addEventListener('click', function () {
  query('#info').classList.add('hidden')
})

query('#about-close').addEventListener('click', function () {
  query('#about').classList.add('hidden')
})

createSafeZone(0, 0)
createSafeZone(mainWidth / 1.5 - safeZoneWidth / 2, 0)
// createSafeZone(0, mainHeight - safeZoneHeight)
// createSafeZone(mainWidth - safeZoneWidth, mainHeight - safeZoneHeight)
