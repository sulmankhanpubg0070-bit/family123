// بنیادی JavaScript functionality

// Zoom functionality
const zoomRange = document.getElementById('zoomRange');
const treeWrap = document.querySelector('.tree-wrap');

zoomRange.addEventListener('input', (e) => {
  const zoom = e.target.value / 100;
  treeWrap.style.transform = `scale(${zoom})`;
  treeWrap.style.transformOrigin = 'top center';
});

document.getElementById('zoomInBtn').addEventListener('click', () => {
  zoomRange.value = Math.min(140, parseInt(zoomRange.value) + 10);
  zoomRange.dispatchEvent(new Event('input'));
});

document.getElementById('zoomOutBtn').addEventListener('click', () => {
  zoomRange.value = Math.max(60, parseInt(zoomRange.value) - 10);
  zoomRange.dispatchEvent(new Event('input'));
});

document.getElementById('zoomResetBtn').addEventListener('click', () => {
  zoomRange.value = 100;
  zoomRange.dispatchEvent(new Event('input'));
});