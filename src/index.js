import './styles.scss'
import bgWithout from './bomberman-without-bg.png'
import bgWith from './bomberman-with-bg.png'

const loadSprite = (spriteWithoutBG) => {
    const image = new Image()
    image.src = spriteWithoutBG
    return image
}

const spriteWithBG = loadSprite(bgWith)
const spriteWithoutBG = loadSprite(bgWithout)

const WIDTH = 500
const HEIGHT = 300
const DPI_WIDTH = WIDTH * 1.2
const DPI_HEIGHT = HEIGHT * 1.2

const defaultSizeSprite = 16

const arrowUp = 'ArrowUp'
const arrowDown = 'ArrowDown'
const arrowLeft = 'ArrowLeft'
const arrowRight = 'ArrowRight'
const keyF = 'KeyF'

const control = [arrowUp, arrowDown, arrowLeft, arrowRight, keyF]

const CONCRETE_WALL = 'CONCRETE_WALL' // не взрываються
const BRICK_WALL = 'BRICK_WALL' // Взрывающие стены
const EMPTY = 'FREE_ZONE'

const FIELD = []
const WALLS = []
const FREE_ZONE = []
const GROUP_FREE_ZONE = []
const POINT_SPAWN_BOTS = { switch: true, points: [] }
const BRICK_WALLS = { switch: true, walls: [] }

const RANDOM_NUMBER = 1.6

const BLOCKS_X = 31
const BLOCKS_Y = 13
const BLOCK_SIZE = Number((DPI_HEIGHT / BLOCKS_Y).toFixed(1))

const LENGTH_X = BLOCKS_X - 1
const LENGTH_Y = BLOCKS_Y - 1

const MAX_WIDTH = BLOCKS_X * BLOCK_SIZE

const LENGTH_BOTS = 8
const distanceBots = MAX_WIDTH / LENGTH_BOTS
const DISTANCE_BOTS = []

const BOTS = {
    loops: [200, 500, 800, 1000],
    persons: {
        person1: {
            up: animation([[48, 240.3], [64, 240.3], [80, 240.3]], 35),
            down: animation([[0, 240.3], [16, 240.3], [32, 240.3]], 35),
            left: animation([[48, 240.3], [64, 240.3], [80, 240.3]], 35),
            right: animation([[0, 240.3], [16, 240.3], [32, 240.3]], 35),
        },
        person2: {
            up: animation([[48, 256], [64, 256], [80, 256]], 20),
            down: animation([[0, 256], [16, 256], [32, 256]], 20),
            left: animation([[48, 256], [64, 256], [80, 256]], 20),
            right: animation([[0, 256], [16, 256], [32, 256]], 20),
        },
    },
    spawn: []
}

const canvas = document.querySelector('[data-el="main"]');
const ctx = canvas.getContext('2d')

canvas.style.width = WIDTH + 'px'
canvas.style.height = HEIGHT + 'px'

canvas.width = DPI_WIDTH
canvas.height = DPI_HEIGHT

const person = {
    x: BLOCK_SIZE + 2,
    y: BLOCK_SIZE + 2,

    height: 0,
    width: 0,

    defaultStep: 0,
    upStep: null,
    downStep: null,
    leftStep: null,
    rightStep: null,

    direction : arrowRight,

    upAnimation: null,
    downAnimation: null,
    leftAnimation: null,
    rightAnimation: null,

    movePlayer() {
        collision(this, WALLS)

        if (!this.move) {
            switch (this.direction) {
                case arrowUp:
                    ctx.drawImage(spriteWithoutBG, 66, 16, defaultSizeSprite - 4, defaultSizeSprite, this.x, this.y, this.width, this.height)
                    break
                case arrowDown:
                    ctx.drawImage(spriteWithoutBG, 66, 0, defaultSizeSprite - 4, defaultSizeSprite, this.x, this.y, this.width, this.height)
                    break
                case arrowLeft:
                    ctx.drawImage(spriteWithoutBG, 17, 0, defaultSizeSprite - 5, defaultSizeSprite, this.x, this.y, this.width, this.height)
                    break
                case arrowRight:
                    ctx.drawImage(spriteWithoutBG, 20, 16, defaultSizeSprite - 5, defaultSizeSprite, this.x, this.y, this.width, this.height)
                    break
            }

        } else {
            switch (this.direction) {
                case arrowUp: {
                    const [x, y] = this.upAnimation()
                    ctx.drawImage(spriteWithoutBG, x, y, defaultSizeSprite - 4, defaultSizeSprite, this.x, this.y, this.width, this.height)
                    break
                }
                case arrowDown: {
                    const [x, y] = this.downAnimation()
                    ctx.drawImage(spriteWithoutBG, x, y, defaultSizeSprite - 4, defaultSizeSprite, this.x, this.y, this.width, this.height)
                    break
                }
                case arrowLeft: {
                    const [x, y] = this.leftAnimation()
                    ctx.drawImage(spriteWithoutBG, x, y, defaultSizeSprite - 4, defaultSizeSprite, this.x, this.y, this.width, this.height)
                    break
                }
                case arrowRight: {
                    const [x, y] = this.rightAnimation()
                    ctx.drawImage(spriteWithoutBG, x, y, defaultSizeSprite - 4, defaultSizeSprite, this.x, this.y, this.width, this.height)
                    break
                }
            }
        }
    },

    moveBot() {
        collision(this, [...WALLS,
            player.activeBomb
                ? [bomb.x * BLOCK_SIZE, bomb.y * BLOCK_SIZE]
                : []
            ]
        )

        this.countLoop++

        const way = {
            [arrowUp]: this.upStep,
            [arrowDown]: this.downStep,
            [arrowLeft]: this.leftStep,
            [arrowRight]: this.rightStep
        }

        if (this.countLoop > this.loop) {
            this.countLoop = 0
            this.loop = BOTS.loops[randomNumber(BOTS.loops.length)]
            this.randomDirection(way)
        }

        if (way[this.direction] === 0) {
            this.randomDirection(way)
        }

        move(this, this.direction)

        switch (this.direction) {
            case arrowUp: {
                const [x, y] = this.upAnimation()
                ctx.drawImage(spriteWithoutBG, x, y, defaultSizeSprite, defaultSizeSprite, this.x, this.y, this.width, this.height)
                break
            }
            case arrowDown: {
                const [x, y] = this.downAnimation()
                ctx.drawImage(spriteWithoutBG, x, y, defaultSizeSprite, defaultSizeSprite, this.x, this.y, this.width, this.height)
                break
            }
            case arrowLeft: {
                const [x, y] = this.leftAnimation()
                ctx.drawImage(spriteWithoutBG, x, y, defaultSizeSprite, defaultSizeSprite, this.x, this.y, this.width, this.height)
                break
            }
            case arrowRight: {
                const [x, y] = this.rightAnimation()
                ctx.drawImage(spriteWithoutBG, x, y, defaultSizeSprite, defaultSizeSprite, this.x, this.y, this.width, this.height)
                break
            }
        }
    },

    randomDirection(way) {
        const idx = randomNumber(Object.keys(way).length)
        this.direction = Object.keys(way)[idx]
    }
}

const player = { ...person, ...{
    x: BLOCK_SIZE + 5,
    y: BLOCK_SIZE + 5,
    height: defaultSizeSprite + 5,
    width: defaultSizeSprite,
    defaultStep: 5,
    direction : arrowRight,
    move: false,
    activeBomb: false,

    upAnimation: animation([[50, 16], [82, 16]], 10),
    downAnimation: animation([[50, 0], [82, 0]], 10),
    leftAnimation: animation([[1, 0], [34, 0]], 10),
    rightAnimation: animation([[3, 16], [34, 16]], 10),
    bombAnimation: animation([[0, 48], [16, 48], [31.5, 48]], 10),

    plantBomb() {
        if (this.activeBomb) {
            bomb.detonationBom(this)
            bomb.drawBomb()
            return
        }

        const playerX = this.x + (this.width / 2)
        const playerY = this.y + (this.height / 2)

        for (const [x, y] of FREE_ZONE) {
            const minX = x * BLOCK_SIZE
            const minY = y * BLOCK_SIZE
            const maxX = x * BLOCK_SIZE + BLOCK_SIZE
            const maxY = y * BLOCK_SIZE + BLOCK_SIZE

            if (
                playerX > minX && playerX < maxX &&
                playerY > minY && playerY < maxY
            ) {
                bomb.x = x
                bomb.y = y

                break
            }
        }
    },
}}

const bomb = {
    x: null,
    y: null,
    countBom: 0,
    timeBom: 180,
    bombAnimation: animation([[0, 48], [16, 48], [31.5, 48]], 10),

    detonationBom(player) {
        this.countBom++

        if (this.countBom >= this.timeBom) {
            this.countBom = 0
            player.activeBomb = false
        }
    },

    drawBomb() {
        const [ x, y ] = this.bombAnimation()

        ctx.drawImage(
            spriteWithBG,
            x,
            y,
            defaultSizeSprite,
            defaultSizeSprite,
            (this.x * BLOCK_SIZE + (BLOCK_SIZE / 2)) - ((defaultSizeSprite + 5) / 2),
            (this.y * BLOCK_SIZE + (BLOCK_SIZE / 2)) - ((defaultSizeSprite + 5) / 2),
            defaultSizeSprite + 5,
            defaultSizeSprite + 5
        )
    }
}

const camera = {
    w: DPI_WIDTH,

    translateX(
        player,
        speed = 1,
        percentL = 50,
        percentR = 50,
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

function clearArrays() {
    WALLS.length = 0
    FREE_ZONE.length = 0
    DISTANCE_BOTS.length = 0
    BRICK_WALLS.switch = false
}

function randomNumber(number) {
    return Math.floor(Math.random() * number)
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

function setupDistanceBetweenBots() {
    let prev = distanceBots
    for (let i = 0; i < LENGTH_BOTS; i++) {
        DISTANCE_BOTS.push([prev, distanceBots + prev])
        prev += distanceBots
    }
}

function setupField() {

    for (let y = 0; y < BLOCKS_Y; y++ ) {
        FIELD[y] = []
        for (let x = 0; x < BLOCKS_X; x++) {
            FIELD[y].push(EMPTY)

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

            if (FIELD[y][x] !== CONCRETE_WALL && BRICK_WALLS.switch) {
               BRICK_WALLS.walls.push([x, y, randomNumber(RANDOM_NUMBER)])
            }

            if (FIELD[y][x] === CONCRETE_WALL) {
                WALLS.push([x * BLOCK_SIZE, y * BLOCK_SIZE])
            }
        }
    }

    // Спавн каменных стен
    for (const [idx, [x, y, randNum]] of BRICK_WALLS.walls.entries()) {

        const prev3 = BRICK_WALLS.walls[idx - 3]?.[2]
        const prev2 = BRICK_WALLS.walls[idx - 2]?.[2]
        const prev1 = BRICK_WALLS.walls[idx - 1]?.[2]

        if (y === 1 && x === 1 ||
            y === 1 && x === 2 ||
            y === 2 && x === 1
        ) {
            continue
        }

        if (prev1 > 0 && prev2 > 0 && prev3 > 0) {
            continue
        }

        if (randNum > 0) {
            FIELD[y][x] = BRICK_WALL
            //WALLS.push([x * BLOCK_SIZE, y * BLOCK_SIZE])
        }
    }

    for (let y = 0; y < FIELD.length; y++ ) {
        for (let x = 0; x < FIELD[y].length; x++) {
            if (FIELD[y][x] === EMPTY) {
                FREE_ZONE.push([x, y])
            }
        }
    }
}

function setupSpawnBots() {
    if (!POINT_SPAWN_BOTS.switch) return;

    for (const [i, [min, max]] of DISTANCE_BOTS.entries()) {
        GROUP_FREE_ZONE[i] = []

        for (const [x, y] of FREE_ZONE) {
            if ( (x * BLOCK_SIZE) > min && (x * BLOCK_SIZE) < max ) {
                GROUP_FREE_ZONE[i].push([x, y])
            }
        }
    }

    for (const groupFreeZone of GROUP_FREE_ZONE) {
        const idx = randomNumber(groupFreeZone.length)
        POINT_SPAWN_BOTS.points.push(groupFreeZone[idx] || [])
        groupFreeZone.splice(idx, 1)
    }

    createBot()

    POINT_SPAWN_BOTS.switch = false
}

function createBot() {
    POINT_SPAWN_BOTS.points.forEach( ([x, y]) =>  {
        const randBotIdx = randomNumber(Object.keys(BOTS.persons).length)
        const nameBot = Object.keys(BOTS.persons)[randBotIdx]
        const bot = BOTS.persons[nameBot]

        BOTS.spawn.push(
            { ...person, ...{
                    x: x * BLOCK_SIZE,
                    y: y * BLOCK_SIZE,
                    height: defaultSizeSprite + 5,
                    width: defaultSizeSprite + 5,
                    countLoop: 0,
                    loop: BOTS.loops[randomNumber(BOTS.loops.length)],
                    direction : control[randomNumber(control.length)],
                    defaultStep: 0.5,
                    upAnimation: bot.up,
                    downAnimation: bot.down,
                    leftAnimation: bot.left,
                    rightAnimation: bot.right,
                }}
        )
    })
}

function drawField() {
    for (let y = 0; y < FIELD.length; y++ ) {
        for (let x = 0; x < FIELD[y].length; x++) {
            ctx.drawImage(
                spriteWithBG,
                0,
                70,
                defaultSizeSprite,
                defaultSizeSprite,
                x * BLOCK_SIZE,
                y * BLOCK_SIZE,
                BLOCK_SIZE,
                BLOCK_SIZE
            )

            switch (FIELD[y][x]) {
                case CONCRETE_WALL:
                    ctx.drawImage(
                        spriteWithBG,
                        48,
                        48,
                        defaultSizeSprite,
                        defaultSizeSprite,
                        x * BLOCK_SIZE,
                        y * BLOCK_SIZE,
                        BLOCK_SIZE,
                        BLOCK_SIZE
                    )
                    break

                case BRICK_WALL:
                    ctx.drawImage(
                        spriteWithBG,
                        64,
                        48,
                        defaultSizeSprite,
                        defaultSizeSprite,
                        x * BLOCK_SIZE,
                        y * BLOCK_SIZE,
                        BLOCK_SIZE,
                        BLOCK_SIZE
                    )
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

    setupDistanceBetweenBots()
    setupField()
    setupSpawnBots()
    drawField()

    player.plantBomb()
    player.movePlayer()

    BOTS.spawn.forEach(bot => bot.moveBot())

    camera.translateX(player, 2)

    clearArrays()
    requestAnimationFrame(render)
}

render()

document.addEventListener('keydown', listenerKeyDown)
document.addEventListener('keyup', listenerKeyUp)

function listenerKeyUp() {
    player.move = false
}

function listenerKeyDown(e) {
    e.preventDefault();

    player.move = e.code !== keyF
    player.direction = e.code === keyF ? player.direction : e.code

    move(player, e.code)
}

function move(person, direction) {

    switch(direction) {
        case arrowUp:
            person.y -= person.upStep
            break
        case arrowDown:
            person.y += person.downStep
            break
        case arrowLeft:
            person.x -= person.leftStep
            break
        case arrowRight:
            person.x += person.rightStep
            break
        case keyF :
            person.activeBomb = true
            break
    }
}