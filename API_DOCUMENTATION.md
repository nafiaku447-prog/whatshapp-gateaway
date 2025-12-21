# 📘 **WA GATEWAY API DOCUMENTATION**

## ✅ UPDATED: Simple API seperti Fonnte!

### **🔑 Authentication**

Gunakan **Device API Token** (bukan User API Key!):
```
Header: X-API-Key: YOUR_DEVICE_API_TOKEN
```

**Cara dapat token:**
1. Login ke dashboard
2. Buka menu "Devices"  
3. Klik detail device yang sudah connected
4. Copy **API Token** yang ditampilkan

---

## 📡 **ENDPOINT: SEND MESSAGE**

### **POST** `/api/send`

**Simple endpoint - tidak perlu device ID di URL!**

---

## 📝 **CONTOH KODE**

### **PHP** 
```php
<?php
$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => 'http://localhost:5000/api/send',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST => 'POST',
  CURLOPT_POSTFIELDS => json_encode([
    'recipient' => '6281234567890',
    'message' => 'Halo dari WA Gateway!'
  ]),
  CURLOPT_HTTPHEADER => array(
    'X-API-Key: YOUR_DEVICE_API_TOKEN',
    'Content-Type: application/json'
  ),
));

$response = curl_exec($curl);
curl_close($curl);

echo $response;
?>
```

### **JavaScript (Node.js)**
```javascript
const axios = require('axios');

const sendMessage = async () => {
  try {
    const response = await axios.post(
      'http://localhost:5000/api/send',
      {
        recipient: '6281234567890',
        message: 'Halo dari WA Gateway!'
      },
      {
        headers: {
          'X-API-Key': 'YOUR_DEVICE_API_TOKEN'
        }
      }
    );
    
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
};

sendMessage();
```

### **Python**
```python
import requests
import json

url = "http://localhost:5000/api/send"

payload = {
    'recipient': '6281234567890',
    'message': 'Halo dari WA Gateway!'
}
headers = {
    'X-API-Key': 'YOUR_DEVICE_API_TOKEN',
    'Content-Type': 'application/json'
}

response = requests.post(url, json=payload, headers=headers)

print(response.text)
```

### **cURL**
```bash
curl -X POST http://localhost:5000/api/send \
  --header 'X-API-Key: YOUR_DEVICE_API_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{"recipient":"6281234567890","message":"Halo dari WA Gateway!"}'
```

---

## ✅ **REQUEST FORMAT**

### Headers:
```
X-API-Key: YOUR_DEVICE_API_TOKEN
Content-Type: application/json
```

### Body (JSON):
```json
{
  "recipient": "6281234567890",
  "message": "Halo dari WA Gateway!"
}
```

---

## ✅ **RESPONSE FORMAT**

### Success (200):
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "messageId": "true_254657855238354@lid_3EB0123...",
    "device": {
      "id": 39,
      "name": "wa"
    },
    "recipient": "6283110892873",
    "status": "sent"
  }
}
```

### Error (4xx/5xx):
```json
{
  "error": "Error Type",
  "message": "Error description"
}
```

---

## 🎯 **KEUNTUNGAN SISTEM INI**

✅ **Simple** - 1 endpoint saja `/api/send`  
✅ **Secure** - Token per-device (bukan per-user)  
✅ **Auto-detect** - Tidak perlu specify device ID  
✅ **Clear** - Response tampilkan device mana yang kirim  
✅ **Professional** - Format sama dengan API komersial  

---

## 📌 **PRODUCTION NOTES**

**Development:**
```
http://localhost:5000/api/send
```

**Production:** 
```
https://yourdomain.com/api/send
```

⚠️ **WAJIB pakai HTTPS di production!**

---

## 🔐 **SECURITY**

- ✅ Token disimpan encrypted di database
- ✅ Token bisa di-revoke kapan saja (hapus device)
- ✅ Request di-validate setiap kali
- ⚠️ Jangan share token di public repository
- ⚠️ Gunakan HTTPS di production

---

**Made with ❤️ by WA Gateway Team**
