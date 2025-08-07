'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import CreateInvoicePage from '../create-invoice/page';
import { toast } from '@/components/ui/use-toast';
import IngredientInventoryForm from '@/components/ingredient-inventory-form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { CalendarDateRangePicker } from '@/components/date-range-picker';
import { DateRange } from 'react-day-picker';
import {
  addDays,
  isWithinInterval,
  startOfYear,
  endOfDay,
  startOfMonth,
  startOfDay
} from 'date-fns';
import { FileIcon, ExternalLinkIcon, Pencil, Save, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEmployee } from '@/hooks/useEmployee';
import { Heading } from '@/components/ui/heading';

interface Invoice {
  id: number;
  amount: number;
  supplier: string;
  invoice_no: string;
  receive_by: string;
  date: string;
  file_path: string | null;
  products: Product[];
  stock_number: string;
  paid: boolean;
}

interface Product {
  item_name: string;
  quantity: number;
  price: string;
  total_amount: string;
}

const Page = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [totalAmountInvoices, setTotalAmountInvoices] = useState(0);
  const [isCreateInvoiceModalOpen, setIsCreateInvoiceModalOpen] =
    useState(false);
  const [productsModal, setProductsModal] = useState([]);
  const {
    getInvoiceData,
    fetchCategories,
    fetchInventoryLocations,
    fetchInventorySuppliers,
    listMeasurementUnits,
    fetchUnitDescriptions,
    fetchOrderUnit,
    saveProductInventory,
    saveInvoiceData,
    updateStockInventory,
    deleteInvoice
  } = useApi();
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<number | null>(
    null
  );
  const [inventoryData, setInventoryData] = useState({
    suppliers: [],
    categories: [],
    locations: [],
    measurementUnits: [],
    unitDescriptions: [],
    orderUnit: []
  });
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // New state to preserve CreateInvoicePage data
  const [createInvoiceData, setCreateInvoiceData] = useState({
    invoiceNumber: '',
    dateIssued: '',
    supplierName: '',
    supplierStockNumber: '',
    file: null,
    recognizedText: '',
    products: []
  });

  // Add new state for the card totals
  const [cardTotals, setCardTotals] = useState({
    today: 0,
    week: 0,
    month: 0,
    total: 0
  });

  const [editingInvoice, setEditingInvoice] = useState<number | null>(null);
  const [editedInvoice, setEditedInvoice] = useState<Invoice | null>(null);

  const { currentEmployee } = useEmployee();

  useEffect(() => {
    fetchInvoices();
    fetchInventoryData();
  }, []);

  useEffect(() => {
    calculateCardTotals();
  }, [invoices]); // This will run whenever invoices change

  useEffect(() => {
    console.log('All invoices:', invoices);
    invoices.forEach((invoice) => {
      console.log(
        `Invoice ${invoice.invoice_no} is duplicate:`,
        checkDuplicateInvoice(invoice.invoice_no)
      );
    });
  }, [invoices]);

  const fetchInvoices = useCallback(async () => {
    try {
      const response = await getInvoiceData();
      if (response.code === 'OK') {
        setInvoices(response.data.invoices.reverse());
        setTotalAmountInvoices(response.data.legend.total_amount_invoices);
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    }
  }, [getInvoiceData]);

  const fetchInventoryData = async () => {
    const [
      fetchedCategories,
      fetchedLocations,
      fetchedSuppliers,
      fetchedMeasurementUnits,
      fetchedUnitDescriptions,
      fetchedOrderUnit
    ] = await Promise.all([
      fetchCategories(),
      fetchInventoryLocations(),
      fetchInventorySuppliers(),
      listMeasurementUnits(),
      fetchUnitDescriptions(),
      fetchOrderUnit()
    ]);
    setInventoryData({
      categories: fetchedCategories,
      locations: fetchedLocations,
      suppliers: fetchedSuppliers,
      measurementUnits: fetchedMeasurementUnits,
      unitDescriptions: fetchedUnitDescriptions,
      orderUnit: fetchedOrderUnit
    });
  };

  const updateProductAsCreated = (productName: string) => {
    setProductsModal((prevProducts: any) =>
      prevProducts.map((product: any) =>
        product.name === productName ? { ...product, updated: true } : product
      )
    );
  };

  const onSubmitInvoice = async (formData: any) => {
    updateProductAsCreated(formData?.product_name);
    const response = await saveProductInventory(formData);
    const response2 = await updateStockInventory({
      pos_product_inventory_items_id: response.data.prod_item?.id,
      new_stock: response.data.prod_item.stock_amount || 0
    });
    toast({
      title: 'Product Added',
      description: 'The product has been added to the inventory.',
      variant: 'success'
    });
  };

  const handleCreateInvoiceClick = () => {
    setIsCreateInvoiceModalOpen(true);
  };

  const handleBackInvoiceClick = useCallback(() => {
    setIsCreateInvoiceModalOpen(false);
    fetchInvoices(); // Fetch updated invoice data when closing the modal
  }, [fetchInvoices]);

  const handleProductSelect = (product: any) => {
    console.log('Selected product:', product);
    setSelectedIngredient(product);
    setIsIngredientModalOpen(true);
    setIsCreateInvoiceModalOpen(false);
  };

  const handleCreateInvoiceDataChange = (newData: any) => {
    setCreateInvoiceData((prevData) => ({ ...prevData, ...newData }));
  };

  const toggleInvoiceExpansion = (invoiceId: number) => {
    setExpandedInvoiceId(expandedInvoiceId === invoiceId ? null : invoiceId);
  };

  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const invoiceDate = new Date(invoice.date);
    const matchesSearch =
      invoice.invoice_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'not_paid' && invoice.paid !== true) ||
      invoice.paid === (filterStatus === 'paid');
    const matchesDateRange =
      !dateRange?.from ||
      !dateRange?.to ||
      (dateRange.from &&
        dateRange.to &&
        isWithinInterval(invoiceDate, {
          start: dateRange.from,
          end: dateRange.to
        }));
    return matchesSearch && matchesStatus && matchesDateRange;
  });

  const toggleInvoiceStatus = async (invoiceId: number) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) return;

    const newPaidStatus = !invoice.paid;

    try {
      const params = {
        id: invoice.id,
        invoice: {
          number: invoice.invoice_no,
          date_issued: invoice.date
        },
        supplier: {
          name: invoice.supplier,
          stock_number: invoice.stock_number
        },
        products: invoice.products.map((product) => ({
          name: product.item_name,
          price: parseFloat(product.price),
          quantity: parseFloat(product.quantity.toString()),
          total: parseFloat(product.total_amount)
        })),
        employee_id: currentEmployee?.id,
        paid: newPaidStatus
      };

      const response = await saveInvoiceData(params);

      if (response.code === 'OK') {
        setInvoices(
          invoices.map((inv) =>
            inv.id === invoiceId ? { ...inv, paid: newPaidStatus } : inv
          )
        );
        toast({
          title: 'Invoice Updated',
          description: `Invoice status changed to ${
            newPaidStatus ? 'Paid' : 'Not Paid'
          }`,
          type: 'background',
          variant: 'success'
        });
      } else {
        throw new Error('Failed to update invoice');
      }
    } catch (error) {
      console.error('Error updating invoice status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update invoice status',
        type: 'background',
        variant: 'destructive'
      });
    }
  };

  const checkDuplicateInvoice = (invoiceNo: string) => {
    return (
      invoices.filter((invoice) => invoice.invoice_no === invoiceNo).length > 1
    );
  };

  const calculateCardTotals = () => {
    const today = startOfDay(new Date());
    const weekStart = addDays(today, -7);
    const monthStart = startOfMonth(new Date());

    const totals = invoices.reduce(
      (acc, invoice) => {
        const invoiceDate = new Date(invoice.date);
        const amount = invoice.amount;

        acc.total += amount;

        if (
          isWithinInterval(invoiceDate, { start: today, end: endOfDay(today) })
        ) {
          acc.today += amount;
        }
        if (
          isWithinInterval(invoiceDate, {
            start: weekStart,
            end: endOfDay(today)
          })
        ) {
          acc.week += amount;
        }
        if (
          isWithinInterval(invoiceDate, {
            start: monthStart,
            end: endOfDay(today)
          })
        ) {
          acc.month += amount;
        }

        return acc;
      },
      { today: 0, week: 0, month: 0, total: 0 }
    );

    setCardTotals(totals);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice.id);
    setEditedInvoice({ ...invoice });
  };

  const handleSaveInvoice = async () => {
    if (!editedInvoice) return;

    try {
      const productsFormatted = editedInvoice.products.map((product: any) => ({
        name: product.item_name,
        price: parseFloat(product.price),
        quantity: parseFloat(product.quantity),
        total: parseFloat(product.total_amount)
      }));
      const params = {
        id: editedInvoice.id,
        invoice: {
          number: editedInvoice.invoice_no,
          date_issued: editedInvoice.date
        },
        supplier: {
          name: editedInvoice.supplier,
          stock_number: editedInvoice.stock_number
        },
        products: productsFormatted,
        employee_id: currentEmployee?.id
      };
      const response = await saveInvoiceData(params);

      if (response.code === 'OK') {
        toast({
          title: 'Invoice Updated',
          description: 'Invoice updated successfully',
          type: 'background',
          variant: 'success'
        });
        setEditingInvoice(null);
        setEditedInvoice(null);
        fetchInvoices(); // Refresh the invoice list
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update invoice',
          type: 'background',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to update invoice',
        type: 'background',
        variant: 'destructive'
      });
    }
  };

  const handleProductChange = (
    index: number,
    field: keyof Product,
    value: string | number
  ) => {
    if (!editedInvoice) return;

    const updatedProducts = [...editedInvoice.products];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };

    setEditedInvoice({
      ...editedInvoice,
      products: updatedProducts,
      amount: updatedProducts.reduce(
        (sum, product) => sum + parseFloat(product.total_amount),
        0
      )
    });
  };

  const handleDeleteInvoice = async (invoiceId: number) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await deleteInvoice(invoiceId);
        toast({
          title: 'Invoice Deleted',
          description: 'The invoice has been successfully deleted.',
          type: 'background',
          variant: 'success'
        });
        fetchInvoices(); // Refresh the invoice list
        // setInvoices((prevInvoices) =>
        //   prevInvoices.filter((invoice) => invoice.id !== invoiceId)
        // );
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete invoice.',
          type: 'background',
          variant: 'destructive'
        });
      }
    }
  };

  return (
    <PageContainer scrollable>
      <div className="w-[90vw] overflow-x-scroll lg:w-full">
        <div className="mb-4 flex items-center justify-between">
          <div className="mb-4">
            <Heading
              title={`Received Invoices`}
              description="Manage Received Invoices here."
              titleClass="text-xl"
              descriptionClass="text-sm"
            />
          </div>
          <Button variant="secondary" onClick={handleCreateInvoiceClick}>
            + Receive Invoice
          </Button>
        </div>

        {/* New cards section */}
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card variant="secondary">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm text-secondary-foreground">
                Today
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-2xl font-bold">
                ${cardTotals.today.toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card variant="secondary">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm text-secondary-foreground">
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-2xl font-bold">
                ${cardTotals.week.toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card variant="secondary">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm text-secondary-foreground">
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-2xl font-bold">
                ${cardTotals.month.toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card variant="secondary">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm text-secondary-foreground">
                Total
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-2xl font-bold">
                ${cardTotals.total.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Existing filter section */}
        <div className="mb-4 flex items-center space-x-4">
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="not_paid">Not Paid</SelectItem>
            </SelectContent>
          </Select>
          <CalendarDateRangePicker
            className="w-[300px]"
            onDateChange={handleDateRangeChange}
            initialDateRange={dateRange}
          />
        </div>
        <Table className="min-w-full border-separate border-spacing-0 rounded-lg border bg-secondary">
          <TableHeader>
            <TableRow>
              <TableHead className="border-b p-4 text-left">Amount</TableHead>
              <TableHead className="border-b p-4 text-left">Status</TableHead>
              <TableHead className="border-b p-4 text-left">Supplier</TableHead>
              <TableHead className="border-b p-4 text-left">
                Invoice Number
              </TableHead>
              <TableHead className="border-b p-4 text-left">
                Received By
              </TableHead>
              <TableHead className="border-b p-4 text-left">Date</TableHead>
              <TableHead className="border-b p-4 text-left">File</TableHead>
              <TableHead className="border-b p-4 text-left">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.map((invoice, index) => (
              <React.Fragment key={invoice.id}>
                <TableRow
                  onClick={() => toggleInvoiceExpansion(invoice.id)}
                  className={`group cursor-pointer border-b hover:bg-hoverTable ${
                    index === filteredInvoices.length - 1 ? 'rounded-bl-lg' : ''
                  }`}
                >
                  <TableCell className="p-4">
                    ${invoice.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="p-4">
                    <span
                      className={`inline-flex min-w-[80px] cursor-pointer items-center justify-center whitespace-nowrap rounded px-2 py-1 text-xs font-medium ${
                        invoice.paid === true
                          ? 'bg-green-100 text-green-900'
                          : 'bg-red-100 text-red-900'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleInvoiceStatus(invoice.id);
                      }}
                    >
                      {invoice.paid === true ? 'Paid' : 'Not Paid'}
                    </span>
                  </TableCell>
                  <TableCell className="p-4">{invoice.supplier}</TableCell>
                  <TableCell className="p-4">
                    {invoice.invoice_no}
                    {checkDuplicateInvoice(invoice.invoice_no) && (
                      <span className="ml-2 text-xs font-medium text-danger">
                        Duplicate
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="p-4">{invoice.receive_by}</TableCell>
                  <TableCell className="p-4">{invoice.date}</TableCell>
                  <TableCell className="p-4">
                    {invoice.file_path && (
                      <a
                        href={`${process.env.NEXT_PUBLIC_IMG_URL}${invoice.file_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-primary hover:underline "
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FileIcon className="mr-2 h-4 w-4" />
                        View
                        <ExternalLinkIcon className="ml-1 h-4 w-4" />
                      </a>
                    )}
                  </TableCell>
                  <TableCell className="p-4">
                    <div className="flex gap-2">
                      {editingInvoice === invoice.id ? (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveInvoice();
                          }}
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditInvoice(invoice);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteInvoice(invoice.id);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                {expandedInvoiceId === invoice.id && (
                  <TableRow>
                    <TableCell colSpan={8} className="p-0">
                      <div className="bg-background p-4">
                        <h3 className="mb-2 text-lg font-medium">Products</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Item Name</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Total Amount</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {/* @ts-ignore */}
                            {(editingInvoice === invoice.id
                              ? editedInvoice?.products
                              : invoice.products
                            ).map((product, productIndex) => (
                              <TableRow key={productIndex}>
                                <TableCell>
                                  {editingInvoice === invoice.id ? (
                                    <Input
                                      value={product.item_name}
                                      onChange={(e) =>
                                        handleProductChange(
                                          productIndex,
                                          'item_name',
                                          e.target.value
                                        )
                                      }
                                    />
                                  ) : (
                                    product.item_name
                                  )}
                                </TableCell>
                                <TableCell>
                                  {editingInvoice === invoice.id ? (
                                    <Input
                                      type="number"
                                      value={product.quantity}
                                      onChange={(e) =>
                                        handleProductChange(
                                          productIndex,
                                          'quantity',
                                          parseFloat(e.target.value)
                                        )
                                      }
                                    />
                                  ) : (
                                    product.quantity
                                  )}
                                </TableCell>
                                <TableCell>
                                  {editingInvoice === invoice.id ? (
                                    <Input
                                      type="number"
                                      value={product.price}
                                      onChange={(e) =>
                                        handleProductChange(
                                          productIndex,
                                          'price',
                                          parseFloat(e.target.value)
                                        )
                                      }
                                    />
                                  ) : (
                                    `$${product.price}`
                                  )}
                                </TableCell>
                                <TableCell>
                                  $
                                  {(
                                    parseFloat(product.price) *
                                    parseFloat(product.quantity.toString())
                                  ).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create Invoice Modal */}
      <Dialog
        open={isCreateInvoiceModalOpen}
        onOpenChange={(open) => {
          setIsCreateInvoiceModalOpen(open);
          if (!open) {
            setSelectedIngredient(null);
            fetchInvoices(); // Fetch updated invoice data when closing the modal
          }
        }}
      >
        <DialogContent className="h-full min-w-full">
          <CreateInvoicePage
            onSelectProduct={handleProductSelect}
            products={productsModal}
            setProducts={setProductsModal}
            handleBackInvoiceClick={handleBackInvoiceClick}
            inventoryData={inventoryData}
            createInvoiceData={createInvoiceData}
            onDataChange={handleCreateInvoiceDataChange}
            onInvoiceSaved={fetchInvoices} // Add this prop
          />
        </DialogContent>
      </Dialog>

      {/* Ingredient Form Modal */}
      <Dialog
        open={isIngredientModalOpen}
        onOpenChange={(open) => {
          setIsIngredientModalOpen(open);
          if (!open) {
            setSelectedIngredient(null);
          }
        }}
      >
        <DialogContent className="h-full min-w-full">
          <IngredientInventoryForm
            isOpen={isIngredientModalOpen}
            onSubmit={(formData: any) => {
              onSubmitInvoice(formData);
              setIsIngredientModalOpen(false);
              setIsCreateInvoiceModalOpen(true);
            }}
            onClose={() => {
              setIsIngredientModalOpen(false);
              setIsCreateInvoiceModalOpen(true);
            }}
            itemData={selectedIngredient}
            inventoryData={inventoryData}
            setUpdatedData={() => {}}
          />
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default Page;
