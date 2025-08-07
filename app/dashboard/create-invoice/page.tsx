'use client';
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import ImageUploader from './ImageUploader';
import { useApi } from '@/hooks/useApi';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AddStockInventory from '@/components/forms/AddStockInventory';
import { isSimilarName } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow
} from '@/components/ui/table';
// import { Link } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEmployee } from '@/hooks/useEmployee';
import PageContainer from '@/components/layout/page-container';
import { toast } from '@/components/ui/use-toast';
import IngredientInventoryForm from '@/components/ingredient-inventory-form';
import ProductInventoryForm from '@/components/product-inventory-form';

const Page = ({
  onSelectProduct,
  products,
  setProducts,
  handleBackInvoiceClick,
  inventoryData,
  createInvoiceData,
  onDataChange,
  onInvoiceSaved
}: any) => {
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSimilar, setShowSimilar] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [customPrompt, setCustomPrompt] = useState('');
  const [customResponse, setCustomResponse] = useState('');
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isListeningModalOpen, setIsListeningModalOpen] = useState(false);
  const [isIngredientsModalOpen, setIsIngredientsModalOpen] = useState(false);
  const [ingredientQuantities, setIngredientQuantities] = useState<any>({});
  const [linkedIngredients, setLinkedIngredients] = useState<{
    [key: number]: any;
  }>({});
  const [currentProductIndex, setCurrentProductIndex] = useState<number | null>(
    null
  );

  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Use createInvoiceData for initial state
  const [invoiceNumber, setInvoiceNumber] = useState<any>(
    createInvoiceData?.invoiceNumber
  );
  const [dateIssued, setDateIssued] = useState<any>(
    createInvoiceData?.dateIssued
  );
  const [supplierName, setSupplierName] = useState<any>(
    createInvoiceData?.supplierName
  );
  const [supplierStockNumber, setSupplierStockNumber] = useState<any>(
    createInvoiceData?.supplierStockNumber
  );
  const [file, setFile] = useState<any>(createInvoiceData?.file);

  const { currentEmployee } = useEmployee();
  const [searchTerm, setSearchTerm] = useState('');

  const loadingRef = useRef<any>(null);
  const itemListRef = useRef<any>(null);

  const {
    fetchInventoryIngredients,
    saveInvoiceData,
    updateStockInventory,
    saveInvoiceFile,
    fetchInventorySuppliers,
    createInventorySupplier,
    saveProductInventory
  } = useApi();

  const router = useRouter();

  // Add new state for the add product modal
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    quantity: 0,
    price: 0,
    total: 0
  });

  useEffect(() => {
    const fetchIngredients = async () => {
      const ingredientsData = await fetchInventoryIngredients();
      setIngredients(ingredientsData);
    };

    fetchIngredients();
  }, []);

  const setImageUrl = async (recognizedText: any) => {
    setLoading(true);

    // Check if recognizedText is already a JSON string
    try {
      const parsedJson = JSON.parse(recognizedText);
      // If we can parse it as JSON, it's already structured data from the PDF-to-text route
      console.log('Recognized text is already JSON:', parsedJson);

      // Process the JSON directly
      processExtractedData(parsedJson);
      setLoading(false);
      return;
    } catch (e) {
      // Not JSON, continue with Gemini processing
      console.log('Recognized text is not JSON, sending to Gemini');
    }

    await sendToGemini(recognizedText);
    setLoading(false);
  };

  const findOrCreateSupplier = async (
    supplierName: string,
    supplierStockNumber: string | null
  ) => {
    try {
      // Check if supplier exists
      const suppliers = await fetchInventorySuppliers();
      const existingSupplier = suppliers.find(
        (s: any) => s.supplier_name.toLowerCase() === supplierName.toLowerCase()
      );

      if (existingSupplier) {
        setSupplierName(existingSupplier.supplier_name);
        setSupplierStockNumber(existingSupplier.supplier_stock_number);
        return existingSupplier;
      } else {
        // Create new supplier
        const newSupplier = await createInventorySupplier({
          supplier_name: supplierName,
          supplier_stock_number: supplierStockNumber || '-'
        });
        setSupplierName(newSupplier.supplier_name);
        setSupplierStockNumber(newSupplier.supplier_stock_number);
        return newSupplier;
      }
    } catch (error) {
      console.error('Error finding or creating supplier:', error);
      return null;
    }
  };

  const processExtractedData = async (parsedData: any) => {
    try {
      // Just set the supplier information in the state without creating it
      if (parsedData.supplier_name) {
        setSupplierName(parsedData.supplier_name);
        setSupplierStockNumber(parsedData.supplier_stock_number || null);
      }

      setInvoiceNumber(parsedData?.invoice_number);
      setDateIssued(parsedData?.date_issued);
      setProducts(parsedData?.products);
    } catch (error) {
      console.error('Error processing extracted data:', error);
    }
  };

  const sendToGemini = async (recognizedText: any) => {
    try {
      const prompt = `Please extract the following information from the invoice text and provide it in a structured JSON format. The response should follow this structure:
      {
        "invoice_number": "",
        "date_issued": "", (on the format YYYY-MM-DD)
        "supplier_name": "",
        "supplier_stock_number": "",
        "products": [
          { "name": "", "quantity": 0, "price": 0, "total": 0 }
        ]
      }
      
      Here's the text: "${recognizedText}"`;

      const { data } = await axios.post('/api/gemini/text-completion', {
        prompt
      });

      const geminiResponse = data.response;
      setCustomResponse(geminiResponse);

      try {
        // Try to parse the JSON content
        let parsedResponse;
        if (data.jsonContent) {
          // If the API already parsed it for us
          parsedResponse = data.jsonContent;
        } else {
          // Try to parse it ourselves
          const cleanedText = geminiResponse
            .replace(/```json\n|\n```|```/g, '')
            .trim();
          parsedResponse = JSON.parse(cleanedText);
        }

        console.log('parsedResponse', parsedResponse);

        // Process the parsed data
        processExtractedData(parsedResponse);
      } catch (parseError) {
        console.error('Error parsing Gemini response:', parseError);
      }
    } catch (error) {
      console.error('Error sending message to Gemini:', error);
    }
  };

  useEffect(() => {
    if (loading) {
      loadingRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [loading]);

  useEffect(() => {
    if (!loading && products.length > 0) {
      itemListRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [loading, products]);

  const sendCustomPrompt = async () => {
    setLoading(true);
    try {
      const prompt = `${customPrompt}. Please update the prices using the "Total Inc GST" column instead of the "Total Net" column.`;

      const { data } = await axios.post('/api/gemini/text-completion', {
        prompt
      });

      const geminiResponse = data.response;
      setCustomResponse(geminiResponse);

      try {
        // Update products if the response contains product information
        const parsedProducts = parseGeminiResponse(data.jsonContent);
        setProducts(parsedProducts);
      } catch (parseError) {
        console.error(
          'Error parsing Gemini response for products:',
          parseError
        );
      }

      setLoading(false);
    } catch (error) {
      console.error('Error sending custom prompt to Gemini:', error);
      setLoading(false);
    }
  };

  const parseGeminiResponse = (response: any) => {
    try {
      const products = JSON.parse(response.trim());
      return products;
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      return [];
    }
  };

  const deleteProduct = (index: number) => {
    const updatedProducts = [...products];
    updatedProducts.splice(index, 1);
    setProducts(updatedProducts);
  };

  const updateProductAsCreated = (productId: number) => {
    setProducts((prevProducts: any) =>
      prevProducts.map((product: any) =>
        product.name === productId ? { ...product, updated: true } : product
      )
    );
  };

  const updateProduct = (index: number, field: string, value: any) => {
    const updatedProducts = [...products];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    setProducts(updatedProducts);
  };

  const handleProductClick = (product: any, index: number) => {
    if (linkedIngredients[index]) {
      openAddStockModal(linkedIngredients[index], index);
    } else {
      setSelectedIngredient(product);
      onSelectProduct(product);
    }
  };

  const toggleShowSimilar = (index: number) => {
    setShowSimilar((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const openAddStockModal = (ingredient: any, index: number) => {
    setSelectedIngredient({
      ingredient,
      quantity: products[index].quantity, // Add the product quantity here
      index
    });
    setIsModalOpen(true);
  };

  const saveLinkedIngredient = (ingredient: any) => {
    if (currentProductIndex !== null) {
      setLinkedIngredients({
        ...linkedIngredients,
        [currentProductIndex]: ingredient
      });
      setIsIngredientsModalOpen(false);
    }
  };

  const openIngredientsModal = (index: number) => {
    setCurrentProductIndex(index);
    setIsIngredientsModalOpen(true);
  };
  const handleQuantityChange = (id: any, value: any) => {
    setIngredientQuantities({ ...ingredientQuantities, [id]: value });
  };

  // Speech Recognition Setup
  const SpeechRecognition =
    typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  const handleSaveInvoice = async () => {
    let supplierData = {
      name: supplierName,
      stock_number: supplierStockNumber
    };

    if (supplierName) {
      try {
        const supplierResult = await findOrCreateSupplier(
          supplierName,
          supplierStockNumber
        );
        if (supplierResult) {
          supplierData = {
            name: supplierResult.supplier_name,
            stock_number: supplierResult.supplier_stock_number
          };
        }
      } catch (error) {
        console.error('Error handling supplier before save:', error);
      }
    }

    const invoiceData = {
      invoice: {
        number: invoiceNumber,
        date_issued: dateIssued
      },
      supplier: supplierData,
      products: products,
      employee_id: currentEmployee?.id
    };

    try {
      const response = await saveInvoiceData(invoiceData);
      console.log('response', response);
      if (response.code === 'OK') {
        const invoiceId = response.data.id;

        // Save the file if it exists
        const formData = new FormData();
        formData.append('id', invoiceId.toString());
        formData.append('file', file);

        await saveInvoiceFile(formData);

        console.log('Invoice saved successfully');
        toast({
          title: 'Invoice Saved',
          description: 'Invoice saved successfully',
          type: 'background',
          variant: 'success'
        });
        onInvoiceSaved(); // Call this function to update the invoice list
        handleBackInvoiceClick();
      } else {
        // Handle error
        toast({
          title: 'Error',
          description: 'Failed to save invoice',
          type: 'background',
          variant: 'destructive'
        });
        console.error('Failed to save invoice');
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to save invoice',
        type: 'background',
        variant: 'destructive'
      });
    }
  };

  const filteredIngredients = ingredients.filter((ingredient) =>
    ingredient.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Update parent component's state when local state changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange({
        invoiceNumber,
        dateIssued,
        supplierName,
        supplierStockNumber,
        file,
        products
      });
    }
  }, [
    invoiceNumber,
    dateIssued,
    supplierName,
    supplierStockNumber,
    file,
    products
  ]);

  // Add function to handle adding a new product
  const handleAddProduct = () => {
    // Calculate total
    const total = newProduct.quantity * newProduct.price;

    // Add new product to the products array
    setProducts([...products, { ...newProduct, total }]);

    // Reset form and close modal
    setNewProduct({ name: '', quantity: 0, price: 0, total: 0 });
    setIsAddProductModalOpen(false);
  };

  const handleOpenProductModal = (product: any) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setIsListeningModalOpen(true);
    };

    recognition.onend = () => {
      setIsListening(false);
      setIsListeningModalOpen(false);
    };

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setCustomPrompt(speechToText);
    };

    const startListening = () => {
      recognition.start();
    };

    const stopListening = () => {
      recognition.stop();
      setIsListeningModalOpen(false);
    };

    return (
      <PageContainer scrollable>
        <div>
          <h1 className="mb-8 text-3xl font-bold">Receive Invoice</h1>

          <div className="grid gap-8 md:grid-cols-[1fr,2fr]">
            {/* Left side: Scrollable container for Upload, Invoice Details, and Custom Prompt */}
            <div className="max-h-[calc(100vh-200px)] space-y-6 overflow-y-auto pr-4">
              <div className="sthadow-sm rounded-lg border bg-secondary p-6">
                <h2 className="mb-4 text-xl font-semibold">Upload Invoice</h2>
                <ImageUploader
                  setLoading={setLoading}
                  setFile={setFile}
                  setImageUrl={setImageUrl}
                />
              </div>

              <div className="rounded-lg border bg-secondary p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold">Invoice Details</h2>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="invoiceNumber">Invoice Number</Label>
                    <Input
                      id="invoiceNumber"
                      value={invoiceNumber ?? ''}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateIssued">Date Issued</Label>
                    <Input
                      id="dateIssued"
                      type="date"
                      value={dateIssued ?? ''}
                      onChange={(e) => setDateIssued(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplierName">Supplier Name</Label>
                    <Input
                      id="supplierName"
                      value={supplierName ?? ''}
                      onChange={(e) => setSupplierName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplierStockNumber">
                      Supplier Stock Number
                    </Label>
                    <Input
                      id="supplierStockNumber"
                      value={supplierStockNumber ?? ''}
                      onChange={(e) => setSupplierStockNumber(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-secondary p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold">Custom Prompt</h2>
                <Textarea
                  id="customPrompt"
                  className="mb-4 w-full"
                  placeholder="Enter a custom prompt..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                />
                <Button className="w-full" onClick={sendCustomPrompt}>
                  Ask Wabi AI
                </Button>
              </div>
            </div>

            {/* Right side: List of products (full height) */}
            <div className="rounded-lg border bg-secondary p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Products</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddProductModalOpen(true)}
                >
                  Add Product
                </Button>
              </div>
              {loading ? (
                <div className="flex h-64 flex-col items-center justify-center">
                  <svg
                    className="h-12 w-12 animate-spin text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.964 7.964 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <p className="mt-4 text-muted-foreground">
                    Processing your request...
                  </p>
                </div>
              ) : (
                <div className="max-h-[calc(100vh-300px)] space-y-4 overflow-y-auto">
                  {products.map((product: any, index: number) => (
                    <ProductItem
                      key={index}
                      product={product}
                      index={index}
                      updateProduct={updateProduct}
                      deleteProduct={deleteProduct}
                      handleProductClick={handleProductClick}
                      openIngredientsModal={openIngredientsModal}
                      linkedIngredients={linkedIngredients}
                      ingredients={ingredients}
                      setProducts={setProducts}
                      updateStockInventory={updateStockInventory}
                      handleOpenProductModal={handleOpenProductModal}
                    />
                  ))}
                </div>
              )}
              <div className="mb-10 mt-6 flex justify-between">
                <Button variant="outline" onClick={handleBackInvoiceClick}>
                  Go Back
                </Button>
                <Button onClick={handleSaveInvoice}>Save Invoice</Button>
              </div>
            </div>
          </div>

          {/* Modals */}
          {/* <ListeningModal
          isOpen={isListeningModalOpen}
          isListening={isListening}
          onStopListening={stopListening}
          onClose={() => setIsListeningModalOpen(false)}
        /> */}

          <AddStockInventory
            ingredient={selectedIngredient?.ingredient}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            invoiceQuantity={selectedIngredient?.quantity}
            setProducts={setProducts}
          />

          <IngredientsModal
            isOpen={isIngredientsModalOpen}
            onClose={() => setIsIngredientsModalOpen(false)}
            ingredients={filteredIngredients}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            saveLinkedIngredient={saveLinkedIngredient}
          />

          <IngredientInventoryForm
            isOpen={isIngredientModalOpen}
            onSubmit={async (formData: any) => {
              try {
                const result = await saveProductInventory(formData);
                setProducts((prevProducts: any) => [
                  ...prevProducts,
                  result.data.prod_item
                ]);
                setIsIngredientModalOpen(false);
                toast({
                  title: 'Ingredient Created/Updated successfully',
                  type: 'background',
                  description: 'Ingredient Created/Updated successfully',
                  variant: 'success'
                });
                updateProductAsCreated(formData?.product_name);
              } catch (err) {
                console.error('Error creating/updating ingredient:', err);
                toast({
                  title: 'Error',
                  description:
                    // @ts-ignore
                    err?.response?.data?.message || 'Error creating ingredient',
                  variant: 'destructive'
                });
              }
            }}
            onClose={() => setIsIngredientModalOpen(false)}
            itemData={selectedIngredient}
            inventoryData={inventoryData}
            setUpdatedData={() => {
              // TODO: Refresh inventory data
            }}
            supplierName={supplierName}
            supplierStockNumber={supplierStockNumber}
          />

          <ProductInventoryForm
            isOpen={isProductModalOpen}
            onSubmit={async (formData: any) => {
              try {
                // Use the appropriate API endpoint for saving products
                const result = await saveProductInventory(formData);

                // Update the UI to show the product was created
                setProducts((prevProducts: any) =>
                  prevProducts.map((product: any) =>
                    product.name === selectedProduct?.name
                      ? { ...product, updated: true }
                      : product
                  )
                );

                setIsProductModalOpen(false);
                toast({
                  title: 'Product Created Successfully',
                  type: 'background',
                  description: 'Product has been added to your inventory',
                  variant: 'success'
                });

                // Update the product status
                updateProductAsCreated(formData?.title);
              } catch (err) {
                console.error('Error creating/updating product:', err);
                toast({
                  title: 'Error',
                  description:
                    // @ts-ignore
                    err?.response?.data?.message || 'Error creating product',
                  variant: 'destructive'
                });
              }
            }}
            onClose={() => setIsProductModalOpen(false)}
            itemData={
              selectedProduct
                ? {
                    title: selectedProduct.name,
                    price: parseFloat(selectedProduct.price) || 0,
                    quantity: parseFloat(selectedProduct.quantity) || 0
                  }
                : null
            }
            categories={inventoryData?.categories || []}
            ingredients={ingredients || []}
            saveIngredientInProduct={async (data: any) => {
              try {
                // This would be the API call to save ingredients in a product
                return await saveProductInventory(data);
              } catch (error) {
                console.error('Error saving ingredients in product:', error);
                throw error;
              }
            }}
            setUpdatedData={() => {
              // TODO: Refresh inventory data
            }}
          />

          {/* Add Product Modal */}
          <Modal
            isOpen={isAddProductModalOpen}
            onClose={() => setIsAddProductModalOpen(false)}
            title="Add Product"
            description="Add a new product to the invoice"
          >
            <div className="grid gap-4 p-4">
              <div>
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <Label htmlFor="productQuantity">Quantity</Label>
                <Input
                  id="productQuantity"
                  type="number"
                  value={newProduct.quantity}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      quantity: parseFloat(e.target.value) || 0
                    })
                  }
                  placeholder="Enter quantity"
                />
              </div>
              <div>
                <Label htmlFor="productPrice">Price</Label>
                <Input
                  id="productPrice"
                  type="number"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      price: parseFloat(e.target.value) || 0
                    })
                  }
                  placeholder="Enter price"
                />
              </div>
              <div>
                <Label htmlFor="productTotal">Total</Label>
                <Input
                  id="productTotal"
                  type="number"
                  value={(newProduct.quantity * newProduct.price).toFixed(2)}
                  readOnly
                  disabled
                />
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddProductModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddProduct}>Add Product</Button>
              </div>
            </div>
          </Modal>
        </div>
      </PageContainer>
    );
  } else {
    return (
      <PageContainer scrollable>
        <div>
          <h1 className="mb-8 text-3xl font-bold">Create Invoice</h1>
          <div className="grid gap-8 md:grid-cols-[1fr,2fr]">
            {/* Left side: Scrollable container for Upload, Invoice Details, and Custom Prompt */}
            <div className="max-h-[calc(100vh-200px)] space-y-6 overflow-y-auto pr-4">
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold">Upload Invoice</h2>
                <ImageUploader
                  setFile={setFile}
                  setImageUrl={setImageUrl}
                  setLoading={setLoading}
                />
              </div>

              <div className="rounded-lg border bg-secondary p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold">Invoice Details</h2>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="invoiceNumber">Invoice Number</Label>
                    <Input
                      id="invoiceNumber"
                      value={invoiceNumber ?? ''}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateIssued">Date Issued</Label>
                    <Input
                      id="dateIssued"
                      type="date"
                      value={dateIssued ?? ''}
                      onChange={(e) => setDateIssued(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplierName">Supplier Name</Label>
                    <Input
                      id="supplierName"
                      value={supplierName ?? ''}
                      onChange={(e) => setSupplierName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplierStockNumber">
                      Supplier Stock Number
                    </Label>
                    <Input
                      id="supplierStockNumber"
                      value={supplierStockNumber ?? ''}
                      onChange={(e) => setSupplierStockNumber(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold">Custom Prompt</h2>
                <Textarea
                  id="customPrompt"
                  className="mb-4 w-full"
                  placeholder="Enter a custom prompt..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                />
                <Button className="w-full" onClick={sendCustomPrompt}>
                  Ask Wabi AI
                </Button>
              </div>
            </div>

            {/* Right side: List of products (full height) */}
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Products</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddProductModalOpen(true)}
                >
                  Add Product
                </Button>
              </div>
              {loading ? (
                <div className="flex h-64 flex-col items-center justify-center">
                  <svg
                    className="h-12 w-12 animate-spin text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.964 7.964 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <p className="mt-4 text-muted-foreground">
                    Processing your request...
                  </p>
                </div>
              ) : (
                <div className="max-h-[calc(100vh-300px)] space-y-4 overflow-y-auto">
                  {products.map((product: any, index: number) => (
                    <ProductItem
                      key={index}
                      product={product}
                      index={index}
                      updateProduct={updateProduct}
                      deleteProduct={deleteProduct}
                      handleProductClick={handleProductClick}
                      openIngredientsModal={openIngredientsModal}
                      linkedIngredients={linkedIngredients}
                      ingredients={ingredients}
                      setProducts={setProducts}
                      updateStockInventory={updateStockInventory}
                      handleOpenProductModal={handleOpenProductModal}
                    />
                  ))}
                </div>
              )}
              <div className="mb-10 mt-6 flex justify-between">
                <Button variant="outline" onClick={handleBackInvoiceClick}>
                  Go Back
                </Button>
                <Button onClick={handleSaveInvoice}>Save Invoice</Button>
              </div>
            </div>
          </div>

          {/* Modals */}
          {/* <ListeningModal
          isOpen={isListeningModalOpen}
          isListening={isListening}
          onStopListening={stopListening}
          onClose={() => setIsListeningModalOpen(false)}
        /> */}

          <AddStockInventory
            ingredient={selectedIngredient?.ingredient}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            invoiceQuantity={selectedIngredient?.quantity}
            setProducts={setProducts}
          />

          <IngredientsModal
            isOpen={isIngredientsModalOpen}
            onClose={() => setIsIngredientsModalOpen(false)}
            ingredients={filteredIngredients}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            saveLinkedIngredient={saveLinkedIngredient}
          />

          <IngredientInventoryForm
            isOpen={isIngredientModalOpen}
            onSubmit={async (formData: any) => {
              try {
                const result = await saveProductInventory(formData);
                setProducts((prevProducts: any) => [
                  ...prevProducts,
                  result.data.prod_item
                ]);
                setIsIngredientModalOpen(false);
                toast({
                  title: 'Ingredient Created/Updated successfully',
                  type: 'background',
                  description: 'Ingredient Created/Updated successfully',
                  variant: 'success'
                });
                updateProductAsCreated(formData?.product_name);
              } catch (err) {
                console.error('Error creating/updating ingredient:', err);
                toast({
                  title: 'Error',
                  description:
                    // @ts-ignore
                    err?.response?.data?.message || 'Error creating ingredient',
                  variant: 'destructive'
                });
              }
            }}
            onClose={() => setIsIngredientModalOpen(false)}
            itemData={selectedIngredient}
            inventoryData={inventoryData}
            setUpdatedData={() => {
              // TODO: Refresh inventory data
            }}
            supplierName={supplierName}
            supplierStockNumber={supplierStockNumber}
          />

          <ProductInventoryForm
            isOpen={isProductModalOpen}
            onSubmit={async (formData: any) => {
              try {
                // Use the appropriate API endpoint for saving products
                const result = await saveProductInventory(formData);

                // Update the UI to show the product was created
                setProducts((prevProducts: any) =>
                  prevProducts.map((product: any) =>
                    product.name === selectedProduct?.name
                      ? { ...product, updated: true }
                      : product
                  )
                );

                setIsProductModalOpen(false);
                toast({
                  title: 'Product Created Successfully',
                  type: 'background',
                  description: 'Product has been added to your inventory',
                  variant: 'success'
                });

                // Update the product status
                updateProductAsCreated(formData?.title);
              } catch (err) {
                console.error('Error creating/updating product:', err);
                toast({
                  title: 'Error',
                  description:
                    // @ts-ignore
                    err?.response?.data?.message || 'Error creating product',
                  variant: 'destructive'
                });
              }
            }}
            onClose={() => setIsProductModalOpen(false)}
            itemData={
              selectedProduct
                ? {
                    title: selectedProduct.name,
                    price: parseFloat(selectedProduct.price) || 0,
                    quantity: parseFloat(selectedProduct.quantity) || 0
                  }
                : null
            }
            categories={inventoryData?.categories || []}
            ingredients={ingredients || []}
            saveIngredientInProduct={async (data: any) => {
              try {
                // This would be the API call to save ingredients in a product
                return await saveProductInventory(data);
              } catch (error) {
                console.error('Error saving ingredients in product:', error);
                throw error;
              }
            }}
            setUpdatedData={() => {
              // TODO: Refresh inventory data
            }}
          />

          {/* Add Product Modal */}
          <Modal
            isOpen={isAddProductModalOpen}
            onClose={() => setIsAddProductModalOpen(false)}
            title="Add Product"
            description="Add a new product to the invoice"
          >
            <div className="grid gap-4 p-4">
              <div>
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <Label htmlFor="productQuantity">Quantity</Label>
                <Input
                  id="productQuantity"
                  type="number"
                  value={newProduct.quantity}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      quantity: parseFloat(e.target.value) || 0
                    })
                  }
                  placeholder="Enter quantity"
                />
              </div>
              <div>
                <Label htmlFor="productPrice">Price</Label>
                <Input
                  id="productPrice"
                  type="number"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      price: parseFloat(e.target.value) || 0
                    })
                  }
                  placeholder="Enter price"
                />
              </div>
              <div>
                <Label htmlFor="productTotal">Total</Label>
                <Input
                  id="productTotal"
                  type="number"
                  value={(newProduct.quantity * newProduct.price).toFixed(2)}
                  readOnly
                  disabled
                />
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddProductModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddProduct}>Add Product</Button>
              </div>
            </div>
          </Modal>
        </div>
      </PageContainer>
    );
  }
};

const ProductItem = ({
  product,
  index,
  updateProduct,
  deleteProduct,
  handleProductClick,
  openIngredientsModal,
  linkedIngredients,
  ingredients,
  updateStockInventory,
  setProducts,
  handleOpenProductModal
}: any) => {
  const exactMatchIngredient = ingredients.find(
    (ingredient: any) =>
      ingredient.product_name.toLowerCase() === product.name.toLowerCase()
  );

  const similarIngredient = ingredients.find((ingredient: any) =>
    isSimilarName(product.name, ingredient.product_name)
  );

  const handleUpdateInventory = async () => {
    if (exactMatchIngredient) {
      console.log('exactMatchIngredient', exactMatchIngredient);
      console.log('product.quantity', product.quantity);
      try {
        const params = {
          pos_product_inventory_items_id: exactMatchIngredient.id,
          new_stock: product.quantity
        };
        const response = await updateStockInventory(params);
        console.log('Stock updated successfully:', response.data);
        setProducts((prev: any) => {
          const updatedProducts = [...prev];
          updatedProducts[index].updated = true;
          return updatedProducts;
        });
      } catch (error) {
        console.error('Error updating stock:', error);
      }
    } else {
      openIngredientsModal(index);
    }
  };

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="mb-4 flex justify-between">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive"
          onClick={() => deleteProduct(index)}
        >
          Remove
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label>Quantity</Label>
          <Input
            type="number"
            value={product.quantity}
            onChange={(e) => updateProduct(index, 'quantity', e.target.value)}
          />
        </div>
        <div>
          <Label>Cost</Label>
          <Input
            type="text"
            value={product.price}
            onChange={(e) => updateProduct(index, 'price', e.target.value)}
          />
        </div>
        <div>
          <Label>Total</Label>
          <Input
            type="text"
            value={(product.quantity * product.price).toFixed(2)}
            readOnly
          />
        </div>
      </div>
      {exactMatchIngredient && (
        <p className="mt-2 text-sm text-green-600">
          Exact match found in inventory: {exactMatchIngredient.product_name}
        </p>
      )}
      {similarIngredient && !exactMatchIngredient && (
        <p className="mt-2 text-sm text-yellow-600">
          Similar item found in inventory: {similarIngredient.product_name}
        </p>
      )}
      <div className="mt-4 flex justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          disabled={product.updated}
          onClick={() => handleProductClick(product, index)}
        >
          {linkedIngredients[index] ? 'Update Item' : 'Add As New Ingredient'}
        </Button>
        {/* <Button
          variant="outline"
          size="sm"
          disabled={product.updated}
          onClick={() => handleOpenProductModal(product)}
        >
          Add As New Product
        </Button> */}
        <Button
          variant="outline"
          size="sm"
          disabled={product.updated}
          onClick={handleUpdateInventory}
        >
          {exactMatchIngredient ? 'Update Item on Inventory' : 'Link Item'}
        </Button>
      </div>
      {product.updated && (
        <div className="mt-2 rounded-md bg-green-100 p-2 text-green-700">
          Item updated successfully!
        </div>
      )}
    </div>
  );
};

const IngredientsModal = ({
  isOpen,
  onClose,
  ingredients,
  searchTerm,
  setSearchTerm,
  saveLinkedIngredient
}: any) => {
  const filteredIngredients = ingredients.filter((ingredient: any) =>
    ingredient.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Link Item"
      description="Link an item to this invoice"
    >
      <div className="flex h-full w-full flex-col p-4 shadow-lg">
        <div className="mb-4 flex w-full justify-around">
          <Input
            type="text"
            placeholder="Search ingredients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex max-h-[60vh] w-full flex-col overflow-y-scroll">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableCell>Ingredient</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Measurement Desc</TableCell>
                <TableCell>Link</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIngredients.map((ingredient: any) => (
                <TableRow key={ingredient.id}>
                  <TableCell>
                    <label htmlFor={ingredient.id}>
                      {ingredient.product_name}
                    </label>
                  </TableCell>
                  <TableCell>{ingredient.avg_cost}</TableCell>
                  <TableCell>{ingredient.measurement_desc}</TableCell>
                  <TableCell>
                    <Button
                      className="justify-center p-4"
                      onClick={() => saveLinkedIngredient(ingredient)}
                    >
                      Link
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Modal>
  );
};

export default Page;
