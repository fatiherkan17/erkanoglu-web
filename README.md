This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## Admin güvenliği

Yönetim paneli `/admin/login` ile korunur. Production ortamında Vercel Project Settings → Environment Variables bölümüne `ADMIN_PASSWORD` ekleyin ve güçlü, benzersiz bir parola kullanın. Gerçek parolayı GitHub'a, `.env` dosyasına veya kaynak koda koymayın.

Admin oturumu 12 saatlik httpOnly cookie ile çalışır. `/admin` altındaki sayfalar ile iç `/api` uçları oturum olmadan erişime kapalıdır. Public proje listeleme ve public proje talebi oluşturma uçları açık bırakılmıştır.

## Deploy / doğrulama

Deployment sonrasında TypeScript ve production build'i yerelde şu komutlarla doğrulayın:

```bash
npx tsc --noEmit
npm run build
```

Next.js güvenlik güncellemelerini takip edin ve desteklenen sürümü kullanın.

## Learn More

To learn more about Next.js, take a look at the [Next.js Documentation](https://nextjs.org/docs).
