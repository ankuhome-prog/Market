document.addEventListener("DOMContentLoaded", function() {
  const input = document.querySelector('.search-container input[type="text"]');
  const container = document.querySelector('.search-container');

  let oldSuggestions = container.querySelector(".search-suggestions");
  if (oldSuggestions) oldSuggestions.remove();

  const suggestions = document.createElement('ul');
  suggestions.className = 'search-suggestions';
  // ... (Styles remain the same as your original code)
  suggestions.style.listStyle = 'none';
  suggestions.style.margin = '10px 0 0 0';
  suggestions.style.padding = '0';
  suggestions.style.position = 'absolute';
  suggestions.style.left = '0';
  suggestions.style.top = '100%';
  suggestions.style.background = '#fff';
  suggestions.style.width = '100%';
  suggestions.style.maxHeight = '450px';
  suggestions.style.overflowY = 'auto';
  suggestions.style.boxShadow = '0 4px 24px rgba(24,48,96,0.10)';
  suggestions.style.borderRadius = '18px';
  suggestions.style.zIndex = '999';
  suggestions.style.display = 'none';
  suggestions.style.border = '1px solid #e3e6ef';

  container.style.position = 'relative';
  container.appendChild(suggestions);

  let dataList = [];

  // Updated to fetch stock-data.json
  fetch('stock-data.json')
    .then(response => response.json())
    .then(data => {
      // Assuming the JSON is a direct array or has a specific key
      dataList = Array.isArray(data) ? data : (data.searchList || []);
    });

  input.addEventListener('input', function() {
    const val = input.value.trim().toLowerCase();
    suggestions.innerHTML = '';
    if (!val) {
      suggestions.style.display = 'none';
      return;
    }

    const filtered = dataList
      .map(item => {
        let minIdx = Infinity;
        
        // Fields to search through
        const searchFields = [
          item.companyName, 
          item.ticker, 
          item.about, 
          item.products
        ];

        searchFields.forEach(field => {
          if (field) {
            const i = field.toLowerCase().indexOf(val);
            if (i !== -1) minIdx = Math.min(minIdx, i);
          }
        });

        return minIdx !== Infinity
          ? { item, matchIndex: minIdx }
          : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.matchIndex - b.matchIndex || a.item.companyName.localeCompare(b.item.companyName))
      .slice(0, 8)
      .map(({ item }) => item);

    if (filtered.length === 0) {
      suggestions.style.display = 'none';
      return;
    }

    filtered.forEach(stock => {
      const li = document.createElement('li');
      li.style.padding = "12px 18px";
      li.style.cursor = "pointer";
      li.style.borderBottom = "1px solid #f1f2f6";
      li.style.background = "transparent";
      li.style.transition = "background 0.2s";
      li.style.fontFamily = "Montserrat, Arial, sans-serif";
      li.style.fontSize = "15px";
      li.style.fontWeight = "500";
      li.style.color = "#2d3748";
      
      // UI: Show Company Name and Ticker
      li.innerHTML = `<span style="color: #1a202c;">${stock.companyName}</span> <small style="color: #718096; margin-left: 8px;">${stock.ticker}</small>`;
      
      li.addEventListener("mousedown", function() {
        const ticker = stock.ticker || stock.companyName;
        window.location.href = 'demo.html?ticker=' + encodeURIComponent(ticker);
        input.value = '';
        suggestions.style.display = 'none';
      });

      li.addEventListener("mouseover", () => li.style.background = "#f5f8fd");
      li.addEventListener("mouseout", () => li.style.background = "transparent");
      
      suggestions.appendChild(li);
    });

    if (suggestions.children.length > 0) {
      suggestions.children[suggestions.children.length - 1].style.borderBottom = "none";
    }
    suggestions.style.display = 'block';
  });

  input.addEventListener('blur', function() {
    setTimeout(() => { 
      suggestions.style.display = 'none';
      input.value = ''; 
    }, 150);
  });
});