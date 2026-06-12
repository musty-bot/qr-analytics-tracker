# QR Analytics Tracker

A complete QR code generator with analytics tracking using Node.js, Express, SQLite, HTML, CSS, and vanilla JavaScript.

## Features

- Generate QR codes for any URL
- **M-Pesa Payment QR Codes** (PayBill, Till, Pochi)
- Track scans with analytics (IP, device, browser, OS, location)
- Responsive dashboard with Chart.js visualizations
- Free tier limit of 10 QR codes
- Premium upgrade placeholder

## M-Pesa Integration

The app supports Safaricom M-Pesa payment QR codes:

- **PayBill**: For businesses collecting payments via business number
- **Till**: For paybill number payments  
- **Pochi**: For individual to individual payments

Customers scan the QR code and are redirected to the M-Pesa payment page with pre-filled amount and reference.

## Installation

```bash
npm install
```

## Running

```bash
npm start
```

The server will start at `http://localhost:3000`

## API Endpoints

- `POST /api/qr/create` - Create a URL QR code (body: `{ url, title? }`)
- `POST /api/mpesa/create` - Create M-Pesa payment QR (body: `{ paymentType, number, amount?, reference? }`)
- `GET /api/qr/list` - List all QR codes
- `GET /api/qr/:id/stats` - Get analytics for a QR code
- `GET /r/:shortCode` - Redirect endpoint (tracks visits)
- `DELETE /api/qr/:id` - Delete a QR code
- `GET /api/qr/:id/download` - Download QR code image

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: SQLite
- **QR Generation**: qrcode npm package
- **Charts**: Chart.js
- **IP Geolocation**: ip-api.com (free, no API key required)