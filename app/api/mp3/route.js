import ytdl from '@distube/ytdl-core'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegStatic from 'ffmpeg-static'
import { PassThrough } from 'stream'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

ffmpeg.setFfmpegPath(ffmpegStatic)

const YT_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)[\w-]+/

function sanitizeFilename(name) {
  return name.replace(/[^\w\s\-]/g, '').trim().slice(0, 100) || 'audio'
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return Response.json({ error: 'URL obrigatório' }, { status: 400 })
  }

  if (!YT_REGEX.test(url)) {
    return Response.json({ error: 'URL do YouTube inválido' }, { status: 400 })
  }

  let info
  try {
    info = await ytdl.getInfo(url)
  } catch {
    return Response.json({ error: 'Não foi possível aceder ao vídeo. Verifica se o link está correto.' }, { status: 400 })
  }

  const title = sanitizeFilename(info.videoDetails.title)

  const audioStream = ytdl.downloadFromInfo(info, {
    quality: 'highestaudio',
    filter: 'audioonly',
  })

  const passThrough = new PassThrough()

  ffmpeg(audioStream)
    .audioCodec('libmp3lame')
    .audioBitrate(320)
    .format('mp3')
    .on('error', () => passThrough.destroy())
    .pipe(passThrough)

  const webStream = new ReadableStream({
    start(controller) {
      passThrough.on('data', chunk => controller.enqueue(new Uint8Array(chunk)))
      passThrough.on('end', () => controller.close())
      passThrough.on('error', () => controller.close())
    },
    cancel() {
      passThrough.destroy()
    },
  })

  return new Response(webStream, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(title)}.mp3"`,
      'Cache-Control': 'no-cache',
      'Transfer-Encoding': 'chunked',
    },
  })
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const url = body.url

  if (!url) {
    return Response.json({ error: 'URL obrigatório' }, { status: 400 })
  }

  if (!YT_REGEX.test(url)) {
    return Response.json({ error: 'URL do YouTube inválido' }, { status: 400 })
  }

  try {
    const info = await ytdl.getInfo(url)
    return Response.json({
      title: info.videoDetails.title,
      author: info.videoDetails.author.name,
      duration: info.videoDetails.lengthSeconds,
      thumbnail: info.videoDetails.thumbnails.at(-1)?.url || null,
    })
  } catch {
    return Response.json({ error: 'Não foi possível aceder ao vídeo.' }, { status: 400 })
  }
}
