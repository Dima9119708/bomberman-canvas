export default class Engine {
    constructor( { clear, render, stop } ) {
        this.clear = clear
        this.render = render
        this.raf = null

        this.tick()
    }

    tick() {
        this.raf = requestAnimationFrame(this.tick.bind(this))

        this.clear()
        this.render(this.raf)
    }
}