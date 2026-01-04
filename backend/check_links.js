const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'tour_manager.db');
const db = new sqlite3.Database(dbPath);

console.log('Checking database content...');

db.serialize(() => {
    db.get('SELECT user_id, email FROM users WHERE email="admin@email.com"', (err, user) => {
        if (err) {
            console.error('Error fetching admin:', err.message);
            return;
        }
        if (!user) {
            console.log('Admin user not found.');
            return;
        }
        console.log('Admin User:', user);

        db.all('SELECT * FROM groups', (err, groups) => {
            if (err) {
                console.error('Error fetching groups:', err.message);
                return;
            }
            console.log('Total Groups:', groups.length);
            console.log('Groups:', groups);

            db.all('SELECT * FROM users_groups', (err, relations) => {
                if (err) {
                    console.error('Error fetching relations:', err.message);
                    return;
                }
                console.log('Total Relations:', relations.length);
                console.log('Relations:', relations);

                const adminInGroups = relations.filter(r => r.user_id === user.user_id);
                console.log('Admin is in', adminInGroups.length, 'groups.');

                if (adminInGroups.length === 0 && groups.length > 0) {
                    console.log('Linking admin to all existing groups...');
                    groups.forEach(g => {
                        db.run('INSERT OR IGNORE INTO users_groups (user_id, group_id, role) VALUES (?, ?, ?)',
                            [user.user_id, g.group_id, 'admin'], (err) => {
                                if (err) console.error('Link error:', err.message);
                                else console.log(`Linked admin to group ${g.group_id}`);
                            });
                    });
                }
            });
        });
    });
});

setTimeout(() => {
    db.close();
    console.log('Done.');
}, 2000);
