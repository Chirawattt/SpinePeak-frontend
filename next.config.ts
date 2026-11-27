import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentUpgrade: "security",
  },

  // หน้ารายการ SET รวมเข้าหน้าคอร์สเรียนแล้ว (ส่วน SET อยู่บนสุด) · ลิงก์เก่า /sets?group=… ยังพาไปหน้าที่กรองไว้เหมือนเดิม
  // query string ถูกส่งต่อให้เอง · หน้ารายละเอียด /sets/[slug] ยังอยู่ที่เดิม
  async redirects() {
    return [{ source: '/sets', destination: '/courses#sets', permanent: true }]
  },
};

export default nextConfig;
