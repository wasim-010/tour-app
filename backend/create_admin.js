const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

// Since this is in the backend folder now, the database is local
const db = new sqlite3.Database('./tour_manager.db');

const email = 'admin@email.com';
const username = 'Admin';
const password = 'adminpassword123';
const role = 'admin';

const passwordHash = bcrypt.hashSync(password, 10);

db.serialize(() => {
    db.run(`INSERT OR REPLACE INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)`,
        [username, email, passwordHash, role],
        function (err) {
            if (err) {
                console.error('Error creating admin:', err.message);
            } else {
                console.log('Admin user created/updated successfully!');
                console.log('Email:', email);
                console.log('Password:', password);
            }
        });
});

db.close();
