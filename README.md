# The 10 Minute Journey to You

Static marketing site for the book and free workbook. Built for GitHub Pages.

## Pages
- `index.html` — Home
- `process.html` — The Process
- `library.html` — Library (practice videos)
- `research.html` — Research / citations
- `subscribe.html` — Free workbook + pre-sale signup

## Deploy to GitHub Pages
1. Create a repo and upload **all files in this folder** (keep the structure — `assets/`, `styles.css`, `script.js`, `workbook.pdf`, `.nojekyll`).
2. Repo **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`.
3. For the custom domain, add a file named `CNAME` containing `the10minutejourneytoyou.com`, then set the DNS records at your registrar (A records to GitHub's IPs, or a CNAME to `<user>.github.io`).

## Wire up email capture (currently UI-only)
Open `script.js` and edit the `submitEmail()` function (top of file). Drop in your
Formspree / Mailchimp / ConvertKit call. Every form + the popup uses this one function.
Each submission includes a `source` field so you can see which form it came from.

## Free workbook PDF
Replace `workbook.pdf` with the real file (keep the same name), or change
`WORKBOOK_PDF_URL` at the top of `script.js`.

## Popup timing
In `script.js`: `POPUP_DELAY_MS` (default 8s) and `POPUP_COOLDOWN_DAYS` (default 7).
