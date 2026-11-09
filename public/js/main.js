// Wait for DOM to be ready before running any code
document.addEventListener("DOMContentLoaded", () => {
  // Enable native lazy-loading and provide a lightweight fallback.
  // For best results, add `data-src`/`data-srcset` to images you want deferred
  // (keeps `src` empty or points to a tiny placeholder). This script will
  // set `loading="lazy"` on all <img> elements and, for browsers that
  // don't support the native attribute, use an IntersectionObserver to copy
  // `data-src`/`data-srcset` into `src`/`srcset` when the image is near the viewport.
  (function enableLazyImages() {
    const imgs = document.querySelectorAll("img");
    imgs.forEach((img) => {
      if (!img.hasAttribute("loading")) img.setAttribute("loading", "lazy");
    });

    if (!("loading" in HTMLImageElement.prototype)) {
      const lazy = document.querySelectorAll('img[loading="lazy"]');
      if (lazy.length === 0) return;

      const io = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            if (el.dataset && el.dataset.src) el.src = el.dataset.src;
            if (el.dataset && el.dataset.srcset) el.srcset = el.dataset.srcset;
            observer.unobserve(el);
          });
        },
        { rootMargin: "200px 0px" },
      );

      lazy.forEach((img) => io.observe(img));
    }
  })();
  // Smooth Scroll Logic for # links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        // Calculate header height to avoid overlapping the title
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth", // This creates the "nice scrolling effect"
        });
      }
    });
  });

  // FAQ & Other DOM-dependent code
  const triggers = document.querySelectorAll(".faq-trigger");

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const parent = trigger.parentElement;
      const content = trigger.nextElementSibling;
      const icon = trigger.querySelector("i");

      // Close other open items (Optional - remove if you want multiple open)
      document.querySelectorAll(".faq-content").forEach((otherContent) => {
        if (otherContent !== content) {
          otherContent.style.maxHeight = "0";
          otherContent.style.opacity = "0";
          otherContent.previousElementSibling.querySelector("i").style.transform = "rotate(0deg)";
        }
      });

      // Toggle active item
      if (content.style.maxHeight === "0px" || content.style.maxHeight === "") {
        content.style.maxHeight = content.scrollHeight + "px";
        content.style.opacity = "1";
        icon.style.transform = "rotate(45deg)"; // Changes + to x
      } else {
        content.style.maxHeight = "0";
        content.style.opacity = "0";
        icon.style.transform = "rotate(0deg)";
      }
    });
  });

  const faqButtons = document.querySelectorAll(".faq-filter-btn");
  const faqItems = document.querySelectorAll(".faq-item[data-category]");

  if (faqButtons.length && faqItems.length) {
    const setFaqCategory = (category) => {
      faqButtons.forEach((btn) => {
        const isActive = btn.getAttribute("data-category") === category;
        btn.classList.toggle("active", isActive);
      });

      faqItems.forEach((item) => {
        const matches = item.getAttribute("data-category") === category;
        item.classList.toggle("hidden", !matches);

        if (!matches) {
          const content = item.querySelector(".faq-content");
          const icon = item.querySelector(".faq-trigger i");
          if (content) {
            content.style.maxHeight = "0";
            content.style.opacity = "0";
          }
          if (icon) icon.style.transform = "rotate(0deg)";
        }
      });
    };

    faqButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        setFaqCategory(btn.getAttribute("data-category"));
      });
    });

    const defaultBtn = document.querySelector(".faq-filter-btn.active") || faqButtons[0];
    if (defaultBtn) {
      setFaqCategory(defaultBtn.getAttribute("data-category"));
    }
  }
  // Form submission handling
  document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      showSuccess();
      form.reset();
    });
  });

  // Blog modal overlay close handler
  const modalOverlay = document.getElementById("modal-overlay");
  if (modalOverlay) {
    modalOverlay.addEventListener("click", closeBlogModal);
  }

  // Contact form submission
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    const EMAIL_API_URL = "https://yourdomain.com/send-email.php";

    contactForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const submitBtn = document.getElementById("submitBtn");
      const originalText = submitBtn.textContent;

      // Disable button and show loading state
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
      submitBtn.classList.add("opacity-50", "cursor-not-allowed");

      // Collect form data
      const formData = {
        name: document.getElementById("fullName").value,
        email: document.getElementById("userEmail").value,
        phone: document.getElementById("userPhone").value,
        subject: document.getElementById("subject").value,
        message: document.getElementById("message").value,
      };

      try {
        const response = await fetch(EMAIL_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // Show success modal
          document.getElementById("successModal").classList.remove("hidden");
          document.getElementById("successModal").classList.add("flex");

          // Reset form
          contactForm.reset();
        } else {
          alert(result.message || "Failed to send message. Please try again or contact us directly.");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to send message. Please try again or contact us directly.");
      } finally {
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        submitBtn.classList.remove("opacity-50", "cursor-not-allowed");
      }
    });
  }

  // Partner count: use Odometer (odometer.js) and trigger on enter
  (function () {
    const el = document.getElementById("partner-count");
    const wrap = document.querySelector(".partner-counter");
    if (!el || !wrap || typeof Odometer === "undefined") return;

    const target = parseInt(wrap.dataset.target || "0", 10);
    const od = new Odometer({ el: el, value: 0, format: "(,ddd)" });

    let hasRun = false;
    const obs = new IntersectionObserver(
      (entries) => {
        if (hasRun) return;
        if (entries.some((e) => e.isIntersecting)) {
          hasRun = true;
          od.update(target);
          obs.disconnect();
        }
      },
      { threshold: 0.4 },
    );

    obs.observe(wrap);
  })();

  window.scrollCertCarousel = scrollCertCarousel;

  // ============================================
  // GLOBAL FUNCTIONS (defined outside DOMContentLoaded)
  // ============================================

  // Function to show the success message
  function showSuccess() {
    const modal = document.getElementById("successModal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.style.overflow = "hidden";
  }

  // Function to close the modal
  function closeModal() {
    const modal = document.getElementById("successModal");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    document.body.style.overflow = "auto";
  }

  // Code for Blog Modal

  const blogData = Object.fromEntries((window.ALASKA_CONTENT?.articles || []).map(article => [article.id, {
    title: article.detailTitle || article.title,
    category: article.category,
    content: article.content,
  }]));
  const articleEscape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));

  // Open Modal with improved performance
  function openBlogModal(id) {
    const modal = document.getElementById("blog-modal");
    const body = document.getElementById("modal-body");
    const data = blogData[id];

    if (!data) return;

    // Use requestAnimationFrame for smoother rendering
    requestAnimationFrame(() => {
      body.innerHTML = `
      <div class="space-y-6 overflow-x-hidden">
        <div class="space-y-3">
          <span class="inline-block category-badge text-zinc-900 font-bold uppercase tracking-widest text-xs px-3 py-1 bg-zinc-100 rounded-full">${articleEscape(data.category)}</span>
          <h1 class="text-2xl md:text-3xl lg:text-4xl font-black uppercase leading-tight text-zinc-900">${articleEscape(data.title)}</h1>
        </div>
        <div class="prose prose-zinc prose-sm md:prose-base lg:prose-lg max-w-none blog-content">
          ${data.content}
        </div>
      </div>
    `;

      // Add click listener to all buttons and links inside the blog content
      const buttons = body.querySelectorAll("button, a");
      buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
          closeBlogModal();
        });
      });
    });

    modal.classList.remove("hidden");
    // Scroll modal into view if not fully visible (mobile especially)
    setTimeout(() => {
      modal.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 10);
    // Smoother transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        modal.classList.add("active");
      });
    });
    document.body.style.overflow = "hidden";
  }

  // Close Modal with smooth transition
  function closeBlogModal() {
    const modal = document.getElementById("blog-modal");
    modal.classList.remove("active");
    setTimeout(() => {
      modal.classList.add("hidden");
      document.body.style.overflow = "";
      // Clear content after closing to reduce memory
      const body = document.getElementById("modal-body");
      if (body) body.innerHTML = "";
    }, 300);
  }

  // Expose modal functions to global scope for inline handlers
  window.openBlogModal = openBlogModal;
  window.closeBlogModal = closeBlogModal;

  // Close on click outside (Overlay) - already handled in DOMContentLoaded

  // Horizontal Scroll logic - improved
  function scrollBlogs(distance) {
    const container = document.getElementById("blog-scroll-container");
    if (!container) return;
    container.scrollBy({ left: distance, behavior: "smooth" });
  }

  // Blog Search with debouncing for better performance
  let searchTimeout;
  function filterBlogs() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const input = document.getElementById("blog-search");
      const filter = input.value.toLowerCase();
      const container = document.getElementById("blog-scroll-container");
      if (!container) return;

      const cards = container.getElementsByClassName("blog-item");

      // Disable loop snapping while searching
      container.style.scrollSnapType = filter ? "none" : "x mandatory";

      for (let i = 0; i < cards.length; i++) {
        const title = cards[i].querySelector("h4")?.innerText?.toLowerCase() || "";
        const category = cards[i].querySelector("p")?.innerText?.toLowerCase() || "";

        if (title.includes(filter) || category.includes(filter)) {
          cards[i].style.display = "block";
        } else {
          cards[i].style.display = "none";
        }
      }
    }, 150); // Debounce by 150ms
  }

  const container = document.getElementById("blog-scroll-container");

  function initBlogEngine() {
    if (!container) return;

    // Mobile Observer for image scale/fade
    const observer = new IntersectionObserver(
      (entries) => {
        if (window.innerWidth >= 1024) return;
        entries.forEach((entry) => {
          const wash = entry.target.querySelector(".wash-layer");
          const img = entry.target.querySelector("img");
          if (entry.isIntersecting) {
            if (wash) wash.style.opacity = "0";
            if (img) img.style.transform = "";
          } else {
            if (wash) wash.style.opacity = "0.7";
            if (img) img.style.transform = "";
          }
        });
      },
      { root: container, threshold: 0.8 },
    );

    document.querySelectorAll(".blog-item").forEach((item) => observer.observe(item));
  }

  function scrollBlogs(dir) {
    if (!container) return;
    const blogItem = container.querySelector(".blog-item");
    if (!blogItem) return;

    const itemWidth = blogItem.offsetWidth + 20;
    const move = window.innerWidth > 1024 ? itemWidth * 3 : itemWidth;
    container.scrollBy({ left: move * dir, behavior: "smooth" });
  }

  function initHomeHeroBannerSlider() {
    const heroTrack = document.getElementById("home-hero-carousel-track");
    if (!heroTrack) return;

    const heroKicker = document.getElementById("home-hero-kicker");
    const heroTitle = document.getElementById("home-hero-title");
    const heroSubtitle = document.getElementById("home-hero-subtitle");
    const heroPrimaryBtn = document.getElementById("home-hero-btn-primary");
    const heroSecondaryBtn = document.getElementById("home-hero-btn-secondary");
    const heroPrimaryBtnLabel = document.getElementById("home-hero-btn-primary-label");
    const heroSecondaryBtnLabel = document.getElementById("home-hero-btn-secondary-label");

    // Used when the site's content manager has no home banners set (window.ALASKA_CONTENT.homeBanners)
    const fallbackHeroSlides = [
      {
        desktop: "assets/slider-home/slide-1.webp",
        mobile: "assets/solutions/mobile/solutions-hero-mobile.webp",
        alt: "Alaska batteries for cars, solar and industry",
        kicker: "",
        title: "Alaska Batteries",
        subtitle: "",
        primaryBtn: { text: "Find My Battery", href: "battery-finder.html#bf-root" },
        secondaryBtn: { text: "Find a Partner", href: "dealers.html#partner-finder" },
      },
      {
        desktop: "assets/slider-home/slide-2.webp",
        mobile: "assets/solutions/mobile/automotive-mobile.webp",
        alt: "Alaska car battery",
        kicker: "",
        title: "Car Batteries",
        subtitle: "",
        primaryBtn: { text: "Battery Finder", href: "battery-finder.html#bf-root" },
        secondaryBtn: { text: "Lead-Acid Range", href: "dry-charge.html#search-section" },
      },
      {
        desktop: "assets/slider-home/slide-3.webp",
        mobile: "assets/solutions/mobile/solar-mobile.webp",
        alt: "Alaska battery powering a home setup",
        kicker: "",
        title: "Backup Power",
        subtitle: "",
        primaryBtn: { text: "Solar Calculator", href: "solar-calculator.html#solar-calculator" },
        secondaryBtn: { text: "LiFePO4 Batteries", href: "l-ion.html#li-range" },
      },
    ];

    const managedHeroSlides = window.ALASKA_CONTENT?.homeBanners;
    const heroSlides = Array.isArray(managedHeroSlides)
      ? managedHeroSlides
      : fallbackHeroSlides;

    if (!heroSlides.length) {
      heroTrack.closest(".hero-section")?.classList.add("hidden");
      return;
    }

    const slidesWithLoop = [...heroSlides, heroSlides[0]];

    heroTrack.innerHTML = slidesWithLoop
      .map(
        (slide) => `
          <article class="hero-slide">
            <picture>
              <source srcset="${slide.mobile}" media="(max-width: 767px)">
              <source srcset="${slide.desktop}" media="(min-width: 768px)">
              <img src="${slide.desktop}" alt="${slide.alt}" class="hero-slide-img" />
            </picture>
          </article>
        `,
      )
      .join("");

    let currentIndex = 0;
    const slideCount = heroSlides.length;

    function syncHeroContent(index) {
      const slide = heroSlides[index % slideCount];
      if (!slide) return;

      if (heroKicker) { heroKicker.textContent = slide.kicker || ""; heroKicker.hidden = !slide.kicker; }
      if (heroTitle) heroTitle.textContent = slide.title;
      if (heroSubtitle) { heroSubtitle.textContent = slide.subtitle || ""; heroSubtitle.hidden = !slide.subtitle; }

      if (heroPrimaryBtn) {
        heroPrimaryBtn.classList.toggle("hidden", !slide.primaryBtn);
        if (slide.primaryBtn) {
          heroPrimaryBtn.href = slide.primaryBtn.href;
          if (heroPrimaryBtnLabel) heroPrimaryBtnLabel.textContent = slide.primaryBtn.text;
        }
      }

      if (heroSecondaryBtn) {
        heroSecondaryBtn.classList.toggle("hidden", !slide.secondaryBtn);
        if (slide.secondaryBtn) {
          heroSecondaryBtn.href = slide.secondaryBtn.href;
          if (heroSecondaryBtnLabel) heroSecondaryBtnLabel.textContent = slide.secondaryBtn.text;
        }
      }
    }

    function updatePosition(index, animate = true) {
      currentIndex = index;
      heroTrack.style.transition = animate ? "transform 700ms ease-in-out" : "none";
      heroTrack.style.transform = `translateX(-${index * 100}%)`;
      syncHeroContent(index);

      if (!animate) {
        heroTrack.offsetHeight;
      }
    }

    heroTrack.addEventListener("transitionend", () => {
      if (currentIndex === slideCount) {
        updatePosition(0, false);
      }
    });

    updatePosition(0, false);

    setInterval(() => {
      updatePosition(currentIndex + 1, true);
    }, 2600);
  }

  // Products Carousel Control
  function initCarousel() {
    const carousel = document.getElementById("productsCarousel");
    const dotsContainer = document.getElementById("carouselDots");
    const prevBtn = document.getElementById("carouselPrev");
    const nextBtn = document.getElementById("carouselNext");
    const cards = Array.from(document.querySelectorAll("#productsCarousel .product-card"));
    const cardCount = cards.length;
    if (!carousel || !dotsContainer) return; // page has no product carousel

    // Create pagination dots
    for (let i = 0; i < cardCount; i++) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = `carousel-dot ${i === 0 ? "active" : ""}`;
      const title = cards[i].querySelector(".product-card-title");
      dot.setAttribute("aria-label", "Show " + (title ? title.textContent.trim() : "card " + (i + 1)));
      dot.onclick = () => scrollToCard(i);
      dotsContainer.appendChild(dot);
    }

    // Function to check if at end and update button visibility
    function updateButtonVisibility() {
      if (!carousel) return;
      const scrollWidth = carousel.scrollWidth;
      const scrollLeft = carousel.scrollLeft;
      const clientWidth = carousel.clientWidth;

      // Check if at start
      if (scrollLeft <= 0) {
        prevBtn.style.opacity = "0.4";
        prevBtn.style.pointerEvents = "none";
        prevBtn.style.display = "none";
      } else {
        prevBtn.style.opacity = "1";
        prevBtn.style.pointerEvents = "auto";
        prevBtn.style.display = "block";
      }

      // Check if at end (with small tolerance for rounding)
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        nextBtn.style.opacity = "0.4";
        nextBtn.style.pointerEvents = "none";
        nextBtn.style.display = "none";
      } else {
        nextBtn.style.opacity = "1";
        nextBtn.style.pointerEvents = "auto";
        nextBtn.style.display = "block";
      }
    }

    // Cards have different widths (portrait and landscape), so positions are
    // worked out from each card's real place in the row, not from the first card.
    function cardLeft(card) {
      const pad = parseFloat(window.getComputedStyle(carousel).paddingLeft) || 0;
      return carousel.scrollLeft + card.getBoundingClientRect().left - carousel.getBoundingClientRect().left - pad;
    }
    function maxScroll() {
      return carousel.scrollWidth - carousel.clientWidth;
    }
    // the card picked with a dot or an arrow stays highlighted until the visitor scrolls by hand
    // (near the end of the row several cards share the same scroll position)
    let pinned = null;
    ["wheel", "touchstart", "pointerdown"].forEach((ev) => carousel.addEventListener(ev, () => (pinned = null), { passive: true }));
    function currentIndex() {
      if (pinned !== null) return pinned;
      let best = 0;
      let bestDist = Infinity;
      cards.forEach((c, i) => {
        const d = Math.abs(cardLeft(c) - carousel.scrollLeft);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      return best;
    }

    // Arrows move one card at a time
    window.scrollCarousel = function (direction) {
      if (!carousel) return;
      const i = Math.max(0, Math.min(cardCount - 1, currentIndex() + direction));
      scrollToCard(i);
    };

    // Update dots and buttons on carousel scroll
    carousel.addEventListener("scroll", () => {
      updateActiveDot();
      updateButtonVisibility();
    });

    function updateActiveDot() {
      const activeIndex = currentIndex();
      document.querySelectorAll(".carousel-dot").forEach((dot, index) => {
        dot.classList.toggle("active", index === activeIndex);
        dot.setAttribute("aria-current", index === activeIndex ? "true" : "false");
      });
    }

    function scrollToCard(index) {
      if (!carousel) return;
      pinned = index;
      updateActiveDot();
      carousel.scrollTo({ left: Math.min(maxScroll(), Math.max(0, cardLeft(cards[index]))), behavior: "smooth" });
      setTimeout(updateButtonVisibility, 300);
    }

    // Initial button visibility check
    updateButtonVisibility();
  }

  // Function to close the success modal
  function closeSuccessModal() {
    const modal = document.getElementById("successModal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  }

  // Initialize carousel on page load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCarousel);
  } else {
    initCarousel();
  }

  initHomeHeroBannerSlider();

  window.addEventListener("load", initBlogEngine);

  // Certifications carousel (about.html, all screens)
  const certifications = [
    {
      src: "assets/gallery/certificates/ISO-9001-2015.jpeg",
      title: "ISO 9001:2015",
      desc: "ISO 9001:2015 Quality Management",
    },
    {
      src: "assets/gallery/certificates/ISO-14001-2015.jpeg",
      title: "ISO 14001:2015",
      desc: "Environmental Safety Certified",
    },
    {
      src: "assets/gallery/certificates/ISO-45001-2018.jpeg",
      title: "ISO 45001:2018",
      desc: "Occupational Health and Safety Management",
    },
    {
      src: "assets/gallery/certificates/Fire-Safety.jpeg",
      title: "Fire Safety",
      desc: "Fire Safety Certified",
    },
  ];
  let certIndex = 0;

  // CLOSE the main DOMContentLoaded block
});

// Certifications carousel (about.html, all screens) - GLOBAL SCOPE
const certifications = [
  {
    src: "assets/gallery/certificates/ISO-9001-2015.jpeg",
    title: "ISO 9001:2015 Quality Management",
    desc: "ISO 9001:2015 Quality Management",
  },
  {
    src: "assets/gallery/certificates/ISO-14001-2015.jpeg",
    title: "ISO 14001:2015 Environmental Safety Certified",
    desc: "Environmental Safety Certified",
  },
  {
    src: "assets/gallery/certificates/ISO-45001-2018.jpeg",
    title: "ISO 45001:2018 Occupational Health and Safety Management",
    desc: "Occupational Health and Safety Management",
  },
  {
    src: "assets/gallery/certificates/Fire-Safety.jpeg",
    title: "Fire Safety Certified",
    desc: "Fire Safety Certified",
  },
];
let certIndex = 0;

function updateCertCarousel() {
  const left = document.getElementById("cert-left-img");
  const center = document.getElementById("cert-center-img");
  const right = document.getElementById("cert-right-img");
  if (!left || !center || !right) return;
  const n = certifications.length;
  const leftIdx = (certIndex - 1 + n) % n;
  const rightIdx = (certIndex + 1) % n;
  left.src = certifications[leftIdx].src;
  left.alt = certifications[leftIdx].title;
  center.src = certifications[certIndex].src;
  center.alt = certifications[certIndex].title;
  right.src = certifications[rightIdx].src;
  right.alt = certifications[rightIdx].title;
  // Dots
  const dots = document.getElementById("cert-dots");
  if (dots) {
    dots.innerHTML = certifications.map((_, i) => `<span class="inline-block w-2 h-2 rounded-full mx-1 ${i === certIndex ? "bg-[#c00d1e]" : "bg-gray-300"}"></span>`).join("");
  }
}
function scrollCertCarousel(dir) {
  certIndex = (certIndex + dir + certifications.length) % certifications.length;
  updateCertCarousel();
}
function certCarouselInit() {
  updateCertCarousel();
  window.addEventListener("resize", updateCertCarousel);

  // Touch scroll sync for mobile
  const certScrollContainer = document.getElementById("cert-scroll-container");
  if (certScrollContainer) {
    certScrollContainer.addEventListener("scroll", function () {
      // Find which image is most centered
      const children = [document.getElementById("cert-left"), document.getElementById("cert-center"), document.getElementById("cert-right")];
      let minDist = Infinity;
      let activeIdx = 1; // default to center
      const containerRect = certScrollContainer.getBoundingClientRect();
      children.forEach((child, idx) => {
        if (!child) return;
        const rect = child.getBoundingClientRect();
        // Distance from center of container
        const dist = Math.abs((rect.left + rect.right) / 2 - (containerRect.left + containerRect.right) / 2);
        if (dist < minDist) {
          minDist = dist;
          activeIdx = idx;
        }
      });
      certIndex = (certIndex + activeIdx - 1 + certifications.length) % certifications.length;
      updateCertCarousel();
    });
  }
}
if (document.getElementById("cert-center-img")) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", certCarouselInit);
  } else {
    certCarouselInit();
  }
}
window.scrollCertCarousel = scrollCertCarousel;

// Feature data - Only 3 items
// Feature tabs (graphite.html by default; a page can supply its own, e.g. js/casilver-data.js)
const featureData = window.FEATURE_DATA || [
  {
    id: 0,
    title: "ADVANCED PLATE COMPOSITION",
    desc: `<ul class="space-y-2 list-disc pl-5 text-sm md:text-lg leading-relaxed">
    <li>Graphite-infused lead plates help reduce sulfation compared to conventional lead-antimony grids, supporting improved battery performance.</li>
    <li>Enhanced conductivity promotes efficient energy transfer while helping reduce internal resistance and unnecessary energy loss.</li>
    <li>Improved plate stability helps minimize active material deterioration, supporting dependable power delivery throughout the battery’s service life.</li>
  </ul>`,
  },
  {
    id: 1,
    title: "ENERGY EFFICIENCY",
    desc: `<ul class="space-y-2 list-disc pl-5 text-sm md:text-lg leading-relaxed">
    <li>Lower internal resistance helps reduce heat buildup and energy loss, allowing the battery to deliver power more efficiently under demanding conditions.</li>
    <li>Less energy is wasted as heat during charging and discharging, so more of the stored energy reaches the vehicle or system it powers.</li>
    <li>Running cooler helps protect internal components and supports consistent performance in hot weather and under heavy loads.</li>
  </ul>`,
  },
  {
    id: 2,
    title: "EXTENDED BATTERY LIFE",
    desc: `<ul class="space-y-2 list-disc pl-5 text-sm md:text-lg leading-relaxed">
    <li>Reduced sulfation and plate deterioration help preserve battery performance over more charge-discharge cycles.</li>
    <li>Durable construction supports reliable operation in environments with continuous vibration.</li>
    <li>Extended service life can reduce replacement frequency and maintenance costs, providing greater long-term value.</li>
  </ul>`,
  },
  {
    id: 3,
    title: "DEEP DISCHARGE RECOVERY",
    desc: `<ul class="space-y-2 list-disc pl-5 text-sm md:text-lg leading-relaxed">
    <li>Designed to recover more effectively after deep discharge cycles, helping restore battery performance when power reserves have been significantly depleted.</li>
    <li>Improved plate technology supports more dependable performance through repeated charging and discharging under demanding operating conditions.</li>
    <li>Helps maintain reliable energy delivery for applications that experience frequent power demands and varying discharge levels.</li>
  </ul>`,
  },
  {
    id: 4,
    title: "FAST CHARGE ACCEPTANCE",
    desc: `<ul class="space-y-2 list-disc pl-5 text-sm md:text-lg leading-relaxed">
    <li>Lower internal resistance helps the battery absorb charging current more efficiently, allowing it to replenish its reserve capacity in less time under suitable charging conditions.</li>
    <li>Improved charge acceptance supports applications with limited charging periods, including short vehicle journeys and systems with intermittent solar charging.</li>
    <li>Designed to perform more effectively under partial state-of-charge (PSoC) conditions, helping maintain battery readiness when a full recharge is not always possible.</li>
  </ul>`,
  },
];

function selectFeatureTab(index, scrollToSection = false) {
  const feature = featureData[index];
  const featureImage = document.getElementById("featureImage");
  const featureStage = document.getElementById("featureStage"); // graphite.html: animated diagrams
  if (!featureImage && !featureStage) return; // page has no feature tabs
  if (featureStage) {
    // text fades out and back in while the graph morphs (css/graphite.css: .gt-text-swap)
    const title = document.getElementById("featureTitle");
    const desc = document.getElementById("featureDesc");
    if (window.showGraphiteDiagram) window.showGraphiteDiagram(index);
    title.classList.add("gt-text-swap");
    desc.classList.add("gt-text-swap");
    clearTimeout(selectFeatureTab._t);
    selectFeatureTab._t = setTimeout(() => {
      title.textContent = feature.title;
      desc.innerHTML = feature.desc;
      title.classList.remove("gt-text-swap");
      desc.classList.remove("gt-text-swap");
    }, title.textContent.trim() === "--" ? 0 : 300);
  } else {
    featureImage.classList.add("swiping");
    setTimeout(() => {
      featureImage.src = feature.image;
      document.getElementById("featureTitle").textContent = feature.title;
      document.getElementById("featureDesc").innerHTML = feature.desc;
      featureImage.classList.remove("swiping");
    }, 200);
  }

  // Desktop tabs (horizontal bar)
  const desktopTabs = document.querySelectorAll("#tabsContainer .feature-tab");
  desktopTabs.forEach((tab, i) => {
    const h3 = tab.querySelector("h3");
    if (i === index) {
      tab.classList.remove("border-gray-300");
      tab.classList.add("border-[#c00d1e]");
      h3.classList.remove("text-gray-400");
      h3.classList.add("text-black", "font-extrabold");
    } else {
      tab.classList.remove("border-[#c00d1e]");
      tab.classList.add("border-gray-300");
      h3.classList.remove("text-black", "font-extrabold");
      h3.classList.add("text-gray-400", "font-extrabold");
    }
  });
  // Mobile grid tabs (2x3 grid)
  const mobileTabs = document.querySelectorAll("#tabsGrid .feature-tab");
  mobileTabs.forEach((tab, i) => {
    const h3 = tab.querySelector("h3");
    if (i === index) {
      tab.classList.remove("border-gray-300");
      tab.classList.add("border-t-4", "border-[#c00d1e]");
      h3.classList.remove("text-gray-400");
      h3.classList.add("text-black", "font-extrabold");
    } else {
      tab.classList.remove("border-t-4", "border-[#c00d1e]");
      tab.classList.add("border-gray-300");
      h3.classList.remove("text-black", "font-extrabold");
      h3.classList.add("text-gray-400", "font-extrabold");
    }
  });
  // On mobile, scroll the whole section into view if requested
  if (scrollToSection && window.innerWidth < 768) {
    const section = document.querySelector(".bg-gray-100.md\\:px-4.md\\:py-6") || document.querySelector(".bg-gray-100");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  selectFeatureTab(0, false);
});

// Attach click handlers to mobile grid tabs to enable scroll
document.addEventListener("DOMContentLoaded", () => {
  const mobileTabs = document.querySelectorAll("#tabsGrid .feature-tab");
  mobileTabs.forEach((tab, i) => {
    tab.onclick = function () {
      selectFeatureTab(i, true);
    };
  });
});

function checkChevronVisibility() {
  const container = document.getElementById("tabsContainer");
  const leftBtn = document.getElementById("scrollLeftBtn");
  const rightBtn = document.getElementById("scrollRightBtn");
  if (!container || !leftBtn || !rightBtn) return; // page has no tab strip

  // If content fits without scrolling, hide chevrons
  if (container.scrollWidth <= container.clientWidth) {
    leftBtn.style.display = "none";
    rightBtn.style.display = "none";
  } else {
    // Show chevrons if scrolling is needed
    leftBtn.style.display = "flex";
    rightBtn.style.display = "flex";
  }
}

// Re-check on window resize
window.addEventListener("resize", checkChevronVisibility);

// Scroll tabs functions
function scrollTabsLeft() {
  const container = document.getElementById("tabsContainer");
  container.scrollBy({
    left: -300,
    behavior: "smooth",
  });
}

function scrollTabsRight() {
  const container = document.getElementById("tabsContainer");
  container.scrollBy({
    left: 300,
    behavior: "smooth",
  });
}
const techmodal = document.getElementById("techmodal");
const closeTechModal = document.querySelector(".techmodal-close");
const techIframe = document.getElementById("techmodal-iframe");

const techVideoURL = "https://www.youtube.com/embed/nu4N6ER5VB4?si=j6WBiQBTYwHYpotO&autoplay=1&rel=0";
const youtubeDirectURL = "https://www.youtube.com/watch?v=nu4N6ER5VB4";

function openTechVideoModal() {
  // Check if mobile (screen width < 768px)
  if (window.innerWidth < 768) {
    // On mobile, open YouTube directly in new tab
    window.open(youtubeDirectURL, "_blank");
  } else {
    // On desktop, open modal
    techIframe.src = techVideoURL;
    techmodal.style.display = "block";
  }
}

if (closeTechModal) closeTechModal.addEventListener("click", closeModal);

window.addEventListener("click", (e) => {
  if (e.target === techmodal) closeModal();
});

function closeModal() {
  techmodal.style.display = "none";
  techIframe.src = ""; // stop video
}

//AboutUs Page JS

function openImageModal(imageSrc, title) {
  const modal = document.getElementById("imageModal");
  const modalImage = document.getElementById("modalImage");
  const modalCaption = document.getElementById("modalCaption");
  const modalCloseBtn = document.getElementById("modalCloseBtn");

  // Populate

  modalImage.src = imageSrc;
  if (modalCaption) {
    if (title) {
      modalCaption.innerHTML = `<span class="block text-xl md:text-2xl font-black uppercase tracking-tight text-[#c00d1e] nice-title">${title}</span>`;
      modalCaption.style.display = "block";
    } else {
      modalCaption.textContent = "";
      modalCaption.style.display = "none";
    }
  }

  // Show modal
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.style.overflow = "hidden";

  // Close button handler (ensure only one listener)
  if (modalCloseBtn && !modalCloseBtn._bound) {
    modalCloseBtn.addEventListener("click", function () {
      closeImageModal();
    });
    modalCloseBtn._bound = true;
  }

  // Handle image loading errors
  modalImage.onerror = function () {
    this.src = "assets/logo.png"; // Fallback
  };
}

function closeImageModal(event) {
  // If called from an event, only allow clicks on the overlay (#imageModal)
  if (event && event.target && event.target.id && event.target.id !== "imageModal") {
    return;
  }

  const modal = document.getElementById("imageModal");
  const modalImage = document.getElementById("modalImage");

  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
  if (modalImage) modalImage.src = "";
  const modalCaption = document.getElementById("modalCaption");
  if (modalCaption) modalCaption.textContent = "";
  document.body.style.overflow = "auto";
}

// Close modal on Escape key
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeImageModal();
  }
});

// Factory tour CTA: scroll to and play the story video
const playTourBtn = document.getElementById("play-tour");
if (playTourBtn) {
  playTourBtn.addEventListener("click", function () {
    const video = document.getElementById("storyVideo");
    if (!video) return;
    // Scroll the video into view (center) and play
    video.scrollIntoView({ behavior: "smooth", block: "center" });
    // Ensure play is triggered after scroll (allow small delay)
    setTimeout(() => {
      // Try to play; user gesture from click should allow playback
      video.play().catch(() => {
        // If play prevented, focus the video so user can play
        video.focus();
      });
    }, 300);
  });
}

// Carousel logic for certifications (3-card window)
(function () {
  const carousel = document.getElementById("certifications-carousel");
  const cards = carousel ? Array.from(carousel.getElementsByClassName("cert-card")) : [];
  const btnLeft = document.getElementById("certScrollLeft");
  const btnRight = document.getElementById("certScrollRight");
  let centerIdx = 1; // Start with second card centered

  function updateVisibleCards() {
    if (!carousel || cards.length === 0) return;
    cards.forEach((card, i) => {
      // Only show center and its two neighbors
      if (i === centerIdx) {
        card.style.display = "";
        card.style.transform = "scale(1.15)";
        card.style.zIndex = 2;
        card.style.opacity = 1;
        card.style.boxShadow = "0 8px 32px 0 rgba(44,0,30,0.18)";
      } else if (i === centerIdx - 1 || i === centerIdx + 1) {
        card.style.display = "";
        card.style.transform = "scale(0.85)";
        card.style.zIndex = 1;
        card.style.opacity = 0.7;
        card.style.boxShadow = "";
      } else {
        card.style.display = "none";
      }
    });
  }

  function scrollToCard(idx) {
    centerIdx = idx;
    updateVisibleCards();
  }

  // Scroll buttons
  if (btnLeft && btnRight && cards.length > 0) {
    btnLeft.style.display = btnRight.style.display = window.innerWidth >= 768 ? "flex" : "none";
    btnLeft.onclick = function () {
      centerIdx = Math.max(1, centerIdx - 1);
      scrollToCard(centerIdx);
    };
    btnRight.onclick = function () {
      centerIdx = Math.min(cards.length - 2, centerIdx + 1);
      scrollToCard(centerIdx);
    };
    window.addEventListener("resize", function () {
      btnLeft.style.display = btnRight.style.display = window.innerWidth >= 768 ? "flex" : "none";
      updateVisibleCards();
    });
    // Initial highlight
    setTimeout(function () {
      scrollToCard(centerIdx);
    }, 200);
  }
})();
