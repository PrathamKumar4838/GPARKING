import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, onValue, set, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// INIT FIREBASE
const app = initializeApp({ databaseURL: "https://sosc-mini-project-default-rtdb.firebaseio.com/" });
const db = getDatabase(app);

// STATE
let currentUser = '';
let currentVehicle = '';
let currentType = ''; 
let isAdmin = false;
let pendingUser = '';

// DOM
const loginSection = document.getElementById('loginSection');
const vehicleSetup = document.getElementById('vehicleSetup');
const dashboardSection = document.getElementById('dashboardSection');

// LOGIN
document.getElementById('loginBtn').addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;

    if (!email || !password) return alert('❌ Fill all fields!');

    // --- ADMIN LOGIN ---
    if (email === 'admin') {
        if (password !== 'admin123') return alert('❌ Wrong Password!');
        isAdmin = true;
        currentUser = 'Administrator';
        currentType = 'admin';
        showDashboard();
        return;
    }

    // --- STUDENT LOGIN ---
    const userRef = ref(db, `users/${email}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.password && data.password !== password) return alert('❌ Wrong Password!');
        
        currentVehicle = data.vehicle;
        currentType = data.type || 'car';
        currentUser = email;
        showDashboard();
    } else {
        // NEW USER FLOW
        pendingUser = email;
        // Temporary password save
        await set(userRef, { password: password }); 
        
        loginSection.classList.add('hidden');
        vehicleSetup.classList.remove('hidden');
    }
});

// SAVE VEHICLE (New User)
document.getElementById('saveVehicleBtn').addEventListener('click', async () => {
    const vehicle = document.getElementById('newVehicle').value.trim().toUpperCase();
    const type = document.querySelector('input[name="vType"]:checked').value;

    if (!vehicle) return alert('❌ Enter Vehicle Number!');

    await set(ref(db, `users/${pendingUser}`), {
        vehicle: vehicle,
        type: type,
        password: document.getElementById('password').value 
    });

    currentUser = pendingUser;
    currentVehicle = vehicle;
    currentType = type;
    
    vehicleSetup.classList.add('hidden');
    showDashboard();
});

// LOGOUT
document.getElementById('logoutBtn').addEventListener('click', () => location.reload());

// ADMIN RESETS
document.getElementById('resetCarsBtn').addEventListener('click', () => resetZone('car'));
document.getElementById('resetBikesBtn').addEventListener('click', () => resetZone('bike'));

async function resetZone(type) {
    if (confirm(`⚠️ Reset ALL ${type.toUpperCase()} slots?`)) {
        for (let i = 1; i <= 5; i++) {
            const prefix = type === 'car' ? 'C' : 'B';
            const slotNum = `${prefix}0${i}`;
            await set(ref(db, `parking_slots/${slotNum}`), { 
                number: slotNum, type: type, status: 'available' 
            });
        }
        alert(`✅ ${type} slots reset!`);
    }
}

// DASHBOARD
function showDashboard() {
    loginSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    
    // Change background for dashboard view
    document.body.style.background = '#f0f2f5'; 
    if(document.querySelector('.bg-overlay')) document.querySelector('.bg-overlay').style.display = 'none';

    document.getElementById('welcomeUser').innerText = currentUser.split('@')[0];
    
    if (isAdmin) {
        document.getElementById('userRole').innerText = 'System Administrator';
        document.getElementById('adminControls').classList.remove('hidden');
    } else {
        document.getElementById('userRole').innerText = `${currentType === 'car' ? '🚗' : '🏍️'} ${currentVehicle}`;
    }

    loadSlots();
}

// LOAD SLOTS
function loadSlots() {
    onValue(ref(db, 'parking_slots'), (snapshot) => {
        const carGrid = document.getElementById('carGrid');
        const bikeGrid = document.getElementById('bikeGrid');
        carGrid.innerHTML = '';
        bikeGrid.innerHTML = '';

        if (!snapshot.exists()) { initSlots(); return; }

        const slots = Object.values(snapshot.val());
        const carSlots = slots.filter(s => s.type === 'car');
        const bikeSlots = slots.filter(s => s.type === 'bike');

        document.getElementById('availCar').innerText = carSlots.filter(s => s.status === 'available').length;
        document.getElementById('availBike').innerText = bikeSlots.filter(s => s.status === 'available').length;

        carSlots.sort((a,b) => a.number.localeCompare(b.number)).forEach(s => renderSlot(s, carGrid));
        bikeSlots.sort((a,b) => a.number.localeCompare(b.number)).forEach(s => renderSlot(s, bikeGrid));
    });
}

async function initSlots() {
    for(let i=1; i<=5; i++) await set(ref(db, `parking_slots/C0${i}`), { number: `C0${i}`, type: 'car', status: 'available' });
    for(let i=1; i<=5; i++) await set(ref(db, `parking_slots/B0${i}`), { number: `B0${i}`, type: 'bike', status: 'available' });
}

function renderSlot(slot, container) {
    const div = document.createElement('div');
    const isMyBooking = slot.vehicle === currentVehicle;
    
    div.className = `slot ${slot.status}`;
    div.innerHTML = `<div>${slot.number}</div>`;
    
    if (slot.status === 'booked') {
        div.innerHTML += isAdmin 
            ? `<small>${slot.user}<br>${slot.vehicle}</small>`
            : `<small>${slot.vehicle}</small>`;
            
        if (isAdmin || isMyBooking) {
            const btn = document.createElement('button');
            btn.className = 'cancel-btn';
            btn.innerHTML = '<i class="fas fa-times"></i>';
            btn.onclick = (e) => { e.stopPropagation(); cancelBooking(slot); };
            div.appendChild(btn);
        }
    } else if (!isAdmin) {
        div.onclick = () => bookSlot(slot);
    }
    container.appendChild(div);
}

async function bookSlot(slot) {
    if (currentType !== slot.type) return alert(`🚫 You have a ${currentType}, not a ${slot.type}!`);
    
    const snap = await get(ref(db, 'parking_slots'));
    const booked = Object.values(snap.val()).find(s => s.vehicle === currentVehicle && s.status === 'booked');
    if (booked) return alert(`🚫 Already parked at ${booked.number}`);

    if (confirm(`Book ${slot.number}?`)) {
        await set(ref(db, `parking_slots/${slot.number}`), {
            number: slot.number, type: slot.type, status: 'booked', vehicle: currentVehicle, user: currentUser
        });
    }
}

async function cancelBooking(slot) {
    if (confirm(`Leave ${slot.number}?`)) {
        await set(ref(db, `parking_slots/${slot.number}`), { number: slot.number, type: slot.type, status: 'available' });
    }
}
