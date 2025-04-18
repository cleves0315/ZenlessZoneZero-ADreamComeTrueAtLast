export function HTMLActuator() {
  this.tileContainer = document.querySelector(".tile-container")
  this.scoreContainer = document.querySelector(".score-container")
  this.bestContainer = document.querySelector(".best-container")
  this.messageContainer = document.querySelector(".game-message")

  this.score = 0
}

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer)

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell)
        }
      })
    })

    self.updateScore(metadata.score, metadata.multedScore)
    self.updateBestScore(metadata.bestScore)

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false) // You lose
      } else if (metadata.won) {
        self.message(true) // You win!
      }
    }
  })
}

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continueGame = function () {
  this.clearMessage()
}

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild)
  }
}

HTMLActuator.prototype.addTile = function (tile) {
  var self = this

  var wrapper = document.createElement("div")
  var inner = document.createElement("div")
  var position = tile.previousPosition || { x: tile.x, y: tile.y }
  var positionClass = this.positionClass(position)

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass]

  if (tile.value > 2048) classes.push("tile-super")

  this.applyClasses(wrapper, classes)

  inner.classList.add("tile-inner")
  inner.setAttribute("data-value", tile.value)
  // inner.textContent = tile.value

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y })
      self.applyClasses(wrapper, classes) // Update the position
    })
  } else if (tile.mergedFrom) {
    classes.push("tile-merged")
    this.applyClasses(wrapper, classes)

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged)
    })

    this.addStar(wrapper)
  } else {
    classes.push("tile-new")
    this.applyClasses(wrapper, classes)
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner)

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper)
}

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "))
}

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 }
}

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position)
  return "tile-position-" + position.x + "-" + position.y
}

HTMLActuator.prototype.updateScore = function (score, multedScore) {
  this.clearContainer(this.scoreContainer)

  var difference = score - this.score
  this.score = score

  this.scoreContainer.textContent = formatNumber(this.score)

  if (difference > 0) {
    this.scoreContainer.dispatchEvent(
      new CustomEvent("updateScore", { detail: { score: this.score } }),
    )

    this.popupAddedScore(difference)
    if (multedScore) {
      this.popupMultedScore(multedScore)
    }
  }
}

HTMLActuator.prototype.popupAddedScore = function (addedScore) {
  var addition = document.createElement("div")
  addition.classList.add("score-addition")
  addition.textContent = "+" + addedScore
  addition.setAttribute("data-text", "+" + addedScore)

  this.scoreContainer.appendChild(addition)
}

HTMLActuator.prototype.popupMultedScore = function (multedScore) {
  this.scoreContainer.dispatchEvent(
    new CustomEvent("popupMultedScore", { detail: { multedScore } }),
  )
}

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = bestScore
}

HTMLActuator.prototype.message = function (won) {
  // var type = won ? "game-won" : "game-over"
  // var message = won ? "You win!" : "Game over!"
  // this.messageContainer.classList.add(type)
  // this.messageContainer.getElementsByTagName("p")[0].textContent = message
}

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won")
  this.messageContainer.classList.remove("game-over")
}

HTMLActuator.prototype.addStar = function (element) {
  const starWrap = document.createElement("div")
  starWrap.classList.add("tile-merged-star-wrapper")

  for (let i = 0; i < 5; i++) {
    const star = document.createElement("div")
    star.classList.add("tile-merged-star")
    starWrap.appendChild(star)
  }

  element.appendChild(starWrap)
}

HTMLActuator.prototype.genRandomMultiplier = function (numberList) {
  this.scoreContainer.dispatchEvent(
    new CustomEvent("genRandomMultiplier", {
      detail: { numberList: JSON.parse(JSON.stringify(numberList)) },
    }),
  )
}

HTMLActuator.prototype.enableMultiplier = function (numbers) {
  this.scoreContainer.dispatchEvent(new CustomEvent("enableMultiplier"))
}
