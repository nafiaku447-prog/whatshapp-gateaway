const { query } = require('../db');

async function checkUser() {
    try {
        // Check for Budi Santoso
        const result = await query(
            `SELECT id, first_name, last_name, email, phone, is_admin, is_active, created_at 
             FROM users 
             WHERE first_name ILIKE '%budi%' OR last_name ILIKE '%santoso%'
             ORDER BY id`
        );

        console.log('\n📋 Users found:\n');

        if (result.rows.length === 0) {
            console.log('❌ No user found with name "Budi Santoso"\n');
        } else {
            result.rows.forEach((user, index) => {
                console.log(`${index + 1}. User Info:`);
                console.log(`   ID: ${user.id}`);
                console.log(`   Name: ${user.first_name} ${user.last_name}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Phone: ${user.phone}`);
                console.log(`   Is Admin: ${user.is_admin ? '👑 YES' : '❌ NO'}`);
                console.log(`   Is Active: ${user.is_active ? '✅ YES' : '❌ NO'}`);
                console.log(`   Created: ${user.created_at}`);
                console.log('');
            });
        }

        console.log('\n⚠️  NOTE: Password is hashed and cannot be retrieved.');
        console.log('   If you need to login, you can:');
        console.log('   1. Use "Lupa Password" feature (if implemented)');
        console.log('   2. Reset password manually via script');
        console.log('   3. Use a known test account\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkUser();
