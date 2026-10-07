// ค่ากลางของการเคลื่อนไหวทั้งเว็บ ปรับความเร็ว / ความเด้งที่นี่ที่เดียว

/** spring เด้งนิด ๆ ใช้เป็นค่าเริ่มต้นของทุก animation (ตั้งไว้ที่ MotionProvider) */
export const SPRING = { type: 'spring', bounce: 0.22, visualDuration: 0.5 } as const

/** ระยะที่ของเลื่อนขึ้นมาตอนปรากฏ (px) */
export const RISE = 16

/** เว้นระหว่างของที่ขึ้นไล่กัน (วินาที) และเพดานรวมของทั้งชุด */
export const STAGGER = 0.05
export const STAGGER_CAP = 0.3

/** hover การ์ด: ยกขึ้น · กดปุ่ม: ยุบลง */
export const LIFT = { y: -4 }
export const PRESS = { scale: 0.97 }

/** เล่นครั้งเดียวเมื่อเลื่อนมาถึง · margin ล่างติดลบ ให้เริ่มเมื่อเข้ามาในจอแล้วนิดหนึ่ง (ใช้ margin ไม่ใช้ amount ของที่สูงกว่าจอจะได้เล่นแน่) */
export const VIEWPORT = { once: true, margin: '0px 0px -8% 0px' } as const
