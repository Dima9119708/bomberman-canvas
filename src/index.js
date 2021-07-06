import './styles.scss'

const canvas = document.querySelector('[data-el="main"]');
const ctx = canvas.getContext('2d')

const WIDTH = 600
const HEIGHT = 200

canvas.style.width = WIDTH + 'px'
canvas.style.height = HEIGHT + 'px'

canvas.width = WIDTH
canvas.height = HEIGHT

const BLOCK_SIZE = 20

