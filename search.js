document.addEventListener("DOMContentLoaded", function() {
  const input = document.querySelector('.search-container input[type="text"]');
  const container = document.querySelector('.search-container');

  // Remove any old suggestion box if it existed
  let oldSuggestions = container.querySelector(".search-suggestions");
  if (oldSuggestions) oldSuggestions.remove();

  // Create a nicely styled suggestions box
  const suggestions = document.createElement('ul');
  suggestions.className = 'search-suggestions';
  suggestions.style.listStyle = 'none';
  suggestions.style.margin = '10px 0 0 0';
  suggestions.style.padding = '0';
  suggestions.style.position = 'absolute';
  suggestions.style.left = '0';
  suggestions.style.top = '100%';
  suggestions.style.background = '#fff';
  suggestions.style.width = '100%';
  suggestions.style.maxHeight = '260px';
  suggestions.style.overflowY = 'auto';
  suggestions.style.boxShadow = '0 4px 24px rgba(24,48,96,0.10)';
  suggestions.style.borderRadius = '18px';
  suggestions.style.zIndex = '999';
  suggestions.style.display = 'none';
  suggestions.style.border = '1px solid #e3e6ef'; // Subtle border for pop effect

  // Ensure .search-container has relative positioning
  container.style.position = 'relative';
  container.appendChild(suggestions);

  let dataList = [];

  fetch('search-data.json')
    .then(response => response.json())
    .then(data => {
      dataList = data.searchList || [];
    });

  input.addEventListener('input', function() {
    const val = input.value.trim().toLowerCase();
    suggestions.innerHTML = '';
    if (!val) {
      suggestions.style.display = 'none';
      return;
    }

    // Find matches and compute the earliest index of occurrence
    const filtered = dataList
      .map(item => {
        // Find where 'val' occurs in name, ticker, or aliases
        let minIdx = Infinity;
        if (item.name) {
          const i = item.name.toLowerCase().indexOf(val);
          if (i !== -1) minIdx = Math.min(minIdx, i);
        }
        if (item.ticker) {
          const i = item.ticker.toLowerCase().indexOf(val);
          if (i !== -1) minIdx = Math.min(minIdx, i);
        }
        if (item.aliases) {
          item.aliases.forEach(alias => {
            const i = alias.toLowerCase().indexOf(val);
            if (i !== -1) minIdx = Math.min(minIdx, i);
          });
        }
        return minIdx !== Infinity
          ? { item, matchIndex: minIdx }
          : null;
      })
      .filter(Boolean)
      // Sort by earliest match (lowest index), then by name for ties
      .sort((a, b) => a.matchIndex - b.matchIndex || a.item.name.localeCompare(b.item.name))
      .slice(0, 6)
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
      // Modern font styles
      li.style.fontFamily = "Montserrat, Arial, sans-serif";
      li.style.fontSize = "15px";
      li.style.fontWeight = "500";
      li.style.color = "#2d3748";
      li.innerHTML = `${stock.name}`;
      li.addEventListener("mousedown", function() {
  input.value = stock.ticker || stock.name;
  suggestions.style.display = 'none';
  input.value = '';

  // Use encodeURIComponent to ensure safe URLs
  const ticker = stock.ticker || stock.name;
  window.location.href = 'demo.html?ticker=' + encodeURIComponent(ticker);
});
      li.addEventListener("mouseover", function() {
        li.style.background = "#f5f8fd";
      });
      li.addEventListener("mouseout", function() {
        li.style.background = "transparent";
      });
      suggestions.appendChild(li);
    });

    // Remove last border
    if (suggestions.children.length > 0) {
      suggestions.children[suggestions.children.length - 1].style.borderBottom = "none";
    }
    suggestions.style.display = 'block';
  });

  // Hide suggestions when input loses focus
  input.addEventListener('blur', function() {
    setTimeout(() => { suggestions.style.display = 'none';input.value = ''; }, 100);
  });
});
