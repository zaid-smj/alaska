/**
 * Alaska Batteries - Regional Office Switcher Logic
 * Handles dynamic content swapping and smooth scrolling
 */

document.addEventListener("DOMContentLoaded", function () {
  const tabs = document.querySelectorAll(".region-tab");
  const mapFrame = document.getElementById("regionMap");
  const dynamicTitle = document.getElementById("dynamic-title");
  const dynamicAddress = document.getElementById("dynamic-address");
  const dynamicPhone = document.getElementById("dynamic-phone");
  const infoContainer = document.getElementById("info-container");

  // We target the section top or the contact header for scrolling
  const scrollTarget = document.querySelector("h4.text-\\[\\#c00d1e\\]");

  if (!tabs.length || !mapFrame) {
    console.warn("Map Switcher: Required elements not found in DOM.");
    return;
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", function (e) {
      e.preventDefault();

      // 1. UI Feedback: Update Active Tab
      tabs.forEach((t) => t.classList.remove("active-tab"));
      this.classList.add("active-tab");

      // 2. Smooth Scroll back to top of contact panel
      if (scrollTarget) {
        const offset = 100; // Adjusts for fixed headers
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = scrollTarget.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }

      // 3. Content Transition: Fade Out
      infoContainer.style.opacity = "0";

      setTimeout(() => {
        // 4. Swap Data from Attributes
        const newTitle = this.getAttribute("data-title");
        const newAddress = this.getAttribute("data-address");
        const newPhone = this.getAttribute("data-phone");
        const newMap = this.getAttribute("data-map");

        if (newTitle) dynamicTitle.textContent = newTitle;
        if (newAddress) dynamicAddress.textContent = newAddress;
        if (newPhone) {
          // sanitize phone for tel: href (keep + and digits)
          const telHref = newPhone.replace(/[^+\d]/g, "");
          dynamicPhone.innerHTML = `<a href="tel:${telHref}" class="text-[#c00d1e] font-semibold hover:underline">${newPhone}</a>`;
        }
        if (newMap) mapFrame.setAttribute("src", newMap);

        // 5. Content Transition: Fade In
        infoContainer.style.opacity = "1";
      }, 400);
    });
  });
});
