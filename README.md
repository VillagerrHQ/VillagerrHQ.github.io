# Villagerr — Alpha

The official website of **DrVillagerr**, a gaming and variety content creator. This first Alpha is a responsive, static website built with HTML, CSS, and JavaScript. It needs no build step, backend, package installation, or paid service.

## Preview locally

From the repository root, run:

```sh
python3 -m http.server 8000
```

Open <http://localhost:8000>. Stop the server with `Ctrl+C`.

Preview the custom error page at <http://localhost:8000/404.html>. Python's basic server does not automatically serve the custom page for unknown paths; GitHub Pages does.

## Add official content

Missing content is deliberately labeled. No channel URLs, video titles, subscriber counts, achievements, or contact address have been invented.

Edit `assets/js/config.js` to add the confirmed details:

| Field | Content |
| --- | --- |
| `youtubeUrl` | The full official YouTube channel URL. |
| `twitchUrl` | The full official Twitch channel URL. |
| `businessEmail` | The confirmed public business email address. |
| `featuredVideos` | Up to six video objects with `title` and `url`; local `thumbnail` and `category` are optional. |

Leave unconfirmed fields empty. Use full HTTPS URLs for external links. Put owned or licensed images in `assets/` and use local paths for thumbnails, for example `assets/images/your-thumbnail.jpg`. Replace the clearly labeled artwork placeholders with official imagery when available, and give meaningful images appropriate alternative text.

To add a video, place an object inside `featuredVideos`. The following is a template to fill with real details, not a ready-to-use video:

```js
featuredVideos: [
  {
    title: "REPLACE_WITH_REAL_VIDEO_TITLE",
    url: "REPLACE_WITH_FULL_HTTPS_YOUTUBE_VIDEO_URL",
    thumbnail: "assets/images/your-thumbnail.jpg",
    category: "REPLACE_WITH_VIDEO_CATEGORY"
  }
]
```

Only HTTPS YouTube and Twitch URLs on their expected domains are enabled. Invalid or empty entries retain the coming-soon state. Configured links open in a new tab and announce that behavior to assistive technology. A missing or failed local thumbnail keeps the labeled thumbnail placeholder. The business address becomes a `mailto:` link; there is no contact form or message storage.

Edit `index.html` for the introduction and other page copy, `assets/css/styles.css` for the design, and `assets/js/main.js` for interactions. The custom `404.html` is self-contained so its appearance also works at missing nested URLs. Its home link targets `/`, appropriate for this account website repository.

Before release, review the page title, description, sharing metadata, image descriptions, all confirmed links, and the mobile layout. Add any final canonical URL or social sharing image only after the public URL and official artwork are confirmed. Do not put private credentials or unpublished contact details in this public repository.

## Publish on GitHub Pages

**This work does not publish or deploy the website.** After approving publication:

1. Commit and push the reviewed files to the desired branch in `VillagerrHQ.github.io`.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Select the branch containing the site and the **`/ (root)`** folder, then save.
5. Wait for GitHub's Pages deployment to finish, then open the URL shown in the Pages settings. For this account-site repository, the default URL is <https://villagerrhq.github.io/>.
6. Check navigation, social links, contact details, mobile layout, and an unknown URL such as `/missing-page` to verify the custom 404.

Keep `index.html`, `404.html`, and `.nojekyll` at the repository root. `.nojekyll` tells GitHub Pages to serve the static files directly. No GitHub Actions workflow or application server is required. If Pages is already enabled for the selected branch, pushing to that branch can trigger publication; obtain approval before doing so.
