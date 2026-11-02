export interface Bilingual<T = string> {
  vi: T;
  en: T;
}

export interface Course {
  id: string;
  badge: Bilingual;
  name: Bilingual;
  duration: Bilingual;
  schedule: { title: Bilingual; note: Bilingual };
  content: Bilingual<string[]>;
  practice: { title: Bilingual; note: Bilingual };
  certificate: Bilingual<string[]>;
}

export const courses: Course[] = [
  {
    id: "full-pt",
    badge: { vi: "Trực tiếp", en: "In person" },
    name: { vi: "Khóa PT Toàn diện", en: "Comprehensive PT Course" },
    duration: { vi: "3 tháng", en: "3 months" },
    schedule: {
      title: { vi: "Thứ 2–Thứ 6 • Ca sáng/chiều", en: "Mon–Fri • Morning/afternoon shifts" },
      note: { vi: "Học trực tiếp tại học viện", en: "In-person at the academy" },
    },
    content: {
      vi: [
        "Giải phẫu hệ vận động",
        "Dinh dưỡng chuyên sâu",
        "Thiết kế chương trình tập nâng cao",
        "Tư vấn bán hàng & tâm lý khách hàng",
      ],
      en: [
        "Musculoskeletal anatomy",
        "Advanced nutrition",
        "Advanced training program design",
        "Sales consulting & client psychology",
      ],
    },
    practice: {
      title: { vi: "Hơn 60 tiết", en: "60+ sessions" },
      note: {
        vi: "Kỹ thuật tập luyện, kickfit, stretching, kiểm tra thể lực và kỹ năng mềm.",
        en: "Training technique, kickfit, stretching, fitness testing and soft skills.",
      },
    },
    certificate: {
      vi: [
        "Chứng chỉ nghề NuEdu.",
        "Thực tập tại Nutrition Fitness và đối tác.",
        "Cam kết giới thiệu việc làm toàn thời gian.",
      ],
      en: [
        "NuEdu professional certificate.",
        "Internship at Nutrition Fitness and partners.",
        "Full-time job referral commitment.",
      ],
    },
  },
  {
    id: "weekend",
    badge: { vi: "Cuối tuần", en: "Weekend" },
    name: { vi: "Khóa Cuối tuần Cơ bản", en: "Basic Weekend Course" },
    duration: { vi: "5–6 tuần", en: "5–6 weeks" },
    schedule: {
      title: { vi: "Thứ 7 & Chủ nhật", en: "Saturday & Sunday" },
      note: { vi: "Học trực tiếp tại học viện", en: "In-person at the academy" },
    },
    content: {
      vi: ["Giải phẫu cơ bản", "Dinh dưỡng cơ bản", "Thiết kế giáo án cá nhân"],
      en: ["Basic anatomy", "Basic nutrition", "Personal lesson plan design"],
    },
    practice: {
      title: { vi: "12–16 tiết", en: "12–16 sessions" },
      note: {
        vi: "Chỉnh kỹ thuật các bài tập cơ bản.",
        en: "Technique correction on basic exercises.",
      },
    },
    certificate: {
      vi: ["Chứng nhận hoàn thành khóa học.", "Không hỗ trợ việc làm."],
      en: ["Course completion certificate.", "No job placement support."],
    },
  },
  {
    id: "online",
    badge: { vi: "Online", en: "Online" },
    name: { vi: "Khóa Online Lý thuyết", en: "Online Theory Course" },
    duration: { vi: "1–2 tháng", en: "1–2 months" },
    schedule: {
      title: { vi: "Tự học theo tiến độ", en: "Self-paced" },
      note: {
        vi: "100% online qua video LMS và Zoom.",
        en: "100% online via LMS videos and Zoom.",
      },
    },
    content: {
      vi: ["Giải phẫu", "Dinh dưỡng", "Thiết kế chương trình tập"],
      en: ["Anatomy", "Nutrition", "Training program design"],
    },
    practice: {
      title: { vi: "Học qua video bài giảng", en: "Learn through video lectures" },
      note: { vi: "Không có thực hành trực tiếp.", en: "No in-person practice." },
    },
    certificate: {
      vi: ["Chứng nhận hoàn thành lý thuyết.", "Không hỗ trợ việc làm."],
      en: ["Theory completion certificate.", "No job placement support."],
    },
  },
  {
    id: "hybrid",
    badge: { vi: "Hybrid", en: "Hybrid" },
    name: { vi: "PT Hybrid Pro", en: "PT Hybrid Pro" },
    duration: { vi: "3 tháng", en: "3 months" },
    schedule: {
      title: {
        vi: "Lý thuyết online • Thực hành trực tiếp",
        en: "Online theory • In-person practice",
      },
      note: {
        vi: "Thực hành tối Thứ 2, 4, 6 hoặc Thứ 3, 5, 7.",
        en: "Practice on Mon/Wed/Fri or Tue/Thu/Sat evenings.",
      },
    },
    content: {
      vi: ["Giải phẫu", "Dinh dưỡng", "Thiết kế chương trình tập", "Tư vấn bán hàng Fitness"],
      en: ["Anatomy", "Nutrition", "Training program design", "Fitness sales consulting"],
    },
    practice: {
      title: { vi: "36 tiết tại phòng tập", en: "36 sessions at the gym" },
      note: {
        vi: "Kỹ thuật, biến thể bài tập, stretching và kỹ năng đứng lớp.",
        en: "Technique, exercise variations, stretching and class-leading skills.",
      },
    },
    certificate: {
      vi: ["Chứng chỉ nghề NuEdu.", "Hỗ trợ kết nối việc làm và cơ hội bán thời gian."],
      en: ["NuEdu professional certificate.", "Job connection support and part-time opportunities."],
    },
  },
];
