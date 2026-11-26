// ---------- 1. LOAD YOUR FORTUNES FROM THE CSV ----------
// fetch() asks the website for fortunes.csv, which sits next to this file.
// Columns: fortune, author, source. The first row is the header.
let todaysFortune = { fortune: "Your fortune is still baking. Try again in a moment.", author: "" };

// Splits one CSV line into columns. Commas inside "quotes" don't count
// as column breaks, and "" inside quotes means a real " character.
function splitCsvLine(line) {
  const cells = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes && ch === '"' && line[i + 1] === '"') { cell += '"'; i++; }
    else if (ch === '"') { inQuotes = !inQuotes; }
    else if (ch === "," && !inQuotes) { cells.push(cell); cell = ""; }
    else { cell += ch; }
  }
  cells.push(cell);
  return cells;
}

fetch("fortunes.csv")
  .then(response => response.text())
  .then(text => {
    const fortunes = text
      .split(/\r?\n/)                     // split into lines
      .slice(1)                           // skip the header row
      .filter(line => line.trim() !== "") // skip blank lines
      .map(line => {
        const cells = splitCsvLine(line);
        return { fortune: cells[0].trim(), author: (cells[1] || "").trim() };
      });
    todaysFortune = pickFortune(fortunes);
  });

function pickFortune(fortunes) {

  // ---------- 2. GIVE THIS PHONE ITS OWN ID ----------
  // localStorage is a tiny notebook the browser keeps for this website.
  // The first visit writes a random ID; later visits read the same one back.
  let deviceId = localStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId = Math.random().toString(36).slice(2);
    localStorage.setItem("deviceId", deviceId);
  }

  // ---------- 3. PICK TODAY'S FORTUNE ----------
  // Combining the phone ID with today's date gives a "seed" that stays
  // the same all day, then changes at midnight, and differs between phones.
  const today = new Date().toLocaleDateString("en-CA"); // e.g. 2026-11-25
  const seed = deviceId + today;

  // Turn the seed text into a number (a simple "hash")
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 1000000007;
  }
  return fortunes[hash % fortunes.length];
} // end of pickFortune

// ---------- 4. REVEAL IT WHEN THE COOKIE IS TAPPED ----------
document.getElementById("cookie").addEventListener("click", function () {
  document.getElementById("fortune").textContent = todaysFortune.fortune;
  // Show "— Author" underneath, if there is one
  document.getElementById("author").textContent =
    todaysFortune.author ? "— " + todaysFortune.author : "";
  document.getElementById("cookie").style.display = "none";
  document.getElementById("hint").style.display = "none";
  document.getElementById("slip").style.display = "block";
});
