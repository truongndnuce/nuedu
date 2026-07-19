const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "NUEDU",
    alternateName: "Học viện Đào tạo Nghề PT Gym NUEDU",
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    image: `${SITE_URL}/images/logo.png`,
    telephone: "+84867770689",
    email: "nuedu.vn@gmail.com",
    sameAs: [],
    address: [
      {
        "@type": "PostalAddress",
        streetAddress: "The Vesta, Phú Lãm",
        addressLocality: "Hà Đông",
        addressRegion: "Hà Nội",
        addressCountry: "VN",
      },
      {
        "@type": "PostalAddress",
        streetAddress: "141 Bắc Hải",
        addressLocality: "Quận 10",
        addressRegion: "TP. Hồ Chí Minh",
        addressCountry: "VN",
      },
    ],
    openingHours: "Mo-Su 06:00-21:00",
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
