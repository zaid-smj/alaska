# WSL Migration Handoff

## Git checkpoint

- Branch: `feature/content-management`
- Parent checkpoint: `feature/employee-work-sessions`
- Remote: `https://github.com/zaid-smj/alaska.git`

## Completed on this branch

- Home banner content management for admins and the super admin.
- Gallery content management for admins and the super admin.
- Audit events for banner and gallery creation, updates, deletion, and reordering.
- Managed homepage and gallery data injected into the existing public website.
- Existing static assets moved under `public/` so Apache serves them directly.
- Tailwind is compiled locally with Vite instead of relying on the development CDN.
- `/` and `/index.html` both serve the managed homepage.
- The homepage carousel was visually verified in a browser: slides are horizontal and advance automatically.
- The managed gallery was visually verified in a browser.

## Verification completed

- Content-management feature tests: 8 passed, 46 assertions.
- Full suite before the final stylesheet integration: 40 passed, 162 assertions.
- PHP formatting passed.
- `public/js/main.js` and `public/js/gallery.js` passed syntax checks.

## Build/runtime notes

- Run `npm run build` after installing Node dependencies. `public/build` is intentionally ignored by Git.
- Run Laravel migrations after restoring or creating the development database.
- Uploaded managed media belongs under `storage/app/public/content`; none existed at migration time.
- The Windows `.env` and MySQL Docker volume are intentionally not tracked by Git and must be restored separately.

## Next migration tasks

1. Clone this branch to `/home/hac736/projects/alaska`.
2. Restore `.env` without committing it.
3. Restore the development MySQL database or initialize a clean database if explicitly chosen.
4. Install Composer and Node dependencies, build assets, start Sail, and verify all tests.
5. Continue content-management development from the WSL-native checkout.
