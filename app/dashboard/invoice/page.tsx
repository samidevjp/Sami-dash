'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useApi } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import PageContainer from '@/components/layout/page-container';
import { ProductCreationModal } from './ProductCreationModal';
import { CustomerCreationModal } from './CustomerCreationModal';
import InvoiceDialog from '@/components/invoice/invoice-dialog';

import { Heading } from '@/components/ui/heading';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { usePermissionsStore } from '@/hooks/usePermissionsStore';
import PaymentLinkDialog from '@/components/invoice/payment-link-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { InvoiceTable } from '@/components/invoice/invoice-table';
import { PaymentLinksTable } from '@/components/invoice/payment-links-table';
import { StripePaymentLink } from '@/types';

export default function GenerateInvoiceOrSubscription() {
  const router = useRouter();
  const { permissions } = usePermissionsStore();
  const { data: session } = useSession();
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [businessSettings, setBusinessSettings] = useState<any>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [mergedItems, setMergedItems] = useState<{
    oneTime: any[];
    recurring: any[];
  }>({
    oneTime: [],
    recurring: []
  });
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [newCustomerDescription, setNewCustomerDescription] = useState('');
  const [recurringInterval, setRecurringInterval] = useState('month');
  const [hasMore, setHasMore] = useState(false); // For invoice pagination
  const [startingAfter, setStartingAfter] = useState<string | null>(null);
  const [startingAfterPaymentLinks, setStartingAfterPaymentLinks] = useState<
    string | null
  >(null);

  const [existingLinks, setExistingLinks] = useState<StripePaymentLink[]>([]);

  const [invoices, setInvoices] = useState<any[]>([]);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isPaymentLinkDialogOpen, setIsPaymentLinkDialogOpen] =
    useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'invoice' | 'link'>('invoice');
  const [hasMorePaymentLinks, setHasMorePaymentLinks] = useState(false); // For payment link pagination
  const [isPaymentLinkLoading, setIsPaymentLinkLoading] = useState(false);
  const [paymentLinkStatus, setPaymentLinkStatus] = useState<
    'all' | 'active' | 'deactivated' | null
  >(null);
  const {
    getStripeInvoices,
    getStripeAccount,
    getStripeProducts,
    getStripeBrandingLogo,
    getStripePaymentLink
  } = useApi();
  const fetchInvoices = async (
    startingAfter: string | null = null,
    newInvoiceId: string | null = null
  ) => {
    try {
      const response = await getStripeInvoices({
        starting_after: startingAfter,
        status: status
      });

      setInvoices((prevInvoices) => {
        const newInvoices = response?.data;
        let filteredInvoices = [];
        if (newInvoiceId !== null) {
          filteredInvoices = newInvoices?.filter(
            (newInvoice: any) => newInvoice.id === newInvoiceId
          );
          return [...filteredInvoices, ...prevInvoices];
        }
        filteredInvoices = newInvoices?.filter(
          (newInvoice: any) =>
            !prevInvoices.some((invoice) => invoice.id === newInvoice.id)
        );
        if (!filteredInvoices) {
          return prevInvoices;
        }

        return [...prevInvoices, ...filteredInvoices];
      });

      setHasMore(response.has_more);

      // Set startingAfter for the next pagination request
      if (response.data.length > 0) {
        setStartingAfter(response.data[response.data.length - 1].id);
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    }
  };

  const fetchPaymentLink = async (reset = false) => {
    setIsPaymentLinkLoading(true);
    try {
      const response = await getStripePaymentLink({
        account: session?.user.stripeAccount as string,
        limit: 10,
        starting_after: reset ? undefined : startingAfterPaymentLinks,
        status: paymentLinkStatus || 'all'
      });
      if (response?.payment_links?.length > 0) {
        setExistingLinks((prev) =>
          reset ? response.payment_links : [...prev, ...response.payment_links]
        );
        setHasMorePaymentLinks(response.has_more);
        setStartingAfterPaymentLinks(response.next_starting_after || '');
      } else {
        setExistingLinks([]);
        setHasMorePaymentLinks(false);
        setStartingAfterPaymentLinks(null);
      }
    } catch (error) {
      console.error('Failed to fetch payment link:', error);
    } finally {
      setIsPaymentLinkLoading(false);
    }
  };
  const handleLoadMore = () => {
    if (hasMore) {
      fetchInvoices(startingAfter);
    }
  };

  const handleCreateInvoiceClick = () => {
    setIsCreatingInvoice(true);
  };

  const handleBackToListClick = () => {
    setSelectedInvoice(null);
    setIsCreatingInvoice(false);
    setIsEdit(false);
    setShowInvoiceForm(false);
    setShowSubscriptionForm(false);
    setSelectedItems([]);
    setSelectedCustomer(null);
  };

  const handleCreateSubscription = async () => {
    setIsLoading(true);

    try {
      const subscriptionItems = selectedItems.map((item) => ({
        price: item.price.id
      }));

      const subscriptionResponse = await axios.post(
        '/api/subscription/create',
        {
          customer: selectedCustomer,
          items: subscriptionItems,
          accountId: session?.user.stripeAccount
        }
      );

      if (subscriptionResponse.status === 200) {
        console.log('Subscription created successfully!');
      } else {
        setErrorMessage('Failed to create subscription.');
      }
    } catch (error) {
      setErrorMessage('An error occurred while creating the subscription.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  const [stripeProduct, setStripeProduct] = useState<any>([]);

  const handleCreateProduct = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      let productResponse;
      if (showInvoiceForm) {
        productResponse = await axios.post('/api/price/create', {
          title: newProductName,
          unit_amount: newProductPrice,
          accountId: session?.user.stripeAccount
        });
      } else if (showSubscriptionForm) {
        productResponse = await axios.post('/api/subscription/product/create', {
          productName: newProductName,
          unit_amount: newProductPrice,
          interval: recurringInterval,
          accountId: session?.user.stripeAccount
        });
      }

      // @ts-ignore
      if (productResponse.status !== 200) {
        throw new Error('Failed to create product.');
      }

      const createdProduct = {
        // @ts-ignore
        ...productResponse.data.product,
        // @ts-ignore
        price: productResponse.data.price
      };

      setMergedItems((prevItems: any) => {
        const newItems = showInvoiceForm
          ? { ...prevItems, oneTime: [...prevItems.oneTime, createdProduct] }
          : {
              ...prevItems,
              recurring: [...prevItems.recurring, createdProduct]
            };

        return newItems;
      });
      setShowProductModal(false);
      setNewProductName('');
      setNewProductPrice('');
      setRecurringInterval('month');
    } catch (error) {
      setErrorMessage('An error occurred while creating the product.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCustomer = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const customerResponse = await axios.post('/api/customers/create', {
        email: newCustomerEmail,
        description: newCustomerDescription,
        accountId: session?.user.stripeAccount
      });

      if (customerResponse.status !== 200) {
        throw new Error('Failed to create customer.');
      }

      const createdCustomer = customerResponse.data.customer;

      setCustomers((prevCustomers) => [...prevCustomers, createdCustomer]);
      setSelectedCustomer(createdCustomer.id);
      setShowCustomerModal(false);
      setNewCustomerEmail('');
    } catch (error) {
      setErrorMessage('An error occurred while creating the customer.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    setHasMore(false);
    setInvoices([]);
    fetchInvoices();
  }, [status]);

  useEffect(() => {
    setHasMorePaymentLinks(false);
    setExistingLinks([]);
    fetchPaymentLink(true);
  }, [paymentLinkStatus]);
  useEffect(() => {
    const fetchBusinessSettings = async () => {
      try {
        const responseData = await getStripeAccount();
        setBusinessSettings(responseData);
        const response = await getStripeBrandingLogo();
        setLogoUrl(response.logo_url);
      } catch (error) {
        console.error(
          'An error occurred while fetching business settings:',
          error
        );
      }
    };

    const handleGetStripeProducts = async (allProducts: any[] = []) => {
      try {
        const lastId = allProducts[allProducts.length - 1]?.product?.id;
        const response = await getStripeProducts({
          limit: 30,
          starting_after: lastId || undefined
        });

        const updatedProducts = [...allProducts, ...response.list];

        setStripeProduct(updatedProducts);

        if (response.has_more && response.list.length > 0) {
          await handleGetStripeProducts(updatedProducts);
        }
      } catch (error) {
        console.error('Failed to fetch Stripe products:', error);
      }
    };

    const fetchPrices = async () => {
      try {
        const response = await axios.post('/api/products', {
          accountId: session?.user.stripeAccount
        });
        const allPrices = response.data.prices.data;
        const allProducts = response.data.products.data;

        // Separate prices based on type
        const oneTimePrices = allPrices.filter(
          (price: any) => price.type === 'one_time'
        );
        const recurringPrices = allPrices.filter(
          (price: any) => price.type === 'recurring'
        );

        // Merge prices with their corresponding products
        const mergedOneTimeItems = mergeProductsAndPrices(
          allProducts,
          oneTimePrices
        );
        const mergedRecurringItems = mergeProductsAndPrices(
          allProducts,
          recurringPrices
        );
        setMergedItems({
          oneTime: mergedOneTimeItems,
          recurring: mergedRecurringItems
        });
      } catch (error) {
        console.error('An error occurred while fetching prices:', error);
      }
    };

    const fetchCustomers = async () => {
      try {
        const response = await axios.post('/api/customers', {
          accountId: session?.user.stripeAccount
        });
        setCustomers(response.data.customers.data);
      } catch (error) {
        console.error('An error occurred while fetching customers:', error);
      }
    };

    fetchBusinessSettings();
    fetchPrices();
    fetchCustomers();
    fetchInvoices();
    fetchPaymentLink(true);
    handleGetStripeProducts();
  }, [session?.user.stripeAccount]);

  const mergeProductsAndPrices = (products: any, prices: any) => {
    return prices.map((price: any) => {
      const product = products.find(
        (product: any) => product.id === price.product
      );
      return {
        ...product,
        price
      };
    });
  };

  const handleProductSelect = (product: any) => {
    const selectedItem =
      mergedItems?.oneTime?.find((item: any) => item.id === product.id) ||
      mergedItems?.recurring?.find((item: any) => item.id === product.id);
    selectedItem.quantity = product.quantity;

    if (selectedItem) {
      setSelectedItems((prevItems) => [...prevItems, selectedItem]);
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomer(customerId);
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return selectedItems.reduce(
      (total, item) =>
        total + (item.price?.unit_amount * item.quantity || 0) / 100,
      0
    );
  };
  const openDialog = async (invoice: any) => {
    setIsCreatingInvoice(true);
    if (invoice) {
      setIsEdit(true);
      setSelectedInvoice(invoice);
      setSelectedCustomer(invoice.customer);
      setSelectedItems(invoice.lines.data.reverse());
    }
  };

  const statuses = [
    { id: 'all', name: 'All Invoices' },
    { id: 'draft', name: 'Draft' },
    { id: 'open', name: 'Open' },
    { id: 'paid', name: 'Paid' },
    { id: 'void', name: 'Deactivated' }
  ];
  const paymentLinkStatuses = [
    { id: 'all', name: 'All Payment Links' },
    { id: 'active', name: 'Active' },
    { id: 'deactivated', name: 'deactivated' }
  ];
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isPaymentLinkStatusDropdownOpen, setIsPaymentLinkStatusDropdownOpen] =
    useState(false);

  useEffect(() => {
    if (!permissions.mainNav?.invoice) {
      router.push('/dashboard');
    }
  }, [permissions, router]);

  // If no permission, don't render anything
  if (!permissions.mainNav?.invoice) {
    return null;
  }

  return (
    <PageContainer scrollable>
      <div className="w-[100%] overflow-x-scroll pt-[1px] lg:w-full">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'invoice' | 'link')}
        >
          {/* Invoice List View */}
          <div className="mb-4 items-center justify-between md:flex">
            <Heading
              title={`Online Payments`}
              description="Manage your invoices and payment-links."
              titleClass="text-xl"
              descriptionClass="text-sm"
            />

            <TabsList className="max-md:my-4">
              <TabsTrigger value="invoice">Invoices</TabsTrigger>
              <TabsTrigger value="link">Payment Links</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              {activeTab === 'link' && (
                <DropdownMenu
                  open={isPaymentLinkStatusDropdownOpen}
                  onOpenChange={setIsPaymentLinkStatusDropdownOpen}
                >
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="max-w-60">
                      {paymentLinkStatus
                        ? paymentLinkStatuses.find(
                            (c) => c.id === paymentLinkStatus
                          )?.name
                        : 'Filter by Status'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {paymentLinkStatuses.map((s) => (
                      <DropdownMenuItem
                        key={s.id}
                        onSelect={() => {
                          setExistingLinks([]);
                          setStartingAfterPaymentLinks(null);
                          setPaymentLinkStatus(
                            s.id as 'all' | 'active' | 'deactivated'
                          );
                          // fetchPaymentLink(true);
                        }}
                      >
                        {s.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {activeTab === 'invoice' && (
                <DropdownMenu
                  open={isStatusDropdownOpen}
                  onOpenChange={setIsStatusDropdownOpen}
                >
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="max-w-60">
                      {status
                        ? statuses.find((c: any) => c.id === status)?.name
                        : 'Filter by Status'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuItem
                      key={Math.random()}
                      onSelect={() => setStatus('')}
                    >
                      All Invoices
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      key={Math.random()}
                      onSelect={() => setStatus('draft')}
                    >
                      Draft
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      key={Math.random()}
                      onSelect={() => setStatus('open')}
                    >
                      Open
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      key={Math.random()}
                      onSelect={() => setStatus('paid')}
                    >
                      Paid
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      key={Math.random()}
                      onSelect={() => setStatus('void')}
                    >
                      Deactivated
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary">+ Create</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={handleCreateInvoiceClick}>
                    Create Invoice
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => setIsPaymentLinkDialogOpen(true)}
                  >
                    Create Payment Link
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <TabsContent value="invoice" className="">
            <InvoiceTable
              invoices={invoices}
              hasMore={hasMore}
              handleLoadMore={handleLoadMore}
              openDialog={openDialog}
            />
          </TabsContent>
          <TabsContent value="link" className="">
            <PaymentLinksTable
              existingLinks={existingLinks}
              toast={toast}
              hasMorePaymentLinks={hasMorePaymentLinks}
              isPaymentLinkLoading={isPaymentLinkLoading}
              fetchPaymentLink={fetchPaymentLink}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}

      <ProductCreationModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        isLoading={isLoading}
        showInvoiceForm={showInvoiceForm}
        newProductName={newProductName}
        setNewProductName={setNewProductName}
        newProductPrice={newProductPrice}
        setNewProductPrice={setNewProductPrice}
        recurringInterval={recurringInterval}
        setRecurringInterval={setRecurringInterval}
        handleCreateProduct={handleCreateProduct}
      />

      <CustomerCreationModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        isLoading={isLoading}
        newCustomerEmail={newCustomerEmail}
        setNewCustomerEmail={setNewCustomerEmail}
        newCustomerDescription={newCustomerDescription}
        setNewCustomerDescription={setNewCustomerDescription}
        handleCreateCustomer={handleCreateCustomer}
        customers={customers}
      />
      {isCreatingInvoice && (
        <InvoiceDialog
          businessSettings={businessSettings}
          calculateTotal={calculateTotal}
          customers={customers}
          fetchInvoices={fetchInvoices}
          handleCreateSubscription={handleCreateSubscription}
          handleCustomerSelect={handleCustomerSelect}
          handleProductSelect={handleProductSelect}
          handleRemoveItem={handleRemoveItem}
          isEdit={isEdit}
          isLoading={isLoading}
          isOpen={isCreatingInvoice}
          logoUrl={logoUrl}
          mergedItems={mergedItems}
          onClose={handleBackToListClick}
          selectedCustomer={selectedCustomer}
          selectedInvoice={selectedInvoice}
          selectedItems={selectedItems}
          session={session}
          setIsLoading={setIsLoading}
          setShowCustomerModal={setShowCustomerModal}
          setShowInvoiceForm={setShowInvoiceForm}
          setShowProductModal={setShowProductModal}
          setShowSubscriptionForm={setShowSubscriptionForm}
          showInvoiceForm={showInvoiceForm}
          showSubscriptionForm={showSubscriptionForm}
        />
      )}
      {isPaymentLinkDialogOpen && (
        <PaymentLinkDialog
          isOpen={isPaymentLinkDialogOpen}
          onClose={() => setIsPaymentLinkDialogOpen(false)}
          session={session}
          stripeItems={mergedItems.oneTime}
          setMergedItems={setMergedItems}
          existingLinks={existingLinks}
          setExistingLinks={setExistingLinks}
        />
      )}
    </PageContainer>
  );
}
