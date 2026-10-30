// Configuration
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:3000/api' 
  : '/api';
const ADMIN_PASSWORD = '1234';

// Sample data (fallback if API fails)
const SAMPLE = [
  {id:1,name:'Dada Ji',father:null,gender:'M'},
  {id:2,name:'Ahmad',father:1,gender:'M'},
  {id:3,name:'Bilal',father:1,gender:'M'},
  {id:4,name:'Aisha',father:1,gender:'F'},
  {id:5,name:'Usman',father:2,gender:'M'},
  {id:6,name:'Fatima',father:2,gender:'F'},
  {id:7,name:'Hamza',father:3,gender:'M'}
];

// Cache for offline use
let dataCache = null;

// Fetch data from API
async function fetchData() {
  try {
    const response = await fetch(`${API_BASE}/members`);
    if (!response.ok) throw new Error('API request failed');
    const data = await response.json();
    dataCache = data;
    return data;
  } catch (error) {
    console.warn('API not available, using cached/local data:', error);
    if (dataCache) return dataCache;
    return SAMPLE.slice();
  }
}

// Get data (async version)
async function getDataAsync() {
  return await fetchData();
}

// Get data (sync version for backward compatibility)
function getData() {
  // For backward compatibility with existing code
  // In production, you should use getDataAsync()
  if (dataCache) return dataCache;
  return SAMPLE.slice();
}

// Save data to API
async function saveDataAsync(data) {
  try {
    const response = await fetch(`${API_BASE}/members/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': ADMIN_PASSWORD
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to save data');
    dataCache = data;
    return true;
  } catch (error) {
    console.error('Failed to save to API:', error);
    return false;
  }
}

// Save single member
async function saveMemberAsync(member) {
  try {
    const response = await fetch(`${API_BASE}/members/${member.id}`, {
      method: member.id ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': ADMIN_PASSWORD
      },
      body: JSON.stringify(member)
    });
    if (!response.ok) throw new Error('Failed to save member');
    const saved = await response.json();
    dataCache = null; // Invalidate cache
    return saved;
  } catch (error) {
    console.error('Failed to save member:', error);
    return null;
  }
}

// Delete member
async function deleteMemberAsync(id) {
  try {
    const response = await fetch(`${API_BASE}/members/${id}`, {
      method: 'DELETE',
      headers: {
        'x-admin-password': ADMIN_PASSWORD
      }
    });
    if (!response.ok) throw new Error('Failed to delete member');
    dataCache = null; // Invalidate cache
    return true;
  } catch (error) {
    console.error('Failed to delete member:', error);
    return false;
  }
}

// Add new member
async function addMemberAsync(member) {
  try {
    const response = await fetch(`${API_BASE}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': ADMIN_PASSWORD
      },
      body: JSON.stringify(member)
    });
    if (!response.ok) throw new Error('Failed to add member');
    const newMember = await response.json();
    dataCache = null; // Invalidate cache
    return newMember;
  } catch (error) {
    console.error('Failed to add member:', error);
    return null;
  }
}

// Get stats
async function getStatsAsync() {
  try {
    const response = await fetch(`${API_BASE}/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return { total: 0, males: 0, females: 0, roots: 0 };
  }
}

// Header function (unchanged)
function header(on) {
  document.getElementById('hdr').innerHTML = `<div class="top"><span class="logo">Family Shajra</span><a class="btn r" href="admin.html">\ud83d\udd12 Admin</a></div>
<nav><a href="index.html" class="${on == 'home' ? 'on' : ''}">\ud83c\udfe0 Home</a><a href="stats.html" class="${on == 'stats' ? 'on' : ''}">\ud83d\udcca Stats</a><a href="about.html" class="${on == 'about' ? 'on' : ''}">\u2139\ufe0f About</a><a href="#" id="mb">\u2630 Menu</a>
<div id="menuBox"><a href="admin.html">Admin panel</a><a href="about.html">About</a><a href="#" id="exp">Data export</a></div></nav>`;

  const b = document.getElementById('menuBox');
  document.getElementById('mb').onclick = e => {
    e.preventDefault();
    b.style.display = b.style.display == 'block' ? 'none' : 'block'
  };
  
  document.getElementById('exp').onclick = async e => {
    e.preventDefault();
    const data = await getDataAsync();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' }));
    a.download = 'shajra-data.json';
    a.click();
  };
}
