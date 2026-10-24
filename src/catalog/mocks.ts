// ข้อมูลตัวอย่าง (mock) ที่ใส่ไว้ดูหน้าตาตอนพัฒนา ห้ามขึ้นเว็บจริง
// รีวิวปลอมและโปรที่ไม่มีจริงผิดหลัก "ความน่าเชื่อถือต้องมาจากของจริง" ใน PRODUCT.md
// วิธีทำเครื่องหมาย: ใส่ "(mock)" ในชื่อ (studentName ของรีวิว, name ของโปร) หรือขึ้นต้น id รีวิวด้วย "mock-"

import type { Content } from './catalog'

const MOCK_LABEL = /\(mock\)/i

export function isMockText(text: string): boolean {
  return MOCK_LABEL.test(text)
}

/** ตัดรีวิวและโปรที่เป็น mock ออก · ส่วนที่ว่างหลังตัด หน้าเว็บซ่อนเองอยู่แล้ว (แถบรีวิว, เมนู "รีวิว", แถบโปร) */
export function withoutMocks(content: Content): Content {
  const { site } = content
  return {
    ...content,
    reviews: content.reviews.filter((r) => !r.id.startsWith('mock-') && !isMockText(r.studentName)),
    site: {
      ...site,
      promos: {
        seasonal: site.promos.seasonal.filter((p) => !isMockText(p.name)),
        evergreen: site.promos.evergreen.filter((p) => !isMockText(p.name)),
      },
    },
  }
}
