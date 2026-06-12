const CORRECT_PASSWORD = '5224';

const QR_FIELD_CONFIGS = {
  url: [
    { name: 'url', label: 'URL *', type: 'url', placeholder: 'https://example.com', required: true }
  ],
  wifi: [
    { name: 'ssid', label: 'WiFi Network Name *', type: 'text', placeholder: 'MyWiFi', required: true },
    { name: 'password', label: 'WiFi Password', type: 'password', placeholder: 'Password' },
    { name: 'security', label: 'Security Type', type: 'select', options: ['WPA', 'WEP', 'nopass'], default: 'WPA' },
    { name: 'hidden', label: 'Hidden Network', type: 'select', options: ['false', 'true'], default: 'false' }
  ],
  vcard: [
    { name: 'fullName', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
    { name: 'organization', label: 'Organization', type: 'text', placeholder: 'Company Name' },
    { name: 'jobTitle', label: 'Job Title', type: 'text', placeholder: 'Manager' },
    { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+254700000000' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com' },
    { name: 'website', label: 'Website', type: 'url', placeholder: 'https://example.com' },
    { name: 'address', label: 'Address', type: 'text', placeholder: 'Nairobi, Kenya' },
    { name: 'note', label: 'Note', type: 'text', placeholder: 'Additional info' }
  ],
  whatsapp: [
    { name: 'phone', label: 'WhatsApp Phone Number *', type: 'tel', placeholder: '+254700000000', required: true },
    { name: 'message', label: 'Pre-filled Message', type: 'text', placeholder: 'Hello, I am interested in your services' }
  ],
  email: [
    { name: 'email', label: 'Email Address *', type: 'email', placeholder: 'recipient@example.com', required: true },
    { name: 'subject', label: 'Subject', type: 'text', placeholder: 'Subject line' },
    { name: 'body', label: 'Email Body', type: 'textarea', placeholder: 'Email content' }
  ],
  sms: [
    { name: 'phone', label: 'Phone Number *', type: 'tel', placeholder: '+254700000000', required: true },
    { name: 'message', label: 'SMS Message', type: 'textarea', placeholder: 'Type your message' }
  ],
  phone: [
    { name: 'phone', label: 'Phone Number *', type: 'tel', placeholder: '+254700000000', required: true }
  ],
  youtube: [
    { name: 'url', label: 'YouTube URL *', type: 'url', placeholder: 'https://www.youtube.com/watch?v=VIDEO_ID', required: true }
  ],
  maps: [
    { name: 'query', label: 'Search Query', type: 'text', placeholder: 'Nairobi, Kenya' },
    { name: 'address', label: 'Address', type: 'text', placeholder: 'Westlands, Nairobi' }
  ],
  social: [
    { name: 'url', label: 'Social Media URL *', type: 'url', placeholder: 'https://instagram.com/username', required: true }
  ],
  menu: [
    { name: 'url', label: 'Menu URL *', type: 'url', placeholder: 'https://example.com/menu.pdf', required: true }
  ],
  pdf: [
    { name: 'url', label: 'PDF URL *', type: 'url', placeholder: 'https://example.com/document.pdf', required: true }
  ],
  image: [
    { name: 'url', label: 'Image URL *', type: 'url', placeholder: 'https://example.com/image.jpg', required: true }
  ],
  coupon: [
    { name: 'url', label: 'Coupon URL', type: 'url', placeholder: 'https://example.com/coupon' },
    { name: 'code', label: 'Coupon Code', type: 'text', placeholder: 'SAVE20' }
  ],
  feedback: [
    { name: 'url', label: 'Feedback Form URL *', type: 'url', placeholder: 'https://forms.gle/xxxxx', required: true }
  ],
  event: [
    { name: 'url', label: 'Event URL *', type: 'url', placeholder: 'https://example.com/event', required: true }
  ],
  location: [
    { name: 'latitude', label: 'Latitude', type: 'number', placeholder: '-1.2921', step: '0.000001' },
    { name: 'longitude', label: 'Longitude', type: 'number', placeholder: '36.8219', step: '0.000001' },
    { name: 'name', label: 'Location Name', type: 'text', placeholder: 'Nairobi National Park' },
    { name: 'address', label: 'Address', type: 'text', placeholder: 'Nairobi, Kenya' }
  ],
  spotify: [
    { name: 'url', label: 'Spotify URL *', type: 'url', placeholder: 'https://open.spotify.com/track/...', required: true }
  ],
  appstore: [
    { name: 'url', label: 'App Store URL *', type: 'url', placeholder: 'https://apps.apple.com/app/id...', required: true }
  ],
  crypto: [
    { name: 'currency', label: 'Cryptocurrency', type: 'select', options: ['bitcoin', 'ethereum'], default: 'bitcoin' },
    { name: 'address', label: 'Wallet Address *', type: 'text', placeholder: 'Wallet address', required: true },
    { name: 'amount', label: 'Amount (optional)', type: 'number', placeholder: '0.01', step: '0.000001' },
    { name: 'label', label: 'Label (optional)', type: 'text', placeholder: 'Payment for order #123' }
  ],
  text: [
    { name: 'text', label: 'Text Content *', type: 'textarea', placeholder: 'Enter your text here', required: true }
  ]
};

function createField(field) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-group';

  const label = document.createElement('label');
  label.htmlFor = field.name;
  label.textContent = field.label;
  wrapper.appendChild(label);

  let input;
  if (field.type === 'select') {
    input = document.createElement('select');
    input.id = field.name;
    input.name = field.name;
    field.options.forEach(option => {
      const opt = document.createElement('option');
      opt.value = option;
      opt.textContent = option;
      if (field.default === option) opt.selected = true;
      input.appendChild(opt);
    });
  } else if (field.type === 'textarea') {
    input = document.createElement('textarea');
    input.id = field.name;
    input.name = field.name;
    input.placeholder = field.placeholder || '';
    input.rows = field.rows || 3;
  } else {
    input = document.createElement('input');
    input.id = field.name;
    input.name = field.name;
    input.type = field.type || 'text';
    input.placeholder = field.placeholder || '';
    if (field.step) input.step = field.step;
  }

  if (field.required) input.required = true;
  wrapper.appendChild(input);
  return wrapper;
}

function renderFields(qrType) {
  const container = document.getElementById('dynamic-fields');
  container.innerHTML = '';
  const fields = QR_FIELD_CONFIGS[qrType] || QR_FIELD_CONFIGS.url;
  fields.forEach(field => {
    container.appendChild(createField(field));
  });
}

function getFormData() {
  const qrType = document.getElementById('qr-type').value;
  const data = {
    qrType,
    title: document.getElementById('title').value
  };

  QR_FIELD_CONFIGS[qrType].forEach(field => {
    const input = document.getElementById(field.name);
    if (input) {
      data[field.name] = input.value;
    }
  });

  return data;
}

window.copyLink = async (shortCode) => {
  const link = `${window.location.origin}/r/${shortCode}`;
  await navigator.clipboard.writeText(link);
  alert('Link copied to clipboard!');
};

window.downloadQR = (id) => {
  const a = document.createElement('a');
  a.href = `/api/qr/${id}/download?t=${Date.now()}`;
  a.download = `qr-${Date.now()}.png`;
  a.click();
};

window.deleteQR = async (id) => {
  if (!confirm('Are you sure you want to delete this QR code?')) return;
  await fetch(`/api/qr/${id}`, { method: 'DELETE' });
  loadQRCodes();
};

window.showStats = async (id) => {
  try {
    const res = await fetch(`/api/qr/${id}/stats`);
    const { qr, stats } = await res.json();

    document.getElementById('stats-container').innerHTML = `
      <div class="stat-header">
        <h2>${qr.title || 'Untitled'} <span class="payment-badge">${qr.qr_type || 'QR'}</span></h2>
        <p><strong>Short Link:</strong> <span class="short-url">${window.location.origin}/r/${qr.short_code}</span></p>
        <p><strong>Total Clicks:</strong> ${qr.total_clicks} | <strong>Created:</strong> ${new Date(qr.created_at).toLocaleDateString()}</p>
      </div>

      <div class="stats-grid">
        <div class="stat-chart">
          <h4>Clicks Over Time (Last 30 Days)</h4>
          <div class="chart-container">
            <canvas id="clicks-chart"></canvas>
          </div>
        </div>

        <div class="stat-chart">
          <h4>Device Type Breakdown</h4>
          <div class="chart-container">
            <canvas id="device-chart"></canvas>
          </div>
        </div>

        <div class="stat-chart">
          <h4>Browser Breakdown</h4>
          <div class="chart-container">
            <canvas id="browser-chart"></canvas>
          </div>
        </div>

        <div class="stat-chart">
          <h4>Top Locations</h4>
          <div id="locations-list">
            ${stats.topLocations.map(loc => `<p>${loc.country} - ${loc.city}: ${loc.count} clicks</p>`).join('') || '<p>No location data yet</p>'}
          </div>
        </div>
      </div>

      <div class="recent-clicks">
        <h4>Recent Clicks</h4>
        <table class="clicks-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Device</th>
              <th>Browser</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            ${stats.recentClicks.map(click => `
              <tr>
                <td>${new Date(click.timestamp).toLocaleString()}</td>
                <td>${click.device_type}</td>
                <td>${click.browser_name}</td>
                <td>${click.country}, ${click.city}</td>
              </tr>
            `).join('') || '<tr><td colspan="4">No clicks yet</td></tr>'}
          </tbody>
        </table>
      </div>
    `;

    renderCharts(stats);
    document.getElementById('stats-modal').classList.remove('hidden');
  } catch (err) {
    alert('Failed to load stats');
  }
};

function renderCharts(stats) {
  const clicksCtx = document.getElementById('clicks-chart').getContext('2d');
  new Chart(clicksCtx, {
    type: 'line',
    data: {
      labels: stats.clicksOverTime.map(d => d.date).reverse(),
      datasets: [{
        label: 'Clicks',
        data: stats.clicksOverTime.map(d => d.clicks).reverse(),
        borderColor: '#667eea',
        tension: 0.3,
        fill: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  });

  const deviceCtx = document.getElementById('device-chart').getContext('2d');
  new Chart(deviceCtx, {
    type: 'pie',
    data: {
      labels: stats.deviceBreakdown.map(d => d.device_type),
      datasets: [{
        data: stats.deviceBreakdown.map(d => d.count),
        backgroundColor: ['#667eea', '#28a745', '#ffc107']
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  const browserCtx = document.getElementById('browser-chart').getContext('2d');
  new Chart(browserCtx, {
    type: 'bar',
    data: {
      labels: stats.browserBreakdown.map(d => d.browser_name),
      datasets: [{
        label: 'Clicks',
        data: stats.browserBreakdown.map(d => d.count),
        backgroundColor: '#667eea'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  });
}

function truncateUrl(url) {
  return url.length > 40 ? url.slice(0, 40) + '...' : url;
}

function getQRImageSrc(qr) {
  if (qr.qr_type === 'mpesa' && qr.original_url) {
    return `data:image/png;base64,${qr.original_url}`;
  }
  return `/api/qr/${qr.id}/download?t=${Date.now()}`;
}

function getQRTypeLabel(qr) {
  if (qr.qr_type === 'mpesa') return 'M-Pesa';
  const labels = {
    url: 'URL',
    wifi: 'WiFi',
    vcard: 'vCard',
    whatsapp: 'WhatsApp',
    email: 'Email',
    sms: 'SMS',
    phone: 'Phone',
    youtube: 'YouTube',
    maps: 'Google Maps',
    social: 'Social Media',
    menu: 'Menu',
    pdf: 'PDF',
    image: 'Image',
    coupon: 'Coupon',
    feedback: 'Feedback',
    event: 'Event',
    location: 'Location',
    spotify: 'Spotify',
    appstore: 'App Store',
    crypto: 'Crypto',
    text: 'Text'
  };
  return labels[qr.qr_type] || 'QR';
}

function getQRDetails(qr) {
  switch (qr.qr_type) {
    case 'wifi':
      return `<p><strong>Network:</strong> ${qr.original_url.split(';S:')[1]?.split(';')[0] || ''}</p>`;
    case 'vcard':
      return `<p><strong>Contact:</strong> ${qr.original_url.split('FN:')[1]?.split('\n')[0] || ''}</p>`;
    case 'whatsapp':
      return `<p><strong>Phone:</strong> ${qr.original_url.split('/wa.me/')[1]?.split('?')[0] || ''}</p>`;
    case 'email':
      return `<p><strong>Email:</strong> ${qr.original_url.replace('mailto:', '').split('?')[0]}</p>`;
    case 'sms':
      return `<p><strong>Phone:</strong> ${qr.original_url.replace('sms:', '').split('?')[0]}</p>`;
    case 'phone':
      return `<p><strong>Phone:</strong> ${qr.original_url.replace('tel:', '')}</p>`;
    case 'crypto':
      return `<p><strong>Wallet:</strong> ${truncateUrl(qr.original_url.split(':')[1] || '')}</p>`;
    case 'text':
      return `<p><strong>Text:</strong> ${truncateUrl(qr.original_url)}</p>`;
    default:
      return `<p><strong>URL:</strong> <span class="original-url">${truncateUrl(qr.original_url)}</span></p>`;
  }
}

async function loadQRCodes() {
  try {
    const res = await fetch('/api/qr/list');
    const codes = await res.json();

    const qrList = document.getElementById('qr-list');
    qrList.innerHTML = '';

    codes.forEach(qr => {
      const card = document.createElement('div');
      card.className = 'qr-card';
      const typeLabel = `<span class="payment-badge">${getQRTypeLabel(qr)}</span>`;
      const amountInfo = qr.amount ? `<span>Amount: KES ${qr.amount}</span>` : '';

      card.innerHTML = `
        <h3>${qr.title || 'Untitled'} ${typeLabel}</h3>
        <div class="qr-preview">
          <img src="${getQRImageSrc(qr)}" alt="QR Code" loading="lazy">
          <div class="qr-watermark">Powered by Musty Corporations</div>
        </div>
        <div class="qr-info">
          ${getQRDetails(qr)}
          ${amountInfo}
          <p><strong>Clicks:</strong> ${qr.total_clicks} | <strong>Created:</strong> ${new Date(qr.created_at).toLocaleDateString()}</p>
        </div>
        <div class="qr-actions">
          <button class="btn-copy" onclick="copyLink('${qr.short_code}')">Copy</button>
          <button class="btn-stats" onclick="showStats(${qr.id})">Stats</button>
          <button class="btn-download" onclick="downloadQR(${qr.id})">Download</button>
          <button class="btn-delete" onclick="deleteQR(${qr.id})">Delete</button>
        </div>
      `;
      qrList.appendChild(card);
    });

    if (codes.length >= 10) {
      document.getElementById('qr-limit-warning').classList.remove('hidden');
    }
  } catch (err) {
    console.error('Failed to load QR codes:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const qrForm = document.getElementById('qr-form');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const loginForm = document.getElementById('login-form');
  const loginScreen = document.getElementById('login-screen');
  const mainApp = document.getElementById('main-app');

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;

    if (password === CORRECT_PASSWORD) {
      loginScreen.classList.add('hidden');
      mainApp.classList.remove('hidden');
      renderFields('url');
      loadQRCodes();
    } else {
      document.getElementById('login-error').classList.remove('hidden');
    }
  });

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.qr-form').forEach(f => f.classList.add('hidden'));
      document.getElementById(btn.dataset.tab).classList.remove('hidden');
    });
  });

  document.getElementById('qr-type').addEventListener('change', (e) => {
    renderFields(e.target.value);
  });

  qrForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = getFormData();

    try {
      const res = await fetch('/api/qr/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (res.ok) {
        qrForm.reset();
        renderFields('url');
        loadQRCodes();
      } else {
        if (result.error && result.error.includes('limit')) {
          document.getElementById('qr-limit-warning').classList.remove('hidden');
        }
        alert(result.error || 'Failed to create QR code');
      }
    } catch (err) {
      console.error('QR error:', err);
      alert('Network error');
    }
  });

  document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('stats-modal').classList.add('hidden');
  });

  window.addEventListener('click', (e) => {
    const statsModal = document.getElementById('stats-modal');
    if (e.target === statsModal) statsModal.classList.add('hidden');
  });
});
