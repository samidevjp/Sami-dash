import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Building2, Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import FormLayout from './FormLayout';
import { Card } from '../ui/card';

type Floor = {
  id: number;
  floor_name: string;
};

type FloorsFormProps = {
  floors: Floor[];
  updateFields: (fields: { floors: Floor[] }) => void;
};

export default function FloorsForm({ floors, updateFields }: FloorsFormProps) {
  const [floorName, setFloorName] = useState('');

  const addFloor = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    if (floorName.trim()) {
      // Generate a unique negative ID for new floors (will be replaced by server-generated ID later)
      const newId =
        floors.length > 0 ? Math.min(...floors.map((f) => f.id)) - 1 : -1;

      const newFloor: Floor = {
        id: newId, // Use negative IDs for new floors
        floor_name: floorName.trim()
      };
      updateFields({ floors: [...floors, newFloor] });
      setFloorName('');
    }
  };

  const removeFloor = (id: number) => {
    updateFields({ floors: floors.filter((f) => f.id !== id) });
  };

  return (
    <FormLayout
      title="Business Sections"
      description="Add the different floors or sections in your establishment. This will help you organize your tables and manage your space effectively."
      fullWidth
    >
      <Card className="p-8">
        <h3 className="mb-6 text-lg font-semibold text-black">Floors</h3>
        <div className="">
          <div className="mb-12 space-y-4 px-4">
            {floors.map((floor) => (
              <motion.div
                key={floor.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between rounded-lg bg-secondary px-4 py-2 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-black" />
                  <span className="text-sm font-medium text-black">
                    {floor.floor_name}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeFloor(floor.id)}
                  className="bg-white "
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={floorName}
              onChange={(e) => setFloorName(e.target.value)}
              placeholder="Floor name"
              className="flex-1 text-black"
            />
            <Button type="button" onClick={addFloor}>
              <Plus className="mr-2 h-4 w-4" />
              Add Floor
            </Button>
          </div>
        </div>
      </Card>
    </FormLayout>
  );
}
