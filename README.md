# Yuki Instituto

Static retro-desktop personal website for **Yuki**. The site is intentionally framework-free so GitHub Pages can publish the repository directly.

## Pages deployment

1. Merge the `yuki-site` pull request into `main`.
2. Open **Settings → Pages** in this repository.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Open the **Actions** tab and watch the `Deploy static site to GitHub Pages` workflow.
5. The project site will normally be available at:
   `https://chaosnap.github.io/TestWeb/`

The workflow is stored in `.github/workflows/deploy-pages.yml` and publishes the repository as a static Pages artifact.

## GitHub Pages compatibility

- All internal links are relative (`./about/`, `../styles.css`, etc.) so they work under the `/TestWeb/` project path.
- `.nojekyll` is included so GitHub Pages does not apply Jekyll processing.
- No Node.js, npm install, build output, or framework runtime is required.
- The site includes `index.html` at the repository root.

## Pages

- `/` — desktop homepage
- `/about/` — Yuki profile
- `/contact/` — contact layout (replace placeholders with real details)
- `/readme/` — VSQX/UST/files layout
- `/voicebank/` — voicebank/resources layout

## Editing contact details

The current contact page contains placeholders on purpose. Edit `contact/index.html` and replace them with the email/social links Yuki wants to publish.
