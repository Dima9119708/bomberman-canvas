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
    step: 4,
    move: false,
    direction : arrowRight,

    movement() {
        if (!this.move) {
            switch (this.direction) {
                case arrowUp:
                    ctx.drawImage(sprite, 66, 16, defaultSizeSprite - 4, defaultSizeSprite, player.x, player.y, defaultSizeSprite, defaultSizeSprite + 5)
                    break
                case arrowDown:
                    ctx.drawImage(sprite, 66, 0, defaultSizeSprite - 4, defaultSizeSprite, player.x, player.y, defaultSizeSprite, defaultSizeSprite + 5)
                    break
                case arrowLeft:
                    ctx.drawImage(sprite, 17, 0, defaultSizeSprite - 5, defaultSizeSprite, player.x, player.y, defaultSizeSprite, defaultSizeSprite + 5)
                    break
                case arrowRight:
                    ctx.drawImage(sprite, 20, 16, defaultSizeSprite - 5, defaultSizeSprite, player.x, player.y, defaultSizeSprite, defaultSizeSprite + 5)
                    break
            }

        } else {
            switch (this.direction) {
                case arrowUp: {
                    const [x, y] = playerUp()
                    ctx.drawImage(sprite, x, y, defaultSizeSprite - 4, defaultSizeSprite, player.x, player.y, defaultSizeSprite, defaultSizeSprite + 5)
                    break
                }
                case arrowDown: {
                    const [x, y] = playerDown()
                    ctx.drawImage(sprite, x, y, defaultSizeSprite - 4, defaultSizeSprite, player.x, player.y, defaultSizeSprite, defaultSizeSprite + 5)
                    break
                }
                case arrowLeft: {
                    const [x, y] = playerLeft()
                    ctx.drawImage(sprite, x, y, defaultSizeSprite - 4, defaultSizeSprite, player.x, player.y, defaultSizeSprite, defaultSizeSprite + 5)
                    break
                }
                case arrowRight: {
                    const [x, y] = playerRight()
                    ctx.drawImage(sprite, x, y, defaultSizeSprite - 4, defaultSizeSprite, player.x, player.y, defaultSizeSprite, defaultSizeSprite + 5)
                    break
                }
            }
        }
    }
}

function clear() {
    ctx.clearRect(0, 0, DPI_WIDTH, DPI_HEIGHT)
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
            player.y -= player.step
            break
        case arrowDown:
            player.y += player.step
            break
        case arrowLeft:
            player.x -= player.step
            break
        case arrowRight:
            player.x += player.step
            break
    }
}
