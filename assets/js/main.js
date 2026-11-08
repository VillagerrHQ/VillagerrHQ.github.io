(() => {
  "use strict";

  const config = window.VILLAGERR_CONFIG || {};
  const nav = document.querySelector(".primary-nav");
  const toggle = document.querySelector(".nav-toggle");
  const mobile = window.matchMedia("(max-width: 650px)");

  // Navigation remains fully visible if JavaScript is unavailable.
  if (nav && toggle) {
    document.documentElement.classList.add("js");
    const setMenu = (open, returnFocus = false) => {
      toggle.setAttribute("aria-expanded", String(open));
      nav.hidden = mobile.matches && !open;
      if (returnFocus) toggle.focus();
    };
    const syncMenu = () => setMenu(false, mobile.matches && nav.contains(document.activeElement));
    syncMenu();
    mobile.addEventListener("change", syncMenu);
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      setMenu(open);
      if (open) nav.querySelector("a").focus();
    });
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a") && mobile.matches) {
        const destination = document.querySelector(event.target.closest("a").getAttribute("href"));
        setMenu(false);
        // Move focus to the destination so it is never left inside a hidden menu.
        if (destination) {
          destination.setAttribute("tabindex", "-1");
          destination.focus({ preventScroll: true });
          destination.addEventListener("blur", () => destination.removeAttribute("tabindex"), { once: true });
        }
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && mobile.matches && toggle.getAttribute("aria-expanded") === "true") setMenu(false, true);
    });
    document.addEventListener("click", (event) => {
      if (mobile.matches && !event.target.closest(".header-inner")) {
        const focusWasInMenu = nav.contains(document.activeElement);
        setMenu(false, focusWasInMenu);
      }
    });
  }

  const introToggle = document.querySelector("#intro-toggle");
  const introExtra = document.querySelector("#intro-extra");
  if (introToggle && introExtra) {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let introAnimation = null;
    introToggle.hidden = false;
    // A native button supplies keyboard and touch activation without custom key handlers.
    introToggle.addEventListener("click", () => {
      const expanded = introToggle.getAttribute("aria-expanded") !== "true";
      const startHeight = introExtra.hidden ? 0 : introExtra.getBoundingClientRect().height;
      if (introAnimation) introAnimation.cancel();
      introAnimation = null;
      introExtra.hidden = false;
      introExtra.style.height = "auto";
      const endHeight = expanded ? introExtra.scrollHeight : 0;
      introToggle.setAttribute("aria-expanded", String(expanded));
      introToggle.textContent = expanded ? "Less" : "More";
      introExtra.setAttribute("aria-hidden", String(!expanded));
      const finish = () => {
        introExtra.hidden = !expanded;
        introExtra.style.height = "";
        introAnimation = null;
      };
      if (reducedMotion.matches || typeof introExtra.animate !== "function") {
        finish();
        return;
      }
      introExtra.style.height = expanded ? "auto" : "0px";
      const animation = introExtra.animate(
        [{ height: `${startHeight}px` }, { height: `${endHeight}px` }],
        { duration: 280, easing: "cubic-bezier(.2,.7,.3,1)" }
      );
      introAnimation = animation;
      animation.onfinish = () => {
        if (introAnimation === animation) finish();
      };
    });
  }

  // Accept HTTPS URLs only, on the expected platform; no executable URLs or lookalike domains.
  const platformUrl = (value, platform) => {
    if (typeof value !== "string" || !value.trim()) return null;
    try {
      const url = new URL(value.trim());
      const allowedHosts = platform === "youtube"
        ? ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"]
        : ["twitch.tv", "www.twitch.tv"];
      return url.protocol === "https:" && !url.username && !url.password && !url.port && allowedHosts.includes(url.hostname) ? url.href : null;
    } catch { return null; }
  };
  const externalLink = (url, label, className = "text-link") => {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.className = className;
    link.append(document.createTextNode(label));
    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "↗";
    const hint = document.createElement("span");
    hint.className = "sr-only";
    hint.textContent = " (opens in a new tab)";
    link.append(arrow, hint);
    return link;
  };

  let configuredChannels = 0;
  [["youtube", config.youtubeUrl, "Visit YouTube"], ["twitch", config.twitchUrl, "Visit Twitch"]].forEach(([platform, value, label]) => {
    const url = platformUrl(value, platform);
    const slot = document.querySelector(`[data-link-slot="${platform}"]`);
    if (url && slot) {
      slot.replaceChildren(externalLink(url, label));
      configuredChannels++;
    }
  });
  const channelNote = document.querySelector(".channel-note");
  if (channelNote && configuredChannels === 2) channelNote.hidden = true;
  else if (channelNote && configuredChannels === 1) channelNote.textContent = "The remaining official channel link will be added when available.";

  if (typeof config.businessEmail === "string") {
    const email = config.businessEmail.trim();
    // Keep the placeholder for missing or malformed addresses; never send form submissions.
    if (/^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?)+$/i.test(email)) {
      const slot = document.querySelector('[data-link-slot="email"]');
      if (slot) {
        const link = document.createElement("a");
        link.className = "button button-primary";
        link.href = `mailto:${email}`;
        link.textContent = email;
        slot.replaceChildren(link);
        document.querySelector(".contact-hint").textContent = "For business inquiries and collaborations.";
      }
    }
  }

  const videos = Array.isArray(config.featuredVideos) ? config.featuredVideos : [];
  const validVideos = videos.filter((video) => video && typeof video.title === "string" && video.title.trim() && platformUrl(video.url, "youtube")).slice(0, 6);
  if (validVideos.length) {
    const grid = document.querySelector("#featured-videos");
    const template = grid.querySelector(".video-art");
    const cards = validVideos.map((video, index) => {
      const card = document.createElement("article");
      card.className = "video-card";
      const entry = document.createElement("a");
      entry.className = "video-entry";
      entry.href = platformUrl(video.url, "youtube");
      entry.target = "_blank";
      entry.rel = "noopener noreferrer";
      entry.setAttribute("aria-label", `Watch ${video.title.trim()} on YouTube (opens in a new tab)`);
      const art = template.cloneNode(true);
      art.querySelectorAll("img").forEach((image) => image.remove());
      art.className = `video-art ${["video-art-forest", "video-art-blue", "video-art-brown"][index % 3]}`;
      art.querySelector(".slot-number").textContent = String(index + 1).padStart(2, "0");
      // Allow local assets and YouTube's own thumbnail CDN for these video IDs.
      if (typeof video.thumbnail === "string" && video.thumbnail.trim()) {
        try {
          const thumbnailUrl = new URL(video.thumbnail, document.baseURI);
          const videoUrl = new URL(entry.href);
          const videoId = videoUrl.hostname === "youtu.be" ? videoUrl.pathname.slice(1) : videoUrl.searchParams.get("v");
          const isYouTubeThumbnail = thumbnailUrl.protocol === "https:" && thumbnailUrl.hostname === "i.ytimg.com" && !thumbnailUrl.username && !thumbnailUrl.password && !thumbnailUrl.port && thumbnailUrl.pathname === `/vi/${videoId}/maxresdefault.jpg`;
          const isLocalThumbnail = thumbnailUrl.origin === window.location.origin && ["http:", "https:", "file:"].includes(thumbnailUrl.protocol);
          if (isLocalThumbnail || isYouTubeThumbnail) {
            const thumbnail = document.createElement("img");
            thumbnail.alt = "";
            thumbnail.loading = "lazy";
            thumbnail.decoding = "async";
            thumbnail.width = 1280;
            thumbnail.height = 720;
            const sources = isYouTubeThumbnail
              ? [thumbnailUrl.href, `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`, `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`]
              : [thumbnailUrl.href];
            let sourceIndex = 0;
            const nextSource = () => {
              sourceIndex++;
              if (sourceIndex < sources.length) thumbnail.src = sources[sourceIndex];
              else thumbnail.remove();
            };
            thumbnail.addEventListener("error", nextSource);
            thumbnail.addEventListener("load", () => {
              // YouTube may return a 120px fallback even for an unavailable high-res image.
              if (isYouTubeThumbnail && thumbnail.naturalWidth < 480) nextSource();
            });
            thumbnail.src = sources[0];
            art.append(thumbnail);
          }
        } catch { /* Retain the explicit thumbnail placeholder. */ }
      }
      const body = document.createElement("div");
      body.className = "video-card-body";
      const category = document.createElement("p");
      category.className = "card-eyebrow";
      category.textContent = typeof video.category === "string" && video.category.trim() ? video.category.trim() : "FEATURED VIDEO";
      const title = document.createElement("h3");
      title.textContent = video.title.trim();
      const cta = document.createElement("p");
      cta.textContent = "Watch on YouTube ↗";
      body.append(category, title, cta);
      entry.append(art, body);
      card.append(entry);
      return card;
    });
    grid.replaceChildren(...cards);
    document.querySelector("#video-placeholder-note")?.setAttribute("hidden", "");
    document.querySelector(".section-chip")?.setAttribute("hidden", "");
    document.querySelector("#videos .section-heading p").textContent = "A few good places to start. Settle in and find your next watch.";
  }

  document.querySelector("#copyright-year").textContent = new Date().getFullYear();
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach((section) => observer.observe(section));
  }
})();
