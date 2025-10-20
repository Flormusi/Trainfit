import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ClientList from './trainer/ClientList';
import WorkoutPlan from './trainer/WorkoutPlan';

const TrainerDashboard = () => (
  <div className="space-y-6">
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Your Clients</h3>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          Add New Client
        </button>
      </div>
      <ClientList />
    </div>
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4">Workout Plans</h3>
      <WorkoutPlan />
    </div>
  </div>
);

const ClientDashboard = () => (
  <div className="space-y-6">
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4">Your Workouts</h3>
      {/* Workout schedule and progress will be implemented here */}
    </div>
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4">Progress Tracking</h3>
      {/* Progress metrics and charts will be implemented here */}
    </div>
  </div>
);

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold">TrainFit Dashboard</h1>
              <p className="text-sm text-gray-500">
                {user?.role ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} - ${user.membershipTier} Plan` : 'Loading...'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user?.role === 'trainer' ? <TrainerDashboard /> : <ClientDashboard />}
      </main>
    </div>
  );
};

export default Dashboard;