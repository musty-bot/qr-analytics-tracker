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

  try {
    const count = await db.countQRCodes();
    if (count >= 10) {
      return res.status(403).json({ error: 'Limit reached (10 QR codes). Contact admin.' });
    }

    const qr = await db.createQRCode({
      qr_id,
      original_url: qrData,
      qr_url: qrData,
      short_code,
      title,
      qr_type: qrType,
      amount: data.amount || null,
      paybill_number: null,
      till_number: null,
      pochi_number: null,
      reference: data.reference || null
    });

    res.json({ id: qr.id, qr_id, short_code, url: qrData, title, qrType });
  } catch (e) {
    console.error('Create QR error:', e);
    res.status(500).json({ error: 'Failed to create QR code' });
  }
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

  try {
    const count = await db.countQRCodes();
    if (count >= 10) {
      return res.status(403).json({ error: 'Limit reached (10 QR codes). Contact admin.' });
    }

    const qr = await db.createQRCode({
      qr_id,
      original_url: null,
      qr_url: null,
      short_code,
      title: titleFinal,
      qr_type: 'mpesa',
      payment_type: paymentType,
      amount: amount ? parseFloat(amount) : null,
      paybill_number: paymentType === 'paybill' ? number : null,
      till_number: paymentType === 'till' ? number : null,
      pochi_number: paymentType === 'pochi' ? number : null,
      reference: reference || null
    });

    const qrBase64 = await generateDynamicQR({ paymentType, number, amount, reference, title: titleFinal });
    await db.updateQRCode(qr.id, { original_url: qrBase64, qr_url: qrBase64 });

    res.json({ id: qr.id, qr_id, short_code, url: qrBase64, title: titleFinal, paymentType });
  } catch (e) {
    console.error('M-Pesa QR error:', e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/qr/list', async (req, res) => {
  try {
    const rows = await db.getQRCodes();
    res.json(rows);
  } catch (e) {
    console.error('List QR error:', e);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/qr/:id/stats', async (req, res) => {
  const { id } = req.params;

  try {
    const qr = await db.getQRCodeById(id);
    if (!qr) return res.status(404).json({ error: 'QR code not found' });

    const analytics = await db.getAnalytics(id);

    const stats = {
      clicksOverTime: [],
      deviceBreakdown: [],
      browserBreakdown: [],
      topLocations: [],
      recentClicks: analytics
    };

    const clicksByDate = {};
    const deviceCounts = {};
    const browserCounts = {};
    const locationCounts = {};

    analytics.forEach(click => {
      const date = new Date(click.timestamp).toISOString().split('T')[0];
      clicksByDate[date] = (clicksByDate[date] || 0) + 1;

      deviceCounts[click.device_type] = (deviceCounts[click.device_type] || 0) + 1;
      browserCounts[click.browser_name] = (browserCounts[click.browser_name] || 0) + 1;

      const locKey = `${click.country}, ${click.city}`;
      locationCounts[locKey] = (locationCounts[locKey] || 0) + 1;
    });

    stats.clicksOverTime = Object.entries(clicksByDate)
      .map(([date, clicks]) => ({ date, clicks }))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 30);

    stats.deviceBreakdown = Object.entries(deviceCounts)
      .map(([device_type, count]) => ({ device_type, count }));

    stats.browserBreakdown = Object.entries(browserCounts)
      .map(([browser_name, count]) => ({ browser_name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    stats.topLocations = Object.entries(locationCounts)
      .map(([loc, count]) => {
        const [country, city] = loc.split(', ');
        return { country, city, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json({ qr, stats });
  } catch (e) {
    console.error('Stats error:', e);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/r/:shortCode', async (req, res) => {
  const { shortCode } = req.params;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  const uaString = req.headers['user-agent'] || '';
  const referer = req.headers['referer'] || '';

  try {
    const row = await db.getQRCodeByShortCode(shortCode);
    if (!row) return res.status(404).send('QR code not found');

    const ua = parseUserAgent(uaString);
    const location = await getLocationFromIP(ip);

    await db.addAnalytics({
      qr_id: row.id,
      ip_address: ip,
      user_agent: uaString,
      device_type: ua.device,
      browser_name: ua.browser,
      browser_version: ua.version,
      os_name: ua.os,
      country: location.country,
      city: location.city,
      referer
    });

    await db.incrementClicks(row.id);

    res.redirect(row.original_url);
  } catch (e) {
    console.error('Redirect error:', e);
    res.status(500).send('Error processing QR code');
  }
});

app.delete('/api/qr/:id', async (req, res) => {
  try {
    await db.deleteQRCode(req.params.id);
    res.json({ success: true });
  } catch (e) {
    console.error('Delete QR error:', e);
    res.status(404).json({ error: 'QR code not found' });
  }
});

app.get('/api/qr/:id/download', async (req, res) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');

  try {
    const row = await db.getQRCodeById(req.params.id);
    if (!row) return res.status(404).send('QR code not found');

    if (row.qr_type === 'mpesa') {
      const qrBuffer = Buffer.from(row.original_url, 'base64');
      res.type('png').send(qrBuffer);
    } else {
      const qrBuffer = await QRCode.toBuffer(row.original_url, { type: 'png', margin: 2, scale: 8 });
      res.type('png').send(qrBuffer);
    }
  } catch (e) {
    console.error('Download error:', e);
    res.status(500).send('Error generating QR code');
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
