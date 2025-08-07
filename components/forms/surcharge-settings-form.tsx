'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import SurchargeGeneralSettings from './surcharge-general-settings';
import { CustomSurcharge } from './CustomSurcharge';
import {
  NewOtherSurcharge,
  OtherSurcharge,
  NewCardSurcharge,
  DayOption,
  CardSurcharge as CardSurchargeType
} from '@/types';
import { CardSurcharge } from './CardSurcharge';

interface SurchargeSettingsFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  selectedTab: string;
}

export default function SurchargeSettingsForm({
  onSubmit,
  initialData,
  selectedTab
}: SurchargeSettingsFormProps) {
  const {
    getPosOtherSurcharge,
    getPosCardSurcharge,
    createOtherSurcharge,
    createCardSurcharge,
    toggleOtherSurchargeStatus,
    toggleCardSurchargeStatus,
    updateOtherSurcharge,
    updateCardSurcharge,
    deleteOtherSurcharge,
    deleteCardSurcharge
  } = useApi();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [otherSurcharges, setOtherSurcharges] = useState<OtherSurcharge[]>([]);
  const [newOtherSurcharge, setNewOtherSurcharge] = useState<NewOtherSurcharge>(
    {
      name: '',
      value: '',
      status: 1,
      auto_add: 0,
      type: 1,
      use_type: 3,
      day_of_week: [],
      selected_date: format(new Date(), 'yyyy-MM-dd'),
      branch_id: null
    }
  );
  const [showNewSurchargeForm, setShowNewSurchargeForm] = useState(false);
  const [editingSurcharge, setEditingSurcharge] =
    useState<OtherSurcharge | null>(null);

  const [phoneOrders, setPhoneOrders] = useState(false);
  const [takeawayOrders, setTakeawayOrders] = useState(false);
  const [dineInOrders, setDineInOrders] = useState(false);

  const [orderTypes, setOrderTypes] = useState({
    walkIn: false,
    phoneOrder: false,
    takeAway: false
  });

  const [cardSurcharges, setCardSurcharges] = useState<CardSurchargeType[]>([]);
  const [newCardSurcharge, setNewCardSurcharge] = useState<NewCardSurcharge>({
    name: '',
    value: '',
    status: 1,
    type: 1,
    use_windcave: 0,
    use_stripe: 0,
    use_novatti: 0,
    use_worldline: 0,
    branch_id: null
  });
  const [editingCardSurcharge, setEditingCardSurcharge] =
    useState<CardSurchargeType | null>(null);
  const [showNewCardSurchargeForm, setShowNewCardSurchargeForm] =
    useState(false);
  const [deleteSurchargeModalOpen, setDeleteSurchargeModalOpen] =
    useState(false);
  const [surchargeToDelete, setSurchargeToDelete] =
    useState<OtherSurcharge | null>(null);
  const [deleteCardSurchargeModalOpen, setDeleteCardSurchargeModalOpen] =
    useState(false);

  const days: DayOption[] = [
    { id: 1, label: 'Monday', short: 'Mon' },
    { id: 2, label: 'Tuesday', short: 'Tue' },
    { id: 3, label: 'Wednesday', short: 'Wed' },
    { id: 4, label: 'Thursday', short: 'Thu' },
    { id: 5, label: 'Friday', short: 'Fri' },
    { id: 6, label: 'Saturday', short: 'Sat' },
    { id: 7, label: 'Sunday', short: 'Sun' }
  ];

  useEffect(() => {
    fetchOtherSurcharges();
    fetchCardSurcharges();
  }, []);

  const fetchOtherSurcharges = async () => {
    try {
      const data = await getPosOtherSurcharge();
      setOtherSurcharges(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch other surcharges',
        variant: 'destructive'
      });
    }
  };

  const fetchCardSurcharges = async () => {
    try {
      const data = await getPosCardSurcharge();
      setCardSurcharges(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch card surcharges',
        variant: 'destructive'
      });
    }
  };

  // Helper function to determine use_type based on selected options
  const getUseType = (
    walkIn: boolean,
    phoneOrder: boolean,
    takeAway: boolean
  ): number => {
    if (walkIn && phoneOrder && takeAway) return 7;
    if (walkIn && phoneOrder) return 3;
    if (walkIn) return 1;
    if (phoneOrder) return 2;
    if (takeAway) return 4;
    return 3; // default to walk-in + phone order
  };

  // Helper function to get selected options from use_type
  const getSelectedOptions = (useType: number) => {
    return {
      walkIn: [1, 3, 7].includes(useType),
      phoneOrder: [2, 3, 7].includes(useType),
      takeAway: [4, 7].includes(useType)
    };
  };

  const handleToggleStatus = async (id: number, currentStatus: number) => {
    setLoading(true);
    try {
      await toggleOtherSurchargeStatus({
        id,
        status: currentStatus === 1 ? 0 : 1
      });
      await fetchOtherSurcharges();
      toast({
        title: 'Success',
        description: 'Surcharge status updated successfully',
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update surcharge status',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleCreateSurcharge = async () => {
    if (!newOtherSurcharge.name || !newOtherSurcharge.value) {
      toast({
        title: 'Error',
        description: 'Please fill in both name and value',
        variant: 'destructive'
      });
      return;
    }

    const useType = getUseType(
      orderTypes.walkIn,
      orderTypes.phoneOrder,
      orderTypes.takeAway
    );

    setLoading(true);
    try {
      await createOtherSurcharge({
        ...newOtherSurcharge,
        use_type: useType
      });
      await fetchOtherSurcharges();
      setNewOtherSurcharge({
        name: '',
        value: '',
        status: 1,
        auto_add: 0,
        type: 1,
        use_type: 3,
        day_of_week: [],
        selected_date: format(new Date(), 'yyyy-MM-dd'),
        branch_id: null
      });
      setOrderTypes({
        walkIn: false,
        phoneOrder: false,
        takeAway: false
      });
      setShowNewSurchargeForm(false);
      toast({
        title: 'Success',
        description: 'Other surcharge created successfully',
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create other surcharge',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleUpdateSurcharge = async () => {
    if (!editingSurcharge) return;

    setLoading(true);
    const useType = getUseType(
      orderTypes.walkIn,
      orderTypes.phoneOrder,
      orderTypes.takeAway
    );

    try {
      await updateOtherSurcharge({
        ...editingSurcharge,
        name: newOtherSurcharge.name,
        value: newOtherSurcharge.value,
        day_of_week: newOtherSurcharge.day_of_week,
        selected_date: newOtherSurcharge.selected_date,
        type: newOtherSurcharge.type,
        use_type: useType
      });
      await fetchOtherSurcharges();
      setNewOtherSurcharge({
        name: '',
        value: '',
        status: 1,
        auto_add: 1,
        type: 1,
        use_type: 3,
        day_of_week: [],
        selected_date: format(new Date(), 'yyyy-MM-dd'),
        branch_id: null
      });
      setEditingSurcharge(null);
      setShowNewSurchargeForm(false);
      toast({
        title: 'Success',
        description: 'Surcharge updated successfully',
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update surcharge',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSurcharge = async (id: number) => {
    setLoading(true);
    try {
      await deleteOtherSurcharge(id);
      await fetchOtherSurcharges();
      toast({
        title: 'Success',
        description: 'Surcharge deleted successfully',
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete surcharge',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (surcharge: OtherSurcharge) => {
    const selectedOptions = getSelectedOptions(surcharge.use_type);
    setOrderTypes({
      walkIn: selectedOptions.walkIn,
      phoneOrder: selectedOptions.phoneOrder,
      takeAway: selectedOptions.takeAway
    });
    setEditingSurcharge(surcharge);
    setNewOtherSurcharge({
      name: surcharge.name,
      value: surcharge.value,
      status: surcharge.status,
      auto_add: surcharge.auto_add,
      type: surcharge.type,
      use_type: surcharge.use_type,
      day_of_week: surcharge.day_of_week,
      selected_date: surcharge.selected_date
    });
    setShowNewSurchargeForm(true);
  };

  const toggleDay = (dayId: number) => {
    setNewOtherSurcharge((prev) => ({
      ...prev,
      day_of_week: prev.day_of_week?.includes(dayId)
        ? prev.day_of_week.filter((d) => d !== dayId)
        : [...(prev.day_of_week || []), dayId]
    }));
  };

  const handleSave = () => {
    onSubmit({
      phoneOrders,
      takeawayOrders,
      dineInOrders,
      otherSurcharges
    });
  };

  // const formButtons = (
  //   <div className="flex justify-end gap-2">
  //     <Button
  //       variant="outline"
  //       onClick={() => {
  //         setShowNewSurchargeForm(false);
  //         setEditingSurcharge(null);
  //         setNewOtherSurcharge({
  //           name: '',
  //           value: '',
  //           status: 1,
  //           auto_add: 1,
  //           type: 1,
  //           use_type: 3,
  //           day_of_week: [],
  //           selected_date: format(new Date(), 'yyyy-MM-dd'),
  //           branch_id: null
  //         });
  //       }}
  //     >
  //       Cancel
  //     </Button>
  //     <Button
  //       onClick={
  //         editingSurcharge ? handleUpdateSurcharge : handleCreateSurcharge
  //       }
  //       disabled={
  //         loading || !newOtherSurcharge.name || !newOtherSurcharge.value
  //       }
  //     >
  //       {editingSurcharge ? 'Update' : 'Create'}
  //     </Button>
  //   </div>
  // );

  const handleCreateCardSurcharge = async () => {
    if (!newCardSurcharge.name || !newCardSurcharge.value) {
      toast({
        title: 'Error',
        description: 'Please fill in both card type and surcharge percentage',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      await createCardSurcharge(newCardSurcharge);
      await fetchCardSurcharges();
      setNewCardSurcharge({
        name: '',
        value: '',
        status: 1,
        type: 1,
        use_windcave: 0,
        use_stripe: 0,
        use_novatti: 0,
        use_worldline: 0,
        branch_id: null
      });
      setShowNewCardSurchargeForm(false);
      toast({
        title: 'Success',
        description: 'Card surcharge created successfully',
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create card surcharge',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCardStatus = async (id: number, currentStatus: number) => {
    setLoading(true);
    try {
      await toggleCardSurchargeStatus({
        id,
        status: currentStatus === 1 ? 0 : 1
      });
      await fetchCardSurcharges();
      toast({
        title: 'Success',
        description: 'Card surcharge status updated successfully',
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update card surcharge status',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCardSurcharge = async () => {
    if (!editingCardSurcharge) return;

    setLoading(true);
    try {
      await updateCardSurcharge({
        ...editingCardSurcharge,
        name: newCardSurcharge.name,
        value: newCardSurcharge.value,
        use_windcave: newCardSurcharge.use_windcave,
        use_stripe: newCardSurcharge.use_stripe,
        use_novatti: newCardSurcharge.use_novatti,
        use_worldline: newCardSurcharge.use_worldline
      });
      await fetchCardSurcharges();
      setNewCardSurcharge({
        name: '',
        value: '',
        status: 1,
        type: 1,
        use_windcave: 0,
        use_stripe: 0,
        use_novatti: 0,
        use_worldline: 0,
        branch_id: null
      });
      setEditingCardSurcharge(null);
      setShowNewCardSurchargeForm(false);
      toast({
        title: 'Success',
        description: 'Card surcharge updated successfully',
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update card surcharge',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCardSurcharge = async (id: number) => {
    setLoading(true);
    try {
      await deleteCardSurcharge(id);
      await fetchCardSurcharges();
      toast({
        title: 'Success',
        description: 'Card surcharge deleted successfully',
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete card surcharge',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditCardClick = (surcharge: CardSurchargeType) => {
    setEditingCardSurcharge(surcharge);
    setNewCardSurcharge({
      name: surcharge.name,
      value: surcharge.value,
      status: surcharge.status,
      type: surcharge.type,
      use_windcave: surcharge.use_windcave,
      use_stripe: surcharge.use_stripe,
      use_novatti: surcharge.use_novatti,
      use_worldline: surcharge.use_worldline
    });
    setShowNewCardSurchargeForm(true);
  };

  return (
    <div className="">
      {/* {selectedTab === 'General-Settings' && (
        <SurchargeGeneralSettings
          phoneOrders={phoneOrders}
          takeawayOrders={takeawayOrders}
          dineInOrders={dineInOrders}
          setPhoneOrders={setPhoneOrders}
          setTakeawayOrders={setTakeawayOrders}
          setDineInOrders={setDineInOrders}
        />
      )} */}
      {selectedTab === 'Custom-Surcharge' && (
        <CustomSurcharge
          orderTypes={orderTypes}
          setOrderTypes={setOrderTypes}
          newOtherSurcharge={newOtherSurcharge}
          setNewOtherSurcharge={setNewOtherSurcharge}
          editingSurcharge={editingSurcharge}
          setEditingSurcharge={setEditingSurcharge}
          showNewSurchargeForm={showNewSurchargeForm}
          setShowNewSurchargeForm={setShowNewSurchargeForm}
          otherSurcharges={otherSurcharges}
          days={days}
          loading={loading}
          handleCreateSurcharge={handleCreateSurcharge}
          handleUpdateSurcharge={handleUpdateSurcharge}
          handleDeleteSurcharge={handleDeleteSurcharge}
          deleteSurchargeModalOpen={deleteSurchargeModalOpen}
          setDeleteSurchargeModalOpen={setDeleteSurchargeModalOpen}
          handleEditClick={handleEditClick}
          handleToggleStatus={handleToggleStatus}
          handleSave={handleSave}
          toggleDay={toggleDay}
          surchargeToDelete={surchargeToDelete}
          setSurchargeToDelete={setSurchargeToDelete}
        />
      )}
      {selectedTab === 'Card-Surcharge' && (
        <CardSurcharge
          cardSurcharges={cardSurcharges}
          editingCardSurcharge={editingCardSurcharge}
          setEditingCardSurcharge={setEditingCardSurcharge}
          newCardSurcharge={newCardSurcharge}
          setNewCardSurcharge={setNewCardSurcharge}
          showNewCardSurchargeForm={showNewCardSurchargeForm}
          setShowNewCardSurchargeForm={setShowNewCardSurchargeForm}
          loading={loading}
          handleCreateCardSurcharge={handleCreateCardSurcharge}
          handleUpdateCardSurcharge={handleUpdateCardSurcharge}
          handleDeleteCardSurcharge={handleDeleteCardSurcharge}
          handleEditCardClick={handleEditCardClick}
          handleToggleCardStatus={handleToggleCardStatus}
          handleSave={handleSave}
          deleteCardSurchargeModalOpen={deleteCardSurchargeModalOpen}
          setDeleteCardSurchargeModalOpen={setDeleteCardSurchargeModalOpen}
        />
      )}
      {selectedTab === 'Ticket-Surcharge' && <></>}
    </div>
  );
}
