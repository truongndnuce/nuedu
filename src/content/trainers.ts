export interface Trainer {
  id: string;
  nameVi: string;
  nameEn: string;
  titleVi: string;
  titleEn: string;
  bioVi: string;
  bioEn: string;
  avatar: string;
  specialties: string[];
}

export const trainers: Trainer[] = [
  {
    id: "trainer-1",
    nameVi: "Nguyễn Văn An",
    nameEn: "Nguyen Van An",
    titleVi: "HLV Thể hình & Sức mạnh",
    titleEn: "Bodybuilding & Strength Coach",
    bioVi: "Hơn 10 năm kinh nghiệm thể hình, chuyên gia tăng cơ giảm mỡ và lập trình luyện tập cá nhân.",
    bioEn: "Over 10 years in bodybuilding, expert in muscle gain, fat loss, and personalized training programming.",
    avatar: "/images/trainers/trainer-1.jpg",
    specialties: ["Bodybuilding", "Strength Training", "Muscle Gain"],
  },
  {
    id: "trainer-2",
    nameVi: "Trần Quốc Hùng",
    nameEn: "Tran Quoc Hung",
    titleVi: "HLV Powerlifting",
    titleEn: "Powerlifting Coach",
    bioVi: "Vô địch powerlifting quốc gia 2022, chuyên huấn luyện Squat – Bench – Deadlift.",
    bioEn: "National powerlifting champion 2022, specializing in Squat, Bench Press, and Deadlift.",
    avatar: "/images/trainers/trainer-2.jpg",
    specialties: ["Powerlifting", "Strength", "Competition Prep"],
  },
  {
    id: "trainer-3",
    nameVi: "Lê Minh Cường",
    nameEn: "Le Minh Cuong",
    titleVi: "HLV Thể hình chuyên nghiệp",
    titleEn: "Professional Bodybuilding Coach",
    bioVi: "8 năm kinh nghiệm huấn luyện thể hình, chuyên gia phát triển cơ bắp và giảm mỡ nhanh.",
    bioEn: "8 years of bodybuilding coaching experience, expert in muscle development and rapid fat loss.",
    avatar: "/images/trainers/trainer-3.jpg",
    specialties: ["Hypertrophy", "Fat Loss", "Core Strength"],
  },
];
