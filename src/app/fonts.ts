import { Anuphan, IBM_Plex_Mono } from 'next/font/google'

/** ฟอนต์ไทยตัวเดียวของเว็บ ใช้ทั้งหัวข้อและเนื้อความ */
export const anuphan = Anuphan({
  weight: ['400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  variable: '--font-anuphan',
})

/** ตัวอักษรละตินเล็ก ๆ เช่นป้ายกำกับ */
export const plexMono = IBM_Plex_Mono({
  weight: '500',
  subsets: ['latin'],
  variable: '--font-plex-mono',
})
