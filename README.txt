AVOFIS AUTH COMPLETE PACKAGE

Kurulum:
1) Bu zip içindeki portal klasörünü repo kökündeki portal ile birleştir.
2) Aynı isimli dosyaları replace et.
3) portal içinde npm install gerekmez; yeni bağımlılık eklenmedi.
4) Vercel redeploy veya local build al.

Bu paket ne yapar:
- Session restore
- Global auth state provider
- useUser hook
- ProtectedRoute bileşeni
- Login sonrası /dashboard yönlendirmesi
- Logout sonrası / yönlendirmesi
- Login/register sayfalarında session varsa /dashboard yönlendirmesi
- Dashboard route koruması

Değişen dosyalar:
- portal/src/app/layout.tsx
- portal/src/app/auth/login/page.tsx
- portal/src/app/auth/register/page.tsx
- portal/src/app/dashboard/page.tsx
- portal/src/lib/supabase.ts

Yeni dosyalar:
- portal/src/components/providers/AuthProvider.tsx
- portal/src/components/auth/ProtectedRoute.tsx
- portal/src/components/auth/LogoutButton.tsx
- portal/src/hooks/useUser.ts
