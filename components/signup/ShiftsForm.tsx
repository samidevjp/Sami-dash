import React from 'react';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Button } from '@/components/ui/button';
// import { motion } from 'framer-motion';
// import { Card, CardContent } from '@/components/ui/card';
// import { Clock, Calendar, Palette, Plus, Trash2 } from 'lucide-react';
// import { cn } from '@/lib/utils';
import FormLayout from './FormLayout';
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle
// } from '@/components/ui/alert-dialog';
// import ShiftSelector from '../pos/shift-selector';
import ShiftsTable from '../shifts-table';

type Shift = {
  id: number;
  name: string;
  start_time: number;
  end_time: number;
  day_of_week: number[];
  shift_color: string;
  floors: number[];
  turn_time: number;
};

type ShiftsFormProps = {
  shifts: Shift[];
  updateFields?: (fields: Partial<{ shifts: Shift[] }>) => void;
};

export default function ShiftsForm({ shifts, updateFields }: ShiftsFormProps) {
  return (
    <FormLayout
      title="Business Hours"
      description="Set your business hours by selecting days and times below."
      fullWidth
    >
      <ShiftsTable shifts={shifts} updateFields={updateFields} />
    </FormLayout>
  );
}
