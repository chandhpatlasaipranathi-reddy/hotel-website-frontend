// Room data: add or change rooms here and the page updates automatically.
const rooms = [
  { id: "standard", name: "Standard Room", price: 3200, desc: "Queen bed, garden view, 22 sqm.", color: "#8cc3c6" },
  { id: "deluxe",   name: "Deluxe Room",   price: 4800, desc: "King bed, sea-facing balcony, 30 sqm.", color: "#4f9aa1" },
  { id: "suite",    name: "Family Suite",  price: 7500, desc: "Two bedrooms, living area, 48 sqm.", color: "#1f6f78" }
];

const $ = (id) => document.getElementById(id);
const rupees = (n) => "\u20B9" + n.toLocaleString("en-IN");

// Build room cards and the room dropdown
function renderRooms() {
  $("roomGrid").innerHTML = rooms.map(r => `
    <article class="room">
      <div class="room-img" style="background:${r.color}"></div>
      <div class="room-body">
        <h3>${r.name}</h3>
        <p>${r.desc}</p>
        <span class="price">${rupees(r.price)} per night</span><br>
        <button class="btn" data-room="${r.id}">Book this room</button>
      </div>
    </article>`).join("");
  $("roomType").innerHTML = rooms.map(r => `<option value="${r.id}">${r.name} (${rupees(r.price)}/night)</option>`).join("");
  document.querySelectorAll("[data-room]").forEach(btn => {
    btn.addEventListener("click", () => {
      $("roomType").value = btn.dataset.room;
      updateSummary();
      $("booking").scrollIntoView();
      $("name").focus();
    });
  });
}

// Dates: no past check-in, check-out after check-in
const today = new Date().toISOString().split("T")[0];
$("checkin").min = today;
$("checkout").min = today;

function nightsBetween() {
  const a = new Date($("checkin").value), b = new Date($("checkout").value);
  const n = Math.round((b - a) / 86400000);
  return isNaN(n) ? 0 : n;
}

function updateSummary() {
  const nights = nightsBetween();
  const room = rooms.find(r => r.id === $("roomType").value);
  if (nights > 0) {
    const total = nights * room.price;
    $("summary").textContent = `${nights} night${nights > 1 ? "s" : ""} in ${room.name}: ${rupees(total)}`;
  } else {
    $("summary").textContent = "Choose your dates to see the total price.";
  }
}

function setError(field, msg) {
  $(field + "Err").textContent = msg;
  $(field).classList.toggle("invalid", Boolean(msg));
  return !msg;
}

function validate() {
  let ok = true;
  ok = setError("name", $("name").value.trim().length < 3 ? "Enter your full name (at least 3 letters)." : "") && ok;
  ok = setError("email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($("email").value) ? "" : "Enter a valid email, like name@example.com.") && ok;
  ok = setError("phone", /^[0-9]{10}$/.test($("phone").value) ? "" : "Enter a 10-digit phone number.") && ok;
  ok = setError("checkin", $("checkin").value ? "" : "Pick a check-in date.") && ok;
  ok = setError("checkout", nightsBetween() > 0 ? "" : "Check-out must be after check-in.") && ok;
  const g = Number($("guests").value);
  ok = setError("guests", g >= 1 && g <= 4 ? "" : "Guests must be between 1 and 4.") && ok;
  return ok;
}

$("bookingForm").addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validate()) return;
  const room = rooms.find(r => r.id === $("roomType").value);
  const nights = nightsBetween();
  const box = $("confirmation");
  box.hidden = false;
  box.innerHTML = `<h3>Booking confirmed</h3>
    <p>Thank you, ${$("name").value.trim()}. We have reserved a ${room.name} for ${nights} night(s),
    from ${$("checkin").value} to ${$("checkout").value}. Total: <strong>${rupees(nights * room.price)}</strong>.
    A confirmation will be sent to ${$("email").value}.</p>`;
  box.scrollIntoView();
  $("bookingForm").reset();
  updateSummary();
});

["checkin", "checkout", "roomType"].forEach(id => $(id).addEventListener("change", () => {
  if (id === "checkin") $("checkout").min = $("checkin").value || today;
  updateSummary();
}));

// Mobile menu
$("menuBtn").addEventListener("click", () => {
  const open = $("nav").classList.toggle("open");
  $("menuBtn").setAttribute("aria-expanded", open);
});
$("nav").addEventListener("click", () => $("nav").classList.remove("open"));

$("year").textContent = new Date().getFullYear();
renderRooms();
