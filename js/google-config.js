// Google Client ID - Replace this with your actual Client ID from .env
// OR create an API endpoint to fetch it dynamically
const GOOGLE_CLIENT_ID = '964004422246-lk6aqkvtocqs952n6i7clv0vh3v332vc.apps.googleusercontent.com';

// Update the hidden div with client ID when page loads
document.addEventListener('DOMContentLoaded', () => {
    const googleOneTap = document.getElementById('g_id_onload');
    if (googleOneTap && GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID') {
        googleOneTap.setAttribute('data-client_id', GOOGLE_CLIENT_ID);
    }
});

// Also update the initialize call
window.GOOGLE_CLIENT_ID = GOOGLE_CLIENT_ID;

