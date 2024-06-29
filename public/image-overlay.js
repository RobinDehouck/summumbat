let currentImageIndex = 0;
let productImages = [];

export function initializeImageOverlay(images) {
  productImages = images;

  const overlay = createOverlayElement();
  document.body.appendChild(overlay);

  document.getElementById('close-overlay').addEventListener('click', closeOverlay);
  document.getElementById('next-image').addEventListener('click', showNextImage);
  document.getElementById('prev-image').addEventListener('click', showPrevImage);

  document.querySelectorAll('.product-image').forEach((img, index) => {
    img.addEventListener('click', () => openOverlay(index));
  });
}

function createOverlayElement() {
  const overlay = document.createElement('div');
  overlay.id = 'image-overlay';
  overlay.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 hidden';
  overlay.innerHTML = `
    <div class="relative">
      <button id="close-overlay" class="absolute top-4 right-4 text-white text-2xl">&times;</button>
      <img id="overlay-image" src="" alt="Full size image" class="max-h-90vh max-w-90vw object-contain" />
      <button id="prev-image" class="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-4xl">&lt;</button>
      <button id="next-image" class="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-4xl">&gt;</button>
    </div>
  `;
  return overlay;
}

function openOverlay(index) {
  currentImageIndex = index;
  document.getElementById('overlay-image').src = productImages[index];
  document.getElementById('image-overlay').classList.remove('hidden');
}

function closeOverlay() {
  document.getElementById('image-overlay').classList.add('hidden');
}

function showNextImage() {
  currentImageIndex = (currentImageIndex + 1) % productImages.length;
  document.getElementById('overlay-image').src = productImages[currentImageIndex];
}

function showPrevImage() {
  currentImageIndex = (currentImageIndex - 1 + productImages.length) % productImages.length;
  document.getElementById('overlay-image').src = productImages[currentImageIndex];
}