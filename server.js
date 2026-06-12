const express = require('express');
const path = require('path');
const { db, init: initDb } = require('./database');
const QRCode = require('qrcode');
const useragent = require('useragent');
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

initDb();

const generateQRId = () => crypto.randomBytes(8).toString('hex');
const generateShortCode = () => crypto.randomBytes(4).toString('hex').slice(0, 8);

const QR_TYPES = {
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
  crypto: 'Crypto Wallet',
  text: 'Plain Text'
};

const validateUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const encodeForUrl = (value) => encodeURIComponent(value || '');

const buildQRData = (data) => {
  const type = data.qrType;

  switch (type) {
    case 'wifi':
      return `WIFI:T:${data.security || 'WPA'};S:${data.ssid || ''};P:${data.password || ''};H:${data.hidden === 'true' ? 'true' : 'false'};;`;

    case 'vcard':
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${data.fullName || ''}`,
        `ORG:${data.organization || ''}`,
        `TITLE:${data.jobTitle || ''}`,
        `TEL;TYPE=CELL:${data.phone || ''}`,
        `EMAIL:${data.email || ''}`,
        `URL:${data.website || ''}`,
        `ADR;TYPE=WORK:;;${data.address || ''};;;;`,
        `NOTE:${data.note || ''}`,
        'END:VCARD'
      ].join('\n');

    case 'whatsapp':
      return `https://wa.me/${(data.phone || '').replace(/[^0-9]/g, '')}?text=${encodeForUrl(data.message || '')}`;

    case 'email':
      return `mailto:${data.email || ''}?subject=${encodeForUrl(data.subject || '')}&body=${encodeForUrl(data.body || '')}`;

    case 'sms':
      return `sms:${(data.phone || '').replace(/[^0-9]/g, '')}?body=${encodeForUrl(data.message || '')}`;

    case 'phone':
      return `tel:${(data.phone || '').replace(/[^0-9]/g, '')}`;

    case 'youtube':
      return data.url;

    case 'maps':
      return `https://www.google.com/maps/search/?api=1&query=${encodeForUrl(data.query || data.address || '')}`;

    case 'social':
      return data.url;

    case 'menu':
      return data.url;

    case 'pdf':
      return data.url;

    case 'image':
      return data.url;

    case 'coupon':
      return data.url || `COUPON:${data.code || ''}`;

    case 'feedback':
      return data.url;

    case 'event':
      return data.url;

    case 'location': {
      const lat = data.latitude;
      const lng = data.longitude;
      if (lat && lng) {
        return `geo:${lat},${lng}`;
      }
      return `https://www.google.com/maps/search/?api=1&query=${encodeForUrl(data.name || data.address || '')}`;
    }

    case 'spotify':
      return data.url;

    case 'appstore':
      return data.url;

    case 'crypto':
      if (data.currency === 'bitcoin') {
        return `bitcoin:${data.address || ''}?amount=${data.amount || ''}&label=${encodeForUrl(data.label || '')}`;
      }
      if (data.currency === 'ethereum') {
        return `ethereum:${data.address || ''}?value=${data.amount || ''}`;
      }
      return data.address || '';

    case 'text':
      return data.text || '';

    case 'url':
    default:
      return data.url;
  }
};

const validateQRData = (data) => {
  const type = data.qrType;

  switch (type) {
    case 'wifi':
      if (!data.ssid) return 'WiFi network name is required';
      break;

    case 'vcard':
      if (!data.fullName && !data.phone && !data.email) return 'At least one vCard field is required';
      break;

    case 'whatsapp':
      if (!data.phone) return 'WhatsApp phone number is required';
      break;

    case 'email':
      if (!data.email) return 'Email address is required';
      break;

    case 'sms':
      if (!data.phone) return 'Phone number is required';
      break;

    case 'phone':
      if (!data.phone) return 'Phone number is required';
      break;

    case 'youtube':
      if (!validateUrl(data.url)) return 'Valid YouTube URL is required';
      break;

    case 'maps':
      if (!data.query && !data.address) return 'Location or address is required';
      break;

    case 'social':
      if (!validateUrl(data.url)) return 'Valid social media URL is required';
      break;

    case 'menu':
      if (!validateUrl(data.url)) return 'Valid menu URL is required';
      break;

    case 'pdf':
      if (!validateUrl(data.url)) return 'Valid PDF URL is required';
      break;

    case 'image':
      if (!validateUrl(data.url)) return 'Valid image URL is required';
      break;

    case 'coupon':
      if (!data.url && !data.code) return 'Coupon URL or code is required';
      break;

    case 'feedback':
      if (!validateUrl(data.url)) return 'Valid feedback form URL is required';
      break;

    case 'event':
      if (!validateUrl(data.url)) return 'Valid event URL is required';
      break;

    case 'location':
      if (!data.latitude && !data.longitude && !data.name && !data.address) return 'Location details are required';
      break;

    case 'spotify':
      if (!validateUrl(data.url)) return 'Valid Spotify URL is required';
      break;

    case 'appstore':
      if (!validateUrl(data.url)) return 'Valid app store URL is required';
      break;

    case 'crypto':
      if (!data.address) return 'Wallet address is required';
      break;

    case 'text':
      if (!data.text) return 'Text content is required';
      break;

    case 'url':
    default:
      if (!validateUrl(data.url)) return 'Valid URL is required';
      break;
  }

  return null;
};

const getLocationFromIP = async (ip) => {
  try {
    const response = await axios.get(`http://ip-api.com/json/${ip}`, { timeout: 3000 });
    if (response.data.status === 'success') {
      return { country: response.data.country, city: response.data.city };
    }
  } catch (e) {
    console.error('Geolocation error:', e);
  }
  return { country: 'Unknown', city: 'Unknown' };
};

const parseUserAgent = (uaString) => {
  const agent = useragent.parse(uaString);
  const device = agent.device.family.toLowerCase().includes('mobile') || agent.os.family.toLowerCase().includes('iphone') ? 'mobile' :
                 agent.device.family.toLowerCase().includes('tablet') || agent.os.family.toLowerCase().includes('ipad') ? 'tablet' : 'desktop';
  return {
    device,
    browser: agent.family,
    os: agent.os.family,
    version: agent.os.major ? `${agent.os.major}.${agent.os.minor || 0}` : ''
  };
};

const getMpesaConfig = () => ({
  consumerKey: process.env.MPESA_CONSUMER_KEY || '',
  consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
  environment: process.env.MPESA_ENVIRONMENT || 'sandbox'
});

const getMpesaBaseUrl = () => {
  const config = getMpesaConfig();
  return config.environment === 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke';
};

const getMpesaToken = async () => {
  const config = getMpesaConfig();
  if (!config.consumerKey || !config.consumerSecret) {
    throw new Error('M-Pesa credentials not configured. Set MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET in .env file.');
  }

  const auth = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString('base64');
  const response = await axios.get(`${getMpesaBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` }
  });
  return response.data.access_token;
};

const generateDynamicQR = async (data) => {
  const trxCode = data.paymentType === 'paybill' ? 'PB' :
                  data.paymentType === 'till' ? 'BG' :
                  data.paymentType === 'pochi' ? 'SM' : 'BG';

  const token = await getMpesaToken();
  const response = await axios.post(
    `${getMpesaBaseUrl()}/mpesa/qrcode/v1/generate`,
    {
      MerchantName: data.title || 'Musty Corporations',
      RefNo: data.reference || `QR-${Date.now()}`,
      Amount: data.amount || 1,
      TrxCode: trxCode,
      CPI: data.number,
      Size: '300'
    },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  return response.data.QRCode;
};

app.get('/api/qr/types', (req, res) => {
  res.json(QR_TYPES);
});

app.post('/api/qr/create', async (req, res) => {
  const data = req.body;
  const qrType = data.qrType || 'url';
  const title = data.title || QR_TYPES[qrType] || 'QR Code';
  const qrData = buildQRData(data);
  const validationError = validateQRData(data);

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const qr_id = generateQRId();
  const short_code = generateShortCode();

  db.get('SELECT COUNT(*) as count FROM qr_codes', (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    if (row.count >= 10) {
      return res.status(403).json({ error: 'Limit reached (10 QR codes). Contact admin.' });
    }

    db.run(
      'INSERT INTO qr_codes (qr_id, original_url, qr_url, short_code, title, qr_type, amount, paybill_number, till_number, pochi_number, reference) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [qr_id, qrData, qrData, short_code, title, qrType, data.amount || null, null, null, null, data.reference || null],
      function (err) {
        if (err) return res.status(500).json({ error: 'Failed to create QR code' });
        res.json({ id: this.lastID, qr_id, short_code, url: qrData, title, qrType });
      }
    );
  });
});

app.post('/api/mpesa/create', async (req, res) => {
  const { paymentType, number, amount, reference, title } = req.body;

  if (!paymentType || !['paybill', 'till', 'pochi'].includes(paymentType)) {
    return res.status(400).json({ error: 'Payment type is required (paybill, till, or pochi)' });
  }

  if (!number) {
    return res.status(400).json({ error: 'Payment number is required' });
  }

  const qr_id = generateQRId();
  const short_code = generateShortCode();
  const titleFinal = title || `${paymentType.charAt(0).toUpperCase() + paymentType.slice(1)} Payment`;

  db.get('SELECT COUNT(*) as count FROM qr_codes', (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    if (row.count >= 10) {
      return res.status(403).json({ error: 'Limit reached (10 QR codes). Contact admin.' });
    }

    db.run(
      'INSERT INTO qr_codes (qr_id, original_url, qr_url, short_code, title, qr_type, payment_type, amount, paybill_number, till_number, pochi_number, reference) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [qr_id, null, null, short_code, titleFinal, 'mpesa', paymentType, amount ? parseFloat(amount) : null, paymentType === 'paybill' ? number : null, paymentType === 'till' ? number : null, paymentType === 'pochi' ? number : null, reference || null],
      async function (err) {
        if (err) return res.status(500).json({ error: 'Failed to create QR code' });

        try {
          const qrBase64 = await generateDynamicQR({ paymentType, number, amount, reference, title: titleFinal });
          db.run('UPDATE qr_codes SET original_url = ?, qr_url = ? WHERE id = ?', [qrBase64, qrBase64, this.lastID]);
          res.json({ id: this.lastID, qr_id, short_code, url: qrBase64, title: titleFinal, paymentType });
        } catch (e) {
          res.status(500).json({ error: e.message });
        }
      }
    );
  });
});

app.get('/api/qr/list', (req, res) => {
  db.all('SELECT id, qr_id, short_code, original_url, qr_url, title, total_clicks, created_at, qr_type, payment_type, amount, paybill_number, till_number, pochi_number, reference FROM qr_codes ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

app.get('/api/qr/:id/stats', (req, res) => {
  const { id } = req.params;

  db.get('SELECT id, qr_id, short_code, original_url, qr_url, title, total_clicks, created_at, qr_type, payment_type, amount FROM qr_codes WHERE id = ?', [id], (err, qr) => {
    if (err || !qr) return res.status(404).json({ error: 'QR code not found' });

    const stats = {};
    const queries = [
      `SELECT date(timestamp) as date, COUNT(*) as clicks FROM analytics WHERE qr_id = ? GROUP BY date ORDER BY date DESC LIMIT 30`,
      `SELECT device_type, COUNT(*) as count FROM analytics WHERE qr_id = ? GROUP BY device_type`,
      `SELECT browser_name, COUNT(*) as count FROM analytics WHERE qr_id = ? GROUP BY browser_name ORDER BY count DESC LIMIT 10`,
      `SELECT country, city, COUNT(*) as count FROM analytics WHERE qr_id = ? GROUP BY country, city ORDER BY count DESC LIMIT 10`,
      `SELECT ip_address, user_agent, device_type, browser_name, os_name, country, city, referer, timestamp FROM analytics WHERE qr_id = ? ORDER BY timestamp DESC LIMIT 50`
    ];

    let completed = 0;
    queries.forEach((query, i) => {
      db.all(query, [id], (err, rows) => {
        if (!err) {
          switch (i) {
            case 0: stats.clicksOverTime = rows; break;
            case 1: stats.deviceBreakdown = rows; break;
            case 2: stats.browserBreakdown = rows; break;
            case 3: stats.topLocations = rows; break;
            case 4: stats.recentClicks = rows; break;
          }
        }
        if (++completed === queries.length) {
          res.json({ qr, stats });
        }
      });
    });
  });
});

app.get('/r/:shortCode', async (req, res) => {
  const { shortCode } = req.params;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  const uaString = req.headers['user-agent'] || '';
  const referer = req.headers['referer'] || '';

  db.get('SELECT * FROM qr_codes WHERE short_code = ?', [shortCode], async (err, row) => {
    if (err || !row) return res.status(404).send('QR code not found');

    const ua = parseUserAgent(uaString);
    const location = await getLocationFromIP(ip);

    db.run(
      'INSERT INTO analytics (qr_id, ip_address, user_agent, device_type, browser_name, browser_version, os_name, country, city, referer) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [row.id, ip, uaString, ua.device, ua.browser, ua.version, ua.os, location.country, location.city, referer],
      () => {
        db.run('UPDATE qr_codes SET total_clicks = total_clicks + 1 WHERE id = ?', [row.id]);
      }
    );

    res.redirect(row.original_url);
  });
});

app.delete('/api/qr/:id', (req, res) => {
  db.run('DELETE FROM qr_codes WHERE id = ?', [req.params.id], function (err) {
    if (err || this.changes === 0) return res.status(404).json({ error: 'QR code not found' });
    db.run('DELETE FROM analytics WHERE qr_id = ?', [req.params.id]);
    res.json({ success: true });
  });
});

app.get('/api/qr/:id/download', async (req, res) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');

  db.get('SELECT original_url, qr_url, qr_type FROM qr_codes WHERE id = ?', [req.params.id], async (err, row) => {
    if (err || !row) return res.status(404).send('QR code not found');

    try {
      if (row.qr_type === 'mpesa') {
        const qrBuffer = Buffer.from(row.original_url, 'base64');
        res.type('png').send(qrBuffer);
      } else {
        const qrBuffer = await QRCode.toBuffer(row.original_url, { type: 'png', margin: 2, scale: 8 });
        res.type('png').send(qrBuffer);
      }
    } catch (e) {
      res.status(500).send('Error generating QR code');
    }
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
