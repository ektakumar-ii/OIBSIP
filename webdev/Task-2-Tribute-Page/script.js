document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  const navbar = document.getElementById("navbar");
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav-link");
  const backToTop = document.getElementById("backToTop");

  const closeMobileMenu = () => {
    hamburger.classList.remove("open");
    mobileMenu.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
  };

  hamburger.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("open");
    hamburger.classList.toggle("open", isOpen);
    hamburger.setAttribute("aria-expanded", String(isOpen));
  });

  mobileMenu.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const targetId = anchor.getAttribute("href");
      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      const offset = navbar.offsetHeight;
      const destination =
        target.getBoundingClientRect().top + window.pageYOffset - offset + 1;
      window.scrollTo({ top: destination, behavior: "smooth" });
    });
  });

  const refreshNavbarLook = () => {
    navbar.classList.toggle("scrolled", window.scrollY > 40);
  };

  const highlightActiveSection = () => {
    const scrollPos = window.scrollY + window.innerHeight * 0.35;
    let activeId = sections[0]?.id ?? "";

    sections.forEach((section) => {
      if (scrollPos >= section.offsetTop) activeId = section.id;
    });

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.dataset.section === activeId);
    });
  };

  const toggleBackToTop = () => {
    backToTop.classList.toggle("show", window.scrollY > 700);
  };

  window.addEventListener(
    "scroll",
    () => {
      refreshNavbarLook();
      highlightActiveSection();
      toggleBackToTop();
    },
    { passive: true },
  );

  refreshNavbarLook();
  highlightActiveSection();
  toggleBackToTop();

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  const revealOnScroll = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealOnScroll.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
  );

  document
    .querySelectorAll(".reveal")
    .forEach((el) => revealOnScroll.observe(el));

  const countUp = (el, endValue, duration = 1200) => {
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * endValue);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = endValue;
    };

    requestAnimationFrame(step);
  };

  const factsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const fact = entry.target;
        const number = fact.querySelector(".num");
        fact.classList.add("is-visible");

        if (number.dataset.value) {
          countUp(number, parseInt(number.dataset.value, 10));
        } else if (number.dataset.text) {
          number.textContent = number.dataset.text;
        }

        factsObserver.unobserve(fact);
      });
    },
    { threshold: 0.4 },
  );

  document.querySelectorAll(".fact").forEach((el) => factsObserver.observe(el));

  const timelineObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        timelineObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.35 },
  );

  document
    .querySelectorAll(".timeline-item")
    .forEach((item) => timelineObserver.observe(item));

  const galleryItems = Array.from(document.querySelectorAll(".gallery-item"));
  const lightbox = document.getElementById("lightbox");
  const lightboxIndexLabel = document.getElementById("lightboxIndex");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");

  let currentImageIndex = 0;
  const formatIndex = (index) => String(index + 1).padStart(2, "0");

  const renderCurrentImage = () => {
    if (lightboxIndexLabel) {
      lightboxIndexLabel.textContent = formatIndex(currentImageIndex);
    }
    const caption = galleryItems[currentImageIndex]?.dataset.caption;
    if (caption && lightboxCaption) lightboxCaption.textContent = caption;
    const imageSrc = galleryItems[currentImageIndex]?.dataset.image;
    if (imageSrc && lightboxImg) {
      lightboxImg.src = imageSrc;
      lightboxImg.alt = caption || "";
    }
  };

  const openLightbox = (index) => {
    currentImageIndex = index;
    renderCurrentImage();
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
    lightboxClose.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
  };

  const showImage = (index) => {
    const total = galleryItems.length;
    currentImageIndex = (index + total) % total;
    renderCurrentImage();
  };

  galleryItems.forEach((item, index) => {
    item.addEventListener("click", () => openLightbox(index));
  });

  lightboxClose.addEventListener("click", closeLightbox);
  lightboxPrev.addEventListener("click", () =>
    showImage(currentImageIndex - 1),
  );
  lightboxNext.addEventListener("click", () =>
    showImage(currentImageIndex + 1),
  );

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowRight") showImage(currentImageIndex + 1);
    if (event.key === "ArrowLeft") showImage(currentImageIndex - 1);
  });
});