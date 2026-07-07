const brandRed = "#c00d1e";

const headerHTML = /* HTML */ `
  <header class="fixed top-0 left-0 w-full z-[100] bg-white border-b border-gray-100">
    <div class="container mx-auto px-6">
      <div class="flex items-center h-20">
        <div class="w-1/4">
          <a href="index.html">
            <img src="assets/logo.png" alt="Alaska Logo" class="h-14 md:h-16 w-auto object-contain" />
          </a>
        </div>

        <nav class="hidden lg:block w-3/4 h-full">
          <ul class="flex h-full items-center justify-end">
            <li class="nav-item">
              <a href="index.html" class="nav-link">Home</a>
            </li>

            <li class="nav-item">
              <a href="dry-charge.html" class="nav-link">Solutions</a>
              <div class="dropdown-panel">
                <a href="dry-charge.html" class="dropdown-item">Dry Charge</a>
                <a href="mf.html" class="dropdown-item">Maintenance Free</a>
                <a href="l-ion.html" class="dropdown-item">Lithium-ion</a>
                <a href="inverters.html" class="dropdown-item">Inverters</a>
                <!--<a href="tubular.html" class="dropdown-item">Tubular</a>-->
                <!--<a href="mcb.html" class="dropdown-item">Motorcycle</a>-->
                <!--<a href="vrla.html" class="dropdown-item">VRLA</a>-->
              </div>
            </li>

            <li class="nav-item">
              <a href="graphite.html" class="nav-link">Technology</a>
              <div class="dropdown-panel">
                <a href="graphite.html" class="dropdown-item">Graphite Lead-Acid</a>
                <a href="CaAg.html" class="dropdown-item">Calcium Silver</a>
                <a href="FePO.html" class="dropdown-item">Lithium ion</a>
              </div>
            </li>

            <li class="nav-item">
              <a href="dealers.html" class="nav-link">Partners</a>
              <div class="dropdown-panel">
                <a href="dealers.html" class="dropdown-item">Find a Partner</a>
                <a href="become-dealer.html" class="dropdown-item">Become a Partner</a>
              </div>
            </li>

            <li class="nav-item">
              <a href="vault.html" class="nav-link">Vault</a>
              <div class="dropdown-panel">
                <a href="vault.html#blogs" class="dropdown-item">News</a>
                <a href="vault.html#faqs" class="dropdown-item">FAQ<span class="lowercase">s</span></a>
                <a href="vault.html#gallery" class="dropdown-item">Gallery</a>
              </div>
            </li>

            

            <li class="nav-item">
              <a href="about.html" class="nav-link">About Us</a>
            </li>

            <li class="nav-item">
              <a href="support.html" class="nav-link">Contact Us</a>
            </li>
          </ul>
        </nav>

        <div class="lg:hidden w-3/4 flex justify-end">
          <button id="mobile-menu-trigger" class="text-[#c00d1e] text-3xl">
            <i class="fa-solid fa-car-battery"></i>
          </button>
        </div>
      </div>
    </div>
  </header>
  <div class="h-20"></div>
`;

const footerHTML = /* HTML */ `
  <footer class="bg-gray-50 border-t-8 border-black-50 pt-6">
    <div class="container mx-auto px-6">
      <div class="flex flex-col md:flex-row md:justify-between gap-8 items-center md:items-start mb-4">
        <!-- Logo Column -->
        <div class="flex justify-center md:justify-start">
          <img src="assets/technology/tech.png" alt="Graphite Technology" class="h-14 md:h-16 w-auto object-contain" />
        </div>

        <!-- Address Column -->
        <div class="flex flex-col items-center md:items-start text-center md:text-left">
          <div class="text-gray-600 text-baseline font-normal leading-relaxed space-y-1">
            <p>7th Floor, B-3 Tower, Opp. F-9 Park,</p>
            <p>Sector F-9/G-9, Jinnah Avenue, New Blue Area,</p>
            <p>Islamabad, Pakistan, 44010</p>
            <p class="pt-2">
              <a href="tel:0518740280" class="text-gray-600 font-bold hover:text-[#c00d1e] transition-colors">+92 51 874 0280</a>
            </p>
            <p>
              <a href="mailto:info@alaskabatteries.com" class="text-[#c00d1e] hover:underline transition-colors">info@alaskabatteries.com</a>
            </p>
          </div>
        </div>

        <!-- Navigation Column -->
        <div class="flex justify-center md:justify-center">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-y-2 md:gap-y-0 gap-x-10 text-baseline font-medium text-gray-700 text-center md:text-left">
            <ul class="flex flex-col space-y-2 items-center md:items-start">
              <li>
                <a href="index.html" class="hover:text-[#c00d1e] transition-colors">Home</a>
              </li>
              <li>
                <a href="dry-charge.html" class="hover:text-[#c00d1e] transition-colors">Solutions</a>
              </li>
              <li>
                <a href="graphite.html" class="hover:text-[#c00d1e] transition-colors">Technology</a>
              </li>
              <li>
                <a href="vault.html" class="hover:text-[#c00d1e] transition-colors">Vault</a>
              </li>
            </ul>

            <ul class="flex flex-col space-y-2 items-center md:items-start">
              <li>
                <a href="dealers.html" class="hover:text-[#c00d1e] transition-colors">Partner Locator</a>
              </li>
              <li>
                <a href="about.html" class="hover:text-[#c00d1e] transition-colors">About Us</a>
              </li>
              <li>
                <a href="support.html" class="hover:text-[#c00d1e] transition-colors">Contact Us</a>
              </li>
            </ul>
          </div>
        </div>

        <!-- Social Media Column -->
        <div class="flex justify-center md:justify-end">
          <div class="grid grid-cols-2 gap-3">
            <a href="https://www.facebook.com/alaskabatteriespk/" class="social-box">
              <i class="fa-brands fa-facebook"></i>
            </a>

            <a href="https://www.instagram.com/alaskabatteriespk/" class="social-box">
              <i class="fa-brands fa-instagram"></i>
            </a>
            <a href="https://www.linkedin.com/company/alaskabatteriespk/" class="social-box">
              <i class="fa-brands fa-linkedin"></i>
            </a>
            <a href="https://www.youtube.com/channel/UCZXmvMmmVMxFqfzQpGHDWWA" class="social-box">
              <i class="fa-brands fa-youtube"></i>
            </a>
            <a href="https://api.whatsapp.com/send?phone=923266660757" class="social-box">
              <i class="fa-brands fa-whatsapp"></i>
            </a>
            <a href="https://www.tiktok.com/@alaskabatteriespk" class="social-box">
              <i class="fa-brands fa-tiktok"></i>
            </a>
          </div>
        </div>
      </div>

      <div class="pt-4 pb-1 flex flex-col items-center text-xs text-gray-400 uppercase tracking-normal text-center">
        <p>©2026 S.M.J International Industries Pvt. Ltd. All Rights Reserved.</p>
      </div>
    </div>
    <div id="successModal" class="fixed inset-0 z-[100] hidden items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div class="bg-white max-w-md w-full p-12 text-center shadow-2xl relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-2 bg-[#c00d1e]"></div>

        <div class="mb-8 flex justify-center">
          <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
            <i class="fa-solid fa-check text-4xl text-[#c00d1e]"></i>
          </div>
        </div>

        <h2 class="text-3xl font-black uppercase tracking-tighter mb-4">Submission <br />Successful</h2>
        <p class="text-gray-500 text-xs font-bold uppercase tracking-widest leading-relaxed mb-10">
          Thank you for reaching out to Alaska. <br />
          Our team will review your details and contact you within 48 business hours.
        </p>

        <button
          id="successModalCloseBtn"
          type="button"
          onclick="(window.closeModal||function(){})()"
          class="w-full bg-black text-white font-black uppercase py-4 text-[10px] tracking-[0.3em] hover:bg-[#c00d1e] transition-all">
          Return to Site
        </button>
      </div>
    </div>
  </footer>
`;

function setupMobileMenu() {
  const trigger = document.getElementById("mobile-menu-trigger");
  if (!trigger) return;

  const oldOverlay = document.getElementById("mobile-menu-overlay");
  if (oldOverlay) oldOverlay.remove();

  const menu = document.createElement("div");
  menu.id = "mobile-menu-overlay";
  // Corporate Style: Dark semi-transparent backdrop with a slide-out white panel
  menu.className = "fixed inset-0 z-[500] hidden";

  menu.innerHTML = /* HTML */ `
    <div id="mobile-backdrop" class="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm opacity-0 transition-opacity duration-500"></div>

    <div
      id="mobile-panel"
      class="absolute top-0 right-0 h-full w-full max-w-[320px] bg-white shadow-2xl translate-x-full transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col">
      <div class="flex justify-between items-center p-6 border-b border-gray-100">
        <a href="index.html">
          <img src="assets/logo.png" alt="Alaska Logo" class="h-14 md:h-16 w-auto object-contain" />
        </a>
        <button id="close-mobile" class="text-zinc-500 hover:text-black transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="flex-grow overflow-hidden relative bg-[#c00d1e]">
        <div id="mobile-menu-container" class="flex w-[200%] h-full transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]">
          <div id="main-view" class="w-1/2 h-full flex flex-col">
            <nav class="p-4">
              <a href="index.html" class="flex items-center px-4 py-4 text-[15px] font-semibold text-white  rounded-lg transition-all">Home</a>

              <button onclick="openSubmenu('solutions-sub')" class="w-full flex justify-between items-center px-4 py-4 text-[15px] font-semibold text-white  rounded-lg transition-all group">
                Solutions <i class="fa-solid fa-chevron-right text-[10px] text-white group-hover:text-[#c00d1e]"></i>
              </button>

              <button onclick="openSubmenu('tech-sub')" class="w-full flex justify-between items-center px-4 py-4 text-[15px] font-semibold text-white  rounded-lg transition-all group">
                Technology <i class="fa-solid fa-chevron-right text-[10px] text-white group-hover:text-[#c00d1e]"></i>
              </button>

              <button onclick="openSubmenu('dealers-sub')" class="w-full flex justify-between items-center px-4 py-4 text-[15px] font-semibold text-white  rounded-lg transition-all group">
                Partners <i class="fa-solid fa-chevron-right text-[10px] text-white group-hover:text-[#c00d1e]"></i>
              </button>

              <button onclick="openSubmenu('vault-sub')" class="w-full flex justify-between items-center px-4 py-4 text-[15px] font-semibold text-white  rounded-lg transition-all group">
                Vault <i class="fa-solid fa-chevron-right text-[10px] text-white group-hover:text-[#c00d1e]"></i>
              </button>

              <a href="about.html" class="flex items-center px-4 py-4 text-[15px] font-semibold text-white  rounded-lg transition-all">About Us</a>
              <a href="support.html" class="flex items-center px-4 py-4 text-[15px] font-semibold text-white  rounded-lg transition-all">Contact Us</a>
            </nav>
          </div>

          <div id="sub-view" class="w-1/2 h-full flex flex-col bg-[#c00d1e]">
            <button onclick="closeSubmenu()" class="flex items-center gap-3 px-8 py-6 text-white font-bold text-xs uppercase tracking-widest border-b border-zinc-200/50">
              <i class="fa-solid fa-arrow-left"></i> Back to Main
            </button>
            <div id="sub-content" class="p-4 flex flex-col"></div>
          </div>
        </div>
      </div>

      <div class="flex justify-between items-center p-6 border-b border-gray-100">
        <a href="index.html">
          <img src="assets/technology/tech.png" alt="Tech Logo" class="h-14 md:h-16 w-auto object-contain" />
        </a>
      </div>
    </div>
  `;

  document.body.appendChild(menu);

  // Corporate Style Submenus
  const submenus = {
    "solutions-sub": `
      <a href="dry-charge.html" class="px-4 py-4 text-[15px] font-semibold text-white  transition-colors">Dry Charge Batteries</a>
    `,
    "tech-sub": `
      <a href="graphite.html" class="px-4 py-4 text-[15px] font-semibold text-white  transition-colors">Graphite Technology</a>
    `,
    "dealers-sub": `
      <a href="dealers.html" class="px-4 py-4 text-[15px] font-semibold text-white  transition-colors">Find a Partner</a>
      <a href="become-dealer.html" class="px-4 py-4 text-[15px] font-semibold text-white  transition-colors">Become a Partner</a>
    `,
    "vault-sub": `
      <a href="vault.html#blogs" class="px-4 py-4 text-[15px] font-semibold text-white  transition-colors">News</a>
      <a href="vault.html#faqs" class="px-4 py-4 text-[15px] font-semibold text-white  transition-colors">FAQs</a>
      <a href="vault.html#gallery" class="px-4 py-4 text-[15px] font-semibold text-white  transition-colors">Gallery</a>
    `,
  };

  window.openSubmenu = function (id) {
    document.getElementById("sub-content").innerHTML = submenus[id];
    document.getElementById("mobile-menu-container").style.transform = "translateX(-50%)";
  };

  window.closeSubmenu = function () {
    document.getElementById("mobile-menu-container").style.transform = "translateX(0)";
  };

  const openMenu = () => {
    const backdrop = document.getElementById("mobile-backdrop");
    const panel = document.getElementById("mobile-panel");
    menu.classList.remove("hidden");

    // Smooth timing for slide and fade
    requestAnimationFrame(() => {
      backdrop.classList.replace("opacity-0", "opacity-100");
      panel.classList.replace("translate-x-full", "translate-x-0");
    });
    document.body.style.overflow = "hidden";
  };

  const closeMenu = () => {
    const backdrop = document.getElementById("mobile-backdrop");
    const panel = document.getElementById("mobile-panel");

    backdrop.classList.replace("opacity-100", "opacity-0");
    panel.classList.replace("translate-x-0", "translate-x-full");

    setTimeout(() => {
      menu.classList.add("hidden");
      closeSubmenu();
      document.body.style.overflow = "";
    }, 500);
  };

  trigger.addEventListener("click", openMenu);
  document.getElementById("close-mobile").addEventListener("click", closeMenu);
  document.getElementById("mobile-backdrop").addEventListener("click", closeMenu);
  // Close the menu when a link inside it is clicked (so anchors navigate cleanly)
  menu.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("a");
    if (a) {
      // allow native navigation, but close the UI immediately
      closeMenu();
    }
  });
}

// Set active nav item based on current page
function setActiveNavItem() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    // Check if link matches current page
    if (href === currentPage || (currentPage === "" && href === "index.html") || (currentPage === "index.html" && href === "index.html")) {
      link.closest(".nav-item").classList.add("active");
    }
  });
}

function init() {
  const headerElem = document.getElementById("header-placeholder");
  const footerElem = document.getElementById("footer-placeholder");

  if (headerElem) {
    headerElem.innerHTML = headerHTML;
  }

  if (footerElem) {
    footerElem.innerHTML = footerHTML;
  }

  // CRITICAL: Initialize mobile menu logic AFTER the HTML is injected
  setupMobileMenu();

  // Set active navigation item
  setActiveNavItem();
}

// Run the initialization
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// Global modal helpers: ensure pages that don't include `main.js` can still
// open/close the shared `successModal` injected by this component.
window.showSuccessModal = function () {
  const modal = document.getElementById("successModal");
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.style.overflow = "hidden";
};

window.closeModal = function () {
  const modal = document.getElementById("successModal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  document.body.style.overflow = "auto";
};

// Provide a global function name `closeModal` so inline onclick="closeModal()"
// does not throw a ReferenceError if older markup or cached scripts call it.
function closeModal() {
  try {
    // prefer the namespaced window implementation
    if (typeof window.closeModal === "function") return window.closeModal();
  } catch (e) {
    // swallow errors
  }
}

// Attach click handler to modal close button (works across pages)
function _attachSuccessModalClose() {
  try {
    const btn = document.getElementById("successModalCloseBtn");
    if (btn && !btn.dataset._attached) {
      btn.addEventListener("click", function () {
        window.closeModal();
      });
      btn.dataset._attached = "1";
    }
  } catch (e) {
    console.error("Error attaching successModal close handler", e);
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", _attachSuccessModalClose);
else _attachSuccessModalClose();

// Fallback: delegate clicks for the close button so it always works
document.addEventListener("click", function (e) {
  try {
    const target = e.target.closest && e.target.closest("#successModalCloseBtn");
    if (target) {
      window.closeModal();
    }
  } catch (err) {
    // ignore
  }
});
