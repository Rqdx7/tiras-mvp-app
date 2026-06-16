# Tiras MVP

Aplicație local-first pentru magazinul fizic Tiras din Leova: catalog, coș, cerere de comandă cu confirmare telefonică, admin pentru produse/stoc/comenzi/utilizatori/setări.

Nu există plată online.

## Setup local

1. Instalează dependențele:

```bash
npm install
```

2. Configurează `.env`:

```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="schimba-acest-secret-local-tiras"
ROOT_ADMIN_EMAIL="admin@tiras.local"
ROOT_ADMIN_PASSWORD_HASH="<hash bcrypt cu caracterele $ escapate ca \$ pentru Next.js>"
```

Parola demo pentru hash-ul inclus este `admin12345`. Pentru producție/local real, generează un hash bcrypt nou și schimbă parola.

3. Rulează migrarea și seed-ul:

```bash
npm run prisma:migrate -- --name init
npm run prisma:seed
```

4. Pornește aplicația:

```bash
npm run dev
```

Deschide `http://localhost:3000`.

## Conturi demo

- Root admin: `admin@tiras.local` / `admin12345`
- Vânzător seed: `seller@tiras.local` / `seller12345`

## Flux principal

- Clientul vede catalogul, filtrează produsele, adaugă în coș și trimite cererea.
- Comanda este salvată în SQLite, stocul variantei se rezervă imediat.
- Admin/vânzătorul vede comanda în `/admin/orders`, contactează clientul și schimbă statusul.
- Dacă o comandă este anulată, stocul rezervat este returnat.

## Upload imagini

Imaginile produselor se salvează local în `public/uploads`. Upload-ul acceptă doar fișiere imagine, maximum 4MB per fișier.
