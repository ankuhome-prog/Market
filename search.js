document.addEventListener("DOMContentLoaded", function() {
  const input = document.querySelector('.search-container input[type="text"]');
  const container = document.querySelector('.search-container');

  let oldSuggestions = container.querySelector(".search-suggestions");
  if (oldSuggestions) oldSuggestions.remove();

  const suggestions = document.createElement('ul');
  suggestions.className = 'search-suggestions';
  
  // Styles remain intact
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

  fetch('stock-data.json')
    .then(response => response.json())
    .then(data => {
      dataList = Array.isArray(data) ? data : (data.searchList || []);
    });

  // Strips special characters but KEEPS casing/spaces if needed
  function cleanWord(word) {
    if (!word) return '';
    return word.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  // Split string into clean, individual alphanumeric words
  function tokenizeText(str) {
    if (!str) return [];
    return str.split(/\s+/).map(cleanWord).filter(Boolean);
  }

  // Helper Function: Checks if a single search word fuzzily matches a single target word
  // (Characters must appear in the correct sequence)
  function fuzzyMatchSingleWord(searchWord, targetWord) {
    if (!searchWord) return true; // Empty search word acts as wildcard/match
    if (!targetWord) return false;
    
    let searchIdx = 0;
    let targetIdx = 0;
    
    while (searchIdx < searchWord.length && targetIdx < targetWord.length) {
      if (searchWord[searchIdx] === targetWord[targetIdx]) {
        searchIdx++;
      }
      targetIdx++;
    }
    return searchIdx === searchWord.length;
  }

  // NEW: Checks index-to-index word fuzzy matching
  // userWords[0] matches companyWords[0], userWords[1] matches companyWords[1], etc.
  function fuzzyMatchWordForWord(searchWords, targetWords) {
    if (searchWords.length > targetWords.length) return false;
    
    for (let i = 0; i < searchWords.length; i++) {
      if (!fuzzyMatchSingleWord(searchWords[i], targetWords[i])) {
        return false;
      }
    }
    return true;
  }

  // Helper Function: Removes consecutive repeated letters (e.g., "bnnk" -> "bnk")
  function removeRepeatedLetters(str) {
    return str.replace(/([a-zA-Z])\1+/g, '$1');
  }

  // Core search processor logic
  function processSearch(originalQuery) {
    const searchWords = tokenizeText(originalQuery);
    if (searchWords.length === 0) return [];

    const compressedQuery = searchWords.join('');

    return dataList
      .map(item => {
        const companyWords = tokenizeText(item.companyName);
        const tickerNorm = cleanWord(item.ticker);
        
        const aboutLower = (item.about || '').toLowerCase();
        const productsLower = (item.products || '').toLowerCase();

        let matchWeight = Infinity;

        // 1. Strict "starts with" or "includes" matching on full target names
        const companyNameNorm = companyWords.join('');
        if (companyNameNorm.startsWith(compressedQuery)) {
          matchWeight = 1;
        } else if (tickerNorm.startsWith(compressedQuery)) {
          matchWeight = 2;
        } else if (companyNameNorm.includes(compressedQuery)) {
          matchWeight = 3;
        }
        // 2. NEW: Word-for-Word Sequential Fuzzy matching
        else if (fuzzyMatchWordForWord(searchWords, companyWords)) {
          matchWeight = 4;
        } 
        // 3. Fallback: Fuzzy matching directly on ticker
        else if (fuzzyMatchSingleWord(compressedQuery, tickerNorm)) {
          matchWeight = 5;
        } 
        // 4. Strict multi-word substring fallback for About and Products
        else if (
          searchWords.every(word => aboutLower.includes(word)) || 
          searchWords.every(word => productsLower.includes(word))
        ) {
          matchWeight = 6;
        }

        if (matchWeight === Infinity) return null;

        return { item, matchWeight };
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (a.matchWeight !== b.matchWeight) {
          return a.matchWeight - b.matchWeight;
        }
        return a.item.companyName.localeCompare(b.item.companyName);
      })
      .slice(0, 8)
      .map(({ item }) => item);
  }

  input.addEventListener('input', function() {
    const originalVal = input.value;
    suggestions.innerHTML = '';
    
    if (!originalVal.trim()) {
      suggestions.style.display = 'none';
      return;
    }

    let filtered = processSearch(originalVal);

    // Fallback logic for repeated keystroke typos
    if (filtered.length === 0) {
      const cleanVal = removeRepeatedLetters(originalVal);
      if (cleanVal !== originalVal) {
        filtered = processSearch(cleanVal);
      }
    }

    if (filtered.length === 0) {
      suggestions.style.display = 'none';
      return;
    }

    // Render results
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