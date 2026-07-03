// analytics.js
const STATS_API_URL = "https://script.google.com/macros/s/AKfycbx-j0vikdB-ZEhvqxXg5ZOpS-5USn2M1_ikAQ75eWOZ3h8Bg80v5UtkIBkD1DqO2oy64w/exec";

window.logPageStat = function(eventAction = "Page View", customTicker = "N/A") {
    // 1. Check if the site is running locally (VS Code Live Server uses localhost or 127.0.0.1)
    const isLocalhost = Boolean(
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.protocol === 'file:' // Blocks it if you just double-click the HTML file
    );

    const now = new Date();
    
    // Format date: dd/mm/yyyy
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = now.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    
    // Format time: HH:mm (24-hour)
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;

    // Payload now contains 4 separate fields
    const payload = {
        date: formattedDate,
        time: formattedTime,
        ticker: customTicker.toUpperCase(),
        platform: navigator.platform
    };

    // 2. If it's localhost, log to console but DON'T send to Google Sheets
    if (isLocalhost) {
        console.log(`[Local Development] Log blocked. Would have sent: ${customTicker} on ${formattedDate}`);
        return; // Exits the function early
    }

    // 3. This will only run when uploaded to GitHub
    fetch(STATS_API_URL, {
        method: "POST",
        mode: "no-cors", 
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
    .then(() => console.log(`Successfully logged: ${customTicker} on ${formattedDate} at ${formattedTime}`))
    .catch(err => console.error("Tracking network error:", err));
};