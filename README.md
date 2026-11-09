# HAD — Heavenly Athletics Department

A responsive league website for Heavenly Athletics Department, built with plain HTML, CSS, and JavaScript so it can be hosted as a static site (for example, GitHub Pages).

## Included

- HAD-branded homepage and seasonal hero banner.
- Crown and Ascended team directories (team names only; no standings positions or records).
- Stats table fetched from the connected Google Sheet and refreshed every 60 seconds, plus a manual refresh button.
- Google Sheet embedded on the site and linked directly.
- Bulletin board, future updates, and pre-playoff bracket preview.
- Operator tools for changing the displayed season, bulletin headlines, and future updates in the current browser.

## Google Sheets connection

The site reads the selected tab (`gid=1938901917`) as CSV from the spreadsheet and renders its first row as the table headers. Changes to the sheet appear on the website after the next refresh (up to 60 seconds), or when a visitor presses **Refresh**.

For data loading and the embedded spreadsheet to work for visitors, set the spreadsheet's General access to **Anyone with the link — Viewer** (or publish the tab to the web). The embed lets visitors view the source sheet; they need Google access to edit it. Stats should be entered in the sheet itself to keep the sheet as the source of truth.

## Operator tools limitation

Operator tool changes use the browser's local storage. They persist on that device/browser only and are not published to other visitors. This is intentionally not presented as secure admin authentication: client-side-only credentials cannot protect shared site content. To let multiple operators publish shared bulletin, season, bracket, and update changes, connect a secure backend or CMS with authenticated accounts.

## Run locally

Open `index.html` in a browser or serve this folder with any static web server. The Google Sheets fetch may require an online connection and public viewer access.

## Deploy

Enable GitHub Pages for this repository and deploy from the `main` branch root, or host the files on any static hosting provider.
