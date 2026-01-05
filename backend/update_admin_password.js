const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./tour_manager.db');

const email = 'admin@email.com';
const newPassword = 'adminpassword123';
const passwordHash = bcrypt.hashSync(newPassword, 10);

db.run(`UPDATE users SET password_hash = ? WHERE email = ?`, [passwordHash, email], function (err) {
    if (err) {
        console.error('Error updating admin password:', err.message);
    } else if (this.changes === 0) {
        console.error('No user found with email:', email);
    } else {
        console.log('Admin password updated successfully. user_id remains unchanged.');
    }
    db.close();
});
