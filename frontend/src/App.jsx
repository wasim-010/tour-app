// src/App.jsx
import React, { Suspense, lazy } from 'react';
import { Box, Spinner } from '@chakra-ui/react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Itinerary = lazy(() => import('./pages/Itinerary'));
const MyExpenses = lazy(() => import('./pages/MyExpenses'));
const AdminGroup = lazy(() => import('./pages/AdminGroup'));
const NewGroup = lazy(() => import('./pages/NewGroup'));
const AdminFinances = lazy(() => import('./pages/AdminFinances'));
const Deposit = lazy(() => import('./pages/Deposit'));
const EventExpenses = lazy(() => import('./pages/EventExpenses'));
const AdminAddExpense = lazy(() => import('./pages/AdminAddExpense'));

// Loading Fallback
const Loading = () => (
  <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
    <Spinner size="xl" color="brand.500" thickness="4px" emptyColor="gray.200" />
  </Box>
);

// Components
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import GroupAdminRoute from './components/GroupAdminRoute';
import AppLayout from './components/AppLayout';

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute> <AppLayout /> </ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="group/:groupId/itinerary" element={<Itinerary />} />
          <Route path="my-expenses" element={<MyExpenses />} />
          <Route path="groups/new" element={<AdminRoute> <NewGroup /> </AdminRoute>} />
        </Route>

        <Route path="/admin" element={<ProtectedRoute> <AppLayout /> </ProtectedRoute>}>
          <Route
            path="group/:groupId"
            element={<GroupAdminRoute> <AdminGroup /> </GroupAdminRoute>}
          />
          <Route
            path="finances"
            element={<AdminRoute> <AdminFinances /> </AdminRoute>}
          />
          <Route
            path="deposit"
            element={<AdminRoute> <Deposit /> </AdminRoute>}
          />
          <Route
            path="event-expenses"
            element={<AdminRoute> <EventExpenses /> </AdminRoute>}
          />
          <Route
            path="add-expense"
            element={<AdminRoute> <AdminAddExpense /> </AdminRoute>}
          />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;