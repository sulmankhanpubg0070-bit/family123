// فیملی ٹری ڈیٹا
const PEOPLE = [
  {
    id: 1,
    name: "احمد علی",
    relation: "دادا جان 👴",
    birth: "1945",
    death: "2010",
    parents: [],
    level: 0
  },
  {
    id: 2,
    name: "علی خان",
    relation: "ابو 👨",
    birth: "1970",
    death: null,
    parents: [1],
    level: 1
  },
  {
    id: 3,
    name: "محمد حسن",
    relation: "چاچا 👨",
    birth: "1972",
    death: null,
    parents: [1],
    level: 1
  },
  {
    id: 4,
    name: "فاطمہ خانم",
    relation: "خالہ 👩",
    birth: "1968",
    death: null,
    parents: [1],
    level: 1
  },
  {
    id: 5,
    name: "احمد",
    relation: "بھائی 👦",
    birth: "1995",
    death: null,
    parents: [2],
    level: 2
  },
  {
    id: 6,
    name: "علیہ",
    relation: "بہن 👧",
    birth: "1998",
    death: null,
    parents: [2],
    level: 2
  },
  {
    id: 7,
    name: "حسن",
    relation: "کزن 👦",
    birth: "1996",
    death: null,
    parents: [3],
    level: 2
  },
  {
    id: 8,
    name: "عائشہ",
    relation: "کزن 👧",
    birth: "2000",
    death: null,
    parents: [3],
    level: 2
  }
];

const ROOT_ID = 1; // دادا جان سے شروع کریں

// درخت بنانے والا فنکشن
function buildTree(peopleList) {
  const treeRoot = document.getElementById('treeRoot');
  treeRoot.innerHTML = '';

  // Levels کے حساب سے ترتیب دیں
  const levels = {};
  peopleList.forEach(person => {
    if (!levels[person.level]) {
      levels[person.level] = [];
    }
    levels[person.level].push(person);
  });

  // ہر level کو display کریں
  Object.keys(levels).sort((a, b) => a - b).forEach(level => {
    const levelDiv = document.createElement('div');
    levelDiv.className = `level level-${parseInt(level) + 1}`;

    levels[level].forEach(person => {
      const card = createPersonCard(person);
      levelDiv.appendChild(card);
    });

    treeRoot.appendChild(levelDiv);
  });
}

// شخص کا کارڈ بنانے والا فنکشن
function createPersonCard(person) {
  const card = document.createElement('div');
  card.className = 'person-node';
  card.innerHTML = `
    <div class="person-circle" data-id="${person.id}">
      <div class="person-name">${person.name}</div>
      <div class="person-relation">${person.relation}</div>
    </div>
  `;

  card.querySelector('.person-circle').addEventListener('click', () => {
    showDetails(person);
  });

  return card;
}

// تفصیلات دکھانے والا فنکشن
function showDetails(person) {
  const modal = document.getElementById('detailsModal');
  const modalTitle = document.getElementById('modalTitle');
  const details = document.getElementById('details');

  modalTitle.textContent = person.name;
  
  let detailsHTML = `
    <p><strong>نام:</strong> ${person.name}</p>
    <p><strong>رشتہ:</strong> ${person.relation}</p>
    <p><strong>پیدائش:</strong> ${person.birth}</p>
  `;

  if (person.death) {
    detailsHTML += `<p><strong>وفات:</strong> ${person.death}</p>`;
  }

  details.innerHTML = detailsHTML;
  details.classList.remove('empty');
  modal.classList.remove('hidden');
}

// موڈل بند کرنا
document.getElementById('closeModalBtn').addEventListener('click', () => {
  document.getElementById('detailsModal').classList.add('hidden');
});

document.querySelector('.modal-backdrop').addEventListener('click', (e) => {
  if (e.target.dataset.close) {
    document.getElementById('detailsModal').classList.add('hidden');
  }
});

// تھیم ٹوگل کریں
document.getElementById('themeToggleBtn').addEventListener('click', () => {
  document.documentElement.toggleAttribute('data-theme');
  localStorage.setItem('theme', document.documentElement.getAttribute('data-theme') || '');
});

// تلاش کی سہولت
document.getElementById('searchToggleBtn').addEventListener('click', () => {
  document.getElementById('searchWrap').classList.toggle('hidden');
});

// صفحہ لوڈ ہونے پر درخت بنائیں
window.addEventListener('DOMContentLoaded', () => {
  buildTree(PEOPLE);
  
  // تھیم لوڈ کریں
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }
});