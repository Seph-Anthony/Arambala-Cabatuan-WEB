// ---------- SELECTORS (existing modal & booking UI) ----------
const modelhold = document.querySelector("#bookingModal");
const btnclose = document.querySelector(".close-btn");
const btnbook = document.querySelectorAll("#btnbook, #book, .sixthbtn");
const flightTypeSelect = document.getElementById("flightType");
const returnDateGroup = document.getElementById("returnDateGroup");

const searchFlightBtn = document.getElementById("searchFlightBtn");
const fromInput = document.getElementById("from");
const toInput = document.getElementById("to");
const departDateInput = document.getElementById("departDate");
const returnDateInput = document.getElementById("returnDate");
const passengerCountInput = document.getElementById("passengerCount");

// ---------- NEW ELEMENTS (flight modal + passenger modal) ----------
const flightModal = document.getElementById("flightModal");
const flightList = document.getElementById("flightList");
const flightBackBtn = document.getElementById("backToBooking");

const passengerModal = document.getElementById("passengerModal");
const passengerFormsContainer = document.getElementById("passengerFormsContainer");
const closePassengerModal = document.getElementById("closePassengerModal");
const backToFlightsBtn = document.getElementById("backToFlights");
const confirmBookingBtn = document.getElementById("confirmBooking");

// ---------- SUMMARY & SUCCESS MODALS ----------
const summaryModal = document.getElementById("summaryModal");
const summaryDetails = document.getElementById("summaryDetails");
const backToPassengerBtn = document.getElementById("backToPassenger");
const bookNowBtn = document.getElementById("bookNowBtn");
const successModal = document.getElementById("successModal");
const closeSuccessBtn = document.getElementById("closeSuccessBtn");

// ---------- STORE BOOKING INFO ----------
let bookingContext = {
  bookingDetails: null,
  selectedFlight: null,
  passengers: []
};

// --------------------- OPEN / CLOSE BOOKING MODAL ---------------------
btnbook.forEach((btn) => {
  btn.addEventListener("click", () => {
    modelhold.classList.add("active");
  });
});

btnclose.addEventListener("click", () => {
  modelhold.classList.remove("active");
});

modelhold.addEventListener("click", (e) => {
  if (e.target === modelhold) modelhold.classList.remove("active");
});

// --------------------- SHOW/HIDE RETURN DATE ---------------------
returnDateGroup.style.display = "none";
flightTypeSelect.addEventListener("change", () => {
  returnDateGroup.style.display =
    flightTypeSelect.value === "roundtrip" ? "block" : "none";
});

// --------------------- DEFAULT FLIGHT SCHEDULES ---------------------
const defaultSchedules = [
  {
    flightNo: "5J 560",
    route: null,
    departTime: "08:00",
    arriveTime: "10:00",
    hours: "2h 00m",
    price: 3499,
    seats: 20,
    fareType: "Promo Fare"
  },
  {
    flightNo: "5J 561",
    route: null,
    departTime: "11:30",
    arriveTime: "13:45",
    hours: "2h 15m",
    price: 4299,
    seats: 15,
    fareType: "Regular"
  },
  {
    flightNo: "5J 562",
    route: null,
    departTime: "16:00",
    arriveTime: "18:00",
    hours: "2h 00m",
    price: 2999,
    seats: 10,
    fareType: "Promo Fare"
  }
];

// --------------------- UTILITIES ---------------------
function formatDateDisplay(isoDate, time) {
  if (!isoDate) return "";
  const d = new Date(isoDate + "T" + (time || "00:00"));
  const options = { month: "short", day: "numeric", year: "numeric" };
  const datePart = d.toLocaleDateString(undefined, options);
  const hh = time ? time : d.toTimeString().slice(0, 5);
  return `${datePart} • ${hh}`;
}

function currencyFormat(n) {
  return "₱" + Number(n).toLocaleString();
}

// --------------------- SEARCH + VALIDATION ---------------------
searchFlightBtn.addEventListener("click", () => {
  const valuenifrom = fromInput.value.trim();
  const valuenito = toInput.value.trim();
  const valuenidepart = departDateInput.value;
  const valuenireturn = returnDateInput.value;
  const valuenipass = parseInt(passengerCountInput.value);
  const valueniflight = flightTypeSelect.value;

  if (!valuenifrom) return alert("Please enter the depart location");
  if (!valuenito) return alert("Please enter the destination location");
  if (!valueniflight) return alert("Please select a type of flight");
  if (!valuenidepart) return alert("Please select a depart date");

  if (valueniflight === "roundtrip") {
    if (!valuenireturn) return alert("Please input a date for your return");
    if (valuenireturn < valuenidepart)
      return alert("Return date cannot be earlier than departure date");
  }

  if (isNaN(valuenipass) || valuenipass < 1)
    return alert("There must be at least one passenger");

  bookingContext.bookingDetails = {
    from: valuenifrom,
    to: valuenito,
    departDate: valuenidepart,
    returnDate: valuenireturn || null,
    passengers: valuenipass,
    type: valueniflight
  };

  modelhold.classList.remove("active");
  showAvailableFlights(bookingContext.bookingDetails);
});

// --------------------- SHOW FLIGHT OPTIONS ---------------------
function showAvailableFlights(booking) {
  flightList.innerHTML = "";

  const schedules = defaultSchedules.map((s, idx) => {
    const sch = { ...s };
    sch.route = `${booking.from} → ${booking.to}`;
    sch.departDateISO = booking.departDate;
    sch.departDisplay = formatDateDisplay(sch.departDateISO, sch.departTime);

    if (booking.type === "roundtrip") {
      sch.returnDateISO = booking.returnDate;
      const returnTimes = ["12:00", "15:30", "19:00"];
      sch.returnTime = returnTimes[idx % returnTimes.length];
      sch.returnDisplay = formatDateDisplay(sch.returnDateISO, sch.returnTime);
    }

    return sch;
  });

  schedules.forEach((f) => {
    const card = document.createElement("div");
    card.className = "flight-card";
    card.innerHTML = `
      <div class="flight-header">
        <strong class="flight-no">${f.flightNo}</strong>
        <span class="fare-type">${f.fareType}</span>
      </div>
      <div class="flight-body">
        <p><strong>Route:</strong> ${f.route}</p>
        <p><strong>Depart:</strong> ${f.departDisplay}</p>
        ${f.returnDisplay ? `<p><strong>Return:</strong> ${f.returnDisplay}</p>` : ""}
        <p><strong>Travel Time:</strong> ${f.hours}</p>
        <p><strong>Seats:</strong> ${f.seats}</p>
        <p><strong>Price:</strong> ${currencyFormat(f.price)}</p>
      </div>
      <div class="flight-actions">
        <button class="select-flight-btn">Select Flight</button>
      </div>
    `;

    card.querySelector(".select-flight-btn").addEventListener("click", () => {
      bookingContext.selectedFlight = f;
      openPassengerModal();
    });

    flightList.appendChild(card);
  });

  flightModal.classList.add("active");
}

// Go back to booking
flightBackBtn.addEventListener("click", () => {
  flightModal.classList.remove("active");
  modelhold.classList.add("active");
});

// --------------------- PASSENGER MODAL ---------------------
function openPassengerModal() {
  passengerFormsContainer.innerHTML = "";

  const count = bookingContext.bookingDetails.passengers;

  for (let i = 1; i <= count; i++) {
    const card = document.createElement("div");
    card.className = "passenger-card";
    card.innerHTML = `
      <h4>Passenger ${i}</h4>
      <input type="text" placeholder="Full Name" class="pname" required>
      <input type="number" placeholder="Age" class="page" min="0" required>
      <select class="pgender" required>
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Others">Others</option>
      </select>
      <input type="text" placeholder="Contact Number" class="pcontact" required>
      <input type="email" placeholder="Gmail" class="pgmail" required>
      <input type="text" placeholder="Address" class="paddress" required>
    `;
    passengerFormsContainer.appendChild(card);
  }

  flightModal.classList.remove("active");
  passengerModal.classList.add("active");
}

// --------------------- CONFIRM BOOKING → SHOW SUMMARY ---------------------
confirmBookingBtn.addEventListener("click", () => {
  const names = document.querySelectorAll(".pname");
  const ages = document.querySelectorAll(".page");
  const genders = document.querySelectorAll(".pgender");
  const contacts = document.querySelectorAll(".pcontact");
  const gmails = document.querySelectorAll(".pgmail");
  const addresses = document.querySelectorAll(".paddress");

  bookingContext.passengers = [];

  for (let i = 0; i < names.length; i++) {
    const name = names[i].value.trim();
    const age = ages[i].value.trim();
    const gender = genders[i].value;
    const contact = contacts[i].value.trim();
    const gmail = gmails[i].value.trim();
    const address = addresses[i].value.trim();



    if (!name || !age || !gender || !contact || !gmail || !address) {
      alert(` ⚠️ Please complete all fields for Passenger ${i + 1}`);
      return;
    }

    if (isNaN(age) || age <= 0) {
      alert(`⚠️ Please enter a valid age for Passenger ${i + 1}`);
      return;
    }

    

 if (!/^\d{11}$/.test(contact)) {
      alert(`⚠️ Please enter a valid 11-digit contact number for Passenger ${i + 1}.`);
      return;
    }


   const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailPattern.test(gmail)) {
      alert(`⚠️ Please enter a valid Gmail address for Passenger ${i + 1} (e.g. example@gmail.com).`);
      return;
    }

    if(age < 18){

      alert(` ⚠️ Passenger ${i + 1} Should be at least 18 years old to book a flight`);

      return;
    }

  

    bookingContext.passengers.push({ name, age, gender, contact, gmail, address });
  }

  passengerModal.classList.remove("active");
  openSummaryModal();
});

// --------------------- IMPROVED SUMMARY MODAL ---------------------
function openSummaryModal() {
  const { bookingDetails, selectedFlight, passengers } = bookingContext;

  summaryDetails.innerHTML = `
    <div class="summaryContentWrapper">
      <div class="summary-section">
        <h3>📅 Booking Details</h3>
        <p><strong>From:</strong> ${bookingDetails.from}</p>
        <p><strong>To:</strong> ${bookingDetails.to}</p>
        <p><strong>Flight Type:</strong> ${bookingDetails.type}</p>
        <p><strong>Depart Date:</strong> ${bookingDetails.departDate}</p>
        ${bookingDetails.type === "roundtrip" ? `<p><strong>Return Date:</strong> ${bookingDetails.returnDate}</p>` : ""}
      </div>

      <div class="summary-section">
        <h3>✈️ Flight Information</h3>
        <p><strong>Flight No:</strong> ${selectedFlight.flightNo}</p>
        <p><strong>Route:</strong> ${selectedFlight.route}</p>
        <p><strong>Depart:</strong> ${selectedFlight.departDisplay}</p>
        ${selectedFlight.returnDisplay ? `<p><strong>Return:</strong> ${selectedFlight.returnDisplay}</p>` : ""}
        <p><strong>Terminal:</strong> Terminal 3</p>
        <p><strong>Fare Type:</strong> ${selectedFlight.fareType}</p>
        <p><strong>Travel Time:</strong> ${selectedFlight.hours}</p>
        <p><strong>Price per Passenger:</strong> ${currencyFormat(selectedFlight.price)}</p>
        <p><strong>Total Price:</strong> ${currencyFormat(selectedFlight.price * passengers.length)}</p>
      </div>

      <div class="summary-section">
        <h3>👥 Passenger Details (${passengers.length})</h3>
        ${passengers.map((p, i) => `
          <div class="passenger-summary-card">
            <h4>Passenger ${i + 1}</h4>
            <p><strong>Name:</strong> ${p.name}</p>
            <p><strong>Age:</strong> ${p.age}</p>
            <p><strong>Gender:</strong> ${p.gender}</p>
            <p><strong>Contact:</strong> ${p.contact}</p>
            <p><strong>Gmail:</strong> ${p.gmail}</p>
            <p><strong>Address:</strong> ${p.address}</p>
          </div>
        `).join("")}
      </div>
    </div>
  `;

  summaryModal.classList.add("active");
}

// --------------------- BACK & SUCCESS ---------------------
backToPassengerBtn.addEventListener("click", () => {
  summaryModal.classList.remove("active");
  passengerModal.classList.add("active");
});

bookNowBtn.addEventListener("click", () => {
  summaryModal.classList.remove("active");
  successModal.classList.add("active");
});

closeSuccessBtn.addEventListener("click", () => {
  successModal.classList.remove("active");
});
