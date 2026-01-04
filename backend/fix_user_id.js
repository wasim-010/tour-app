const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'tour_manager.db');
const db = new sqlite3.Database(dbPath);

console.log('Fixing User IDs...');

db.serialize(() => {
    // 1. Get current info for admin@email.com
    db.get('SELECT * FROM users WHERE email="admin@email.com"', (err, user) => {
        if (user) {
            console.log('Found admin with ID:', user.user_id);
            const oldId = user.user_id;

            if (oldId !== 1) {
                // Check if user_id 1 is taken
                db.get('SELECT * FROM users WHERE user_id=1', (err, otherUser) => {
                    db.serialize(() => {
                        if (otherUser) {
                            console.log('User ID 1 is taken by:', otherUser.email);
                            // Switch them? This is getting complex. 
                            // Easier: Delete user 1 (it's likely a duplicate or old entry) and move this one.
                            db.run('DELETE FROM users WHERE user_id=1');
                        }

                        // Update current user to ID 1
                        // SQLite doesn't like updating the PK directly sometimes if it's auto-increment
                        // Let's just delete and re-insert properly
                        db.run('DELETE FROM users WHERE email="admin@email.com"');
                        db.run('INSERT INTO users (user_id, username, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)',
                            [1, user.username, user.email, user.password_hash, user.role, user.created_at], (err) => {
                                if (err) console.error('Error moving admin to ID 1:', err.message);
                                else console.log('Admin moved to ID 1 successfully.');
                            });

                        // Also make sure they are linked to the group
                        db.run('INSERT OR IGNORE INTO users_groups (user_id, group_id, role) VALUES (?, ?, ?)',
                            [1, 2, 'admin']);
                    });
                });
            } else {
                console.log('Admin already has ID 1.');
                db.run('INSERT OR IGNORE INTO users_groups (user_id, group_id, role) VALUES (?, ?, ?)',
                    [1, 2, 'admin']);
            }
        } else {
            console.log('Admin user not found.');
        }
    });
});

setTimeout(() => {
    db.close();
    console.log('Done.');
}, 2000);
