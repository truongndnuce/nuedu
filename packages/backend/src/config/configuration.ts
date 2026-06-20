export default () => ({
  port: parseInt(process.env.PORT ?? '4000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  apiPrefix: process.env.API_PREFIX ?? '/api/v1',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  cookieDomain: process.env.COOKIE_DOMAIN ?? 'localhost',

  database: {
    url: process.env.DATABASE_URL,
  },

  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshTtl: process.env.JWT_REFRESH_TTL ?? '7d',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    folderPrefix: process.env.CLOUDINARY_UPLOAD_FOLDER_PREFIX ?? 'nuedu',
    privateUrlTtl: parseInt(process.env.CLOUDINARY_PRIVATE_URL_TTL ?? '3600', 10),
  },

  revalidate: {
    url: process.env.NEXT_REVALIDATE_URL,
    token: process.env.NEXT_REVALIDATE_TOKEN,
  },

  mail: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM ?? 'no-reply@nuedu.vn',
  },
});
