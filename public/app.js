const API = "";
const $ = (id) => document.getElementById(id);

function setStatus(ok) {
  $("status").textContent = ok ? "online" : "offline";
  $("status").style.color = ok ? "#9ff0c1" : "#ff9aa9";
}

function getToken() {
  return localStorage.getItem("token") || "";
}

function setToken(t) {
  if (t) localStorage.setItem("token", t);
  else localStorage.removeItem("token");
  $("tokenBox").textContent = t || "—";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);
}

function markInvalid(el, invalid) {
  el.style.borderColor = invalid ? "rgba(255,59,92,.8)" : "rgba(27,42,82,.7)";
}

async function safeRead(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

async function ping() {
  try {
    const r = await fetch(`${API}/api/health`);
    setStatus(r.ok);
  } catch {
    setStatus(false);
  }
}

async function register() {
  const email = $("email").value.trim();
  const password = $("password").value;
  const role = $("role").value;

  if (!isValidEmail(email)) {
    markInvalid($("email"), true);
    $("adminResult").textContent = JSON.stringify(
      { error: "Invalid email format" },
      null,
      2,
    );
    return;
  }
  markInvalid($("email"), false);

  if (password.length < 6) {
    $("adminResult").textContent = JSON.stringify(
      { error: "Password must be at least 6 characters" },
      null,
      2,
    );
    return;
  }

  const r = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role }),
  });

  const data = await safeRead(r);
  $("adminResult").textContent = JSON.stringify(
    { status: r.status, data },
    null,
    2,
  );
}

async function login() {
  const email = $("email").value.trim();
  const password = $("password").value;

  if (!isValidEmail(email)) {
    markInvalid($("email"), true);
    $("adminResult").textContent = JSON.stringify(
      { error: "Invalid email format" },
      null,
      2,
    );
    return;
  }
  markInvalid($("email"), false);

  const r = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await safeRead(r);
  if (r.ok && data.token) setToken(data.token);

  $("adminResult").textContent = JSON.stringify(
    { status: r.status, data },
    null,
    2,
  );
}

function logout() {
  setToken("");
  $("adminResult").textContent = "Logged out.";
}

async function loadRooms() {
  const r = await fetch(`${API}/rooms`);
  const data = await safeRead(r);

  const box = $("roomsList");
  box.innerHTML = "";

  if (!r.ok) {
    box.innerHTML = `<div class="item"><div class="t">Error ${r.status}</div><div class="s">${JSON.stringify(data, null, 2)}</div></div>`;
    return;
  }

  if (!Array.isArray(data) || data.length === 0) {
    box.innerHTML = `<div class="item"><div class="t">No rooms</div><div class="s">Create one as admin</div></div>`;
    return;
  }

  for (const room of data) {
    const el = document.createElement("div");
    el.className = "item";
    el.innerHTML = `
      <div class="t">${room.name ?? "Room"}</div>
      <div class="s">
        <b>id:</b> ${room._id}<br/>
        capacity: ${room.capacity ?? "-"} • price/h: ${room.pricePerHour ?? "-"} • type: ${room.roomType ?? "-"}
      </div>
    `;

    // click to fill booking roomId
    el.addEventListener("click", () => {
      const input = $("bookRoomId");
      if (input) input.value = room._id;
    });

    box.appendChild(el);
  }
}

async function createRoom() {
  const token = getToken();

  const body = {
    name: $("roomName").value.trim() || "Room A",
    capacity: Number($("roomCapacity").value || 10),
    pricePerHour: Number($("roomPrice").value || 5000),
    roomType: $("roomType").value.trim() || "conference",
    amenities: ($("roomAmenities").value || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    available: true,
  };

  const r = await fetch(`${API}/rooms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await safeRead(r);
  $("adminResult").textContent = JSON.stringify(
    { status: r.status, data },
    null,
    2,
  );

  if (r.ok) loadRooms();
}

function toISO(dtLocal) {
  if (!dtLocal) return null;
  return new Date(dtLocal).toISOString();
}

async function loadBookings() {
  const box = $("bookingsList");
  box.innerHTML = `<div class="item"><div class="t">Loading...</div></div>`;

  const r = await fetch(`${API}/bookings`);
  const data = await safeRead(r);

  if (!r.ok) {
    box.innerHTML = `<div class="item"><div class="t">Error ${r.status}</div><div class="s">${JSON.stringify(data, null, 2)}</div></div>`;
    return;
  }

  box.innerHTML = "";
  if (!Array.isArray(data) || data.length === 0) {
    box.innerHTML = `<div class="item"><div class="t">No bookings</div><div class="s">Create one</div></div>`;
    return;
  }

  for (const b of data) {
    const roomName = b.roomId?.name || b.roomId?._id || b.roomId || "room";
    const el = document.createElement("div");
    el.className = "item";
    el.innerHTML = `
      <div class="t">${b.customerName || "Booking"}</div>
      <div class="s">
        room: ${roomName}<br/>
        ${new Date(b.startTime).toLocaleString()} → ${new Date(b.endTime).toLocaleString()} • ${b.status || "active"}
      </div>
    `;
    box.appendChild(el);
  }
}

async function createBooking() {
  const token = getToken();
  const roomId = $("bookRoomId").value.trim();
  const customerName = $("bookName").value.trim();
  const startISO = toISO($("bookStart").value);
  const endISO = toISO($("bookEnd").value);

  if (!token) {
    $("adminResult").textContent = JSON.stringify(
      { error: "Login first (user/admin)" },
      null,
      2,
    );
    return;
  }
  if (!roomId) {
    $("adminResult").textContent = JSON.stringify(
      { error: "roomId is required (click a room)" },
      null,
      2,
    );
    return;
  }
  if (!customerName) {
    $("adminResult").textContent = JSON.stringify(
      { error: "customerName is required" },
      null,
      2,
    );
    return;
  }
  if (!startISO || !endISO) {
    $("adminResult").textContent = JSON.stringify(
      { error: "startTime and endTime are required" },
      null,
      2,
    );
    return;
  }
  if (new Date(endISO) <= new Date(startISO)) {
    $("adminResult").textContent = JSON.stringify(
      { error: "endTime must be after startTime" },
      null,
      2,
    );
    return;
  }

  const body = { roomId, customerName, startTime: startISO, endTime: endISO };

  const r = await fetch(`${API}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await safeRead(r);
  $("adminResult").textContent = JSON.stringify(
    { status: r.status, data },
    null,
    2,
  );

  if (r.ok) loadBookings();
}

// events
$("btnRegister").addEventListener("click", register);
$("btnLogin").addEventListener("click", login);
$("btnLogout").addEventListener("click", logout);
$("btnLoadRooms").addEventListener("click", loadRooms);
$("btnCreateRoom").addEventListener("click", createRoom);
$("btnCreateBooking").addEventListener("click", createBooking);
$("btnLoadBookings").addEventListener("click", loadBookings);

$("togglePw").addEventListener("click", () => {
  const input = $("password");
  const hidden = input.type === "password";
  input.type = hidden ? "text" : "password";
  $("togglePw").textContent = hidden ? "🙈" : "👁";
});

// init
setToken(getToken());
ping();
