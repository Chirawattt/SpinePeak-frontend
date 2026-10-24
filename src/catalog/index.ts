import { content } from '@/content'
import { createCatalog } from './catalog'

export type { Catalog, ClipCard, Content, FeaturedCard, Footer, GroupEntry, HelpStep, HeroStat, Landing, SocialLink, Teacher } from './catalog'
export type { CourseCard } from './course-card'
export type { OgCard, OgPage } from './og'
export type { CourseFilters } from './course-filters'
export type { CourseList, CourseListIndex, CoursesPage, GoalLink, GroupTab, Paging, ReviewQuote } from './course-list'
export { filtersToQuery, parseFilters } from './course-filters'
export type { CourseContent, CourseDetail, CourseInstructor, CoursePreview, CourseSets, SetOffer } from './course-detail'
export type { Cover, CoverTone, Faq, NavLink, Stat } from './format'
export type { SetCard, SetSavings } from './set-card'
export type { SetFilters, SetList, SetListCard, SetListIndex } from './set-list'
export type { SetDetail, SetGet, SetTeacher } from './set-detail'
export type { Promo } from './promos'
export type { ContentProblem } from './validate-content'

// mock โชว์เฉพาะตอน next dev ไว้ดูหน้าตา · production build (รวม preview บน Vercel) ตัดทิ้งเสมอ
export const catalog = createCatalog(content, { showMocks: process.env.NODE_ENV === 'development' })
