import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, CircleHelp } from 'lucide-react';
import axios from 'axios';

import { Dialog, DialogOverlay } from '@/components/ui/dialog';
import { CustomerProductSelection } from '@/app/dashboard/invoice/CustomerProductSelection';
import InvoiceEmailPreview from '@/components/invoice/email';
import InvoicePDFPreview from '@/components/invoice/pdf';
import { RadioGroup, RadioGroupItem } from '../ui/radio';
import { toast } from '../ui/use-toast';
import { useApi } from '@/hooks/useApi';
interface InvoiceDialogProps {
  businessSettings: any; // Replace with appropriate type
  calculateTotal: () => number;
  customers: any[]; // Replace with appropriate type
  fetchInvoices: any;
  handleCreateSubscription: () => void;
  handleCustomerSelect: (customerId: string) => void;
  handleProductSelect: any;
  handleRemoveItem: (index: number) => void;
  isEdit: boolean;
  isLoading: boolean;
  isOpen: boolean;
  logoUrl: string | null;
  mergedItems: {
    oneTime: any[]; // Replace with appropriate type
    recurring: any[]; // Replace with appropriate type
  };
  onClose: () => void;
  selectedCustomer: any; // Replace with appropriate type
  selectedInvoice: any;
  selectedItems: any[]; // Replace with appropriate type
  session: any; // Replace with appropriate type
  setIsLoading: any;
  setShowCustomerModal: (show: boolean) => void;
  setShowInvoiceForm: (show: boolean) => void;
  setShowProductModal: (show: boolean) => void;
  setShowSubscriptionForm: (show: boolean) => void;
  showInvoiceForm: boolean;
  showSubscriptionForm: boolean;
}

const InvoiceDialog: React.FC<InvoiceDialogProps> = ({
  businessSettings,
  calculateTotal,
  customers,
  fetchInvoices,
  handleCreateSubscription,
  handleCustomerSelect,
  handleProductSelect,
  handleRemoveItem,
  isEdit,
  isLoading,
  isOpen,
  logoUrl,
  mergedItems,
  onClose,
  selectedCustomer,
  selectedInvoice,
  selectedItems,
  session,
  setIsLoading,
  setShowCustomerModal,
  setShowInvoiceForm,
  setShowProductModal,
  setShowSubscriptionForm,
  showInvoiceForm,
  showSubscriptionForm
}) => {
  const [activeTab, setActiveTab] = useState<'pdf' | 'email'>('pdf');

  const [selectedForm, setSelectedForm] = useState<string>('invoice');
  const [description, setDescription] = useState<string>(
    selectedInvoice?.description || ''
  );
  const [footer, setFooter] = useState<string>(selectedInvoice?.footer || '');
  const [customFields, setCustomFields] = useState(
    selectedInvoice?.custom_fields || []
  );
  const [checkedStates, setCheckedStates] = useState({
    memo: !!description,
    footer: !!footer,
    customField: customFields.length > 0
  });
  const handleCloseModal = () => {
    setDescription('');
    setFooter('');
    setCustomFields([]);
    setCheckedStates({
      memo: false,
      footer: false,
      customField: false
    });
    onClose();
  };

  const { createStripeInvoice } = useApi();
  useEffect(() => {
    if (selectedForm) {
      if (selectedForm === 'invoice') {
        setShowInvoiceForm(true);
        setShowSubscriptionForm(false);
      } else {
        setShowInvoiceForm(false);
        setShowSubscriptionForm(true);
      }
    }
  }, [selectedForm]);

  const handleCreateInvoice = async (invoiceId = null) => {
    setIsLoading(true);
    try {
      const invoiceItems = await Promise.all(
        selectedItems.map(async (item) => {
          let priceId;

          if (item.price) {
            priceId = item.price.id;
          } else {
            const productResponse = await axios.post('/api/price/create', {
              title: item.name,
              unit_amount: item.value,
              accountId: session?.user.stripeAccount
            });

            if (productResponse.status !== 200) {
              throw new Error('Failed to create product.');
            }

            priceId = productResponse.data.price.id;
          }

          return {
            priceId,
            quantity: item.quantity,
            price: item.price.unit_amount / 100
          };
        })
      );
      let invoiceResponse;
      if (isEdit) {
        invoiceResponse = await axios.post('/api/invoice/update', {
          customer: selectedCustomer,
          invoiceId: invoiceId,
          items: invoiceItems,
          accountId: session?.user.stripeAccount,
          description: checkedStates.memo ? description : null,
          footer: checkedStates.footer ? footer : null,
          customFields: checkedStates.customField ? customFields : null
        });
      } else {
        invoiceResponse = await createStripeInvoice({
          customer: selectedCustomer as string,
          items: invoiceItems,
          description: checkedStates.memo ? description : '',
          footer: checkedStates.footer ? footer : '',
          customFields: checkedStates.customField ? customFields : null
        });
      }
      console.log('Invoice Response:', invoiceResponse);

      if (invoiceResponse?.status === 200) {
        toast({
          title: 'Success',
          description: 'Invoice created successfully!',
          duration: 3000,
          variant: 'success'
        });
        fetchInvoices(null, invoiceResponse.data.id);
        onClose();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to create invoice.',
          duration: 3000,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while creating the invoice.',
        duration: 3000,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  const divRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(600);
  useEffect(() => {
    const handleResize = () => {
      if (divRef.current) {
        setContentHeight(divRef.current.offsetHeight);
      }
    };
    handleResize();
  }, []);

  const headerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <Dialog open={isOpen} modal={true}>
        <DialogOverlay className="-webkit-backdrop-blur-3xl h-[100vh] min-w-[100vw] overflow-auto bg-secondary backdrop-blur-3xl">
          <div
            ref={headerRef}
            className="sticky left-0 top-0 z-[60] flex items-center justify-between border-b border-muted bg-background p-4 "
          >
            <X
              onClick={handleCloseModal}
              className="cursor-pointer text-foreground"
            />

            {isEdit ? (
              <div className="flex gap-4">
                <Button
                  className="flex items-center gap-1"
                  variant="secondary"
                  onClick={() =>
                    (window.location.href = selectedInvoice.invoice_pdf)
                  }
                >
                  <Download width={18} /> <span>Download PDF</span>
                </Button>
                <Button
                  onClick={() => handleCreateInvoice(selectedInvoice.id)}
                  disabled={isLoading}
                >
                  Upate Invoice
                </Button>
              </div>
            ) : (
              <Button
                onClick={() =>
                  showInvoiceForm
                    ? handleCreateInvoice()
                    : handleCreateSubscription()
                }
                disabled={
                  isLoading || !selectedCustomer || selectedItems.length === 0
                }
              >
                {isLoading
                  ? showInvoiceForm
                    ? 'Creating Invoice...'
                    : 'Creating Subscription...'
                  : isEdit
                  ? 'Upate Invoice'
                  : showInvoiceForm
                  ? 'Submit Invoice'
                  : 'Submit Subscription'}
              </Button>
            )}
          </div>
          <div
            style={{
              minHeight: `calc(100svh - ${headerRef.current?.offsetHeight}px)`
            }}
            className="z-10 flex flex-col lg:flex-row"
          >
            <div className="relative px-12 pb-20 pt-4 lg:w-1/2 lg:pr-4">
              {!isEdit && (
                <div className="mb-8 border-b border-muted pb-8">
                  <h3 className="mb-6 text-xl font-medium">
                    Invoice or Subscription
                  </h3>
                  <div className="mb-4">
                    <RadioGroup
                      value={selectedForm}
                      onValueChange={(value) => setSelectedForm(value)}
                      className="gap-4"
                    >
                      <RadioGroupItem value="invoice" label="Create Invoice" />
                      <RadioGroupItem
                        value="subscription"
                        label="Create Subscription"
                      />
                    </RadioGroup>
                  </div>
                </div>
              )}
              {(isEdit || showInvoiceForm || showSubscriptionForm) && (
                <div className="space-y-4">
                  <CustomerProductSelection
                    customers={customers}
                    selectedCustomer={selectedCustomer}
                    handleCustomerSelect={handleCustomerSelect}
                    mergedItems={
                      showInvoiceForm
                        ? mergedItems.oneTime
                        : mergedItems.recurring
                    }
                    handleRemoveItem={handleRemoveItem}
                    selectedItems={selectedItems}
                    handleProductSelect={handleProductSelect}
                    setShowCustomerModal={setShowCustomerModal}
                    setShowProductModal={setShowProductModal}
                    description={description}
                    setDescription={setDescription}
                    footer={footer}
                    setFooter={setFooter}
                    customFields={customFields}
                    setCustomFields={setCustomFields}
                    checkedStates={checkedStates}
                    setCheckedStates={setCheckedStates}
                  />
                </div>
              )}
            </div>
            <div className="mt-8 flex justify-center bg-backgroundPos p-8 pt-4 lg:mt-0 lg:w-1/2 lg:border-l">
              <div
                className="sticky"
                style={{ height: contentHeight, top: 78 }}
              >
                <div className="max-w-96" ref={divRef}>
                  <div className="relative mb-4">
                    {['pdf', 'email'].map((tab) => (
                      <button
                        key={tab}
                        className={`w-1/2 border-b border-gray px-2 pb-2 ${
                          activeTab === tab ? 'font-semibold' : ''
                        }`}
                        onClick={() => setActiveTab(tab as 'pdf' | 'email')}
                      >
                        {tab === 'pdf' ? 'Invoice PDF' : 'Email'}
                      </button>
                    ))}
                    <div
                      className={`absolute bottom-0 h-0.5 w-1/2 bg-primary transition-all ${
                        activeTab === 'pdf' ? 'right-1/2' : 'right-0'
                      }`}
                    />
                  </div>
                  {activeTab === 'email' && (
                    <p className="mb-2 ml-2 flex gap-1 text-xs">
                      <CircleHelp size={14} /> You can change the design in
                      General Settings
                    </p>
                  )}
                  {businessSettings?.settings ? (
                    <>
                      {activeTab === 'pdf' && (
                        <InvoicePDFPreview
                          logoUrl={logoUrl}
                          selectedCustomer={selectedCustomer}
                          customers={customers}
                          selectedItems={selectedItems}
                          selectedInvoice={selectedInvoice}
                          calculateTotal={calculateTotal}
                          description={description}
                          footer={footer}
                          customFields={customFields}
                          checkedStates={checkedStates}
                        />
                      )}
                      {activeTab === 'email' && (
                        <InvoiceEmailPreview
                          logoUrl={logoUrl}
                          session={session}
                          selectedInvoice={selectedInvoice}
                          businessSettings={businessSettings}
                          showInvoiceForm={showInvoiceForm}
                          selectedCustomer={selectedCustomer}
                          customers={customers}
                          selectedItems={selectedItems}
                          calculateTotal={calculateTotal}
                          handleRemoveItem={handleRemoveItem}
                        />
                      )}
                    </>
                  ) : (
                    <div>Loading...</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogOverlay>
      </Dialog>
    </>
  );
};

export default InvoiceDialog;
