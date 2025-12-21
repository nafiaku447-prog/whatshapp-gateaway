// ============================================
// CONTOH WA GATEWAY - Kirim WhatsApp via WA Gateway API (Self-Hosted)
// ============================================

// 1. Cara Install (jika pakai Node.js)
// npm install axios

// 2. Cara Kirim Pesan dengan WA Gateway (SIMPLE seperti Fonnte!)
const axios = require('axios');

async function kirimPesanWAGateway() {
    try {
        const response = await axios.post('http://localhost:5000/api/send', {
            recipient: '6283110892873',
            message: 'Halo dari WA Gateway!'
        }, {
            headers: {
                // ✅ Pakai API Token DEVICE (dari devices.html - Detail Device)
                // Tidak pakai User API Key lagi!
                'X-API-Key': '2298ea14a22cba549af683acebb0d31590fdfa13f5e09dfbec12bd7b0f5de80d'
            }
        });

        console.log(response.data);
    } catch (error) {
        console.error(error.message);
    }
}

kirimPesanWAGateway();


// ============================================
// ATAU dengan CURL (Terminal)
// ============================================

/*
curl -X POST http://localhost:5000/api/send \
  -H "X-API-Key: API_KEY_ANDA_DISINI" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": "6281234567890",
    "message": "Halo dari WA Gateway!"
  }'
*/


// ============================================
// CONTOH PAKAI PHP
// ============================================

/*
<?php
$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => 'http://localhost:5000/api/send',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => 'POST',
  CURLOPT_POSTFIELDS => json_encode([
    'recipient' => '6281234567890',
    'message' => 'Halo dari WA Gateway!'
  ]),
  CURLOPT_HTTPHEADER => array(
    'X-API-Key: API_KEY_ANDA_DISINI',
    'Content-Type: application/json'
  ),
));

$response = curl_exec($curl);
curl_close($curl);

echo $response;
?>
*/


// ============================================
// PERBANDINGAN: FONNTE vs WA GATEWAY
// ============================================
/*
┌─────────────────┬──────────────────────────────────┬─────────────────────────────────┐
│ Aspek           │ Fonnte                           │ WA Gateway                      │
├─────────────────┼──────────────────────────────────┼─────────────────────────────────┤
│ Endpoint        │ https://api.fonnte.com/send      │ http://localhost:5000/api/send  │
│ Header          │ Authorization: TOKEN             │ X-API-Key: API_KEY              │
│ Body            │ {target, message, countryCode}   │ {recipient, message}            │
│ Biaya           │ Rp 150.000 - 500.000/bulan       │ GRATIS (biaya server saja)      │
│ Setup           │ Mudah (daftar & bayar)           │ Butuh setup teknis              │
│ Kontrol         │ Terbatas                         │ Full control                    │
│ Data Privacy    │ Data di server Fonnte            │ Data di server Anda             │
│ Customization   │ Terbatas oleh API mereka         │ Unlimited (open source)         │
└─────────────────┴──────────────────────────────────┴─────────────────────────────────┘

SEKARANG ENDPOINT WA GATEWAY SUDAH SESIMPEL FONNTE! ✅
*/


// ============================================
// CARA MENDAPATKAN API KEY:
// ============================================
// 1. Login ke: http://localhost/wa api/login.html
// 2. Masuk ke menu Settings/Profile
// 3. Copy API Key yang ditampilkan
// 4. Paste ke header 'X-API-Key'
// 5. Selesai! (API Key tidak expired)
