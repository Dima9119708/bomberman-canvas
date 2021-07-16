import audio from "./audio";
import bgWith from "../image/bomberman-with-bg.png";
import bgWithout from "../image/bomberman-without-bg.png";
import Engine from "./Engine";

const WIDTH = 500
const HEIGHT = 300
const DPI_WIDTH = WIDTH * 1.2
const DPI_HEIGHT = HEIGHT * 1.2

const defaultSizeSprite = 16

const arrowUp = 'ArrowUp'
const arrowDown = 'ArrowDown'
const arrowLeft = 'ArrowLeft'
const arrowRight = 'ArrowRight'
const W = 'KeyW'
const S = 'KeyS'
const D = 'KeyD'
const A = 'KeyA'
const keyF = 'KeyF'

const control = [arrowUp, arrowDown, arrowLeft, arrowRight]

const CONCRETE_WALL = 'CONCRETE_WALL' // не взрываються
const BRICK_WALL = 'BRICK_WALL' // Взрывающие стены
const EMPTY = 'FREE_ZONE'

const loadSprite = (sprite) => {
    const image = new Image()
    image.src = sprite
    return image
}

const spriteWithBG = loadSprite(bgWith)
const spriteWithoutBG = loadSprite(bgWithout)

export default function Bomberman() {
    let raf

    const FIELD = []
    const WALLS = []
    const FREE_ZONE = []
    const GROUP_FREE_ZONE = []
    const POINT_SPAWN_BOTS = { switch: true, points: [] }

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

    const TIME_BOMB = 180
    const TIME_BANG = 50
    const TIME_DEAD = 100
    const TIME_SCORE = 100
    const TIME_BRICK_WALL = 80
    const TIME_BOTS = 200

    const BANG = []

    const canvas = document.querySelector('[data-el="main"]');
    const dashboard = document.querySelector('.dashboard');
    const ctx = canvas.getContext('2d')

    canvas.style.width = WIDTH + 'px'
    canvas.style.height = HEIGHT + 'px'
    dashboard.style.width = WIDTH + 'px'

    canvas.width = DPI_WIDTH
    canvas.height = DPI_HEIGHT

    const BRICK_WALLS = {
        switch: true,
        walls: [],

        tick: 0,
        time: TIME_BRICK_WALL,

        destroyGroup: [],
        destroyAnimation: animation([[80, 48], [96, 48], [112, 48], [128, 48], [144, 48], [160, 48]], TIME_BRICK_WALL / 6),

        destroy(x, y) {
            for (const [i, [wallX, wallY]] of this.walls.entries()) {
                if (wallX === x && wallY === y) {
                    this.destroyGroup.push([x, y])
                    this.walls.splice(i, 1)
                }
            }
        },

        drawDestroy() {
            if (!this.destroyGroup.length) return

            this.tick++

            if (this.tick > this.time) {
                this.tick = 0
                this.destroyGroup.length = 0
                this.destroyAnimation(true)
                return
            }

            const [sx, sy] = this.destroyAnimation()

            for (const [dx, dy] of this.destroyGroup) {
                ctx.drawImage(
                    spriteWithoutBG,
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
        }
    }

    const SCORE = {
        timeScore: TIME_SCORE,
        destroyGroup: [],

        score: 100,

        score100: [116, 339],
        score200: [116, 337],
        score400: [116, 355],
        score800: [116, 383],

        drawScore() {
            for (const [idx, bot] of this.destroyGroup.entries()) {
                bot.tickScore++

                if (bot.tickScore >= this.timeScore) {
                    this.score += bot.score
                    dashboard.innerHTML = `Score: ${this.score}`
                    this.destroyGroup.splice(idx, 1)
                }

                const [sx, sy] = this[`score${bot.score}`]

                ctx.drawImage(
                    spriteWithoutBG,
                    sx,
                    sy,
                    12,
                    5,
                    bot.x,
                    bot.y,
                    16,
                    9,
                )
            }
        }
    }

    const BOTS = {
        loops: [200, 400, 500, 700, 800, 1000],
        persons: {
            person1: {
                defaultStep: 0.4,
                wall: false,
                score: 100,
                animate() {
                    return {
                        up: animation([[48, 240.3], [64, 240.3], [80, 240.3]], 35),
                        down: animation([[0, 240.3], [16, 240.3], [32, 240.3]], 35),
                        left: animation([[48, 240.3], [64, 240.3], [80, 240.3]], 35),
                        right: animation([[0, 240.3], [16, 240.3], [32, 240.3]], 35),
                        destroy: animation([[96, 240], [112, 240], [128, 240], [144, 240], [160, 240]], 200 / 5)
                    }
                }
            },
            person2: {
                defaultStep: 0.4,
                wall: false,
                score: 200,
                animate() {
                    return {
                        up: animation([[48, 256], [64, 256], [80, 256]], 20),
                        down: animation([[0, 256], [16, 256], [32, 256]], 20),
                        left: animation([[48, 256], [64, 256], [80, 256]], 20),
                        right: animation([[0, 256], [16, 256], [32, 256]], 20),
                        destroy: animation([[96, 256], [112, 288], [128, 288], [144, 288], [160, 288]], 200 / 5)
                    }
                }
            },
        },

        spawn: [],

        tick: 0,
        time: TIME_BOTS,

        destroyGroup: [],

        setupDistanceBetweenBots() {
            let prev = distanceBots
            for (let i = 0; i < LENGTH_BOTS; i++) {
                DISTANCE_BOTS.push([prev, distanceBots + prev])
                prev += distanceBots
            }
        },

        setupSpawnBots() {
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

                if (!groupFreeZone[idx]) break

                POINT_SPAWN_BOTS.points.push(groupFreeZone[idx])
                groupFreeZone.splice(idx, 1)
            }

            this.createBot()

            POINT_SPAWN_BOTS.switch = false
        },

        createBot() {
            POINT_SPAWN_BOTS.points.forEach( ([x, y]) =>  {
                const randBotIdx = randomNumber(Object.keys(BOTS.persons).length)
                const nameBot = Object.keys(BOTS.persons)[randBotIdx]
                const bot = BOTS.persons[nameBot]
                Object.assign(bot, bot.animate())

                BOTS.spawn.push(
                    { ...person, ...{
                            x: x * BLOCK_SIZE,
                            y: y * BLOCK_SIZE,
                            height: defaultSizeSprite + 5,
                            width: defaultSizeSprite + 5,
                            countLoop: 0,
                            wall: bot.wall,
                            walls: [],
                            tickScore: 0,
                            score: bot.score,
                            loop: BOTS.loops[randomNumber(BOTS.loops.length)],
                            direction : control[randomNumber(control.length)],
                            defaultStep: bot.defaultStep,
                            upAnimation: bot.up,
                            downAnimation: bot.down,
                            leftAnimation: bot.left,
                            rightAnimation: bot.right,
                            destroyAnimation: bot.destroy,

                            movement() {
                                collision(this, [
                                    ...WALLS,
                                    ...this.walls,
                                    ...player.posBomb.map(({x, y}) => [x * BLOCK_SIZE, y * BLOCK_SIZE])
                                ])

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
                        }}
                )
            })
        },

        movement() {
            this.spawn.forEach(bot => bot.movement())
        },

        destroy(idx) {
            this.destroyGroup.push(...this.spawn.splice(idx, 1))
        },

        drawDestroy() {
            if (!this.destroyGroup.length) return

            this.tick++

            for (const bot of this.destroyGroup) {
                const [sx, sy] = bot.destroyAnimation()

                if (this.tick > this.time) {
                    this.tick = 0
                    SCORE.destroyGroup.push(bot)
                    this.destroyGroup.length = 0
                    bot.destroyAnimation(true)
                    return
                }

                ctx.drawImage(
                    spriteWithoutBG,
                    sx,
                    sy,
                    defaultSizeSprite,
                    defaultSizeSprite,
                    bot.x,
                    bot.y,
                    defaultSizeSprite + 5,
                    defaultSizeSprite + 5
                )
            }
        }
    }

    const person = {
        x: null,
        y: null,

        height: 0,
        width: 0,

        defaultStep: 0,
        upStep: null,
        downStep: null,
        leftStep: null,
        rightStep: null,

        direction : null,

        walls: [],

        upAnimation: null,
        downAnimation: null,
        leftAnimation: null,
        rightAnimation: null,
    }

    const player = { ...person, ...{
            x: BLOCK_SIZE + 5,
            y: BLOCK_SIZE + 5,
            xDead: undefined,
            yDead: undefined,
            dead: false,
            height: defaultSizeSprite + 5,
            width: defaultSizeSprite,
            defaultStep: 5,
            direction : arrowRight,
            move: false,
            activeBomb: false,

            countBomb: 1,
            posBomb: [],

            countDead: 0,
            timeDead: TIME_DEAD,

            upAnimation: animation([[50, 16], [82, 16]], 10),
            downAnimation: animation([[50, 0], [82, 0]], 10),
            leftAnimation: animation([[1, 0], [34, 0]], 10),
            rightAnimation: animation([[3, 16], [34, 16]], 10),
            destroyAnimation: animation([[2, 32], [18, 32], [34, 32], [50, 32], [66, 32], [82, 32], [98, 32]], 14),

            plantBomb() {
                bomb.detonationBom()

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

                return this
            },

            movement() {
                collision(this, [...WALLS, ...this.walls])

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
                        case W:
                            ctx.drawImage(spriteWithoutBG, 66, 16, defaultSizeSprite - 4, defaultSizeSprite, this.x, this.y, this.width, this.height)
                            break
                        case S:
                            ctx.drawImage(spriteWithoutBG, 66, 0, defaultSizeSprite - 4, defaultSizeSprite, this.x, this.y, this.width, this.height)
                            break
                        case A:
                            ctx.drawImage(spriteWithoutBG, 17, 0, defaultSizeSprite - 5, defaultSizeSprite, this.x, this.y, this.width, this.height)
                            break
                        case D:
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

                        case W: {
                            const [x, y] = this.upAnimation()
                            ctx.drawImage(spriteWithoutBG, x, y, defaultSizeSprite - 4, defaultSizeSprite, this.x, this.y, this.width, this.height)
                            break
                        }
                        case S: {
                            const [x, y] = this.downAnimation()
                            ctx.drawImage(spriteWithoutBG, x, y, defaultSizeSprite - 4, defaultSizeSprite, this.x, this.y, this.width, this.height)
                            break
                        }
                        case A: {
                            const [x, y] = this.leftAnimation()
                            ctx.drawImage(spriteWithoutBG, x, y, defaultSizeSprite - 4, defaultSizeSprite, this.x, this.y, this.width, this.height)
                            break
                        }
                        case D: {
                            const [x, y] = this.rightAnimation()
                            ctx.drawImage(spriteWithoutBG, x, y, defaultSizeSprite - 4, defaultSizeSprite, this.x, this.y, this.width, this.height)
                            break
                        }
                    }
                }

                return this
            },

            destroy() {
                this.xDead = this.x
                this.yDead = this.y

                this.x = undefined
                this.x = undefined
            },

            drawDestroy() {
                if (!this.xDead && !this.yDead) return

                const [sx, sy] = this.destroyAnimation()

                audio.dead.play()

                this.countDead++

                if (this.countDead > this.timeDead) {
                    this.countDead = 0
                    this.xDead = undefined
                    this.yDead = undefined
                    reset()
                    return
                }

                ctx.drawImage(
                    spriteWithoutBG,
                    sx,
                    sy,
                    defaultSizeSprite - 4,
                    defaultSizeSprite,
                    this.xDead,
                    this.yDead,
                    defaultSizeSprite,
                    defaultSizeSprite + 5
                )
            },

            savePosBomb() {
                if (this.posBomb.length < this.countBomb) {
                    audio.putBomb.play()

                    const x = bomb.x
                    const y = bomb.y

                    this.posBomb.push(
                        { x,
                            y,
                            detonationTick: 0,
                            bangTick: 0,
                            pointsDestruction: [],
                            bombAnimation: animation([[0, 48], [16, 48], [31.5, 48]], 10)
                        })
                }
            }
        }}

    const bomb = {
        x: null,
        y: null,

        timeBom: TIME_BOMB,
        timeBang: TIME_BANG,

        frameIndex : 0,
        tickCount : 0,

        env: {},

        view: 1,

        initAnimation() {
            const speed = 100

            this.centerAnimation = animation([[32, 95], [112, 95], [32, 176], [112, 176]], speed, this)
            this.horizontalRightAnimation = animation([[18, 96], [98, 96], [17, 176], [96, 176]], speed, this)
            this.horizontalLeftAnimation = animation([[18, 96], [98, 96], [17, 176], [96, 176]], speed, this)
            this.verticalTopAnimation = animation([[32, 82], [112, 82], [32, 161], [112, 161]], speed, this)
            this.verticalDownAnimation = animation([[32, 82], [112, 82], [32, 161], [112, 161]], speed, this)
            this.topEndAnimation = animation([[32, 68], [112, 67], [32, 144], [112, 144]], speed, this)
            this.downEndAnimation = animation([[32, 124], [112, 125], [32, 208], [112, 208]], speed, this)
            this.rightEndAnimation = animation([[61, 96], [141, 96], [64, 176], [144, 176]], speed, this)
            this.leftEndAnimation = animation([[4, 96], [83, 96], [0, 176], [80, 176]], speed, this)
        },

        detonationBom() {
            for (const bomb of player.posBomb) {
                if (bomb.detonationTick <= this.timeBom) {
                    bomb.detonationTick++
                    this.drawBomb(bomb)
                }
            }

            for (const [idx, bomb] of player.posBomb.entries()) {
                if (bomb.detonationTick >= this.timeBom) {
                    this.bang(bomb, idx)
                    audio.explosion.play()
                }
            }
        },

        bang(bomb, idx) {
            bomb.bangTick++

            if (!this.env[idx]) {
                this.env[idx] = {}
            }

            if (bomb.bangTick > this.timeBang) {
                bomb.pointsDestruction.forEach(coords => {
                    for (const [idx, bang] of BANG.entries()) {
                        if (coords === bang) {
                            BANG.splice(idx, 1)
                        }
                    }
                })

                this.env[idx] = {}
                player.posBomb.splice(idx, 1)
                this.clearAnimation()

                return null
            }

            this.drawBang(this.getEnv('top',  bomb, idx), this.verticalTopAnimation, this.topEndAnimation, bomb)
            this.drawBang(this.getEnv('down', bomb, idx), this.verticalDownAnimation, this.downEndAnimation, bomb)
            this.drawBang(this.getEnv('left', bomb, idx), this.horizontalLeftAnimation, this.leftEndAnimation, bomb)
            this.drawBang(this.getEnv('right', bomb, idx), this.horizontalRightAnimation, this.rightEndAnimation, bomb)
        },

        getEnv(direction, bomb, idx) {
            const env = []
            const { x, y } = bomb

            for (let i = 1; i < this.view + 1; i++) {

                switch (direction) {
                    case 'top':
                        env.push({
                            x: x,
                            y: y - i,
                            name: FIELD[y - i]?.[x],
                        })
                        break
                    case 'down':
                        env.push({
                            x: x,
                            y: y + i,
                            name: FIELD[y + i]?.[x],
                        })
                        break
                    case 'left':
                        env.push({
                            x: x - i,
                            y: y,
                            name: FIELD[y][x - i],
                        })
                        break
                    case 'right':
                        env.push({
                            x: x + i,
                            y: y,
                            name: FIELD[y][x + i],
                        })
                        break
                }
            }

            if(!this.env[idx]?.[direction]) {
                this.env[idx][direction] = this.envProcessing(env, bomb)
            }

            return this.env[idx][direction]
        },

        envProcessing(env, bomb) {
            const { x, y } = bomb

            return env.reduce((acc, zone, idx) => {
                if(zone.name === CONCRETE_WALL) {
                    env.splice(idx, env.length)
                    return acc
                }

                const center = { x, y, name: EMPTY }

                BANG.push(zone, center)
                bomb.pointsDestruction.push(zone, center)

                if(zone.name === BRICK_WALL) {
                    env.splice(idx, env.length)
                    return acc
                }

                acc.push(zone)
                return acc
            }, [])
        },

        drawBang(envArr, callbackStraight, callbackEnd, bomb) {
            const end = envArr[envArr.length - 1]

            for (const env of envArr) {
                {
                    const [x, y] = this.centerAnimation()
                    this.drawImage(x, y, bomb.x, bomb.y)
                }
                {
                    const [x, y] = callbackStraight()
                    this.drawImage(x, y, env.x, env.y)
                }
                {
                    const [x, y] = callbackEnd()
                    this.drawImage(x, y, end.x, end.y)
                }
            }
        },

        drawBomb(bomb) {
            const { x: dx, y : dy, bombAnimation } = bomb
            const [ sx, sy ] = bombAnimation()

            ctx.drawImage(
                spriteWithBG,
                sx,
                sy,
                defaultSizeSprite,
                defaultSizeSprite,
                (dx * BLOCK_SIZE + (BLOCK_SIZE / 2)) - ((defaultSizeSprite + 5) / 2),
                (dy * BLOCK_SIZE + (BLOCK_SIZE / 2)) - ((defaultSizeSprite + 5) / 2),
                defaultSizeSprite + 5,
                defaultSizeSprite + 5
            )
        },

        drawImage(sx, sy, dx, dy) {
            ctx.drawImage(
                spriteWithoutBG,
                sx,
                sy,
                defaultSizeSprite,
                defaultSizeSprite,
                dx * BLOCK_SIZE,
                dy * BLOCK_SIZE,
                BLOCK_SIZE,
                BLOCK_SIZE
            )
        },

        clearAnimation() {
            this.centerAnimation(true)
            this.verticalTopAnimation(true)
            this.topEndAnimation(true)
            this.verticalDownAnimation(true)
            this.downEndAnimation(true)
            this.horizontalLeftAnimation(true)
            this.leftEndAnimation(true)
            this.horizontalRightAnimation(true)
            this.rightEndAnimation(true)
        },
    }

    bomb.initAnimation()

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

    function destroy() {

        const playerMinX = player.x
        const playerMinY = player.y

        const playerMaxX = player.x + player.width
        const playerMaxY = player.y + player.height

        for (const bang of BANG) {
            const minX = bang.x * BLOCK_SIZE
            const minY = bang.y * BLOCK_SIZE

            const maxX = bang.x * BLOCK_SIZE + BLOCK_SIZE
            const maxY = bang.y * BLOCK_SIZE + BLOCK_SIZE

            if (bang.name === BRICK_WALL) {
                BRICK_WALLS.destroy(bang.x, bang.y)
            }

            if (playerMinX >= minX && playerMinX <= maxX &&
                playerMinY >= minY && playerMinY <= maxY
                ||
                playerMaxX >= minX && playerMaxX <= maxX &&
                playerMaxY >= minY && playerMaxY <= maxY
            ) {
                player.destroy()
            }

            for (const [i, bot] of BOTS.spawn.entries()) {

                const botMinX = bot.x + 2
                const botMinY = bot.y + 2

                const botManX = bot.x + bot.width - 2
                const botManY = bot.y + bot.height - 2

                const centerX = bot.x + (bot.width / 2)
                const centerY = bot.y + (bot.height / 2)

                if (centerX >= minX && centerX <= maxX &&
                    centerY >= minY && centerY <= maxY &&
                    bang.name !== BRICK_WALL
                    ||
                    botMinX >= minX && botMinX <= maxX &&
                    botMinY >= minY && botMinY <= maxY &&
                    bang.name !== BRICK_WALL
                    ||
                    botManX >= minX && botManX <= maxX &&
                    botManY >= minY && botManY <= maxY &&
                    bang.name !== BRICK_WALL
                ) {
                    BOTS.destroy(i)
                }
            }
        }

        for (const bot of BOTS.spawn) {
            const botMinX = bot.x
            const botMinY = bot.y

            const botManX = bot.x + bot.width
            const botManY = bot.y + bot.height

            if (playerMinX >= botMinX && playerMinX <= botManX &&
                playerMinY >= botMinY && playerMinY <= botManY
                ||
                playerMaxX >= botMinX && playerMaxX <= botManX &&
                playerMaxY >= botMinY && playerMaxY <= botManY
            ) {
                player.destroy()
            }
        }

        BRICK_WALLS.drawDestroy()
        BOTS.drawDestroy()
        player.drawDestroy()
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

        BRICK_WALLS.switch = false

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
                player.walls.push([x * BLOCK_SIZE, y * BLOCK_SIZE])
                BOTS.spawn.forEach(bot => {
                    if (!bot.wall) {
                        bot.walls.push([x * BLOCK_SIZE, y * BLOCK_SIZE])
                    }
                })
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

    function reset() {
        cancelAnimationFrame(raf)
        Bomberman()
        dashboard.innerHTML = `Score: 0`
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

    function animation(frames, loop = 6, obj = {}) {
        obj.frameIndex = 0
        obj.tickCount = 0

        return (clearAnimation = false) => {
            obj.tickCount++

            if (clearAnimation) {
                obj.tickCount = 0
                obj.frameIndex = 0
            }

            if (obj.tickCount > loop) {
                obj.tickCount = 0;
                if (obj.frameIndex < frames.length - 1) {
                    obj.frameIndex++;
                } else {
                    obj.frameIndex = 0;
                }
            }

            return frames[obj.frameIndex]
        }
    }

    new Engine({
        clear() {
            ctx.clearRect(0, 0, MAX_WIDTH, DPI_HEIGHT)
            player.walls.length = 0
            BOTS.spawn.forEach(bot => bot.walls.length = 0)
            WALLS.length = 0
            FREE_ZONE.length = 0
            DISTANCE_BOTS.length = 0
        },
        render(reqAf) {
            raf = reqAf

            BOTS.setupDistanceBetweenBots()
            setupField()
            BOTS.setupSpawnBots()
            drawField()

            player.plantBomb().movement()

            BOTS.movement()

            SCORE.drawScore()

            destroy()

            camera.translateX(player, 2)
        }
    })

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
            case W:
                person.y -= person.upStep
                break
            case S:
                person.y += person.downStep
                break
            case A:
                person.x -= person.leftStep
                break
            case D:
                person.x += person.rightStep
                break
            case keyF :
                person.savePosBomb()
                break
        }
    }

    document.addEventListener('keydown', listenerKeyDown)
    document.addEventListener('keyup', listenerKeyUp)

    function listenerKeyUp() {
        player.move = false
    }

    function listenerKeyDown(e) {
        e.preventDefault();

        if ([...control, W,S,A,D].includes(e.code)) {
            player.move = e.code
            player.direction = e.code
        }

        move(player, e.code)
    }

    return {
        reset: reset
    }
}