import React, { useState } from 'react';
import { workoutPlanService } from '../../services/workoutPlanService';
import { toast } from 'react-hot-toast';

interface Client {
  id: number;
  name: string;
  email: string;
}

interface AssignWorkoutModalProps {
  planId: number;
  clients: Client[];
  onClose: () => void;
  onAssign: () => void;
  loading: boolean;
  error: string;
}

const AssignWorkoutModal = ({ planId, clients, onClose, onAssign, loading, error }: AssignWorkoutModalProps) => {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  const handleAssign = async () => {
    if (!selectedClientId) {
      toast.error('Please select a client');
      return;
    }

    try {
      await workoutPlanService.assignWorkoutPlan(planId, selectedClientId);
      toast.success('Workout plan assigned successfully');
      onAssign();
      onClose();
    } catch (err) {
      toast.error('Failed to assign workout plan');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">Assign Workout Plan</h3>
        
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-4">{error}</div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Client
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={selectedClientId || ''}
                onChange={(e) => setSelectedClientId(Number(e.target.value))}
              >
                <option value="">Choose a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Assign
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignWorkoutModal;