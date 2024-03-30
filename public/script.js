var scrollpos = window.scrollY;
var header = document.getElementById("header");
var navcontent = document.getElementById("nav-content");
var navaction = document.getElementById("navAction");
var brandname = document.getElementById("brandname");
var toToggle = document.querySelectorAll(".toggleColour");

document.addEventListener("scroll", function () {
  /*Apply classes for slide in bar*/
  scrollpos = window.scrollY;

  if (scrollpos > 10) {
    header.classList.add("bg-white");
    navaction.classList.remove("bg-white");
    navaction.classList.remove("font-bold");
    navaction.classList.add("gradient-bg");
    navaction.classList.remove("text-gray-800");
    navaction.classList.add("text-white");
    //Use to switch toggleColour colours
    for (var i = 0; i < toToggle.length; i++) {
      toToggle[i].classList.add("text-gray-800");
      toToggle[i].classList.remove("text-white");
    }
    header.classList.add("shadow");
    navcontent.classList.remove("bg-gray-100");
    navcontent.classList.add("bg-white");
  } else {
    header.classList.remove("bg-white");
    navaction.classList.remove("gradient-bg");
    navaction.classList.add("bg-white");
    navaction.classList.remove("text-white");
    //Use to switch toggleColour colours
    for (var i = 0; i < toToggle.length; i++) {
      toToggle[i].classList.add("text-white");
      toToggle[i].classList.remove("text-gray-800");
    }

    header.classList.remove("shadow");
    navcontent.classList.remove("bg-white");
    navcontent.classList.add("bg-gray-100");
  }
});

var navMenuDiv = document.getElementById("nav-content");
var navMenu = document.getElementById("nav-toggle");

document.onclick = check;
function check(e) {
  var target = (e && e.target) || (event && event.srcElement);

  //Nav Menu
  if (!checkParent(target, navMenuDiv)) {
    // click NOT on the menu
    if (checkParent(target, navMenu)) {
      // click on the link
      if (navMenuDiv.classList.contains("hidden")) {
        navMenuDiv.classList.remove("hidden");
      } else {
        navMenuDiv.classList.add("hidden");
      }
    } else {
      // click both outside link and outside menu, hide menu
      navMenuDiv.classList.add("hidden");
    }
  }
}

function checkParent(t, elm) {
  while (t.parentNode) {
    if (t == elm) {
      return true;
    }
    t = t.parentNode;
  }
  return false;
}

function call() {
  if (window.innerWidth < 768) {
    window.open("tel:0788879157");
  }
  else {
    window.location.href = "#footer";
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll("nav ul li a");

  window.addEventListener('scroll', () => {
    let current = "";
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (pageYOffset >= sectionTop - sectionHeight / 3 && pageYOffset < sectionTop + sectionHeight - sectionHeight / 3) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(li => {
      li.classList.remove('active');
      if (li.getAttribute('href').includes(current)) {
        li.classList.add('active');
      }
    });

    // If no current section is found, ensure all navLinks are not active
    if (current === "") {
      navLinks.forEach(li => {
        li.classList.remove('active');
      });
    }
  });
});


// Create a GSAP timeline with paused state to control the start manually
const tl = gsap.timeline({ paused: true });

// Function to simulate a click effect on the "+" icon
function clickPlusEffect() {
  tl.to(".icon-plus", {
    scale: 0.8, // Simulate click by scaling down
    duration: 0.2,
    yoyo: true, // Go back to original scale
    repeat: 1, // Repeat the scale down and up once
    ease: "power1.inOut",
  });
}

// Function to animate the icons in
function animateIconsIn() {
  clickPlusEffect();
  tl.from(".solar-panel", { duration: 0.5, y: -50, opacity: 0, ease: "back.out(1.7)" }, "+=0.1");
  clickPlusEffect();
  tl.from(".renovation", { duration: 0.5, x: 50, opacity: 0, ease: "back.out(1.7)" }, "+=0.1");
  clickPlusEffect();
  tl.from(".ballon-eau-chaude", { duration: 0.5, x: -50, opacity: 0, ease: "back.out(1.7)" }, "+=0.1");
  clickPlusEffect();
  tl.from(".heat-pump", { duration: 0.5, x: 50, opacity: 0, ease: "back.out(1.7)" }, "+=0.1");
  clickPlusEffect();
  tl.from(".poele", { duration: 0.5, x: -50, opacity: 0, ease: "back.out(1.7)" }, "+=0.1");
}

// Function to animate icons and the "+" button out
function animateOut() {
  tl.to(".icon-plus, .solar-panel, .renovation, .ballon-eau-chaude, .heat-pump, .poele", {
    opacity: 0,
    duration: 0.5,
    ease: "back.in(1.7)",
    stagger: {
      amount: 0.5,
      from: "end"
    }
  });
}

// Function to restart the animation from the beginning
function restartAnimation() {
  // Set all icons and the "+" button to full opacity before restart
  gsap.set(".icon-plus, .solar-panel, .renovation, .ballon-eau-chaude, .heat-pump, .poele", { opacity: 1 });
  
  // Reset the timeline to start
  tl.restart();
}

// Initial animation setup
animateIconsIn();

// Wait 5 seconds after the last icon animation to start fading out
tl.to({}, { duration: 5 }, "+=0.1");
// animateOut();

// Start the animation
tl.play();

document.addEventListener("scroll", function() {
  document.querySelectorAll('.image-container').forEach(function(el) {
    var speed = 0.1; // Ajustez ce taux pour changer la vitesse de l'effet parallaxe
    var windowScroll = window.pageYOffset; // Obtient la position actuelle du défilement
    el.style.backgroundPositionY = (windowScroll * speed) + "px";
  });
});

window.addEventListener('load', function() {
  // Preload the background image
  var img = new Image();
  img.onload = function() {
    document.getElementById('loader').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';

    // Initialize AOS or refresh AOS calculations here
    AOS.init({
      // Your AOS configurations
      once: false,
    });
    // Alternatively, if AOS was already initialized earlier, just refresh it:
    AOS.refresh();
  };
  img.src = 'landing-banner-2.webp';
});

window.addEventListener('scroll', function() {
  document.querySelectorAll('.project-parallax .parallax-background').forEach(function(bg) {
    var rect = bg.parentElement.getBoundingClientRect();
    var speed = parseFloat(bg.parentElement.getAttribute('data-speed'));
    
    // Check if the element is within the viewport
    if(rect.bottom > 0 && rect.top < window.innerHeight) {
      var offset = rect.top * speed * -0.5;
      bg.style.transform = `translate3d(0, ${offset}px, 0)`;
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const counters = document.querySelectorAll('.kpi-counter');

  const startCount = (counter) => {
    const target = +counter.getAttribute('data-target').replace(/[^\d]/g, '');
    let count = 0;
    const increment = target / (1000 / 16);

    const timer = setInterval(() => {
      count += increment;
      if (count > target) {
        count = target;
        clearInterval(timer);
      }
      counter.innerText = Math.floor(count) + counter.getAttribute('data-target').replace(/\d/g, '');
    }, 16);
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        startCount(entry.target);
        observer.unobserve(entry.target); // Stop observing the target after animation starts
      }
    });
  }, {threshold: 0.5}); // Configure threshold according to when you want the animation to start

  counters.forEach(counter => {
    observer.observe(counter); // Observe each counter
  });
});
