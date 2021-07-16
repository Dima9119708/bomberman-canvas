export default class Engine {
    constructor( { clear, render } ) {
        this.clear = clear
        this.render = render

        this.tick()
    }

    tick() {
        this.clear()
        this.render()

        requestAnimationFrame(this.tick.bind(this))
    }
}