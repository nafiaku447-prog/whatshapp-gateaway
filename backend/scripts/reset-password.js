const { query } = require('../db');
const bcrypt = require('bcryptjs');

async function resetPassword() {
    try {
        const email = 'budisantoso@gmail.com';
        const newPassword = 'password123'; // Password baru

        console.log('\n🔐 Resetting password for:', email);
        console.log('🔑 New password:', newPassword);
        console.log('');

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        // Update password
        const result = await query(
            'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, email, first_name, last_name',
            [passwordHash, email]
        );

        if (result.rows.length > 0) {
            const user = result.rows[0];
            console.log('✅ Password successfully reset for:');
            console.log(`   Name: ${user.first_name} ${user.last_name}`);
            console.log(`   Email: ${user.email}`);
            console.log('');
            console.log('📝 Login credentials:');
            console.log(`   Email: ${email}`);
            console.log(`   Password: ${newPassword}`);
            console.log('');
            console.log('⚠️  Please change this password after login!');
        } else {
            console.log('❌ User not found!');
        }

        console.log('');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

resetPassword();
