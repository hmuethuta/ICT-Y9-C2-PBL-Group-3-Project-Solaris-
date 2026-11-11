// Account Creation
document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("createAccountForm");

    if (!form) {
        console.error("Create account form not found!");
        return;
    }

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        // Get values
        const email = document.getElementById("registerEmail").value.trim();
        const name = document.getElementById("registerName").value.trim();
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const phone = document.getElementById("registerPhone").value.trim();

        // Get error elements
        const emailError = document.getElementById("emailError");
        const nameError = document.getElementById("nameError");
        const passwordError = document.getElementById("passwordError");
        const confirmError = document.getElementById("confirmError");
        const phoneError = document.getElementById("phoneError");
        const success = document.getElementById("registerSuccess");

        // Clear old errors
        emailError.textContent = "";
        nameError.textContent = "";
        passwordError.textContent = "";
        confirmError.textContent = "";
        phoneError.textContent = "";
        success.textContent = "";

        let valid = true;

        // 1. EMAIL VALIDATION
        const emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

        if (email === "") {
            emailError.textContent = "Email is required.";
            valid = false;
        } else if (!emailPattern.test(email)) {
            emailError.textContent = "Please enter a valid email address.";
            valid = false;
        }

        // 2. NAME VALIDATION
        const nameParts = name.split(/\s+/);

        if (name === "") {
            nameError.textContent = "Name is required.";
            valid = false;
        } else if (nameParts.length < 2) {
            nameError.textContent = "Please enter your first and last name.";
            valid = false;
        }

        // 3. PASSWORD VALIDATION
        if (password.length < 8) {
            passwordError.textContent = "Password must contain at least 8 characters.";
            valid = false;
        }

        // 4. PASSWORD RECONFIRMATION
        if (confirmPassword === "") {
            confirmError.textContent = "Please confirm your password.";
            valid = false;
        } else if (password !== confirmPassword) {
            confirmError.textContent = "Passwords do not match.";
            valid = false;
        }

        // 5. PHONE NUMBER VALIDATION
        const phonePattern = /^09\d{9}$/;

        if (phone === "") {
            phoneError.textContent = "Phone number is required.";
            valid = false;
        } else if (!phonePattern.test(phone)) {
            phoneError.textContent = "Phone number must start with 09 and contain exactly 11 digits.";
            valid = false;
        }

        // FINAL RESULT
        if (!valid) {
            console.log("Registration failed validation.");
            return;
        }

        const accounts = getAccounts();
        if (accounts[email.toLowerCase()]) {
            emailError.textContent = "An account with this email already exists. Try logging in instead.";
            return;
        }

        hashPassword(password, email).then(function (hash) {
            // Only a salted hash of the password is stored, never the password itself
            accounts[email.toLowerCase()] = { name: name, email: email, phone: phone, passHash: hash };
            saveAccounts(accounts);
            setSession({ name: name, email: email });

            success.textContent = "Account created successfully! You're now logged in.";
            success.style.color = "green";
            form.reset();

            setTimeout(function () { hideModal("registerModal"); }, 1000);
        });

    });

});

// Contact

document.addEventListener("DOMContentLoaded", function () {

    const feedbackForm = document.getElementById("feedbackForm");

    if (!feedbackForm) return;

    feedbackForm.addEventListener("submit", function (event) {

        event.preventDefault();

        // Get input values
        const name = document.getElementById("feedbackName").value.trim();
        const email = document.getElementById("feedbackEmail").value.trim();
        const topic = document.getElementById("feedbackTopic").value;
        const message = document.getElementById("feedbackMessage").value.trim();

        // Get error elements
        const nameError = document.getElementById("feedbackNameError");
        const emailError = document.getElementById("feedbackEmailError");
        const topicError = document.getElementById("feedbackTopicError");
        const messageError = document.getElementById("feedbackMessageError");
        const success = document.getElementById("feedbackSuccess");

        // Clear previous errors
        nameError.textContent = "";
        emailError.textContent = "";
        topicError.textContent = "";
        messageError.textContent = "";
        success.textContent = "";

        let valid = true;

        // NAME VALIDATION
        if (name === "") {
            nameError.textContent = "Please enter your name.";
            valid = false;
        } else if (name.length < 2) {
            nameError.textContent = "Name must contain at least 2 characters.";
            valid = false;
        }

        // EMAIL VALIDATION
        const emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

        if (email === "") {
            emailError.textContent = "Please enter your email address.";
            valid = false;
        } else if (!emailPattern.test(email)) {
            emailError.textContent = "Please enter a valid email address.";
            valid = false;
        }

        // TOPIC VALIDATION
        if (topic === "") {
            topicError.textContent = "Please select a topic.";
            valid = false;
        }

        // MESSAGE VALIDATION
        if (message === "") {
            messageError.textContent = "Please enter your message.";
            valid = false;
        } else if (message.length < 10) {
            messageError.textContent = "Message must contain at least 10 characters.";
            valid = false;
        }

        // FINAL RESULT
        if (valid) {

            success.textContent = "Thank you! Your feedback has been submitted.";

            console.log("Feedback submitted:", {
                name: name,
                email: email,
                topic: topic,
                message: message
            });

            feedbackForm.reset();

        } else {
            console.log("Feedback submission failed validation.");
        }

    });

});


/* =========================================================
   Shared helpers
   ========================================================= */
function getSolarisUser() {
    try { return JSON.parse(localStorage.getItem("solarisUser")); } catch (e) { return null; }
}
function getAccounts() {
    try { return JSON.parse(localStorage.getItem("solarisAccounts")) || {}; } catch (e) { return {}; }
}
function saveAccounts(accounts) {
    try { localStorage.setItem("solarisAccounts", JSON.stringify(accounts)); } catch (e) {}
}
// Demo-grade only: this site has no server, so accounts live in this browser's localStorage.
function hashPassword(password, email) {
    const data = email.trim().toLowerCase() + ":" + password;
    if (window.crypto && crypto.subtle && window.TextEncoder) {
        return crypto.subtle.digest("SHA-256", new TextEncoder().encode(data)).then(function (buf) {
            return Array.from(new Uint8Array(buf)).map(function (b) {
                return b.toString(16).padStart(2, "0");
            }).join("");
        });
    }
    let h = 5381;
    for (let i = 0; i < data.length; i++) h = ((h << 5) + h + data.charCodeAt(i)) | 0;
    return Promise.resolve("x" + (h >>> 0).toString(16));
}
function setSession(user) {
    try { localStorage.setItem("solarisUser", JSON.stringify({ name: user.name, email: user.email })); } catch (e) {}
    document.dispatchEvent(new CustomEvent("solaris:login"));
}
function clearSession() {
    try { localStorage.removeItem("solarisUser"); } catch (e) {}
    document.dispatchEvent(new CustomEvent("solaris:logout"));
}
function showModal(id) {
    const el = document.getElementById(id);
    if (el && window.bootstrap) bootstrap.Modal.getOrCreateInstance(el).show();
}
function hideModal(id) {
    const el = document.getElementById(id);
    if (el && window.bootstrap) {
        const inst = bootstrap.Modal.getInstance(el);
        if (inst) inst.hide();
    }
}
function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
}

/* =========================================================
   Navbar shadow on scroll + dead "#" links
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
    const header = document.getElementById("topHeader");
    if (header) {
        const onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 10); };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
    }

    // Placeholder links (href="#" or empty) shouldn't jump to the top / reload
    document.querySelectorAll('a[href="#"], a[href=""]').forEach(function (a) {
        a.addEventListener("click", function (e) { e.preventDefault(); });
    });

    // information.html uses id="#Formation" (with a stray #), so the browser can't
    // scroll to it on its own. Handle it here.
    if (location.hash === "#Formation") {
        const el = document.getElementById("#Formation");
        if (el) setTimeout(function () { el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100);
    }
});

/* =========================================================
   LOG IN + ACCOUNT MENU
   (all markup lives in the HTML pages; this only wires it up)
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {

    // ---- Switch between the login and register modals ----
    document.addEventListener("click", function (e) {
        const link = e.target.closest("[data-switch]");
        if (!link) return;
        e.preventDefault();
        const current = link.closest(".modal");
        const target = link.dataset.switch;
        if (current && window.bootstrap) {
            current.addEventListener("hidden.bs.modal", function () { showModal(target); }, { once: true });
            hideModal(current.id);
        } else {
            showModal(target);
        }
    });

    // ---- Login form ----
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const email = document.getElementById("loginEmail").value.trim();
            const password = document.getElementById("loginPassword").value;
            const emailErr = document.getElementById("loginEmailError");
            const passErr = document.getElementById("loginPasswordError");
            const generalErr = document.getElementById("loginError");
            emailErr.textContent = passErr.textContent = generalErr.textContent = "";

            let valid = true;
            if (email === "") { emailErr.textContent = "Email is required."; valid = false; }
            else if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email)) { emailErr.textContent = "Please enter a valid email address."; valid = false; }
            if (password === "") { passErr.textContent = "Password is required."; valid = false; }
            if (!valid) return;

            const account = getAccounts()[email.toLowerCase()];
            if (!account) {
                generalErr.textContent = "Incorrect email or password.";
                return;
            }
            hashPassword(password, email).then(function (hash) {
                if (hash !== account.passHash) {
                    generalErr.textContent = "Incorrect email or password.";
                    return;
                }
                setSession({ name: account.name, email: account.email });
                loginForm.reset();
                hideModal("loginModal");
            });
        });
    }

    // ---- Header: swap buttons for the account menu ----
    const loginBtn = document.getElementById("loginButton");
    const createBtn = document.getElementById("createAccountButton");
    const menu = document.getElementById("accountMenu");

    function initials(name) {
        const parts = name.trim().split(/\s+/);
        return ((parts[0] || "")[0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
    }

    function renderAccount() {
        if (!menu) return;
        const user = getSolarisUser();
        const loggedIn = !!(user && user.name && user.email);

        if (loginBtn) loginBtn.hidden = loggedIn;
        if (createBtn) createBtn.hidden = loggedIn;
        menu.hidden = !loggedIn;
        if (!loggedIn) return;

        document.getElementById("accountAvatar").textContent = initials(user.name);
        document.getElementById("accountName").textContent = user.name.trim().split(/\s+/)[0];
        document.getElementById("accountFull").textContent = user.name;
        document.getElementById("accountEmail").textContent = user.email;

        let best = null;
        try { best = JSON.parse(localStorage.getItem("solarisQuizBest:" + user.email)); } catch (e) {}
        document.getElementById("accountQuiz").textContent = best ? "Best quiz score: " + best.score + "/" + best.total : "";
    }

    const logoutBtn = document.getElementById("logoutButton");
    if (logoutBtn) logoutBtn.addEventListener("click", clearSession);
    if (menu) menu.addEventListener("show.bs.dropdown", renderAccount);

    document.addEventListener("solaris:login", renderAccount);
    document.addEventListener("solaris:logout", renderAccount);
    window.addEventListener("storage", function (e) { if (e.key === "solarisUser") renderAccount(); });

    // ---- Modal tidy-up: focus first field on open, clear messages on close ----
    ["loginModal", "registerModal"].forEach(function (id) {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("shown.bs.modal", function () {
            const first = el.querySelector("input");
            if (first) first.focus();
        });
        el.addEventListener("hidden.bs.modal", function () {
            el.querySelectorAll("small.text-danger, #loginError").forEach(function (n) { n.textContent = ""; });
            const ok = el.querySelector("#registerSuccess");
            if (ok) ok.textContent = "";
        });
    });

    renderAccount();
});

/* =========================================================
   HEAT QUIZ  (information.html -> #quizBanner)
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
    const banner = document.getElementById("quizBanner");
    if (!banner) return;

    const QUESTIONS = [
        { q: "What kind of weather system often causes a heatwave?",
          o: ["A low-pressure system", "A high-pressure system that stays over an area", "A passing cold front", "A tropical storm"], a: 1,
          e: "Sinking air under high pressure warms as it compresses and suppresses cloud and rain." },
        { q: "What does the Heat Index combine?",
          o: ["Temperature and wind speed", "Temperature and UV level", "Temperature and relative humidity", "Humidity and rainfall"], a: 2,
          e: "The Heat Index estimates how hot it feels by combining air temperature and humidity." },
        { q: "Why does high humidity make hot weather more dangerous?",
          o: ["Sweat evaporates more slowly, so the body cools less effectively", "It raises air temperature directly", "It blocks sunlight", "It makes people sweat less"], a: 0,
          e: "Cooling depends on sweat evaporating. In humid air it evaporates slowly." },
        { q: "Which is a sign of heatstroke rather than heat exhaustion?",
          o: ["Heavy sweating", "Mild headache", "Confusion or seizures", "Cold, clammy skin"], a: 2,
          e: "Confusion, seizures or unconsciousness mean heatstroke, which is a medical emergency." },
        { q: "What should you do first if you suspect someone has heatstroke?",
          o: ["Give them a large drink and let them rest", "Call emergency services and start cooling them", "Wait to see if they improve", "Make them walk it off"], a: 1,
          e: "Call emergency help immediately and cool them rapidly. Don't give fluids to someone confused or unconscious." },
        { q: "Why are cities often hotter than rural areas?",
          o: ["More wind in cities", "Concrete and asphalt store heat and there is less vegetation", "Cities are closer to the equator", "Rural areas have more clouds"], a: 1,
          e: "This is the Urban Heat Island effect: materials store heat and release it slowly, especially at night." },
        { q: "When is the best time to avoid strenuous outdoor activity?",
          o: ["Early morning", "During the hottest hours of the day", "After sunset", "Right after rain"], a: 1,
          e: "Avoid strenuous activity during the hottest hours of the day." },
        { q: "Which part of the brain helps regulate body temperature?",
          o: ["Cerebellum", "Hippocampus", "Hypothalamus", "Brain stem"], a: 2,
          e: "The hypothalamus triggers sweating and widens blood vessels near the skin to release heat." }
    ];

    // Build UI inside the banner (existing HTML is untouched)
    const box = document.createElement("div");
    box.className = "quiz-box";
    box.setAttribute("aria-live", "polite");
    banner.appendChild(box);

    let index = 0, score = 0, answered = false;

    function bestKey() {
        const u = getSolarisUser();
        return u ? "solarisQuizBest:" + u.email : null;
    }
    function getBest() {
        const k = bestKey();
        if (!k) return null;
        try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; }
    }

    function renderStart() {
        const best = getBest();
        const user = getSolarisUser();
        box.innerHTML =
            '<p class="quiz-meta">' + QUESTIONS.length + ' questions · about 2 minutes</p>' +
            (best ? '<p class="quiz-meta">Your best score: <strong>' + best.score + '/' + best.total + '</strong></p>' : '') +
            (!user ? '<p class="quiz-meta">Create an account to save your results.</p>' : '') +
            '<button type="button" class="quiz-btn" data-action="start">Start quiz</button>';
    }

    function renderQuestion() {
        const item = QUESTIONS[index];
        answered = false;
        const pct = Math.round((index / QUESTIONS.length) * 100);
        box.innerHTML =
            '<div class="quiz-progress"><div style="width:' + pct + '%"></div></div>' +
            '<p class="quiz-meta">Question ' + (index + 1) + ' of ' + QUESTIONS.length + '</p>' +
            '<h3 class="quiz-question">' + escapeHTML(item.q) + '</h3>' +
            '<div class="quiz-options">' +
            item.o.map(function (opt, i) {
                return '<button type="button" class="quiz-option" data-choice="' + i + '">' + escapeHTML(opt) + '</button>';
            }).join("") +
            '</div>' +
            '<div class="quiz-feedback" id="quizFeedback"></div>' +
            '<button type="button" class="quiz-btn d-none" data-action="next">' +
            (index === QUESTIONS.length - 1 ? "See results" : "Next question") + '</button>';
    }

    function renderResult() {
        const total = QUESTIONS.length;
        const user = getSolarisUser();
        let note = "";
        if (user) {
            const prev = getBest();
            if (!prev || score > prev.score) {
                try {
                    localStorage.setItem(bestKey(), JSON.stringify({ score: score, total: total, date: new Date().toISOString() }));
                } catch (e) {}
                note = prev ? "New personal best saved!" : "Result saved to your account.";
            } else {
                note = "Your best score is still " + prev.score + "/" + total + ".";
            }
        } else {
            note = "Create an account to save your results.";
        }
        const msg = score === total ? "Perfect score. You're heat-safe!"
                  : score >= total * 0.6 ? "Nice work. You know your heat safety."
                  : "Good start. Have another look at the Information and Staying Safe pages.";
        box.innerHTML =
            '<div class="quiz-progress"><div style="width:100%"></div></div>' +
            '<h3 class="quiz-question">You scored ' + score + ' / ' + total + '</h3>' +
            '<p class="quiz-meta">' + msg + '</p>' +
            '<p class="quiz-meta"><strong>' + note + '</strong></p>' +
            (!user ? '<button type="button" class="quiz-btn quiz-btn-alt" data-action="register">Create account</button> ' : '') +
            '<button type="button" class="quiz-btn" data-action="start">Try again</button>';
    }

    box.addEventListener("click", function (e) {
        const btn = e.target.closest("button");
        if (!btn) return;

        if (btn.dataset.action === "start") { index = 0; score = 0; renderQuestion(); return; }
        if (btn.dataset.action === "next") {
            index++;
            index < QUESTIONS.length ? renderQuestion() : renderResult();
            return;
        }
        if (btn.dataset.action === "register") {
            const modalEl = document.getElementById("registerModal");
            if (modalEl && window.bootstrap) bootstrap.Modal.getOrCreateInstance(modalEl).show();
            return;
        }

        if (btn.dataset.choice !== undefined && !answered) {
            answered = true;
            const choice = Number(btn.dataset.choice);
            const item = QUESTIONS[index];
            const correct = choice === item.a;
            if (correct) score++;

            box.querySelectorAll(".quiz-option").forEach(function (b, i) {
                b.disabled = true;
                if (i === item.a) b.classList.add("is-correct");
                else if (i === choice) b.classList.add("is-wrong");
            });
            document.getElementById("quizFeedback").innerHTML =
                "<strong>" + (correct ? "Correct!" : "Not quite.") + "</strong> " + escapeHTML(item.e);
            box.querySelector('[data-action="next"]').classList.remove("d-none");
        }
    });

    // Refresh start screen if the user registers while the quiz is idle
    ["solaris:login", "solaris:logout"].forEach(function (evt) {
        document.addEventListener(evt, function () {
            if (box.querySelector('[data-action="start"]') && !box.querySelector(".quiz-option")) renderStart();
        });
    });

    renderStart();
});

/* =========================================================
   COMMUNITY HEAT MAP  (safety.html -> #mappies)
   Google Maps JavaScript API. Reports are saved in this
   browser's localStorage.
   ========================================================= */

const GOOGLE_MAPS_API_KEY = "AIzaSyAAbgTZyNo2xIogHQtYyVShouGZg6n07Yw";

(function () {
    let started = false;

    document.addEventListener("DOMContentLoaded", function () {
        const section = document.getElementById("mappies");
        if (!section) return;
        const box = section.querySelector(".img-placeholder");
        if (!box) return;

        // Hand-off to Google's loader callback
        window.initSolarisMap = function () { buildMap(section, box); };
        window.gm_authFailure = function () {
            showMapMessage(box, "Google Maps rejected the API key. Check the key, that the Maps JavaScript API is enabled, and that billing and referrer restrictions allow this site.");
        };

        if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === "PLACEHOLDER_KEY") {
            showMapMessage(box, "Map not active yet: add your Google Maps API key to GOOGLE_MAPS_API_KEY at the bottom of script.js.");
            return;
        }

        const s = document.createElement("script");
        s.src = "https://maps.googleapis.com/maps/api/js?key=" + encodeURIComponent(GOOGLE_MAPS_API_KEY) +
                "&callback=initSolarisMap&loading=async&v=weekly";
        s.async = true;
        s.onerror = function () { showMapMessage(box, "Could not load Google Maps. Check your internet connection."); };
        document.head.appendChild(s);
    });

    function showMapMessage(box, text) {
        const note = document.createElement("div");
        note.className = "map-message";
        note.textContent = text;
        box.appendChild(note);
    }

    const LEVELS = {
        warm:    { label: "Warm",         color: "#f8c059" },
        hot:     { label: "Hot",          color: "#e2662a" },
        extreme: { label: "Extreme heat", color: "#c0392b" }
    };
    const STORE_KEY = "solarisHeatReports";

    function loadReports() {
        try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch (e) { return []; }
    }
    function saveReports(list) {
        try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (e) {}
    }

    function buildMap(section, box) {
        if (started) return;
        started = true;

        box.innerHTML = '<div id="solarisMap" style="width:100%;height:100%;border-radius:12px;"></div>';

        // Toolbar above the map
        const bar = document.createElement("div");
        bar.className = "map-toolbar";
        bar.innerHTML =
            '<span class="map-hint"><i class="bi bi-cursor"></i> Click the map to report a hot spot</span>' +
            '<span class="map-count" id="mapCount"></span>' +
            '<button type="button" class="btn btn-sm btn-outline-secondary" id="mapLocate"><i class="bi bi-crosshair"></i> My location</button>' +
            '<button type="button" class="btn btn-sm btn-outline-danger" id="mapClear"><i class="bi bi-trash"></i> Clear reports</button>';
        box.parentNode.insertBefore(bar, box);

        const map = new google.maps.Map(document.getElementById("solarisMap"), {
            center: { lat: 14.5995, lng: 120.9842 }, // Metro Manila
            zoom: 11,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            clickableIcons: false
        });

        const info = new google.maps.InfoWindow();
        let reports = loadReports();
        const markers = {};
        let draftMarker = null;

        function iconFor(level) {
            return {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 11,
                fillColor: (LEVELS[level] || LEVELS.hot).color,
                fillOpacity: 0.92,
                strokeColor: "#ffffff",
                strokeWeight: 2.5
            };
        }

        function updateCount() {
            document.getElementById("mapCount").textContent =
                reports.length + (reports.length === 1 ? " report" : " reports");
        }

        function reportContent(r) {
            const el = document.createElement("div");
            el.className = "map-info";
            const when = new Date(r.time).toLocaleString();
            el.innerHTML =
                '<strong>' + escapeHTML(r.place || "Reported hot spot") + '</strong>' +
                '<div><span class="map-badge" style="background:' + LEVELS[r.level].color + '">' + LEVELS[r.level].label + '</span>' +
                (r.temp !== "" && r.temp !== null ? ' <span>' + escapeHTML(r.temp) + '°C reported</span>' : '') + '</div>' +
                (r.notes ? '<p>' + escapeHTML(r.notes) + '</p>' : '') +
                '<small>' + escapeHTML(r.by) + ' · ' + escapeHTML(when) + '</small>' +
                '<div class="map-info-note">Unverified community report</div>' +
                '<button type="button" class="map-remove">Remove report</button>';
            el.querySelector(".map-remove").addEventListener("click", function () {
                reports = reports.filter(function (x) { return x.id !== r.id; });
                saveReports(reports);
                markers[r.id].setMap(null);
                delete markers[r.id];
                info.close();
                updateCount();
            });
            return el;
        }

        function addMarker(r) {
            const m = new google.maps.Marker({
                position: { lat: r.lat, lng: r.lng },
                map: map,
                icon: iconFor(r.level),
                title: r.place || "Reported hot spot"
            });
            m.addListener("click", function () {
                clearDraft();
                info.setContent(reportContent(r));
                info.open(map, m);
            });
            markers[r.id] = m;
        }

        function clearDraft() {
            if (draftMarker) { draftMarker.setMap(null); draftMarker = null; }
        }

        function formContent(latLng) {
            const el = document.createElement("form");
            el.className = "map-info map-form";
            el.noValidate = true;
            el.innerHTML =
                '<strong>Report a hot spot</strong>' +
                '<label>Place name<input type="text" name="place" maxlength="60" placeholder="e.g. Bus stop on Rizal Ave"></label>' +
                '<label>How hot is it?<select name="level">' +
                    '<option value="warm">Warm</option><option value="hot" selected>Hot</option><option value="extreme">Extreme heat</option>' +
                '</select></label>' +
                '<label>Temperature in °C (optional)<input type="number" name="temp" min="20" max="70" step="0.1" placeholder="e.g. 41"></label>' +
                '<label>Notes<textarea name="notes" rows="2" maxlength="200" placeholder="No shade, no water nearby..."></textarea></label>' +
                '<div class="map-error"></div>' +
                '<button type="submit" class="map-submit">Submit report</button>';

            el.addEventListener("submit", function (e) {
                e.preventDefault();
                const f = el.elements;
                const err = el.querySelector(".map-error");
                const temp = f.temp.value.trim();

                if (temp !== "" && (isNaN(temp) || Number(temp) < 20 || Number(temp) > 70)) {
                    err.textContent = "Temperature must be between 20 and 70 °C.";
                    return;
                }
                if (f.place.value.trim() === "" && f.notes.value.trim() === "") {
                    err.textContent = "Please add a place name or a note.";
                    return;
                }

                const user = getSolarisUser();
                const r = {
                    id: Date.now() + "-" + Math.random().toString(36).slice(2, 7),
                    lat: latLng.lat(),
                    lng: latLng.lng(),
                    place: f.place.value.trim(),
                    level: f.level.value,
                    temp: temp,
                    notes: f.notes.value.trim(),
                    by: user ? user.name : "Anonymous",
                    time: Date.now()
                };
                
                reports.push(r);
                saveReports(reports);
                addMarker(r);
                clearDraft();
                info.close();
                updateCount();
            });
            return el;
        }
        
        // Complete the map logic
        map.addListener("click", function (e) {
            clearDraft();
            draftMarker = new google.maps.Marker({
                position: e.latLng,
                map: map,
                opacity: 0.6
            });
            info.setContent(formContent(e.latLng));
            info.open(map, draftMarker);
        });

        // Initialize markers from storage
        reports.forEach(addMarker);
        updateCount();

        // Clear reports feature
        document.getElementById("mapClear").addEventListener("click", function () {
            if (confirm("Are you sure you want to clear all hot spot reports?")) {
                Object.keys(markers).forEach(id => markers[id].setMap(null));
                reports = [];
                saveReports([]);
                info.close();
                updateCount();
            }
        });

        // Geolocation feature
        document.getElementById("mapLocate").addEventListener("click", function () {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    map.setCenter(pos);
                    map.setZoom(14);
                });
            }
        });
    }
})();
