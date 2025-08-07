'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Modal } from '@/components/ui/modal';
import { Plus, Pencil, Trash, XCircle, CheckCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow
} from '@/components/ui/table';

interface DayOption {
  id: number;
  label: string;
  short: string;
}
interface OtherSurcharge {
  id: number;
  name: string;
  value: string;
  status: number;
  auto_add: number;
  type: number;
  use_type: number;
  day_of_week: number[];
  selected_date: string;
}

interface CustomSurchargeProps {
  orderTypes: { walkIn: boolean; phoneOrder: boolean; takeAway: boolean };
  setOrderTypes: React.Dispatch<React.SetStateAction<any>>;
  newOtherSurcharge: any;
  setNewOtherSurcharge: React.Dispatch<React.SetStateAction<any>>;
  editingSurcharge: any;
  setEditingSurcharge: (value: any) => void;
  showNewSurchargeForm: boolean;
  setShowNewSurchargeForm: (value: boolean) => void;
  otherSurcharges: any[];
  days: DayOption[];
  loading: boolean;
  handleCreateSurcharge: () => Promise<void>;
  handleUpdateSurcharge: () => Promise<void>;
  handleDeleteSurcharge: (id: number) => void;
  deleteSurchargeModalOpen: boolean;
  setDeleteSurchargeModalOpen: (value: boolean) => void;
  handleEditClick: (surcharge: any) => void;
  handleToggleStatus: (id: number, currentStatus: number) => void;
  handleSave: () => void;
  toggleDay: (dayId: number) => void;
  surchargeToDelete: OtherSurcharge | null;
  setSurchargeToDelete: (surcharge: OtherSurcharge | null) => void;
}

export function CustomSurcharge({
  orderTypes,
  setOrderTypes,
  newOtherSurcharge,
  setNewOtherSurcharge,
  editingSurcharge,
  setEditingSurcharge,
  showNewSurchargeForm,
  setShowNewSurchargeForm,
  otherSurcharges,
  days,
  loading,
  handleCreateSurcharge,
  handleUpdateSurcharge,
  handleDeleteSurcharge,
  deleteSurchargeModalOpen,
  setDeleteSurchargeModalOpen,
  handleEditClick,
  handleToggleStatus,
  handleSave,
  toggleDay,
  surchargeToDelete,
  setSurchargeToDelete
}: CustomSurchargeProps) {
  const getDefaultOtherSurcharge = () => ({
    name: '',
    value: '',
    status: 1,
    auto_add: 1,
    type: 1,
    use_type: 3,
    day_of_week: [],
    selected_date: new Date().toISOString().split('T')[0],
    branch_id: null
  });

  // Helper function to get selected options from use_type
  const getSelectedOptions = (useType: number) => {
    return {
      walkIn: [1, 3, 7].includes(useType),
      phoneOrder: [2, 3, 7].includes(useType),
      takeAway: [4, 7].includes(useType)
    };
  };
  const renderSurchargeItem = (surcharge: OtherSurcharge) => {
    const selectedOptions = getSelectedOptions(surcharge.use_type);
    const appliesTo = [
      selectedOptions.walkIn && 'Walk-in',
      selectedOptions.phoneOrder && 'Phone Order',
      selectedOptions.takeAway && 'Take Away'
    ]
      .filter(Boolean)
      .join(', ');

    const appliesToArray = [
      selectedOptions.walkIn && 'Walk-in',
      selectedOptions.phoneOrder && 'Phone Order',
      selectedOptions.takeAway && 'Take Away'
    ].filter(Boolean);

    return (
      <TableRow key={surcharge.id} className="">
        <TableCell>
          <Label>{surcharge.name}</Label>
          <p className="text-sm text-muted-foreground">
            This will charge{' '}
            {surcharge.type === 1
              ? `$${surcharge.value}`
              : `${surcharge.value}%`}
            <br />
          </p>
        </TableCell>
        <TableCell>
          {/* Applies to: */}
          <div className="">
            <div className="mb-2 flex flex-wrap gap-2">
              {appliesToArray.filter(Boolean).map((option) => (
                <div className="" key={option as string}>
                  <Badge className="border-primary bg-secondary text-secondary-foreground">
                    {option}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center justify-center">
            {surcharge.auto_add === 1 ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-gray-400" />
            )}{' '}
          </div>
        </TableCell>

        <TableCell className="text-center">
          {surcharge.day_of_week?.length > 0
            ? surcharge.day_of_week
                .map((d) => days.find((day) => day.id === d)?.short)
                .join(', ')
            : '--'}
        </TableCell>
        <TableCell className="text-center">
          {surcharge.selected_date ? surcharge.selected_date : '--'}
        </TableCell>
        <TableCell className="text-center">
          <Input
            type="text"
            value={surcharge.value}
            className="w-20"
            disabled
          />
        </TableCell>
        <TableCell className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditClick(surcharge)}
            disabled={loading}
          >
            <Pencil size={16} />
          </Button>
        </TableCell>
        <TableCell className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSurchargeToDelete(surcharge);
              setDeleteSurchargeModalOpen(true);
            }}
            disabled={loading}
          >
            <Trash size={16} />
          </Button>
        </TableCell>
        <TableCell className="text-center">
          <Switch
            checked={surcharge.status === 1}
            onCheckedChange={() =>
              handleToggleStatus(surcharge.id, surcharge.status)
            }
            disabled={loading}
          />
        </TableCell>
      </TableRow>
    );
  };

  return (
    <>
      <div className="mb-8">
        <div className="items-end justify-between gap-8 md:flex">
          <div className="">
            <h2 className="font-semibold">Custom Surcharge</h2>
            <p className="text-sm text-muted-foreground">
              Set up and customize surcharges based on order type, day of the
              week, or special dates.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowNewSurchargeForm(true)}
            disabled={showNewSurchargeForm}
            className="mt-4 md:mt-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Custome Surcharge
          </Button>
        </div>
      </div>
      <div className="">
        <Modal
          title="Select a Reader"
          description="Choose a reader to process the payment."
          isOpen={showNewSurchargeForm}
          onClose={() => {
            setShowNewSurchargeForm(false);
            setEditingSurcharge(null);
            setNewOtherSurcharge(getDefaultOtherSurcharge());
          }}
        >
          <div className="h-[70dvh] overflow-y-scroll">
            <div className="space-y-10 rounded-lg bg-secondary/20 p-4">
              <div className="space-y-2">
                <Label className="font-semibold">Title</Label>
                <Input
                  placeholder="Enter surcharge title"
                  value={newOtherSurcharge.name}
                  onChange={(e) =>
                    setNewOtherSurcharge((prev: any) => ({
                      ...prev,
                      name: e.target.value
                    }))
                  }
                />
              </div>

              <div className="">
                <div className="mb-2">
                  <Label className="font-semibold">Value Type</Label>
                </div>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={
                      newOtherSurcharge.type === 1 ? 'default' : 'outline'
                    }
                    onClick={() =>
                      setNewOtherSurcharge((prev: any) => ({
                        ...prev,
                        type: 1
                      }))
                    }
                  >
                    Fixed Amount
                  </Button>
                  <Button
                    type="button"
                    variant={
                      newOtherSurcharge.type === 2 ? 'default' : 'outline'
                    }
                    onClick={() =>
                      setNewOtherSurcharge((prev: any) => ({
                        ...prev,
                        type: 2
                      }))
                    }
                  >
                    Percentage
                  </Button>
                </div>
              </div>

              <div className="">
                <div className="mb-2">
                  <Label className="font-semibold">Value</Label>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder={
                      newOtherSurcharge.type === 1
                        ? 'Enter amount'
                        : 'Enter percentage'
                    }
                    value={newOtherSurcharge.value}
                    onChange={(e) =>
                      setNewOtherSurcharge((prev: any) => ({
                        ...prev,
                        value: e.target.value
                      }))
                    }
                    className="pl-6"
                  />
                  <span className="absolute left-2 top-1/2 -translate-y-1/2">
                    {newOtherSurcharge.type === 1 ? '$' : '%'}
                  </span>
                </div>
              </div>

              <div className="mb-16">
                <div className="mb-4">
                  <Label className="font-semibold">Apply To</Label>
                </div>
                <div className="">
                  <div className="max-w-52 gap-x-8 px-4">
                    <div className="mb-4 flex items-center justify-between">
                      <Label htmlFor="apply-walkin">Walk-in Orders</Label>
                      <Switch
                        id="apply-walkin"
                        checked={orderTypes.walkIn}
                        onCheckedChange={(checked) =>
                          setOrderTypes((prev: any) => ({
                            ...prev,
                            walkIn: checked
                          }))
                        }
                      />
                    </div>
                    <div className="mb-4 flex items-center justify-between">
                      <Label htmlFor="apply-phone">Phone Orders</Label>
                      <Switch
                        id="apply-phone"
                        checked={orderTypes.phoneOrder}
                        onCheckedChange={(checked) =>
                          setOrderTypes((prev: any) => ({
                            ...prev,
                            phoneOrder: checked
                          }))
                        }
                      />
                    </div>
                    <div className="mb-4 flex items-center justify-between">
                      <Label htmlFor="apply-takeaway">Takeaway Orders</Label>
                      <Switch
                        id="apply-takeaway"
                        checked={orderTypes.takeAway}
                        onCheckedChange={(checked) =>
                          setOrderTypes((prev: any) => ({
                            ...prev,
                            takeAway: checked
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="">
                <div className="flex items-center gap-8">
                  <Label htmlFor="auto-add" className="font-semibold">
                    Auto Add to Payment
                  </Label>
                  <Switch
                    id="auto-add"
                    checked={newOtherSurcharge.auto_add === 1}
                    onCheckedChange={(checked) =>
                      setNewOtherSurcharge((prev: any) => ({
                        ...prev,
                        auto_add: checked ? 1 : 0
                      }))
                    }
                  />
                </div>
              </div>

              <div className="">
                <div className="mb-4">
                  <Label className="font-semibold">Apply on days</Label>
                </div>
                <div className="flex flex-wrap gap-2 px-4">
                  {days.map((day) => (
                    <Button
                      key={day.id}
                      variant={
                        newOtherSurcharge.day_of_week?.includes(day.id)
                          ? 'default'
                          : 'outline'
                      }
                      className="w-14"
                      onClick={() => toggleDay(day.id)}
                      type="button"
                    >
                      {day.short}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="">
                <div className="mb-2">
                  <Label className="font-semibold">Selected Date</Label>
                </div>
                <Input
                  type="date"
                  value={newOtherSurcharge.selected_date}
                  onChange={(e) =>
                    setNewOtherSurcharge((prev: any) => ({
                      ...prev,
                      selected_date: e.target.value
                    }))
                  }
                />
              </div>
            </div>
            <div className="sticky bottom-0 bg-background pt-4">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewSurchargeForm(false);
                    setEditingSurcharge(null);
                    setNewOtherSurcharge(getDefaultOtherSurcharge());
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={
                    editingSurcharge
                      ? handleUpdateSurcharge
                      : handleCreateSurcharge
                  }
                  disabled={
                    loading ||
                    !newOtherSurcharge.name ||
                    !newOtherSurcharge.value
                  }
                >
                  {editingSurcharge ? 'Update' : 'Create'}
                </Button>
              </div>{' '}
            </div>
          </div>
        </Modal>
        <div className="min-h-dvh">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Surcharge</TableCell>
                <TableCell className="text-center">Applied To</TableCell>
                <TableCell className="text-center">Auto Add</TableCell>
                <TableCell className="text-center">Applied Days</TableCell>
                <TableCell className="text-center">Selected Date</TableCell>
                <TableCell className="w-1/12 text-center">Value</TableCell>
                <TableCell className="w-1/12 text-center">Edit</TableCell>
                <TableCell className="w-1/12 text-center">Delete</TableCell>
                <TableCell className="w-1/12 text-center">Activate</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>{otherSurcharges.map(renderSurchargeItem)}</TableBody>
          </Table>
        </div>
      </div>
      {/* <div className="sticky bottom-0 flex justify-between bg-background py-4">
        <Button variant="outline">Preview payment</Button>
        <Button onClick={handleSave} className="w-36">
          Save
        </Button>
      </div> */}
      <Modal
        title="Delete Surcharge"
        description={
          surchargeToDelete
            ? `Are you sure you want to delete "${surchargeToDelete.name}"?`
            : 'Are you sure you want to delete this surcharge?'
        }
        isOpen={deleteSurchargeModalOpen}
        onClose={() => {
          setDeleteSurchargeModalOpen(false);
          setSurchargeToDelete(null);
        }}
      >
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setDeleteSurchargeModalOpen(false);
              setSurchargeToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (surchargeToDelete) {
                handleDeleteSurcharge(surchargeToDelete.id);
              }
              setDeleteSurchargeModalOpen(false);
              setSurchargeToDelete(null);
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
