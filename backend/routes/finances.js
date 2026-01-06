// routes/finances.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const db = require('../db');
const router = express.Router();

// ... (all other routes are the same, only /event/:eventId/details is changed) ...

// ADMIN: Get Full Financial Summary for a Group
router.get('/group/:groupId', protect, async (req, res) => {
    const { groupId } = req.params;
    try {
        const users = await db.allAsync(`SELECT u.user_id, u.username, ug.role FROM users u JOIN users_groups ug ON u.user_id = ug.user_id WHERE ug.group_id = ?`, [groupId]);
        const allExpenses = await db.allAsync(`SELECT user_id, SUM(total_cost) as total_spent FROM expenses WHERE event_id IN (SELECT event_id FROM events WHERE location_id IN (SELECT location_id FROM locations WHERE day_id IN (SELECT day_id FROM tour_days WHERE group_id = ?))) GROUP BY user_id`, [groupId]);
        const allDeposits = await db.allAsync(`SELECT user_id, SUM(amount) as total_deposited FROM deposits WHERE group_id = ? GROUP BY user_id`, [groupId]);

        const userSummaries = users.map(user => {
            const expenseData = allExpenses.find(e => e.user_id === user.user_id) || { total_spent: 0 };
            const depositData = allDeposits.find(d => d.user_id === user.user_id) || { total_deposited: 0 };
            return { ...user, total_spent: expenseData.total_spent, total_deposited: depositData.total_deposited, balance: depositData.total_deposited - expenseData.total_spent };
        });
        const groupTotalSpent = userSummaries.reduce((sum, u) => sum + u.total_spent, 0);
        const groupTotalDeposited = userSummaries.reduce((sum, u) => sum + u.total_deposited, 0);
        res.json({ groupSummary: { total_spent: groupTotalSpent, total_deposited: groupTotalDeposited, balance: groupTotalDeposited - groupTotalSpent }, userSummaries });
    } catch (error) { res.status(500).json({ message: 'Error fetching group finances.' }); }
});

// ADMIN: MASTER FINANCIAL SUMMARY
router.get('/admin-summary', protect, async (req, res) => {
    const adminId = req.user.userId;
    try {
        const adminGroups = await db.allAsync(`SELECT g.group_id, g.group_name FROM groups g JOIN users_groups ug ON g.group_id = ug.group_id WHERE ug.user_id = ? AND ug.role = 'admin'`, [adminId]);
        if (adminGroups.length === 0) {
            return res.json({ masterSummary: { total_spent: 0, total_deposited: 0, balance: 0 }, groupSummaries: [] });
        }
        const groupIds = adminGroups.map(g => g.group_id);
        const placeholders = groupIds.map(() => '?').join(',');
        const allExpenses = await db.allAsync(`SELECT ug.group_id, e.user_id, SUM(e.total_cost) as total_spent FROM expenses e JOIN users_groups ug ON e.user_id = ug.user_id WHERE ug.group_id IN (${placeholders}) GROUP BY ug.group_id, e.user_id`, groupIds);
        const allDeposits = await db.allAsync(`SELECT group_id, user_id, SUM(amount) as total_deposited FROM deposits WHERE group_id IN (${placeholders}) GROUP BY group_id, user_id`, groupIds);
        const allUsers = await db.allAsync(`SELECT u.user_id, u.username, ug.group_id, ug.role FROM users u JOIN users_groups ug ON u.user_id = ug.user_id WHERE ug.group_id IN (${placeholders})`, groupIds);

        let masterSpent = 0;
        let masterDeposited = 0;
        const groupSummaries = adminGroups.map(group => {
            const usersInGroup = allUsers.filter(u => u.group_id === group.group_id);
            const userFinancials = usersInGroup.map(user => {
                const userExpenses = allExpenses.filter(e => e.group_id === group.group_id && e.user_id === user.user_id);
                const userDeposits = allDeposits.filter(d => d.group_id === group.group_id && d.user_id === user.user_id);
                const total_spent = userExpenses.reduce((sum, e) => sum + e.total_spent, 0);
                const total_deposited = userDeposits.reduce((sum, d) => sum + d.total_deposited, 0);
                return { user_id: user.user_id, username: user.username, role: user.role, total_spent, total_deposited, balance: total_deposited - total_spent };
            });
            const groupTotalSpent = userFinancials.reduce((sum, u) => sum + u.total_spent, 0);
            const groupTotalDeposited = userFinancials.reduce((sum, u) => sum + u.total_deposited, 0);
            masterSpent += groupTotalSpent;
            masterDeposited += groupTotalDeposited;
            return { group_id: group.group_id, group_name: group.group_name, groupSummary: { total_spent: groupTotalSpent, total_deposited: groupTotalDeposited, balance: groupTotalDeposited - groupTotalSpent }, userSummaries: userFinancials };
        });
        const masterSummary = { total_spent: masterSpent, total_deposited: masterDeposited, balance: masterDeposited - masterSpent };
        res.json({ masterSummary, groupSummaries });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch admin financial summary." });
    }
});

// ADMIN: ADD A DEPOSIT FOR A USER
router.post('/deposits', protect, async (req, res) => {
    const { user_id, group_id, amount } = req.body;
    if (!user_id || !group_id || !amount || amount <= 0) {
        return res.status(400).json({ message: 'User, group, and a valid amount are required.' });
    }
    try {
        await db.runAsync(`INSERT INTO deposits (user_id, group_id, amount) VALUES (?, ?, ?)`, [user_id, group_id, amount]);
        res.status(201).json({ message: 'Deposit recorded successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to record deposit.' });
    }
});

// USER: GET PERSONAL FINANCIAL SUMMARY
router.get('/my-summary', protect, async (req, res) => {
    const userId = req.user.userId;
    try {
        const expenses = await db.allAsync(`SELECT SUM(total_cost) as total_spent FROM expenses WHERE user_id = ?`, [userId]);
        const deposits = await db.allAsync(`SELECT SUM(amount) as total_deposited FROM deposits WHERE user_id = ?`, [userId]);
        const totalSpent = expenses[0]?.total_spent || 0;
        const totalDeposited = deposits[0]?.total_deposited || 0;
        const balance = totalDeposited - totalSpent;
        res.json({ total_spent: totalSpent, total_deposited: totalDeposited, balance: balance });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching financial summary.' });
    }
});

// ADMIN: GET EVENT-BASED EXPENSE SUMMARY
router.get('/admin/event-summary', protect, async (req, res) => {
    const adminId = req.user.userId;
    try {
        const adminGroups = await db.allAsync(
            `SELECT g.group_id FROM groups g
             JOIN users_groups ug ON g.group_id = ug.group_id
             WHERE ug.user_id = ? AND ug.role = 'admin'`,
            [adminId]
        );

        if (adminGroups.length === 0) {
            return res.json([]);
        }
        const groupIds = adminGroups.map(g => g.group_id);
        const placeholders = groupIds.map(() => '?').join(',');

        const eventSummaries = await db.allAsync(`
            SELECT
                e.event_id,
                e.event_name,
                l.location_name,
                g.group_name,
                COALESCE(SUM(ex.quantity), 0) as total_quantity,
                COALESCE(SUM(ex.total_cost), 0) as total_expense,
                MAX(ex.expense_timestamp) as last_updated
            FROM events e
            JOIN locations l ON e.location_id = l.location_id
            JOIN tour_days td ON l.day_id = td.day_id
            JOIN groups g ON td.group_id = g.group_id
            LEFT JOIN expenses ex ON e.event_id = ex.event_id
            WHERE g.group_id IN (${placeholders})
            GROUP BY e.event_id, e.event_name, l.location_name, g.group_name
            ORDER BY MAX(ex.expense_timestamp) DESC, g.group_name, e.event_name;
        `, groupIds);

        res.json(eventSummaries);
    } catch (error) {
        console.error("Error fetching event expense summary:", error);
        res.status(500).json({ message: 'Failed to fetch event expense summary.' });
    }
});

// ADMIN: GET DETAILED EXPENSES FOR A SINGLE EVENT
router.get('/event/:eventId/details', protect, async (req, res) => {
    const { eventId } = req.params;
    const adminId = req.user.userId;

    try {
        const eventGroup = await db.getAsync(`
            SELECT d.group_id FROM events e
            JOIN locations l ON e.location_id = l.location_id
            JOIN tour_days d ON l.day_id = d.day_id
            WHERE e.event_id = ?
        `, [eventId]);

        if (!eventGroup) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        const adminRole = await db.getAsync(
            'SELECT role FROM users_groups WHERE user_id = ? AND group_id = ?',
            [adminId, eventGroup.group_id]
        );

        if (!adminRole || adminRole.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: You are not an admin of this group.' });
        }

        const expenseDetails = await db.allAsync(`
            SELECT
                ex.expense_id,
                u.username,
                ex.quantity,
                ex.total_cost,
                ex.expense_timestamp
            FROM expenses ex
            JOIN users u ON ex.user_id = u.user_id
            WHERE ex.event_id = ?
            ORDER BY ex.expense_timestamp DESC
        `, [eventId]);

        res.json(expenseDetails);

    } catch (error) {
        console.error(`Error fetching details for event ${eventId}:`, error);
        res.status(500).json({ message: 'Failed to fetch expense details.' });
    }
});

router.get('/deposits', protect, async (req, res) => {
    const adminId = req.user.userId;
    try {
        const deposits = await db.allAsync(`
            SELECT
                d.deposit_id,
                d.amount,
                d.deposit_timestamp,
                u.user_id,
                u.username,
                g.group_id,
                g.group_name
            FROM deposits d
            JOIN users u ON d.user_id = u.user_id
            JOIN groups g ON d.group_id = g.group_id
            WHERE d.group_id IN (SELECT group_id FROM users_groups WHERE user_id = ? AND role = 'admin')
            ORDER BY d.deposit_timestamp DESC
        `, [adminId]);
        res.json(deposits);
    } catch (error) {
        console.error("Error fetching all deposits for admin:", error);
        res.status(500).json({ message: 'Failed to fetch deposits.' });
    }
});

// PUT (Edit) a specific deposit
router.put('/deposits/:depositId', protect, async (req, res) => {
    const { depositId } = req.params;
    const { amount } = req.body;
    const adminId = req.user.userId;

    if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: 'A valid positive amount is required.' });
    }

    try {
        // Security Check: Verify the admin has rights to the group this deposit belongs to
        const deposit = await db.getAsync('SELECT group_id FROM deposits WHERE deposit_id = ?', [depositId]);
        if (!deposit) {
            return res.status(404).json({ message: 'Deposit not found.' });
        }
        const adminRole = await db.getAsync('SELECT role FROM users_groups WHERE user_id = ? AND group_id = ?', [adminId, deposit.group_id]);
        if (!adminRole || adminRole.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden.' });
        }

        await db.runAsync('UPDATE deposits SET amount = ? WHERE deposit_id = ?', [parseFloat(amount), depositId]);
        res.status(200).json({ message: 'Deposit updated successfully.' });
    } catch (error) {
        console.error("Error updating deposit:", error);
        res.status(500).json({ message: 'Failed to update deposit.' });
    }
});

// DELETE a specific deposit
router.delete('/deposits/:depositId', protect, async (req, res) => {
    const { depositId } = req.params;
    const adminId = req.user.userId;

    try {
        // Security Check (same as edit)
        const deposit = await db.getAsync('SELECT group_id FROM deposits WHERE deposit_id = ?', [depositId]);
        if (!deposit) {
            return res.status(404).json({ message: 'Deposit not found.' });
        }
        const adminRole = await db.getAsync('SELECT role FROM users_groups WHERE user_id = ? AND group_id = ?', [adminId, deposit.group_id]);
        if (!adminRole || adminRole.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden.' });
        }

        await db.runAsync('DELETE FROM deposits WHERE deposit_id = ?', [depositId]);
        res.status(200).json({ message: 'Deposit deleted successfully.' });
    } catch (error) {
        console.error("Error deleting deposit:", error);
        res.status(500).json({ message: 'Failed to delete deposit.' });
    }
});


module.exports = router;

module.exports = router;
