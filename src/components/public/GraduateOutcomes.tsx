import Image from "next/image";

interface Props {
  locale: string;
}

const partners = [
  "/images/graduates/partner-1.jpg",
  "/images/graduates/partner-2.jpg",
  "/images/graduates/partner-3.jpg",
  "/images/graduates/partner-4.jpg",
  "/images/graduates/partner-5.jpg",
];

const stories = [
  "/images/graduates/story-1.jpg",
  "/images/graduates/story-2.jpg",
  "/images/graduates/story-3.jpg",
  "/images/graduates/story-4.jpg",
  "/images/graduates/story-5.jpg",
];

export function GraduateOutcomes({ locale }: Props) {
  const isVi = locale === "vi";

  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-14 text-center">
          <p className="text-sm font-bold uppercase text-primary">
            {isVi ? "Cam kết đầu ra" : "Outcome commitment"}
          </p>
          <h2 className="mt-2 text-3xl font-black uppercase text-accent sm:text-5xl">
            {isVi ? "Việc làm sau tốt nghiệp" : "Career after graduation"}
          </h2>
        </div>

        {/* 1. Certificate */}
        <div className="mb-16 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border">
            <Image
              src="/images/graduates/certificate.jpg"
              alt={isVi ? "Giấy chứng nhận hoàn thành khóa học" : "Certificate of completion"}
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase text-accent">
              {isVi ? "Giấy chứng nhận hoàn thành khóa học" : "Certificate of completion"}
            </h3>
            <p className="mt-3 leading-7 text-muted-foreground">
              {isVi
                ? "Học viên hoàn thành chương trình được cấp giấy chứng nhận hoàn thành khóa học nghề PT Gym tại NUEDU — hành trang xin việc và mở dịch vụ huấn luyện riêng."
                : "Graduates receive an official certificate of completion for the PT Gym program at NUEDU — a credential for job applications and starting their own coaching business."}
            </p>
          </div>
        </div>

        {/* 2. Recruitment partners */}
        <div className="mb-16 text-center">
          <h3 className="mb-3 text-2xl font-black uppercase text-accent">
            {isVi ? "Đối tác tuyển dụng" : "Recruitment partners"}
          </h3>
          <p className="mx-auto mb-6 max-w-2xl leading-7 text-muted-foreground">
            {isVi
              ? "NUEDU liên kết với mạng lưới phòng gym, chuỗi fitness trên toàn quốc, sẵn sàng tuyển dụng học viên ngay sau tốt nghiệp."
              : "NUEDU partners with a nationwide network of gyms and fitness chains, ready to hire graduates right after the program."}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {partners.map((src, index) => (
              <div
                key={src}
                className="group relative aspect-[3/2] w-full max-w-xs overflow-hidden rounded-lg border border-border bg-muted sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.75rem)]"
              >
                <Image
                  src={src}
                  alt={`${isVi ? "Đối tác tuyển dụng" : "Recruitment partner"} ${index + 1}`}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 3. Graduate stories */}
        <div className="mb-16 text-center">
          <h3 className="mb-3 text-2xl font-black uppercase text-accent">
            {isVi ? "Câu chuyện học viên sau tốt nghiệp" : "Graduate stories"}
          </h3>
          <p className="mx-auto mb-6 max-w-2xl leading-7 text-muted-foreground">
            {isVi
              ? "Những chia sẻ thực tế từ học viên đã tốt nghiệp và đang làm nghề PT tại các phòng tập trên cả nước."
              : "Real stories from graduates who are now working as personal trainers at gyms across the country."}
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {stories.map((src, index) => (
              <div
                key={src}
                className="group relative aspect-[3/4] overflow-hidden rounded-lg border border-border bg-muted"
              >
                <Image
                  src={src}
                  alt={`${isVi ? "Câu chuyện học viên" : "Graduate story"} ${index + 1}`}
                  fill
                  sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 4. Lifetime warranty */}
        <div className="grid gap-8 rounded-xl bg-primary p-6 text-primary-foreground sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <h3 className="text-2xl font-black uppercase text-white">
              {isVi
                ? "Bảo hành kiến thức trọn đời, học lại không tốn phí"
                : "Lifetime knowledge warranty, free re-enrollment"}
            </h3>
            <p className="mt-3 leading-7 text-white/72">
              {isVi
                ? "Học viên NUEDU được bảo hành kiến thức trọn đời — được học lại bất kỳ buổi học nào miễn phí để củng cố tay nghề, luôn tự tin trước mọi khách hàng."
                : "NUEDU graduates receive a lifetime knowledge warranty — free re-enrollment in any session to reinforce their skills and stay confident with every client."}
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
            <Image
              src="/images/graduates/warranty.jpg"
              alt={isVi ? "Bảo hành kiến thức trọn đời" : "Lifetime knowledge warranty"}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
