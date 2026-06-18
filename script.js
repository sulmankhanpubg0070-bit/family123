// Family Tree Modern Features

document.addEventListener('DOMContentLoaded', function() {
    const personCircles = document.querySelectorAll('.person-circle');
    
    // Add hover effects and animations
    personCircles.forEach((circle, index) => {
        // Stagger animation on load
        circle.style.animationDelay = (index * 0.1) + 's';
        
        // Interactive click effect
        circle.addEventListener('click', function() {
            this.style.transform = 'scale(1.2) rotateZ(10deg)';
            setTimeout(() => {
                this.style.transform = 'scale(1.15) rotateZ(5deg)';
            }, 150);
        });

        // Add particle effect on hover
        circle.addEventListener('mouseenter', function() {
            createParticles(this);
        });
    });

    // Animate on scroll
    observeElements();
});

// Create floating particles on hover
function createParticles(element) {
    const particleCount = 6;
    const rect = element.getBoundingClientRect();
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.width = '6px';
        particle.style.height = '6px';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '999';
        
        const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        particle.style.left = (rect.left + rect.width / 2) + 'px';
        particle.style.top = (rect.top + rect.height / 2) + 'px';
        
        document.body.appendChild(particle);
        
        // Animate particle
        const angle = (Math.PI * 2 * i) / particleCount;
        const velocity = 3;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        let x = rect.left + rect.width / 2;
        let y = rect.top + rect.height / 2;
        let life = 1;
        
        const animate = () => {
            x += vx;
            y += vy;
            life -= 0.02;
            
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.opacity = life;
            
            if (life > 0) {
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        };
        
        animate();
    }
}

// Intersection Observer for scroll animations
function observeElements() {
    const options = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideUp 0.6s ease-out forwards';
                observer.unobserve(entry.target);
            }
        });
    }, options);
    
    document.querySelectorAll('.person-card').forEach(card => {
        observer.observe(card);
    });
}

// Function to edit family member
function editMember(name, relation) {
    const newName = prompt('نیا نام (New Name):', name);
    if (newName) {
        console.log(`Updated: ${name} -> ${newName}`);
    }
}

// Function to add new member
function addNewMember(levelClass, name, relation) {
    const newCard = document.createElement('div');
    newCard.className = 'person-card';
    newCard.innerHTML = `
        <div class="person-circle">
            <div class="person-name">${name}</div>
            <div class="person-relation">${relation}</div>
        </div>
        <div class="person-info">
            <p>📅 جنم سال</p>
        </div>
    `;
    
    const levelDiv = document.querySelector('.' + levelClass);
    if (levelDiv) {
        levelDiv.appendChild(newCard);
        // Re-attach event listeners to new element
        const newCircle = newCard.querySelector('.person-circle');
        newCircle.addEventListener('mouseenter', function() {
            createParticles(this);
        });
    }
}

console.log('✨ Family Tree Script Loaded!');
console.log('💡 استعمال: addNewMember("level-3", "علی", "بھائی")');
