import './styles.css'
import { App } from './app'

function boot() {
  const canvas = document.getElementById('scene') as HTMLCanvasElement | null
  if (!canvas) throw new Error('Canvas #scene not found')
  const app = new App(canvas)
  app.start()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot)
} else {
  boot()
}

