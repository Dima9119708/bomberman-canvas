import './styles.scss'
import Bomberman from "./bomberman/game";

const menu = document.querySelector('.start-game')
const canvas = document.querySelector('[data-el="main"]');
const dashboard = document.querySelector('.dashboard');

document.querySelector('.js-start')
        .addEventListener('click', () => {
            menu.style.display = 'none'
            Bomberman(canvas, dashboard)
        })