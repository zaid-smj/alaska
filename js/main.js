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

  const blogData = {
    "choosing-guide": {
      title: "How to Choose the Best Battery for Your Vehicle or Solar System",
      category: "Guide",
      image: "",
      content: ` 
        <p>
Summer in Pakistan is hard on batteries. High temperatures accelerate chemical reactions inside the cell, increasing corrosion and electrolyte evaporation, which shortens battery life. Below are concise, actionable steps to protect your battery and keep your vehicle running through the hottest months.
</p>

<h2>Why Heat Damages Batteries</h2>

<p>
Heat increases internal resistance and speeds up chemical breakdown. Over time, this causes capacity loss, slower cranking, and a higher risk of sudden failure.
</p>

<h2>Top Summer Survival Tips</h2>

<ul>
<li><strong>Park Smart:</strong> Whenever possible, park in shade or a covered area to limit direct sun exposure and reduce temperature-related stress.</li>
<li><strong>Keep Terminals Clean:</strong> Corrosion increases resistance and heat. Clean terminals and clamps monthly and use a corrosion inhibitor spray when needed.</li>
<li><strong>Avoid Deep Discharge:</strong> Repeated deep discharge shortens battery life. Use accessories sparingly when the engine is off and recharge promptly after heavy use.</li>
<li><strong>Check Charging System:</strong> Overcharging and voltage spikes also damage batteries. Have your alternator and voltage regulator checked during service visits.</li>
</ul>

<h2>1) Identify Your Application</h2>

<p><strong>Start by clarifying how the battery will be used:</strong></p>

<ul>
<li><strong>Automotive (Cars, Bikes, SUVs):</strong> Requires reliable starting power, vibration resistance, correct size, and proper terminal layout.</li>
<li><strong>Solar & Energy Storage:</strong> Needs deep-cycle capability, sufficient capacity for your load, and adequate backup duration.</li>
<li><strong>Industrial / Commercial:</strong> Often demands high capacity, long service life, robust construction, and special configurations.</li>
</ul>

<p><em>Alaska Batteries categorizes its products based on these three applications.</em></p>

<h2>2) Understand Battery Technologies & Types</h2>

<p>
Different battery technologies are designed for different requirements.
</p>

<ul>
<li>
<strong>Automotive batteries:</strong> Alaska uses advanced graphite lead-acid technology for improved heat tolerance, faster charging, and longer service life.
</li>
<li>
<strong>Deep-cycle batteries:</strong> Designed for solar and storage applications, these batteries handle repeated discharge and recharge cycles better than standard starter batteries.
</li>
</ul>

<h2>Monthly Maintenance Checklist</h2>

<ul>
<li>Measure open-circuit voltage (12.4V or higher for a healthy 12V battery).</li>
<li>Inspect for swelling, leaks, or damage to the casing.</li>
<li>Clean corrosion from terminals and ensure clamps are tight.</li>
<li>Check the manufacturing or charge date—older batteries may fail faster in peak summer.</li>
</ul>

<h2>Pro Tip</h2>

<p>
Choose batteries designed for high-temperature environments. Graphite-based battery technology helps reduce internal heat buildup and improves charge acceptance during heavy use.
</p>

<p>
If you rely on your vehicle daily, small preventive steps today can save you from breakdowns and unexpected replacement costs. When in doubt, have your battery and charging system tested by an authorized dealer.
</p>

<p>
<div class="text-center">
<a href="dry-charge.html" style="border-radius:12px;display:inline-block;padding:12px 28px;background:#cc001b;color:#ffffff;text-decoration:none;font-weight:bold;">
View Summer Ready Batteries
</a>
</div>
</p>
    `,
    },
    "eid-checklist": {
      title: "Don't Let Eid Travel Leave You Stranded - Complete Battery Readiness Checklist",
      category: "Travel",
      image: "assets/vault/blogs/eid-blog-2.webp",
      content: `<h2>Start Your Eid Journey With a Few Simple Steps</h2>

<p><strong>Pre-Travel Battery Checklist:</strong></p>

<ul>
<li><strong>Clean your battery terminals</strong> to ensure smooth and reliable power flow.</li>
<li><strong>Check battery voltage</strong> — 12.4V or higher indicates a healthy charge.</li>
<li><strong>Inspect for physical wear or damage</strong>, such as swelling, fluid leaks, or a cracked casing.</li>
</ul>

<h3>Here’s Where Alaska Graphite Batteries Take the Lead</h3>

<p>
Built for high demand and long routes, Alaska Graphite Batteries recharge up to <strong>2x faster</strong> than conventional batteries. This allows you to regain lost charge quickly during short stops at petrol pumps or rest areas. Their superior heat resistance and durability ensure dependable performance across all terrains — from scorching highways to cooler, high-altitude routes.
</p>

<h3>A Reliable Battery Means No Delays, No Compromises</h3>

<p>
A dependable battery ensures your journey remains smooth and stress-free. It prevents unexpected breakdowns and protects what should be a joyful Eid experience. In the end, it’s the <strong>peace of mind</strong> that truly matters on long journeys.
</p>

<p>
For added safety, especially when traveling with children or elders, carrying a jump starter kit and a power bank is always recommended.
</p>

<h2>This Eid, Don’t Just Prepare Your Car — Prepare Your Battery</h2>

<p>
<strong>Alaska Graphite Batteries</strong><br>
<em>Built for beautiful and memorable journeys. Powered by Innovation.</em>
</p>
<p class="text-center text-sm font-semibold text-zinc-600">
#Durability · #GraphiteBatteries · #Power · #EidTravel
</p>
    `,
    },
    "power-saving": {
      title: "5 Power-Saving Secrets to Make Your Car Battery Last Longer",
      category: "Maintenance",
      image: "assets/vault/blogs/power-blog-3.webp",
      content: `<p>
Tired of unexpected battery failures? Follow these expert-backed tips to extend your car battery life and ensure a smooth, worry-free drive every time. Your car battery is the unsung hero of your vehicle — a little care goes a long way.
</p>

<h2>Keep Terminals Corrosion-Free</h2>

<p>
A buildup of white or green residue weakens connections and forces your battery to work harder. Mix a tablespoon of baking soda with warm water, scrub the terminals gently with an old toothbrush, then rinse and dry thoroughly. Applying a corrosion inhibitor helps protect the clamps.
</p>

<h2>Avoid Micro-Draining from Short Trips</h2>

<p>
Short trips don’t give the alternator enough time to fully recharge the battery. Take a 20–30 minute drive once a week to restore charge, and turn off non-essential accessories during short drives to reduce strain.
</p>

<h2>Protect Against Extreme Weather</h2>

<p>
High temperatures accelerate fluid evaporation and capacity loss, while cold weather slows chemical reactions and makes starting sluggish. Park in shaded areas, use sunshades, and consider a battery insulator in colder regions. While Alaska batteries are engineered for extremes, extra precautions always help.
</p>

<h2>Watch for Parasitic Power Drain</h2>

<p>
Modern vehicles continue drawing power even when switched off. Unplug phone chargers, turn off dash cameras when parked, and double-check interior lights before locking the car to avoid unnecessary drain.
</p>

<h2>Routine Checkups Matter</h2>

<ul>
<li>Measure open-circuit voltage (12.4V or higher for a healthy 12V battery).</li>
<li>Inspect the battery for swelling, leaks, or casing damage.</li>
<li>Ensure terminals are tight and free from corrosion.</li>
<li>Have the alternator and voltage regulator tested to prevent over- or under-charging.</li>
</ul>

<h3>Pro Tip</h3>

<p>
Choose batteries designed for temperature extremes. Graphite-based battery technology improves heat handling and charge acceptance under heavy use.
</p>

<p>
A small preventive effort today can help you avoid roadside breakdowns and costly replacements tomorrow. When in doubt, have your battery and charging system tested by an authorized dealer.
</p>

<p>
<div class="text-center">
<a href="dry-charge.html" style="border-radius:12px;display:inline-block;padding:12px 28px;background:#cc001b;color:#ffffff;text-decoration:none;font-weight:bold;">
Explore Battery Options
</a>
</div>
</p>
    `,
    },
    "ebike-accessories": {
      title: "Beat the Heat | Battery Survival Guide for Pakistani Summer Season",
      category: "Summer Guide",
      image: "assets/vault/blogs/summer-blog-6.webp",
      content: `<p>
Summer heat in Pakistan is one of the fastest ways to shorten a battery’s life. High temperatures speed up internal chemical reactions and increase corrosion. With a few practical steps, however, you can protect your battery and avoid unexpected failures.
</p>

<h2>Quick Heat-Proof Checklist</h2>

<ul>
<li><strong>Park in shade:</strong> Direct sunlight significantly raises under-hood temperatures. Whenever possible, park under shade or in covered areas.</li>
<li><strong>Keep the battery charged:</strong> Heat increases self-discharge. Maintain a healthy charge, especially if the vehicle remains unused for long periods, and avoid leaving electronics plugged in while parked.</li>
<li><strong>Inspect regularly:</strong> Check for swelling, cracks, fluid leaks, or loose terminals. Clean corrosion using a baking soda solution and protect clamps with an anti-corrosion spray.</li>
<li><strong>Check the charging system:</strong> Overheating alternators and voltage spikes can damage batteries. Have the system tested if you notice excessive heat or slow engine cranking.</li>
</ul>

<h2>Monthly Summer Maintenance</h2>

<ul>
<li>Measure resting voltage (12.4V or higher indicates a healthy 12V battery).</li>
<li>Ensure terminals are tight and free from white or green corrosion.</li>
<li>For serviceable batteries, check electrolyte levels and top up with distilled water when required.</li>
<li>Consider replacing batteries older than 3–4 years or those showing repeated capacity loss.</li>
</ul>

<h3>Pro Tip</h3>

<p>
Choose batteries designed for high-temperature performance. Graphite-based battery technology offers improved heat tolerance and faster charge acceptance under heavy use.
</p>

<p>
Small preventive steps taken today can prevent roadside trouble and extend battery life through peak summer months. When in doubt, have an authorized dealer perform a load and charging system test.
</p>
<div class="text-center">
        <a href="dry-charge.html" style="color:#ffffff;text-decoration:none;" class="inline-block bg-[#cc001b] text-white px-8 py-3 rounded-full font-black uppercase tracking-tighter hover:scale-105 transition-transform">Find Heat Ready Batteries</a>
      </div>
    `,
    },
    "ebike-repairs": {
      title: "The Right Way to Charge & Store Your Battery for Maximum Lifespan",
      category: "Battery Care",
      image: "assets/vault/blogs/storing-blog-4.webp",
      content: `<p>
Avoid battery degradation and early failures. Learn how to properly charge and store your battery to keep it in top condition for years.
</p>

<p>
Whether you are storing a vintage car for several months or keeping a spare battery for emergencies, proper charging and storage are essential for long-term performance. Always begin storage with a full charge. Batteries left partially charged are prone to sulfation, where hardened lead sulfate crystals reduce the battery’s ability to hold power.
</p>

<h2>Storage Location Is Critical</h2>

<p>
Heat accelerates chemical decay, while extreme cold can freeze electrolytes in traditional lead-acid batteries. Store batteries in a cool, dry place such as a garage shelf or climate-controlled room. Avoid placing batteries directly on concrete; instead, elevate them on a wooden pallet or rubber mat to reduce temperature fluctuations.
</p>

<h2>Disconnect Batteries for Long-Term Vehicle Storage</h2>

<p>
Modern vehicles draw power continuously through clocks, alarms, and onboard electronics. A disconnected battery typically loses only 1–2% charge per month, while a connected battery can lose 5–10% over the same period.
</p>

<h2>Check Stored Batteries Every 8–12 Weeks</h2>

<p>
Lead-acid batteries should remain above 12.4 volts during storage. If voltage drops below this level, recharge immediately. Before reusing a stored battery, test its voltage—readings below 12 volts indicate the need for a slow, steady recharge. Avoid high-amp chargers, which can warp plates and cause internal damage.
</p>

<h3>Pro Tip</h3>

<p>
Choose batteries designed for temperature stability and consistent charge acceptance. Batteries built for durability perform better during storage and are more reliable when put back into service.
</p>

<p>
With simple, scheduled checks and proper storage practices, your battery will remain ready when you need it most. If you are unsure, have an authorized dealer inspect and maintain your battery to prevent premature failure.
</p>

<p>
<div class="text-center">
<a href="vault.html#faqs" style="border-radius:12px;display:inline-block;padding:12px 28px;background:#cc001b;color:#ffffff;text-decoration:none;font-weight:bold;">
Read for Battery Care
</a>
</div>
</p>
    `,
    },
    "ebike-charging": {
      title: "Battery Recycling: Turning Old Power into New Possibilities",
      category: "E-Bike Tips",
      image: "assets/vault/blogs/recycle-blog-5.webp",
      content: `<p>
Did you know old batteries can be repurposed? Understanding the battery recycling process explains why it is essential for sustainability and a cleaner planet.
</p>

<h2>How Recycling Starts</h2>

<p>
The process begins at certified drop-off points, such as authorized dealer networks. Once collected, batteries are sorted by type. Lead-acid batteries are crushed, and the lead plates are melted, purified, and molded into new grids. Plastic casings are recycled into pellets for new battery cases, while sulfuric acid is filtered or converted into useful industrial chemicals. Recycling just one car battery can save enough energy to power a home for several hours.
</p>

<h2>Why This Matters</h2>

<p>
Discarding batteries in landfills harms the environment. Lead can leach into groundwater, and lithium-ion battery fires release toxic fumes. Recycling prevents environmental contamination and allows valuable materials to be recovered, reducing the need for new raw resources and improving the sustainability of battery production.
</p>

<h2>What You Can Do</h2>

<p>
Return used batteries to authorized dealers or approved recycling centers. Many recycling programs offer incentives, such as discounts on new battery purchases. By returning batteries for recycling, you help close the loop and reduce the environmental impact of energy storage.
</p>

<h3>Takeaway</h3>

<p>
Sustainability is built one returned battery at a time. Recycling recovers valuable materials, reduces pollution, and lowers the overall energy footprint of future batteries.
</p>
    `,
    },
  };

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
          <span class="inline-block category-badge text-zinc-900 font-bold uppercase tracking-widest text-xs px-3 py-1 bg-zinc-100 rounded-full">${data.category}</span>
          <h1 class="text-2xl md:text-3xl lg:text-4xl font-black uppercase leading-tight text-zinc-900">${data.title}</h1>
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

    const heroSlides = [
      {
        desktop: "assets/slider-home/slide-1.webp",
        mobile: "assets/solutions/mobile/automotive-mobile.webp",
        alt: "Automotive banner",
        kicker: "Placeholder",
        title: "Placeholder Title",
        subtitle: "Placeholder text for banner.",
        primaryBtn: { text: "View More", href: "#" },
        secondaryBtn: { text: "Get Support", href: "#" },
      },
      {
        desktop: "assets/slider-home/slide-2.webp",
        mobile: "assets/solutions/mobile/solar-mobile.webp",
        alt: "Solar banner",
        kicker: "Placeholder",
        title: "Placeholder Title",
        subtitle: "Placeholder text for banner.",
        primaryBtn: { text: "Explore", href: "#" },
        secondaryBtn: { text: "Find Partner", href: "#" },
      },
      {
        desktop: "assets/slider-home/slide-3.webp",
        mobile: "assets/solutions/mobile/industrial-mobile.webp",
        alt: "Industrial banner",
        kicker: "Placeholder",
        title: "Placeholder Title",
        subtitle: "Placeholder text for banner.",
        primaryBtn: { text: "View More", href: "#" },
        secondaryBtn: { text: "Get Support", href: "#" },
      },
    ];

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

      if (heroKicker) heroKicker.textContent = slide.kicker;
      if (heroTitle) heroTitle.textContent = slide.title;
      if (heroSubtitle) heroSubtitle.textContent = slide.subtitle;

      if (heroPrimaryBtn && slide.primaryBtn) {
        heroPrimaryBtn.href = slide.primaryBtn.href;
        if (heroPrimaryBtnLabel) heroPrimaryBtnLabel.textContent = slide.primaryBtn.text;
      }

      if (heroSecondaryBtn && slide.secondaryBtn) {
        heroSecondaryBtn.href = slide.secondaryBtn.href;
        if (heroSecondaryBtnLabel) heroSecondaryBtnLabel.textContent = slide.secondaryBtn.text;
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
    const cards = document.querySelectorAll(".product-card");
    const cardCount = cards.length;

    // Create pagination dots
    for (let i = 0; i < cardCount; i++) {
      const dot = document.createElement("button");
      dot.className = `carousel-dot ${i === 0 ? "active" : ""}`;
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

    // Scroll carousel by item count
    window.scrollCarousel = function (direction) {
      if (!carousel) return;
      const cardWidth = cards[0].offsetWidth + parseInt(window.getComputedStyle(carousel).gap);
      carousel.scrollBy({ left: cardWidth * direction, behavior: "smooth" });
      setTimeout(updateButtonVisibility, 300);
    };

    // Update dots and buttons on carousel scroll
    carousel.addEventListener("scroll", () => {
      updateActiveDot();
      updateButtonVisibility();
    });

    function updateActiveDot() {
      const dots = document.querySelectorAll(".carousel-dot");
      const scrollPos = carousel.scrollLeft;
      const cardWidth = cards[0].offsetWidth + parseInt(window.getComputedStyle(carousel).gap);
      const activeIndex = Math.round(scrollPos / cardWidth);

      dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === activeIndex);
      });
    }

    function scrollToCard(index) {
      if (!carousel) return;
      const cardWidth = cards[0].offsetWidth + parseInt(window.getComputedStyle(carousel).gap);
      carousel.scrollTo({ left: cardWidth * index, behavior: "smooth" });
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
const featureData = [
  {
    id: 0,
    title: "ADVANCED PLATE COMPOSITION",
    desc: `<ul class="space-y-2 list-disc pl-5 text-sm md:text-lg leading-relaxed">
                <li>Traditional batteries use <b>lead - antimony or lead - calcium grids</b > that degrade faster due
                    to
                    sulfation.</li>
            <li><b>Graphite Lead-Acid</b> batteries incorporate <b>Graphite</b>, reducing sulfation and
              increasing
              efficiency.</li>
              <li>Longer battery life & improved energy flow.</li>
                </ul >`,
    image: "assets/technology/tech-1.webp",
  },
  {
    id: 1,
    title: "ENERGY EFFICIENCY & HEAT",
    desc: `<ul class="space-y-2 list-disc pl-5 text-sm md:text-lg leading-relaxed">
                  <li>Traditional batteries generate <b>more heat and waste energy</b> due to high internal
                    resistance.
                  </li>
                  <li>Graphite Lead-Acid models have <b>lower internal resistance</b>, keeping temperatures low and
                    performance high.</li>
                    <li>Improved reliability and efficiency.</li>
                </ul>`,
    image: "assets/technology/tech-2.webp",
  },
  {
    id: 2,
    title: "CYCLE LIFE & LONGEVITY",
    desc: `<ul class="space-y-2 list-disc pl-5 text-sm md:text-lg leading-relaxed">
                  <li>Standard batteries last <b>300-500 cycles</b>, while graphite-enhanced versions last
                    <b>600-1000+
                      cycles</b>.
                  </li>
                  <li>Graphite slows down sulfate buildup, preserving battery health.</li>
                  <li>Extended lifespan and lower costs.</li>
                </ul>`,
    image: "assets/technology/tech-3.webp",
  },
  {
    id: 3,
    title: "DEEP DISCHARGE RECOVERY",
    desc: `<ul class="space-y-2 list-disc pl-5 text-sm md:text-lg leading-relaxed">
                  <li>Normal batteries <b>suffer permanent</b> damage from deep discharges.</li>
                  <li>Graphite Lead Acid batteries <b>recover better</b> from deep discharge cycles.</li>
                  <li>Durability in demanding conditions.</li>
                </ul>`,
    image: "assets/technology/tech-4.webp",
  },
  {
    id: 4,
    title: "IDEAL FOR MODERN APPLICATIONS",
    desc: `<ul class="space-y-2 list-disc pl-5 text-sm md:text-lg leading-relaxed">
                  <li>Traditional Lead-Acid batteries are best for <b>low-drain uses</b> like motorcycles.</li>
                  <li>Graphite batteries excel in: Stop-Start Vehicles, Solar Energy Storage, Hybrid System &
                    Industrial
                    Use.</li>
                    <li>Versatility for the future of storage.</li>
                </ul>`,
    image: "assets/technology/tech-5.webp",
  },
  {
    id: 5,
    title: "CHARGE ACCEPTANCE & SPEED",
    desc: `<ul class="space-y-2 list-disc pl-5 text-sm md:text-lg leading-relaxed">
                  <li>Normal Lead Acid batteries charge <b>slower</b> and struggle in <b>partial state-of-charge
                      (PSoC)
                      conditions</b>.</li>
                  <li>Graphite Lead Acid batteries <b>absorb current much faster</b>, ideal for <b>modern stop-start
                      vehicle systems</b>.</li>
                  <li>Faster charging and increased efficiency.</li>
                </ul>`,
    image: "assets/technology/tech-6.webp",
  },
];

function selectFeatureTab(index, scrollToSection = false) {
  const feature = featureData[index];
  const featureImage = document.getElementById("featureImage");
  featureImage.classList.add("swiping");
  setTimeout(() => {
    featureImage.src = feature.image;
    document.getElementById("featureTitle").textContent = feature.title;
    document.getElementById("featureDesc").innerHTML = feature.desc;
    featureImage.classList.remove("swiping");
  }, 200);

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

closeTechModal.addEventListener("click", closeModal);

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
