// Configuration for Vercel Serverless Functions
const API_BASE = '/api/members';
const ADMIN_PASSWORD = '1234';

// Sample data (fallback if API fails)
const SAMPLE = [
  {id: 1, name: 'Dada Ji', father: null, gender: 'M'},
  {id: 2, name: 'Ahmad', father: 1, gender: 'M'},
  {id: 3, name: 'Bilal', father: 1, gender: 'M'},
  {id: 4, name: 'Aisha', father: 1, gender: 'F'},
  {id: 5, name: 'Usman', father: 2, gender: 'M'},
  {id: 6, name: 'Fatima', father: 2, gender: 'F'},
  {id: 7, name: 'Hamza', father: 3, gender: 'M'}
];

// Cache for offline use
let dataCache = null;

// Fetch data from API
async function fetchData() {
  try {
    const response = await fetch(API_BASE);
    if (!response.ok) {
      const error = await response.json();
      console.error('API Error:', response.status, error);
      throw new Error('API request failed');
    }
    const data = await response.json();
    dataCache = data;
    return data;
  } catch (error) {
    console.warn('API not available, using cached/local data:', error);
    if (dataCache) return dataCache;
    return SAMPLE.slice();
  }
}

// Get data (async)
async function getDataAsync() {
  return await fetchData();
}

// Get data (sync fallback)
function getData() {
  if (dataCache) return dataCache;
  return SAMPLE.slice();
}

// Save data (import all members)
async function saveDataAsync(data) {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ members: data, password: ADMIN_PASSWORD })
    });
    if (!response.ok) {
      const error = await response.json();
      console.error('Save Error:', error);
      throw new Error('Failed to save data');
    }
    dataCache = null;
    return true;
  } catch (error) {
    console.error('Failed to save:', error);
    return false;
  }
}

// Add single member
async function addMemberAsync(member) {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...member, password: ADMIN_PASSWORD })
    });
    if (!response.ok) {
      const error = await response.json();
      console.error('Add Error:', error);
      throw new Error('Failed to add member');
    }
    dataCache = null;
    return await response.json();
  } catch (error) {
    console.error('Failed to add member:', error);
    return null;
  }
}

// Delete member
async function deleteMemberAsync(id) {
  try {
    const response = await fetch(API_BASE, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, password: ADMIN_PASSWORD })
    });
    if (!response.ok) {
      const error = await response.json();
      console.error('Delete Error:', error);
      throw new Error('Failed to delete member');
    }
    dataCache = null;
    return true;
  } catch (error) {
    console.error('Failed to delete member:', error);
    return false;
  }
}

// Header function
function header(on) {
  document.getElementById('hdr').innerHTML = `<div class="top">
    <span class="logo">Family Tree</span>
    <a class="btn r" href="admin.html">🔑 Admin</a>
  </div>
  <nav>
    <a href="index.html" class="${on == 'home' ? 'on' : ''}">🏠 Home</a>
    <a href="stats.html" class="${on == 'stats' ? 'on' : ''}">📊 Stats</a>
    <a href="about.html" class="${on == 'about' ? 'on' : ''}">ℹ️ About</a>
    <a href="#" id="mb">☰ Menu</a>
    <div id="menuBox">
      <a href="admin.html">Admin panel</a>
      <a href="about.html">About</a>
      <a href="#" id="exp">Data export</a>
    </div>
  </nav>`;

  const b = document.getElementById('menuBox');
  document.getElementById('mb').onclick = e => {
    e.preventDefault();
    b.style.display = b.style.display == 'block' ? 'none' : 'block';
  };
  
  document.getElementById('exp').onclick = async e => {
    e.preventDefault();
    const data = await getDataAsync();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' }));
    a.download = 'family-data.json';
    a.click();
  };
}
