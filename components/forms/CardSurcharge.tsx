'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Modal } from '@/components/ui/modal';
import { Plus, Pencil, Trash } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useEffect } from 'react';

interface CardSurcharge {
  id: number;
  name: string;
  value: string;
  status: number;
  use_windcave: number;
  use_stripe: number;
  use_novatti: number;
  use_worldline: number;
}

interface CardSurchargeProps {
  cardSurcharges: any[];
  editingCardSurcharge: any;
  setEditingCardSurcharge: (value: any) => void;
  newCardSurcharge: any;
  setNewCardSurcharge: React.Dispatch<React.SetStateAction<any>>;
  showNewCardSurchargeForm: boolean;
  setShowNewCardSurchargeForm: (value: boolean) => void;
  loading: boolean;
  handleCreateCardSurcharge: () => Promise<void>;
  handleUpdateCardSurcharge: () => Promise<void>;
  handleDeleteCardSurcharge: (id: number) => void;
  handleEditCardClick: (surcharge: any) => void;
  handleToggleCardStatus: (id: number, currentStatus: number) => void;
  handleSave: () => void;
  deleteCardSurchargeModalOpen: boolean;
  setDeleteCardSurchargeModalOpen: (value: boolean) => void;
}

export function CardSurcharge({
  cardSurcharges,
  editingCardSurcharge,
  setEditingCardSurcharge,
  newCardSurcharge,
  setNewCardSurcharge,
  showNewCardSurchargeForm,
  setShowNewCardSurchargeForm,
  loading,
  handleCreateCardSurcharge,
  handleUpdateCardSurcharge,
  handleDeleteCardSurcharge,
  handleEditCardClick,
  handleToggleCardStatus,
  handleSave,
  deleteCardSurchargeModalOpen,
  setDeleteCardSurchargeModalOpen
}: CardSurchargeProps) {
  const formButtons = (
    <div className="flex justify-end gap-2">
      <Button
        variant="outline"
        onClick={() => {
          setShowNewCardSurchargeForm(false);
          setEditingCardSurcharge(null);
          setNewCardSurcharge({
            name: '',
            value: '',
            status: 1,
            use_windcave: 0,
            use_stripe: 0,
            use_novatti: 0,
            use_worldline: 0,
            branch_id: null
          });
        }}
      >
        Cancel
      </Button>
      <Button
        onClick={
          editingCardSurcharge
            ? handleUpdateCardSurcharge
            : handleCreateCardSurcharge
        }
        disabled={loading || !newCardSurcharge.name || !newCardSurcharge.value}
      >
        {editingCardSurcharge ? 'Update' : 'Create'}
      </Button>
    </div>
  );

  const renderCardSurchargeItem = (surcharge: CardSurcharge) => {
    const paymentProcessors = [
      surcharge.use_windcave && 'Windcave',
      surcharge.use_stripe && 'Stripe',
      surcharge.use_novatti && 'Novatti',
      surcharge.use_worldline && 'Worldline'
    ]
      .filter(Boolean)
      .join(', ');
    const paymentProcessorsArray = [
      surcharge.use_windcave && 'Windcave',
      surcharge.use_stripe && 'Stripe',
      surcharge.use_novatti && 'Novatti',
      surcharge.use_worldline && 'Worldline'
    ].filter(Boolean);
    return (
      <TableRow key={surcharge.id} className="space-y-2">
        <TableCell>
          <Label>{surcharge.name}</Label>
          <p className="text-sm text-muted-foreground">
            This will charge {surcharge.value}% for {surcharge.name} payments
          </p>
        </TableCell>
        <TableCell className="">
          <div className="">
            {!!paymentProcessorsArray.length ? (
              <div className="mb-2 flex flex-wrap gap-2">
                {paymentProcessorsArray.filter(Boolean).map((option) => (
                  <div className="" key={option as string}>
                    <Badge className="border-primary bg-secondary text-secondary-foreground">
                      {option}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="">--</p>
            )}
          </div>
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
            onClick={() => handleEditCardClick(surcharge)}
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
              setEditingCardSurcharge(surcharge);
              setDeleteCardSurchargeModalOpen(true);
            }}
            //   onClick={() => handleDeleteCardSurcharge(surcharge.id)}
            disabled={loading}
          >
            <Trash size={16} />
          </Button>
        </TableCell>
        <TableCell className="text-center">
          <Switch
            checked={surcharge.status === 1}
            onCheckedChange={() =>
              handleToggleCardStatus(surcharge.id, surcharge.status)
            }
            disabled={loading}
          />
        </TableCell>
      </TableRow>
    );
  };

  const getDefaultCardSurcharge = () => ({
    name: '',
    value: '',
    status: 1,
    use_windcave: 0,
    use_stripe: 0,
    use_novatti: 0,
    use_worldline: 0,
    branch_id: null
  });
  return (
    <>
      <div className="mb-8 items-end justify-between gap-8 md:flex">
        <div className="">
          <h2 className="font-semibold">Card Surcharge</h2>
          <p className="text-sm text-muted-foreground">
            Manage surcharge rates for different card payment types.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => setShowNewCardSurchargeForm(true)}
          disabled={showNewCardSurchargeForm}
          className="mt-4 md:mt-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Card Surcharge
        </Button>
      </div>

      {/* {showNewCardSurchargeForm && (
   
      )} */}
      <Modal
        title="Edit Card Surcharge"
        description=""
        isOpen={showNewCardSurchargeForm}
        onClose={() => {
          setEditingCardSurcharge(null);
          setNewCardSurcharge(getDefaultCardSurcharge);
          setShowNewCardSurchargeForm(false);
        }}
      >
        <div className="space-y-8 rounded-lg bg-secondary/20 p-4">
          <div className="space-y-2">
            <Label className="font-semibold">Card Type</Label>
            <Input
              placeholder="Enter card type (e.g., Visa, Mastercard)"
              value={newCardSurcharge.name}
              onChange={(e) =>
                setNewCardSurcharge((prev: any) => ({
                  ...prev,
                  name: e.target.value
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">Surcharge Percentage</Label>
            <div className="relative">
              <Input
                type="number"
                step="0.1"
                placeholder="Enter surcharge percentage"
                value={newCardSurcharge.value}
                onChange={(e) =>
                  setNewCardSurcharge((prev: any) => ({
                    ...prev,
                    value: e.target.value
                  }))
                }
                className="pl-6"
              />
              <span className="absolute left-2 top-1/2 -translate-y-1/2">
                %
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <Label className="font-semibold">Payment Processors</Label>
            <div className="space-y-4 px-4">
              <div className="flex max-w-40 items-center justify-between">
                <Label htmlFor="use-windcave">Windcave</Label>
                <Switch
                  id="use-windcave"
                  checked={newCardSurcharge.use_windcave === 1}
                  onCheckedChange={(checked) =>
                    setNewCardSurcharge((prev: any) => ({
                      ...prev,
                      use_windcave: checked ? 1 : 0
                    }))
                  }
                />
              </div>
              <div className="flex max-w-40 items-center justify-between">
                <Label htmlFor="use-stripe">Stripe</Label>
                <Switch
                  id="use-stripe"
                  checked={newCardSurcharge.use_stripe === 1}
                  onCheckedChange={(checked) =>
                    setNewCardSurcharge((prev: any) => ({
                      ...prev,
                      use_stripe: checked ? 1 : 0
                    }))
                  }
                />
              </div>
              <div className="flex max-w-40 items-center justify-between">
                <Label htmlFor="use-novatti">Novatti</Label>
                <Switch
                  id="use-novatti"
                  checked={newCardSurcharge.use_novatti === 1}
                  onCheckedChange={(checked) =>
                    setNewCardSurcharge((prev: any) => ({
                      ...prev,
                      use_novatti: checked ? 1 : 0
                    }))
                  }
                />
              </div>
              <div className="flex max-w-40 items-center justify-between">
                <Label htmlFor="use-worldline">Worldline</Label>
                <Switch
                  id="use-worldline"
                  checked={newCardSurcharge.use_worldline === 1}
                  onCheckedChange={(checked) =>
                    setNewCardSurcharge((prev: any) => ({
                      ...prev,
                      use_worldline: checked ? 1 : 0
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowNewCardSurchargeForm(false);
                setEditingCardSurcharge(null);
                setNewCardSurcharge(getDefaultCardSurcharge);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={
                editingCardSurcharge
                  ? handleUpdateCardSurcharge
                  : handleCreateCardSurcharge
              }
              disabled={
                loading || !newCardSurcharge.name || !newCardSurcharge.value
              }
            >
              {editingCardSurcharge ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
      <div className="min-h-dvh">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Surcharge</TableCell>
              <TableCell>Payment processors</TableCell>
              <TableCell className="w-1/12 text-center">Value</TableCell>
              <TableCell className="w-1/12 text-center">Edit</TableCell>
              <TableCell className="w-1/12 text-center">Delete</TableCell>
              <TableCell className="w-1/12 text-center">Activate</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>{cardSurcharges.map(renderCardSurchargeItem)}</TableBody>
        </Table>
      </div>

      {/* <div className="sticky bottom-0 mt-8 flex justify-between bg-background py-4">
        <Button variant="outline">Preview payment</Button>
        <Button onClick={handleSave} className="w-36">
          Save
        </Button>
      </div> */}
      <Modal
        title="Delete Card Surcharge"
        description="Are you sure you want to delete this card surcharge?"
        isOpen={deleteCardSurchargeModalOpen}
        onClose={() => {
          setDeleteCardSurchargeModalOpen(false);
          setEditingCardSurcharge(null);
          setNewCardSurcharge(getDefaultCardSurcharge);
        }}
      >
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setDeleteCardSurchargeModalOpen(false);
              setEditingCardSurcharge(null);
              setNewCardSurcharge(getDefaultCardSurcharge);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleDeleteCardSurcharge(editingCardSurcharge.id);
              setEditingCardSurcharge(null);
              setNewCardSurcharge(getDefaultCardSurcharge);
              setDeleteCardSurchargeModalOpen(false);
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
