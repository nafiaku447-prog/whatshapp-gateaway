const { query } = require('../db');

async function setupAdmin() {
    try {
        console.log('🔧 Setting up admin user...\n');

        // 1. Add is_admin column if not exists
        console.log('1️⃣ Adding is_admin column to users table...');

        await query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM information_schema.columns 
                    WHERE table_name = 'users' 
                    AND column_name = 'is_admin'
                ) THEN
                    ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
                    RAISE NOTICE 'Column is_admin added';
                ELSE
                    RAISE NOTICE 'Column is_admin already exists';
                END IF;
            END $$;
        `);

        console.log('✅ Column check complete\n');

        // 2. Get all users
        console.log('2️⃣ Fetching users...');
        const usersResult = await query('SELECT id, email, first_name, last_name, is_admin FROM users ORDER BY id');

        if (usersResult.rows.length === 0) {
            console.log('❌ No users found in database!');
            console.log('   Please register a user first.\n');
            process.exit(1);
        }

        console.log(`\n📋 Found ${usersResult.rows.length} users:\n`);
        usersResult.rows.forEach((user, index) => {
            const adminBadge = user.is_admin ? '👑 ADMIN' : '';
            console.log(`   ${index + 1}. ID: ${user.id} | Email: ${user.email} | Name: ${user.first_name} ${user.last_name} ${adminBadge}`);
        });

        // 3. Prompt user to select (for now, just make first user admin)
        console.log('\n3️⃣ Setting first user as admin...');

        const updateResult = await query(
            'UPDATE users SET is_admin = TRUE WHERE id = $1 RETURNING id, email, first_name, last_name',
            [usersResult.rows[0].id]
        );

        if (updateResult.rows.length > 0) {
            const admin = updateResult.rows[0];
            console.log(`✅ Successfully set ${admin.first_name} ${admin.last_name} (${admin.email}) as ADMIN!\n`);
        }

        // 4. Show all admins
        console.log('4️⃣ Current admin users:');
        const adminsResult = await query('SELECT id, email, first_name, last_name FROM users WHERE is_admin = TRUE');

        adminsResult.rows.forEach((admin, index) => {
            console.log(`   👑 ${index + 1}. ${admin.first_name} ${admin.last_name} (${admin.email})`);
        });

        console.log('\n✨ Admin setup complete!');
        console.log('\n📝 To set other users as admin, run:');
        console.log('   UPDATE users SET is_admin = TRUE WHERE email = \'user@example.com\';\n');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error setting up admin:', error.message);
        process.exit(1);
    }
}

// Run setup
setupAdmin();
