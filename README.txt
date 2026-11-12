UFILAG REWORK — QUICK START

Open index.html to preview locally. Upload the entire folder contents to any static web host (Netlify, Cloudflare Pages, GitHub Pages, or your hosting provider).

WHAT'S INCLUDED
- Rockstar-inspired black/gold visual direction (inspired by the genre/layout, not copied branding/assets)
- Responsive mobile/desktop navigation
- EN/RU language toggle (main interface labels; editorial copy can be expanded)
- Featured news slider, news feed and article view
- Game catalogue and SECTOR 7 detail page
- Demo admin panel: create/delete news, feature news on homepage, upload gallery images
- Demo profile creation

IMPORTANT LIMITATION — DEMO STORAGE
This build uses browser localStorage/sessionStorage. It is a working front-end prototype, but:
- Content created in Admin is saved only in the browser where it was created.
- It does NOT automatically sync to visitors or another device.
- The admin password is a local demo lock, NOT secure production authentication.
- Demo account creation is not real account authentication.
- Image uploads are limited to 1.5 MB each in demo mode.

BEFORE PUBLIC LAUNCH
To make publishing work from both phone and PC and show the same news to every visitor, connect a shared backend:
1. Create a Supabase project.
2. Add tables: news (id, title, summary, body, category, image_url, featured, published_at), games, gallery, profiles.
3. Enable Supabase Auth; restrict admin writes with an admin role and Row Level Security.
4. Store images in Supabase Storage and save public image URLs in the database.
5. Replace local demo storage calls in assets/site.js with Supabase reads/writes.
6. Configure production domain, HTTPS, backups and privacy/cookie notices as appropriate.

Do not publish sensitive information or use the demo password as a real security measure.


LATEST DESIGN UPDATE
- Homepage hero copy is aligned to the left with a narrower editorial text column.
- Newswire on homepage and news page now uses an image-led editorial card grid, with category/date, headline, summary and read-more link.
- Featured news can be selected in Admin to appear in the rotating homepage hero.


UFILAG EXPANDED FEATURES
- Page transition fade, scroll reveal animations and reduced-motion accessibility.
- New Trailers & Gameplay page. Admin can publish YouTube/Vimeo URLs.
- New Announcements page. Admin can publish announcement entries.
- Homepage promo panels for trailers and announcements.
- Contact section and footer social links for Telegram, Instagram and phone.
- Configure actual contacts in assets/config.js (contacts.telegram / instagram / phone). These are intentionally blank until you provide real handles/numbers.
- News cards use image-led editorial layout; featured entries can rotate in the homepage hero.

PRODUCTION BACKEND (REQUIRED FOR SHARED PUBLISHING / REAL ACCOUNTS)
This archive still runs as a browser-only demo until Supabase is configured. It is not possible to create your live database, secure admin account or real user authentication without your Supabase project credentials and your actual contact details.
1. Create a project at https://supabase.com/
2. In Project Settings > API, copy Project URL and anon/public key into assets/config.js:
   supabase.url and supabase.anonKey.
3. Run SUPABASE_SETUP.sql in Supabase SQL Editor.
4. Create a public Storage bucket named ufilag-media.
5. Create your account through the account page / Supabase Auth, then promote its profile UUID to admin using the SQL comment in the setup file.
6. Configure your real Telegram, Instagram and phone links in assets/config.js.
7. Deploy the full folder to a static host with HTTPS.
Never put a Supabase service_role key in frontend code. Only use the anon/public key with Row Level Security enabled.

This build does not pretend to have real accounts or cross-device publishing before those steps are completed. Browser demo data is local to the current browser.


WHAT I STILL NEED FROM THE UFILAG OWNER TO FINISH THE LIVE LAUNCH
- Telegram URL or @username.
- Instagram URL or @username.
- Public business phone number (or tel: link).
- Supabase Project URL and anon/public key (never send service_role key).
- Domain/hosting provider, if already purchased.
The site intentionally uses blank contact values rather than publishing made-up handles or phone numbers.


CURRENT BUILD NOTES — NOVEMBER 2026
- Telegram contact is configured: https://t.me/ufilag
- Instagram and phone are left blank because no real public links/numbers were provided.
- Supabase integration is implemented in the frontend. The site switches to shared remote content/auth when both values in assets/config.js are set.
- Account registration and sign-in use Supabase Auth.
- Admin login checks public.profiles.role = 'admin'. There is no browser-only admin password.
- News, announcements, trailers and gallery metadata use Supabase tables; image files use Supabase Storage.
- Until Supabase URL/key are configured, public pages use the built-in sample content and account/admin publishing show a setup message.

FROM ZERO TO ONLINE
A. Create Supabase
1. Open https://supabase.com/ and create a new project.
2. Wait for the database to finish provisioning.
3. Open SQL Editor > New query. Paste all of SUPABASE_SETUP.sql and run it.
4. Open Storage > New bucket. Name it exactly `ufilag-media` and enable Public bucket.
5. Open Project Settings > API. Copy Project URL and anon/public key.
6. Paste those into assets/config.js:
   url: "https://YOUR-PROJECT.supabase.co"
   anonKey: "YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY"
   Never paste a service_role or secret key into the website.

B. Create the UFILAG administrator
1. Upload/deploy the site once, or open profile.html locally from a web server.
2. Register with the studio's admin email and a strong password.
3. Confirm the email if Supabase email confirmation is enabled.
4. In Supabase > Authentication > Users, copy that user's UUID.
5. In SQL Editor run:
   update public.profiles set role = 'admin' where id = 'PASTE-USER-UUID-HERE';
6. Open admin.html and sign in with that email/password.
7. Publish news, announcements and trailers. These will be visible to every visitor and synced between devices.

C. Put the site online (no domain/hosting purchased yet)
Recommended beginner path:
1. Create a free Cloudflare account and open Workers & Pages > Create > Pages > Upload assets (or use Netlify Drop).
2. Extract the ZIP on your computer.
3. Upload the contents of the UFILAG site folder (the HTML files and the assets folder), not the ZIP itself.
4. After deployment, open the generated HTTPS address and test index.html, admin.html and profile.html.
5. A custom domain can be connected later; it is not required for the first preview.

D. Important
- Supabase free-tier limits and pricing may change; check the dashboard before launch.
- Enable email confirmation and configure allowed redirect URLs in Supabase Auth for your deployed domain.
- Add a privacy policy/contact email before collecting user account data from the public.
- Back up the database and Storage bucket periodically.
- The frontend must only contain the anon/publishable key. Never expose service_role keys.


VERSION 5 NOTES
- Improved admin content library with search and type filters.
- Edit existing news, announcements and trailers from the admin panel.
- Safer delete flow checks that Supabase actually removed the row and reports RLS errors.
- Added an admin shortcut on the Games page and a floating shortcut for signed-in admins.
- Reduced ambient animation workload: fewer particles, capped device pixel ratio, pauses in background tabs, disabled on small screens/reduced-motion.
- Refined admin editor and responsive styling.


VERSION 6 — ADMIN CLEANUP, SECTOR 7 BANNER & VIDEO UPLOAD
- Removed public-facing Admin Desk shortcut and Admin links from public navigation/footer.
- Admin access remains available directly at /admin.html.
- Added editable SECTOR 7 hero banner from the admin panel.
- Added direct MP4/WebM video uploads to the ufilag-media Storage bucket, as well as YouTube/Vimeo links.
- Trailer pages render uploaded MP4/WebM with native video controls.
- Upload size guidance is displayed next to each upload field.
- IMPORTANT: run SUPABASE_V6_MIGRATION.sql once in SQL Editor to create game_settings and its RLS policies.
UPLOAD DIMENSIONS
- SECTOR 7 hero banner: 2560 × 1000 px (wide landscape), WebP/JPG, max 8 MB.
- News/announcement cover: 1600 × 900 px (16:9), WebP/JPG, max 8 MB.
- SECTOR 7 gallery: 1920 × 1080 px (16:9), WebP/JPG, max 8 MB.
- Uploaded video: MP4 (H.264 recommended) or WebM, 1920 × 1080 recommended, max 50 MB in the UI. Supabase Storage bucket limits may be lower; adjust bucket file size limit in Storage settings if needed.


VERSION 7 — RUSSIAN ADMIN, BANNER FIX, CINEMATIC SLIDER & PERFORMANCE
- Admin panel interface is now Russian-first and language toggle is removed from admin.
- Fixed SECTOR 7 banner upload/read implementation. Run SUPABASE_V7_MIGRATION.sql once; it creates game_settings, grants the required API privileges and adds RLS policies.
- Homepage slider uses published items marked "Показывать на главном экране" that have a cover image.
- Homepage slider automatically advances every 7 seconds with directional movement: outgoing image slides left while the next image enters from the right.
- Visitors can drag with a mouse or swipe on touch screens to change slides; arrows also work.
- Direct MP4/WebM uploads are supported in the trailer form; YouTube/Vimeo links remain supported.
- Removed the animated canvas snow and expensive full-screen SVG turbulence overlay to reduce rendering work.
- Respect prefers-reduced-motion.
IMPORTANT: If the banner still does not save, open admin panel and read the message shown under the banner button. The most common reason is that SUPABASE_V7_MIGRATION.sql has not been run yet.


VERSION 9 — VIDEO / NEWS CAROUSEL / DEPLOYMENT FIXES
- Homepage news now displays every published news/announcement item in a responsive carousel with arrows and automatic advance; it no longer truncates the homepage feed to three static cards.
- YouTube links (watch, shorts, live, youtu.be) and Vimeo links now resolve to their proper embed players.
- Direct MP4/WebM/OGG video files use the native HTML5 player; unsupported links show a readable fallback instead of a blank frame.
- Video uploads accept MP4/WebM based on MIME type or file extension and set an explicit content type.
- Trailers page no longer loads assets/config.js twice.
- Added SUPABASE_V9_MEDIA_MIGRATION.sql to create/update the public ufilag-media bucket, set a 50 MiB upload limit, allow image/video MIME types and refresh Storage RLS policies.

REQUIRED FOR THIS BUILD
Run SUPABASE_V9_MEDIA_MIGRATION.sql in Supabase SQL Editor after the earlier setup/migrations. The bucket must be public for public video URLs to play. The 50 MiB file limit is configured by this migration; project-wide Supabase plan limits still apply.

UFILAG v10 — GAME CATALOGUE & RELEASE MANAGEMENT
1. Replace the previous website files with this package.
2. In Supabase SQL Editor, run SUPABASE_V10_GAMES_RELEASES_MIGRATION.sql after the previous setup/migrations (including V7, V8 and V9).
3. Sign in to admin.html with an account whose profiles.role is 'admin'.
4. Use Управление играми to add/edit games, covers, genres, statuses, platforms and release dates.
5. Use Управление релизами to create or reschedule dated release entries and publish notes about delays.
6. Public games.html reads visible games and release entries from Supabase.
7. The publication editor also supports News, Announcements, Development Diaries, Articles, Studio Updates and Trailers.
NOTE: The V10 SQL migration expects the base SUPABASE_SETUP.sql and earlier migrations to have been run. Never put a Supabase service_role key in the browser config.

UFILAG v11 — COMMUNITY + PHOTO-ONLY HOMEPAGE
Run SUPABASE_V11_COMMUNITY_HERO_MIGRATION.sql after all previous migrations.
Community features: game favorites, article comments, and in-account notifications for new published content.
Homepage photo-only mode: Admin → Главный экран → Фото без текста. Upload a 2560×1440 image and keep the checkbox enabled to hide headline, description and buttons. Use the restore button to return to the normal homepage hero.

UFILAG v12 — FIX FOR PHOTO-ONLY HOMEPAGE AND ACCOUNTS

IMPORTANT SQL ORDER WHEN V11 FAILED WITH public.games DOES NOT EXIST:
1. Run SUPABASE_V12_REPAIR.sql in Supabase SQL Editor.
2. Run SUPABASE_V11_COMMUNITY_HERO_MIGRATION.sql again.
3. Ensure the Storage bucket `ufilag-media` exists and is PUBLIC, and that the admin upload policies from SUPABASE_SETUP.sql are installed.

PHOTO-ONLY HOMEPAGE:
Admin panel > Главный экран > Фото без текста. Select an image and press СОХРАНИТЬ ГЛАВНЫЙ ЭКРАН. The uploaded image replaces the homepage hero and all overlay copy/buttons/slider controls are hidden when the checkbox is enabled. The hero image is stored in `hero_media` and the file in `ufilag-media`.

ACCOUNT SESSION:
Supabase Auth session persistence is explicitly enabled in localStorage. After email confirmation, sign in once; the session should survive reloads on the same browser/device. The account is not automatically signed in on a different device. If email confirmation is enabled, confirm the link sent by Supabase before the first sign-in.
