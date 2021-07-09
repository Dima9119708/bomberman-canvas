import './styles.scss'
import img from './Bomberman.png'

const loadSprite = (sprite) => {
    const image = new Image()
    image.src = sprite
    return image
}

const sprite = loadSprite(img)

const WIDTH = 500
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
const FREE_ZONE = 'FREE_ZONE'

const FIELD = []
const WALLS = []

const BLOCKS_X = 31
const BLOCKS_Y = 13

const BLOCK_SIZE = Number((DPI_HEIGHT / BLOCKS_Y).toFixed(1))

const LENGTH_X = BLOCKS_X - 1
const LENGTH_Y = BLOCKS_Y - 1

const MAX_WIDTH = BLOCKS_X * BLOCK_SIZE

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
        collision(this, WALLS)

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

const camera = {
    w: DPI_WIDTH,

    translateX(
        player,
        speed = 1,
        percentR = 50,
        percentL = 50,
    ) {

        const rightPoint = player.x
        const leftPoint = player.x + player.width

        const startPointX = this.w - DPI_WIDTH

        const pointRTranslate = startPointX + (DPI_WIDTH * percentR) / 100
        const pointLTranslate = startPointX + (DPI_WIDTH * percentL) / 100

        if (rightPoint > pointRTranslate && this.w < MAX_WIDTH) {
            ctx.translate(-speed, 0)
            this.w += speed
        }

        if (leftPoint < pointLTranslate && this.w > DPI_WIDTH) {
            ctx.translate(speed, 0)
            this.w -= speed
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

        const point1X = player.x
        const point1Y = player.y

        const point2X = player.x + player.width
        const point2Y = player.y

        const point3X = player.x + player.width
        const point3Y = player.y + player.height

        const point4X = player.x
        const point4Y = player.y + player.height

        if (
            point1X > minX &&
            point1X < maxX &&
            point1Y - player.upStep > minY &&
            point1Y - player.upStep < maxY
            ||
            point2X > minX &&
            point2X < maxX &&
            point2Y - player.upStep > minY &&
            point2Y - player.upStep < maxY
        ) {
            player.upStep = point1Y - maxY
        }
        else if (
            point3X > minX &&
            point3X < maxX &&
            point3Y + player.downStep > minY &&
            point3Y + player.downStep < maxY
            ||
            point4X > minX &&
            point4X < maxX &&
            point4Y + player.downStep > minY &&
            point4Y + player.downStep < maxY
        ) {
            player.downStep = minY - point3Y
        }
        else if (
            point1X - player.leftStep > minX &&
            point1X - player.leftStep < maxX &&
            point1Y > minY &&
            point1Y < maxY
            ||
            point4X - player.leftStep > minX &&
            point4X - player.leftStep < maxX &&
            point4Y > minY &&
            point4Y < maxY
        ) {
            player.leftStep = point4X - maxX
        }
        else if (
            point2X + player.rightStep > minX &&
            point2X + player.rightStep < maxX &&
            point2Y > minY &&
            point2Y < maxY
            ||
            point3X + player.rightStep > minX &&
            point3X + player.rightStep < maxX &&
            point3Y > minY &&
            point3Y < maxY
        ) {
            player.rightStep = minX - point3X
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

            if (FIELD[y][x] !== CONCRETE_WALL &&
                y % 5 === 0 && x % 5 === 0
            ) {
                FIELD[y][x] = BRICK_WALL
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

                case BRICK_WALL:
                    drawImage(64, 48, x, y)
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
    camera.translateX(player, 2)

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
