// Contact: ทุกปุ่มติดต่อบนเว็บได้ href จากที่นี่ที่เดียว
//
// เฟส 1 ยังไม่มี backend จึงลิงก์ตรงไป LINE OA / Messenger
// พอ backend พร้อม ให้เปลี่ยนเป็น `/go/contact?channel=<channel>&item=<kind>:<slug>` ที่ฟังก์ชันนี้ที่เดียว
// (แล้วตั้ง rewrite /go/* ไปที่ API) ปุ่มทั้งเว็บจะเปลี่ยนตามเอง

import type { Site } from '@content/types'

export type ContactChannel = 'line' | 'facebook'

/** ของที่ผู้ชมสนใจ ไม่ระบุได้ (เช่น ปุ่มในหน้าแรก) · promo = โปรโมชัน title คือชื่อโปรที่ลูกค้าบอกแอดมิน */
export type ContactItem = { kind: 'course' | 'set' | 'promo'; slug: string; title: string }

export function createContact(site: Site) {
  const { line, facebook } = site.contact

  function contactHref(item: ContactItem | undefined, channel: ContactChannel): string {
    if (channel === 'line') {
      const chat = `https://line.me/R/oaMessage/${encodeURIComponent(line.basicId)}/`
      // ปุ่มที่ไม่ได้ผูกกับคอร์สไหนก็ยังบอกแอดมินว่ามาจากเว็บ · ไม่ได้ตั้งไว้ใน site.json เปิดแชทเปล่า
      const text = item ? line.prefillTemplate.replace('{itemTitle}', item.title) : line.generalPrefill?.trim()
      return text ? `${chat}?${encodeURIComponent(text)}` : chat
    }

    // ref บอกเพจว่าแชทนี้มาจากคอร์ส เซ็ต หรือโปรไหน
    const chat = `https://m.me/${facebook.pageId}`
    return item ? `${chat}?ref=${item.kind}_${item.slug}` : chat
  }

  return { contactHref }
}
