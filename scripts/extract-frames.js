const { spawnSync } = require('child_process')
const fs   = require('fs')
const path = require('path')

const FFMPEG  = 'D:\\Queiroz Almeida\\node_modules\\.pnpm\\ffmpeg-static@5.3.0\\node_modules\\ffmpeg-static\\ffmpeg.exe'
const VIDEO   = 'D:\\Queiroz Almeida\\packages\\frontend\\public\\construct-video-scrub.mp4'
const OUT_DIR = 'D:\\Queiroz Almeida\\packages\\frontend\\public\\sequence'

if (!fs.existsSync(VIDEO)) { console.error('Vídeo não encontrado:', VIDEO); process.exit(1) }

fs.mkdirSync(OUT_DIR, { recursive: true })

// Limpa frames anteriores
fs.readdirSync(OUT_DIR).forEach(f => { try { fs.unlinkSync(path.join(OUT_DIR, f)) } catch {} })

console.log('Extraindo frames como JPEG (30fps, 1280px)...')

const result = spawnSync(FFMPEG, [
  '-i', VIDEO,
  '-vf', 'fps=30,scale=1280:-1',
  '-q:v', '3',
  '-f', 'image2',
  path.join(OUT_DIR, 'frame_%d.jpg'),
], { stdio: 'inherit' })

if (result.status !== 0) { console.error('Erro na extração.'); process.exit(1) }

const frames = fs.readdirSync(OUT_DIR).filter(f => /^frame_\d+\.jpg$/.test(f))
console.log('\n✅ ' + frames.length + ' frames extraídos')
console.log('👉 Atualize FRAME_COUNT = ' + frames.length + ' no componente')
