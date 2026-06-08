export interface PostCategory {
  slug: string;
  nameVi: string;
  nameEn: string;
}

export interface Post {
  id: string;
  slug: string;
  titleVi: string;
  titleEn: string;
  excerptVi: string;
  excerptEn: string;
  contentVi: string;
  contentEn: string;
  featuredImage?: string;
  status: "published" | "draft" | "scheduled";
  publishedAt: string;
  scheduledAt?: string;
  category: PostCategory;
  tags: string[];
  author: { id: string; name: string };
  metaTitleVi?: string;
  metaTitleEn?: string;
  metaDescriptionVi?: string;
  metaDescriptionEn?: string;
}

export const categories: PostCategory[] = [
  { slug: "training", nameVi: "Huấn luyện", nameEn: "Training" },
  { slug: "nutrition", nameVi: "Dinh dưỡng", nameEn: "Nutrition" },
  { slug: "news", nameVi: "Tin tức", nameEn: "News" },
];

export const posts: Post[] = [
  {
    id: "1",
    slug: "5-bai-tap-the-hinh-co-ban",
    titleVi: "5 bài tập thể hình cơ bản cho người mới bắt đầu",
    titleEn: "5 Basic Bodybuilding Exercises for Beginners",
    excerptVi:
      "Khám phá những bài tập thể hình cơ bản giúp bạn xây dựng nền tảng thể lực vững chắc.",
    excerptEn:
      "Discover basic bodybuilding exercises to help you build a solid fitness foundation.",
    contentVi: `
<h2>Giới thiệu</h2>
<p>Khi bắt đầu hành trình tập luyện, việc chọn đúng các bài tập cơ bản là vô cùng quan trọng. Dưới đây là 5 bài tập không thể thiếu.</p>
<h2>1. Squats (Ngồi xổm)</h2>
<p>Squats là bài tập toàn thân hiệu quả nhất, tác động đến đùi, mông và cơ lõi.</p>
<h2>2. Push-ups (Hít đất)</h2>
<p>Bài tập không cần dụng cụ, rèn luyện ngực, vai và tay.</p>
<h2>3. Deadlifts (Kéo tạ)</h2>
<p>Bài tập tổng hợp giúp phát triển sức mạnh toàn thân.</p>
<h2>4. Pull-ups (Xà đơn)</h2>
<p>Tập trung vào cơ lưng và tay trên.</p>
<h2>5. Plank</h2>
<p>Bài tập tĩnh tuyệt vời cho cơ lõi.</p>
    `.trim(),
    contentEn: `
<h2>Introduction</h2>
<p>When starting your fitness journey, choosing the right basic exercises is crucial. Here are 5 essential exercises.</p>
<h2>1. Squats</h2>
<p>Squats are the most effective full-body exercise, targeting thighs, glutes, and core.</p>
<h2>2. Push-ups</h2>
<p>No-equipment exercise training chest, shoulders, and arms.</p>
<h2>3. Deadlifts</h2>
<p>Compound exercise for total body strength development.</p>
<h2>4. Pull-ups</h2>
<p>Focuses on back and upper arm muscles.</p>
<h2>5. Plank</h2>
<p>Excellent static exercise for the core.</p>
    `.trim(),
    status: "published",
    publishedAt: "2026-05-15T08:00:00Z",
    category: categories[0],
    tags: ["thể hình", "người mới", "bài tập"],
    author: { id: "1", name: "Coach An" },
  },
  {
    id: "2",
    slug: "che-do-an-truoc-khi-tap",
    titleVi: "Chế độ ăn trước khi tập luyện",
    titleEn: "Pre-Workout Nutrition Guide",
    excerptVi:
      "Ăn gì trước khi tập để đạt hiệu quả tối đa? Hướng dẫn chi tiết từ chuyên gia dinh dưỡng.",
    excerptEn:
      "What to eat before training for maximum results? Detailed guide from nutrition experts.",
    contentVi: `
<h2>Tại sao dinh dưỡng trước tập quan trọng?</h2>
<p>Chế độ ăn trước khi tập ảnh hưởng trực tiếp đến hiệu suất và kết quả tập luyện.</p>
<h2>Thực phẩm nên ăn</h2>
<ul><li>Carbohydrate phức tạp: cơm gạo lứt, yến mạch</li><li>Protein: thịt gà, trứng</li><li>Trái cây: chuối, táo</li></ul>
    `.trim(),
    contentEn: `
<h2>Why Pre-Workout Nutrition Matters</h2>
<p>Pre-workout nutrition directly affects training performance and results.</p>
<h2>Foods to Eat</h2>
<ul><li>Complex carbs: brown rice, oats</li><li>Protein: chicken, eggs</li><li>Fruits: bananas, apples</li></ul>
    `.trim(),
    status: "published",
    publishedAt: "2026-05-20T09:00:00Z",
    category: categories[1],
    tags: ["dinh dưỡng", "trước tập"],
    author: { id: "1", name: "Coach Bình" },
  },
  {
    id: "3",
    slug: "khai-giang-khoa-powerlifting-thang-6",
    titleVi: "Khai giảng khóa Powerlifting tháng 6/2026",
    titleEn: "Powerlifting Course Opening – June 2026",
    excerptVi: "NUEDU khai giảng khóa học Powerlifting dành cho mọi trình độ vào tháng 6/2026.",
    excerptEn: "NUEDU opens a Powerlifting course for all levels in June 2026.",
    contentVi: `
<h2>Thông tin khóa học</h2>
<p>Khóa Powerlifting tháng 6 của NUEDU tập trung vào 3 động tác nền tảng: Squat, Bench Press và Deadlift.</p>
<p>Thời gian: Thứ 2, 4, 6 - 18:00 đến 20:00</p>
<p>Giáo viên: Coach Hùng - Vô địch Powerlifting quốc gia 2022</p>
<h2>Bạn sẽ học được gì?</h2>
<ul><li>Kỹ thuật Squat, Bench Press, Deadlift chuẩn</li><li>Lập trình tập luyện tăng sức mạnh</li><li>Dinh dưỡng hỗ trợ phát triển cơ bắp</li></ul>
    `.trim(),
    contentEn: `
<h2>Course Information</h2>
<p>NUEDU's June Powerlifting course focuses on the three core lifts: Squat, Bench Press, and Deadlift.</p>
<p>Schedule: Mon, Wed, Fri - 6:00 PM to 8:00 PM</p>
<p>Instructor: Coach Hung - National Powerlifting Champion 2022</p>
<h2>What You Will Learn</h2>
<ul><li>Proper Squat, Bench Press, Deadlift technique</li><li>Strength training programming</li><li>Nutrition for muscle development</li></ul>
    `.trim(),
    status: "published",
    publishedAt: "2026-06-01T07:00:00Z",
    featuredImage: "/images/gym/gym-barbell.jpg",
    category: categories[2],
    tags: ["thể hình", "sức mạnh", "khai giảng"],
    author: { id: "1", name: "NUEDU" },
  },
];

// In-memory mutable store for portal (create/edit/delete)
let postsStore: Post[] = [...posts];

export function getAllPosts(): Post[] {
  return postsStore.filter((p) => p.status === "published");
}

export function getAllPostsAdmin(): Post[] {
  return postsStore;
}

export function getPostBySlug(slug: string): Post | undefined {
  return postsStore.find((p) => p.slug === slug);
}

export function getPostsByCategory(categorySlug: string): Post[] {
  return postsStore.filter(
    (p) => p.category.slug === categorySlug && p.status === "published"
  );
}

export function createPost(data: Omit<Post, "id">): Post {
  const post: Post = { ...data, id: String(Date.now()) };
  postsStore = [post, ...postsStore];
  return post;
}

export function updatePost(id: string, data: Partial<Post>): Post | null {
  const idx = postsStore.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  postsStore[idx] = { ...postsStore[idx], ...data };
  return postsStore[idx];
}

export function deletePost(id: string): boolean {
  const len = postsStore.length;
  postsStore = postsStore.filter((p) => p.id !== id);
  return postsStore.length < len;
}
