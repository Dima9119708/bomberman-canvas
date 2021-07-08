import './styles.scss'
import img from './Bomberman.png'

const loadSprite = (sprite) => {
    const image = new Image()
    image.src = sprite
    return image
}

const sprite = loadSprite(img)

const WIDTH = 300
const HEIGHT = 300
const DPI_WIDTH = WIDTH * 1.2
const DPI_HEIGHT = HEIGHT * 1.2
const defaultSizeSprite = 16

const arrowUp = 'ArrowUp'
const arrowDown = 'ArrowDown'
const arrowLeft = 'ArrowLeft'
const arrowRight = 'ArrowRight'

const CONCRETE_WALL = 'CONCRETE_WALL'
const BRICK_WALL = 'BRICK_WALL'

const FIELD = []
const WALLS = []

const BLOCK_SIZE = 27

const BLOCKS_X = Math.round(DPI_WIDTH / BLOCK_SIZE)
const BLOCKS_Y = Math.round(DPI_HEIGHT / BLOCK_SIZE)

const LENGTH_X = BLOCKS_X - 1
const LENGTH_Y = BLOCKS_Y - 1

const canvas = document.querySelector('[data-el="main"]');
const ctx = canvas.getContext('2d')

canvas.style.width = WIDTH + 'px'
canvas.style.height = HEIGHT + 'px'

canvas.width = DPI_WIDTH
canvas.height = DPI_HEIGHT

const playerUp    = animation([[50, 16], [82, 16]], 10)
const playerDown  = animation([[50, 0], [82, 0]], 10)
const playerRight = animation([[3, 16], [34, 16]], 10)
const playerLeft  = animation([[1, 0], [34, 0]], 10)

const player = {
    x: BLOCK_SIZE + 2,
    y: BLOCK_SIZE + 2,
    height: defaultSizeSprite + 5,
    width: defaultSizeSprite,

    defaultStep: 5,
    upStep: null,
    downStep: null,
    leftStep: null,
    rightStep: null,

    move: false,
    direction : arrowRight,

    up: true,
    down: true,
    left: true,
    right: true,

    movement() {
        if (!this.move) {
            switch (this.direction) {
                case arrowUp:
                    ctx.drawImage(sprite, 66, 16, defaultSizeSprite - 4, defaultSizeSprite, this.x, this.y, this.width, this.height)
                    break
                case arrowDown:
                    ctx.drawImage(sprite, 66, 0, defaultSizeSprite - 4, defaultSizeSprite, this.x, this.y, this.width, this.height)
                    break
                case arrowLeft:
                    ctx.drawImage(sprite, 17, 0, defaultSizeSprite - 5, defaultSizeSprite, this.x, this.y, this.width, this.height)
                    break
                case arrowRight:
                    ctx.drawImage(sprite, 20, 16, defaultSizeSprite - 5, defaultSizeSprite, this.x, this.y, this.width, this.height)
                    break
            }

        } else {
            switch (this.direction) {
                case arrowUp: {
                    const [x, y] = playerUp()
                    ctx.drawImage(sprite, x, y, defaultSizeSprite - 4, defaultSizeSprite, this.x, this.y, this.width, this.height)
                    break
                }
                case arrowDown: {
                    const [x, y] = playerDown()
                    ctx.drawImage(sprite, x, y, defaultSizeSprite - 4, defaultSizeSprite, this.x, this.y, this.width, this.height)
                    break
                }
                case arrowLeft: {
                    const [x, y] = playerLeft()
                    ctx.drawImage(sprite, x, y, defaultSizeSprite - 4, defaultSizeSprite, this.x, this.y, this.width, this.height)
                    break
                }
                case arrowRight: {
                    const [x, y] = playerRight()
                    ctx.drawImage(sprite, x, y, defaultSizeSprite - 4, defaultSizeSprite, this.x, this.y, this.width, this.height)
                    break
                }
            }
        }
    }
}

function clear() {
    ctx.clearRect(0, 0, DPI_WIDTH, DPI_HEIGHT)
}

function collision(player, walls) {
    player.upStep = player.defaultStep
    player.downStep = player.defaultStep
    player.leftStep = player.defaultStep
    player.rightStep = player.defaultStep

    for (const [x, y] of walls) {
        const minX = x
        const minY = y
        const maxX = x + BLOCK_SIZE
        const maxY = y + BLOCK_SIZE

        const upMinX = player.x
        const upMinY = player.y
        const upMaxX = player.x + player.width
        const upMaxY = player.y

        const downMinX = player.x
        const downMinY = player.y + player.height
        const downMaxX = player.x + player.width
        const downMaxY = player.y + player.height

        const leftMinX = player.x
        const leftMinY = player.y
        const leftMaxX = player.x
        const leftMaxY = player.y + player.height

        const rightMinX = player.x + player.width
        const rightMinY = player.y
        const rightMaxX = player.x + player.width
        const rightMaxY = player.y + player.height

        if (
            upMinX > minX &&
            upMinX < maxX &&
            upMinY - player.upStep > minY &&
            upMinY - player.upStep < maxY
            ||
            upMaxX > minX &&
            upMaxX < maxX &&
            upMaxY - player.upStep > minY &&
            upMaxY - player.upStep < maxY
        ) {
            player.upStep = upMaxY - maxY
        }
        else if (
            downMinX > minX &&
            downMinX < maxX &&
            downMinY + player.downStep > minY &&
            downMinY + player.downStep < maxY
            ||
            downMaxX > minX &&
            downMaxX < maxX &&
            downMaxY + player.downStep > minY &&
            downMaxY + player.downStep < maxY
        ) {
            player.downStep = minY - downMinY
        }
        else if (
            leftMinX - player.leftStep > minX &&
            leftMinX - player.leftStep < maxX &&
            leftMinY > minY &&
            leftMinY < maxY
            ||
            leftMaxX - player.leftStep > minX &&
            leftMaxX - player.leftStep < maxX &&
            leftMaxY > minY &&
            leftMaxY < maxY
        ) {
            player.leftStep = leftMaxX - maxX
        }
        else if (
            rightMinX + player.rightStep > minX &&
            rightMinX + player.rightStep < maxX &&
            rightMinY > minY &&
            rightMinY < maxY
            ||
            rightMaxX + player.rightStep > minX &&
            rightMaxX + player.rightStep < maxX &&
            rightMaxY > minY &&
            rightMaxY < maxY
        ) {
            player.rightStep = minX - rightMaxX
        }
    }
}

function setupField() {
    for (let y = 0; y < BLOCKS_Y; y++ ) {
        FIELD[y] = []
        for (let x = 0; x < BLOCKS_X; x++) {
            FIELD[y].push('')

            if (y === 0) {
                FIELD[y][x] = CONCRETE_WALL
            }
            else if(x === 0) {
                FIELD[y][x] = CONCRETE_WALL
            }
            else if (x === LENGTH_X) {
                FIELD[y][x] = CONCRETE_WALL
            }
            else if( y === LENGTH_Y) {
                FIELD[y][x] = CONCRETE_WALL
            }

            if (y % 2 === 0 && x % 2 === 0) {
                FIELD[y][x] = CONCRETE_WALL
            }

            if (FIELD[y][x] === CONCRETE_WALL) {
                WALLS.push([x * BLOCK_SIZE, y * BLOCK_SIZE])
            }
        }
    }
}

function drawField() {
    for (let y = 0; y < FIELD.length; y++ ) {
        for (let x = 0; x < FIELD[y].length; x++) {
            drawImage(0, 70, x, y)

            switch (FIELD[y][x]) {
                case CONCRETE_WALL:
                    drawImage(48, 48, x, y)
                    break
            }
        }
    }
}

function animation(frames, loop = 6) {
    let frameIndex = 0
    let tickCount = 0

    return () => {
        tickCount++

        if (tickCount > loop) {
            tickCount = 0;
            if (frameIndex < frames.length - 1) {
                frameIndex++;
            } else {
                frameIndex = 0;
            }
        }

        return frames[frameIndex]
    }
}

function render() {
    clear()

    setupField()
    drawField()
    collision(player, WALLS)

    player.movement()

    requestAnimationFrame(render)
}

render()

function drawImage(sx, sy, dx, dy) {
   ctx.drawImage(
       sprite,
       sx,
       sy,
       defaultSizeSprite,
       defaultSizeSprite,
       dx * BLOCK_SIZE,
       dy * BLOCK_SIZE,
       BLOCK_SIZE,
       BLOCK_SIZE
   )
}

document.addEventListener('keydown', listenerKeyDown)
document.addEventListener('keyup', listenerKeyUp)

function listenerKeyUp() {
    player.move = false
}

function listenerKeyDown(e) {
    e.preventDefault();

    player.move = true
    player.direction = e.code

    switch(e.code) {
        case arrowUp:
            player.y -= player.upStep
            break
        case arrowDown:
            player.y += player.downStep
            break
        case arrowLeft:
            player.x -= player.leftStep
            break
        case arrowRight:
            player.x += player.rightStep
            break
    }
}
