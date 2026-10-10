// ลิงก์ YouTube จากชีต (หลายรูปแบบ) → ลิงก์ embed สำหรับ <iframe>

const ID = /^[\w-]{11}$/

/** youtu.be/ID · youtube.com/watch?v=ID · /embed/ID · /shorts/ID → ID · อ่านไม่ออก = undefined (หน้าจะซ่อนกล่องคลิป) */
export function youtubeId(url: string): string | undefined {
  let parsed: URL
  try {
    parsed = new URL(url.trim())
  } catch {
    return undefined
  }
  const host = parsed.hostname.replace(/^(www|m)\./, '')
  const candidate =
    host === 'youtu.be'
      ? parsed.pathname.slice(1)
      : host === 'youtube.com' || host === 'youtube-nocookie.com'
        ? (parsed.searchParams.get('v') ?? parsed.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1])
        : undefined
  return candidate && ID.test(candidate) ? candidate : undefined
}

/** ใช้โดเมน nocookie: ไม่ฝังคุกกี้ติดตามจนกว่าผู้ชมจะกดเล่น */
export function youtubeEmbedUrl(url: string): string | undefined {
  const id = youtubeId(url)
  return id && `https://www.youtube-nocookie.com/embed/${id}`
}
