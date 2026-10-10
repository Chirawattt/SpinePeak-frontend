import { describe, expect, it } from 'vitest'
import { youtubeEmbedUrl, youtubeId } from './youtube'

describe('youtubeId()', () => {
  it.each([
    ['https://youtu.be/QnQe0xW_JY4', 'QnQe0xW_JY4'],
    ['https://www.youtube.com/watch?v=QnQe0xW_JY4&t=30s', 'QnQe0xW_JY4'],
    ['https://m.youtube.com/watch?v=QnQe0xW_JY4', 'QnQe0xW_JY4'],
    ['https://www.youtube.com/embed/QnQe0xW_JY4', 'QnQe0xW_JY4'],
    ['https://youtube.com/shorts/QnQe0xW_JY4', 'QnQe0xW_JY4'],
    ['  https://youtu.be/QnQe0xW_JY4  ', 'QnQe0xW_JY4'],
  ])('reads the video id from %s', (url, id) => {
    expect(youtubeId(url)).toBe(id)
  })

  it.each([[''], ['not a url'], ['https://vimeo.com/123'], ['https://www.youtube.com/@krunam'], ['https://youtu.be/short']])(
    'gives up on %j, so the page hides the clip',
    (url) => {
      expect(youtubeId(url)).toBeUndefined()
    },
  )
})

describe('youtubeEmbedUrl()', () => {
  it('embeds through the no-cookie domain', () => {
    expect(youtubeEmbedUrl('https://youtu.be/QnQe0xW_JY4')).toBe('https://www.youtube-nocookie.com/embed/QnQe0xW_JY4')
  })
})
