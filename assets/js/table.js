const apiKey = 'Z4ZXb0nUnTMOq6cljxbN1cFD0mk6kLaQBzkqehf3';
const urlParams = new URLSearchParams(window.location.search);
const parkCode = urlParams.get('parkCode');

// Select the iframe element
const iframe = document.getElementsByClassName('cesium-infoBox-iframe')[0];

// Set up a MutationObserver to watch for changes in the 'sandbox' attribute
const observer = new MutationObserver(() => {
  if (iframe.hasAttribute('sandbox')) {
    // Modify the sandbox attribute to include necessary permissions
    iframe.setAttribute(
      'sandbox',
      'allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation allow-popups-to-escape-sandbox'
    );
  }
});

// Start observing changes to the 'sandbox' attribute
observer.observe(iframe, { attributes: true, attributeFilter: ['sandbox'] });

// Trigger a refresh of the iframe to apply the new sandbox settings
viewer.infoBox.frame.src = 'about:blank';

// List of excluded attributes to skip during rendering
const excludedAttributes = [
  'id', 'images', 'states', 'latLong', 'parkCode', 'latitude', 'longitude', 'name', 'directionsUrl', 'multimedia', 'relevanceScore'
];

// Fetch park data and populate the table
if (parkCode) {
  fetch(`https://developer.nps.gov/api/v1/parks?parkCode=${parkCode}&api_key=${apiKey}`)
    .then(response => response.json())
    .then(data => {
      const table = document.getElementById('parkTable');
      const loadingDiv = document.getElementById('loading');

      if (data.data && data.data.length > 0) {
        const park = data.data[0];
        const tbody = table.querySelector('tbody');

        // Add data rows
        Object.entries(park).forEach(([key, value]) => {
          if (excludedAttributes.includes(key)) return;

          const row = document.createElement('tr');
          const keyCell = document.createElement('td');
          const valueCell = document.createElement('td');

          keyCell.textContent = key;

          if (key === 'addresses' && Array.isArray(value)) {
            const list = document.createElement('ul');
            value.forEach(address => {
              const listItem = document.createElement('li');
              listItem.textContent = `${address.line1}, ${address.city}, ${address.stateCode} ${address.postalCode}`;
              list.appendChild(listItem);
            });
            valueCell.appendChild(list);
          } else if (key === 'contacts' && typeof value === 'object') {
            const contactList = document.createElement('ul');

            if (value.phoneNumbers) {
              value.phoneNumbers.forEach(phone => {
                const phoneItem = document.createElement('li');
                phoneItem.textContent = `Phone: ${phone.phoneNumber} (${phone.type})`;
                contactList.appendChild(phoneItem);
              });
            }

            if (value.emailAddresses) {
              value.emailAddresses.forEach(email => {
                const emailItem = document.createElement('li');
                emailItem.textContent = `Email: ${email.emailAddress} (${email.description})`;
                contactList.appendChild(emailItem);
              });
            }

            valueCell.appendChild(contactList);
          } else if (Array.isArray(value)) {
            const list = document.createElement('ul');
            value.forEach(item => {
              const listItem = document.createElement('li');
              listItem.textContent = item.name || item.title || item.id || JSON.stringify(item);
              list.appendChild(listItem);
            });
            valueCell.appendChild(list);
          } else if (typeof value === 'object') {
            valueCell.textContent = JSON.stringify(value, null, 2); // Pretty print objects
          } else {
            valueCell.textContent = value;
          }

          row.appendChild(keyCell);
          row.appendChild(valueCell);
          tbody.appendChild(row);
        });

        loadingDiv.style.display = 'none';
        table.style.display = 'table';
      } else {
        loadingDiv.textContent = 'No data found for this park.';
      }
    })
    .catch(error => {
      console.error('Error fetching park data:', error);
      document.getElementById('loading').textContent = 'Error loading data.';
    });
} else {
  document.getElementById('loading').textContent = 'Invalid park code.';
}
