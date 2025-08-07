import { toast } from '@/components/ui/use-toast';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

const apiBase = process.env.NEXT_PUBLIC_API_URL;

export const useApi = () => {
  const router = useRouter();
  const { data: session, update } = useSession();

  const headers = {
    Authorization: `Bearer ${session?.user.token}`
  };

  const API = useMemo(() => {
    const instance = axios.create({
      baseURL: apiBase,
      timeout: 15000,
      headers: {
        Authorization: session?.user?.token
          ? `Bearer ${session.user.token}`
          : ''
      }
    });

    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          toast({
            title: 'Session Expired',
            description: 'Your session has expired. Please log in again.',
            variant: 'destructive'
          });
          localStorage.setItem('LoggedIn', 'false');
          localStorage.removeItem('employee-storage');
          localStorage.removeItem('currentEmployee');
          localStorage.removeItem('permissions-storage');
          localStorage.removeItem('shifts-storage');
          localStorage.removeItem('pinPreference');
          update({ user: {} });
          router.push('/');
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, [session]);

  const saveInvoiceData = async (invoiceData: any) => {
    const params = invoiceData ? invoiceData : {};
    try {
      const response = await API.post(`/invoices/submit`, params, {
        headers
      });
      return response.data;
    } catch (err) {
      console.error('error fetching');
      throw err;
    }
  };

  const createUser = async (userData: any) => {
    try {
      const response = await API.post(`/register`, userData, {
        headers
      });
      return response.data;
    } catch (err) {
      console.error('error creating user');
      throw err;
    }
  };

  const getAnalyticsData = async (filter: any) => {
    const params = filter ? filter : {};
    try {
      const response = await API.post(`/pos/day_view_sales`, params, {
        headers
      });
      return response.data;
    } catch (err) {
      console.error('error fetching');
      throw err;
    }
  };

  const saveInvoiceFile = async (formData: FormData) => {
    try {
      const response = await API.post(`/invoices/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...headers
        }
      });
      return response.data;
    } catch (err) {
      console.error('error saving invoice file');
      throw err;
    }
  };

  const getInvoiceData = async () => {
    try {
      const response = await API.post(
        `/invoices`,
        {},
        {
          headers
        }
      );
      return response.data;
    } catch (err) {
      console.error('error fetching');
      throw err;
    }
  };
  const fetchBumpScreen = async (date?: any) => {
    const params = date ? { order_date: date } : {};
    try {
      const response = await API.post(`/bump-screen`, params, {
        headers
      });
      return response.data;
    } catch (err) {
      console.error('Fetch Bump Screen Error:', err);
      throw err;
    }
  };

  const addProductToBumpOrder = async (param: any) => {
    try {
      const response = await API.post(`/bump-screen/submit`, param, {
        headers
      });
      return response.data;
    } catch (err) {
      console.error('Add Product to Bump Order Error:', err);
      throw err;
    }
  };

  const fetchIngredientsFromProduct = async (productId: any) => {
    const params = productId ? { pos_product_id: productId } : {};
    try {
      const response = await API.post(
        `/pos/product/ingredients-lists`,
        params,
        { headers }
      );
      return response.data.data.product;
    } catch (err) {
      console.error('Fetch Ingredients Error:', err);
      throw err;
    }
  };

  const getEmailCampaigns = async () => {
    try {
      const response = await API.get(`/campaigns`, { headers });
      return response.data;
    } catch (err) {
      console.error('Error fetching email campaigns:', err);
      throw err;
    }
  };

  const createEmailCampaign = async (campaignData: any) => {
    try {
      const response = await API.post(`/campaigns`, campaignData, {
        headers
      });
      return response.data;
    } catch (err) {
      console.error('Error creating email campaign:', err);
      throw err;
    }
  };

  const fetchIngredientsFromCategory = async (categoryId: any) => {
    const params = categoryId
      ? { category_id: categoryId }
      : { category_id: 0 };
    try {
      const response = await API.post(
        `/pos/product/ingredients-lists`,
        params,
        { headers }
      );
      return response.data.data.product;
    } catch (err) {
      console.error('Fetch Ingredients Error:', err);
      throw err;
    }
  };

  const fetchInventoryLocations = async () => {
    try {
      const response = await API.post(
        `/pos/inventory/location`,
        {},
        { headers }
      );
      return response.data.data.location;
    } catch (err) {
      console.error('Fetch Inventory Locations Error:', err);
      throw err;
    }
  };

  const createInventoryLocation = async (locationData: any) => {
    const LocationData = {
      location_name: 'Warehouse'
    };

    try {
      const response = await API.post(
        `/pos/inventory/location/submit`,
        locationData,
        { headers }
      );
      return response.data;
    } catch (err) {
      console.error('Create Inventory Location Error:', err);
      throw err;
    }
  };

  const deleteInventoryLocation = async (locationId: any) => {
    try {
      const response = await API.post(
        `/pos/inventory/location/delete/`,
        { id: locationId },
        { headers }
      );
      return response.data;
    } catch (err) {
      console.error('Delete Inventory Location Error:', err);
      throw err;
    }
  };

  const fetchInventorySuppliers = async () => {
    try {
      const response = await API.post(
        `/pos/inventory/supplier`,
        {},
        { headers }
      );
      return response.data.data.supplier;
    } catch (err) {
      console.error('Fetch Inventory Suppliers Error:', err);
      throw err;
    }
  };

  const updateStockInventory = async (param: any) => {
    try {
      const response = await API.post(`/pos/inventory/item/addstock`, param, {
        headers
      });
      return response.data;
    } catch (err) {
      console.error('Update Stock Inventory Error:', err);
      throw err;
    }
  };

  const createInventorySupplier = async (supplierData: any) => {
    const SupplierData = {
      supplier_name: 'San Miguel',
      supplier_stock_number: '123456'
    };

    try {
      const response = await API.post(
        `/pos/inventory/supplier/submit`,
        supplierData,
        { headers }
      );
      return response.data;
    } catch (err) {
      console.error('Create Inventory Supplier Error:', err);
      throw err;
    }
  };

  const deleteInventorySupplier = async (supplierId: any) => {
    try {
      const response = await API.post(
        `/pos/inventory/supplier/delete/`,
        { id: supplierId },
        { headers }
      );
      return response.data;
    } catch (err) {
      console.error('Delete Inventory Supplier Error:', err);
      throw err;
    }
  };

  const listMeasurementUnits = async () => {
    try {
      const response = await API.post(
        `/pos/inventory/measurement_unit`,
        {},
        { headers }
      );
      return response.data.data.measurement_unit;
    } catch (err) {
      console.error('List Measurement Units Error:', err);
      throw err;
    }
  };

  const createMeasurementUnit = async (measurementData: any) => {
    const MeasurementData = {
      unit_of_measurement: 'Milliliter',
      abbreviation: 'mL',
      category: 'Volume'
    };

    try {
      const response = await API.post(
        `/pos/inventory/measurement_unit/submit`,
        measurementData,
        { headers }
      );
      return response.data;
    } catch (err) {
      console.error('Create Measurement Unit Error:', err);
      throw err;
    }
  };

  const deleteMeasurementUnit = async (measurementId: any) => {
    try {
      const response = await API.post(
        `/pos/inventory/measurement_unit/delete/`,
        { id: measurementId },
        { headers }
      );
      return response.data;
    } catch (err) {
      console.error('Delete Measurement Unit Error:', err);
      throw err;
    }
  };

  const fetchUnitDescriptions = async () => {
    try {
      const response = await API.post(
        `/pos/inventory/unit_desc`,
        {},
        { headers }
      );
      return response.data.data.unit_desc;
    } catch (err) {
      console.error('Fetch Unit Descriptions Error:', err);
      throw err;
    }
  };

  const createUnitDescription = async (unitData: any) => {
    const UnitData = {
      unit_desc: 'bottle'
    };

    try {
      const response = await API.post(
        `/pos/inventory/unit_desc/submit`,
        unitData,
        { headers }
      );
      return response.data;
    } catch (err) {
      console.error('Create Unit Description Error:', err);
      throw err;
    }
  };

  const deleteUnitDescription = async (unitId: any) => {
    try {
      const response = await API.post(
        `/pos/inventory/unit_desc/delete/`,
        { id: unitId },
        { headers }
      );
      return response.data;
    } catch (err) {
      console.error('Delete Unit Description Error:', err);
      throw err;
    }
  };

  const fetchOrderUnit = async () => {
    try {
      const response = await API.post(
        `/pos/inventory/order_unit_desc`,
        {},
        { headers }
      );
      return response.data.data.order_unit_desc;
    } catch (err) {
      console.error('Fetch Order Unit Error:', err);
      throw err;
    }
  };

  const createOrderUnit = async (orderData: any) => {
    const OrderData = {
      order_unit_desc: 'case'
    };

    try {
      const response = await API.post(
        `/pos/inventory/order_unit_desc/submit`,
        orderData,
        { headers }
      );
      return response.data;
    } catch (err) {
      console.error('Create Order Unit Error:', err);
      throw err;
    }
  };

  const deleteOrderUnit = async (orderId: any) => {
    try {
      const response = await API.post(
        `/pos/inventory/order_unit_desc/delete/`,
        { id: orderId },
        { headers }
      );
      return response.data;
    } catch (err) {
      console.error('Delete Order Unit Error:', err);
      throw err;
    }
  };

  const saveAddonIngredient = async (addonData: any) => {
    try {
      const response = await API.post(
        `/pos/product/addon/ingredients/submit`,
        addonData,
        { headers }
      );
      return response.data;
    } catch (err) {
      console.error('Save Addon Ingredient Error:', err);
      throw err;
    }
  };

  const fetchAddonIngredients = async (addonId: any) => {
    const params = { pos_product_add_ons_id: addonId };
    try {
      const response = await API.post(
        `/pos/product/addon/ingredients-lists`,
        params,
        { headers }
      );
      return response.data.data.product_addon;
    } catch (err) {
      console.error('Fetch Addon Ingredients Error:', err);
      throw err;
    }
  };

  const createCategory = async (categoryData: {
    color: string;
    name: string;
    status: number;
    order: number;
    id?: number;
  }) => {
    try {
      const response = await API.post(`/pos/product/category`, categoryData, {
        headers
      });
      return response.data;
    } catch (err) {
      console.error('Create Category Error:', err);
      throw err;
    }
  };

  const fetchInventoryIngredients = async () => {
    try {
      const response = await API.post(
        `/pos/inventory/item-lists`,
        {},
        { headers }
      );
      return response.data.data.prod_items;
    } catch (err) {
      console.error('Fetch Inventory Items Error:', err);
      throw err;
    }
  };

  const fetchGroupModifiers = async () => {
    try {
      const response = await API.post(`/pos/group_modifier`, {}, { headers });
      return response.data.data.group_modifiers;
    } catch (err) {
      console.error('Fetch Group Modifiers Error:', err);
      throw err;
    }
  };

  const createGroupModifier = async (groupModifierData: any) => {
    try {
      const response = await API.post(
        `/pos/group_modifier/submit`,
        groupModifierData,
        { headers }
      );
      return response.data;
    } catch (err) {
      console.error('Create Group Modifier Error:', err);
      throw err;
    }
  };

  const deleteGroupModifier = async (groupModifierId: any) => {
    try {
      const response = await API.post(
        `/pos/group_modifier/delete`,
        { id: groupModifierId },
        { headers }
      );
      return response.data;
    } catch (err) {
      console.error('Delete Group Modifier Error:', err);
      throw err;
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await API.post(
        `/pos/inventory/item_category`,
        {},
        {
          headers
        }
      );
      return response.data.data.pos_inventory_item_categories;
    } catch (err) {
      console.error('Fetch Categories Error:', err);
      throw err;
    }
  };

  const createInventoryCategory = async (categoryData: any) => {
    const CategoryData = {
      item_category: 'Cold Drinks',
      item_description: 'Cold Drinks'
    };

    try {
      const response = await API.post(
        `/pos/inventory/item_category/submit`,
        categoryData,
        { headers }
      );
      return response.data;
    } catch (err) {
      console.error('Create Inventory Category Error:', err);
      throw err;
    }
  };

  const deleteInventoryCategory = async (categoryId: any) => {
    try {
      const response = await API.post(
        `/pos/inventory/item_category/delete/`,
        { id: categoryId },
        { headers }
      );
      return response.data;
    } catch (err) {
      console.error('Delete Inventory Category Error:', err);
      throw err;
    }
  };

  const updatePhotoProductUpload = async (photoData: any) => {
    try {
      const response = await API.post(`/pos/inventory/item/upload`, photoData, {
        headers
      });
      return response.data;
    } catch (err) {
      console.error('Update Photo Product Upload Error:', err);
      throw err;
    }
  };

  const fetchPaginatedInventoryItems = async ({
    limitPerPage = 10,
    pos_inventory_item_categories_id = 0,
    page = 1
  }) => {
    try {
      const response = await API.post(
        `/pos/inventory/item-pagelists`,
        {
          limitPerPage,
          pos_inventory_item_categories_id,
          page
        },
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching paginated inventory items:', error);
      throw error;
    }
  };

  const saveProductInventory = async (productData: any) => {
    try {
      const response = await API.post(
        `/pos/inventory/item/submit`,
        productData,
        { headers }
      );
      return response.data;
    } catch (err) {
      console.error('Save Product Inventory Error:', err);
      throw err;
    }
  };

  const getAverageCost = async (productId: any) => {
    try {
      const response = await API.post(
        `/pos/product/item/get_item_avg_cost-cost/${productId}`,
        {},
        { headers }
      );
      return response.data;
    } catch (err) {
      console.error('Get Average Cost Error:', err);
      throw err;
    }
  };

  const deleteProductIngredients = async (productId: any) => {
    try {
      const response = await API.post(
        `/pos/product/ingredients/delete`,
        { pos_product_ingredients_id: productId },
        { headers }
      );
      return response.data.data.prod_ingredients_item;
    } catch (err) {
      console.error('Delete Product Ingredients Error:', err);
      throw err;
    }
  };

  const saveIngredientInProduct = async (ingredientData: any) => {
    const IngredientData = {
      pos_product_id: 942,
      ingredients: [
        {
          pos_product_inventory_id: 4,
          quantity: 100,
          measurement_unit: {
            id: 9,
            category: 'Weight',
            unit_of_measurement: 'Gram',
            abbreviation: 'g'
          },
          cost: 0.5,
          isDeleted: false
        }
      ]
    };

    try {
      const response = await API.post(
        `/pos/product/ingredients/submit`,
        ingredientData,
        {
          headers: { Authorization: `Bearer ${session?.user.token}` }
        }
      );
      return response.data;
    } catch (err) {
      console.error('Save Ingredient Inventory Error:', err);
      throw err;
    }
  };

  const fetchInventoryProducts = async (categoryId: any = null) => {
    const params = { category_id: categoryId };
    // : { category_id: 1 };
    try {
      const response = await API.post(`/pos/product/list-all`, params, {
        headers: { Authorization: `Bearer ${session?.user.token}` }
      });
      return response.data.data.products;
    } catch (err) {
      console.error('Fetch Products Error:', err);
      throw err;
    }
  };

  const fetchIngredientsFromAddon = async (categoryId: any) => {
    const params = { category_id: categoryId };
    try {
      const response = await API.post(`/pos/product/addon/list-all`, params, {
        headers
      });
      return response.data.data.product_addon;
    } catch (err) {
      console.error('Fetch Ingredeints From Addon Category Error:', err);
    }
  };

  const getDayViewSales = async (filter: any) => {
    const params = filter ? filter : {};
    try {
      const response = await API.post(`/pos/analytics`, params, {
        headers
      });
      return response.data.data;
    } catch (err) {
      console.error('Get Day View Sales Error:', err);
      throw err;
    }
  };

  const fetchAnalyticsInventoryProducts = async () => {
    const params = {
      analytics: {
        type: 'week',
        filter_type: 'sales',
        value: '2024-08-11 10:00'
      },
      filter: null
    };
    try {
      const response = await API.post(`/pos/inventory/analytics`, params, {
        headers
      });
      return response.data.data.prod_items;
    } catch (err) {
      console.error('Fetch Analytics Inventory Products Error:', err);
      throw err;
    }
  };

  const createProduct = async (productData: any) => {
    try {
      const response = await API.post(
        `/pos/inventory/create-product`,
        productData,
        { headers }
      );
      return response.data;
    } catch (err) {
      console.error('Create Product Error:', err);
      throw err;
    }
  };

  const updateProduct = async (productId: any, productData: any) => {
    try {
      const response = await API.put(
        `/pos/inventory/update-product/${productId}`,
        productData,
        { headers }
      );
      return response.data;
    } catch (err) {
      console.error('Update Product Error:', err);
      throw err;
    }
  };

  const deleteProduct = async (productId: any) => {
    try {
      const response = await API.delete(
        `/pos/inventory/delete-product/${productId}`,
        { headers }
      );
      return response.data;
    } catch (err) {
      console.error('Delete Product Error:', err);
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await API.post('/auth', {
        email,
        password,
        device_name: 'Android'
      });
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const getProducts = async () => {
    try {
      const response = await API.post('/pos/product/menu');
      return response.data;
    } catch (err) {
      console.error('Get Products Error:', err);
      throw err;
    }
  };

  const getShifts = async () => {
    try {
      const response = await API.post('/get_shifts');
      return response.data;
    } catch (err) {
      console.error('Get Shifts Error:', err);
      throw err;
    }
  };

  const getFloors = async () => {
    try {
      const response = await API.post('/get_floors');
      return response.data;
    } catch (err) {
      console.error('Get Floors Error:', err);
      throw err;
    }
  };

  const getEmployees = async () => {
    try {
      const response = await API.post('/get_employees');
      return response.data;
    } catch (err) {
      console.error('Get Employees Error:', err);
      throw err;
    }
  };

  const getDeletedEmployees = async () => {
    try {
      const response = await API.post('/get_employees', { is_deleted: 'true' });
      return response.data;
    } catch (err) {
      console.error('Get Deleted Employees Error:', err);
      throw err;
    }
  };

  const getBusinessProfile = async () => {
    try {
      const response = await API.post('/get_business_profile');
      return response.data;
    } catch (err) {
      console.error('Get Business Profile Error', err);
      throw err;
    }
  };

  const addEmployee = async (employee: any) => {
    try {
      const response = await API.post(`/set_staffs`, employee);
      return response.data;
    } catch (err) {
      console.error('Add Employee Error:', err);
      throw err;
    }
  };

  const deleteEmployee = async (employee: any) => {
    try {
      const response = await API.post(`/delete_staffs`, employee);

      return response.data;
    } catch (err) {
      console.error('Delete Employee Error:', err);
      throw err;
    }
  };
  const restoreEmployee = async (id: any) => {
    try {
      const response = await API.post(`/restore_staffs`, id);

      return response.data;
    } catch (err) {
      console.error('Restore Employee Error:', err);
      throw err;
    }
  };

  const updateEmployee = async (employee: any) => {
    try {
      const response = await API.post(`/update_employee_details`, employee);
      return response.data;
    } catch (err) {
      console.error('Update Employee Error:', err);
      throw err;
    }
  };

  const uploadEmployeePhoto = async (params: { id: any }, fileObject: any) => {
    const formData = new FormData();
    formData.append('id', params.id);
    formData.append('image', fileObject);

    try {
      const response = await API.post('/employee_upload_photo/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (err) {
      console.error('Photo upload failed:', err);
      throw err;
    }
  };

  const getEmployeementContract = async () => {
    try {
      const response = await API.post('/employment_contract');
      return { error: null, data: response.data.data.employment_contract };
    } catch (err) {
      console.error('Get Employment Contract Error', err);
      return { error: err, data: null };
    }
  };

  const addEmployeeContract = async (contract: any) => {
    try {
      const response = await API.post('/employment_contract/add', contract);
      return response.data;
    } catch (err) {
      console.error('Add Employee Contract Error:', err);
      throw err;
    }
  };
  const deleteEmployeeContract = async (id: number) => {
    try {
      const response = await API.post('/employment_contract/delete', { id });
      return response.data;
    } catch (err) {
      console.error('Delete Employee Contract Error:', err);
      throw err;
    }
  };

  const getEmployeeRoles = async () => {
    try {
      const response = await API.post('/employment_role');
      return { error: null, data: response.data.data.employment_role };
    } catch (err) {
      console.error('Get Employee Roles Error', err);
      return { error: err, data: null };
    }
  };

  const addEmployeeRole = async (role: any) => {
    try {
      const response = await API.post('/employment_role/add', role);
      return response.data;
    } catch (err) {
      console.error('Add Employee Role Error:', err);
      throw err;
    }
  };

  const deleteEmployeeRole = async (id: number) => {
    try {
      const response = await API.post('/employment_role/delete', { id });
      return response.data;
    } catch (err) {
      console.error('Delete Employee Role Error:', err);
      throw err;
    }
  };

  const getGroupSchedule = async () => {
    try {
      const response = await API.post('/get_group_schedule');
      return response.data.data;
    } catch (err) {
      console.error('Get Group Schedule Error:', err);
      throw err;
    }
  };
  const createGroupSchedule = async (schedule: any) => {
    try {
      const response = await API.post('/create_group_schedule', schedule);
      return response.data.data;
    } catch (err) {
      console.error('Create Group Schedule Error:', err);
      throw err;
    }
  };

  const removeGroupSchedule = async (params: { id: number }) => {
    try {
      const response = await API.post('/remove_group_schedule', {
        id: params.id
      });
      return response.data.data;
    } catch (err) {
      console.error('Remove Group Schedule Error:', err);
      throw err;
    }
  };

  const getScheduleDate = async (params: { id: number }) => {
    try {
      const response = await API.post('/get_schedule_date', {
        employee_group_schedule_id: params.id
      });
      return response.data;
    } catch (err) {
      console.error('Get Schedule Date Error:', err);
      throw err;
    }
  };

  const createScheduleDate = async (schedule: any) => {
    try {
      const response = await API.post('/create_schedule_date', schedule);
      return response.data.data;
    } catch (err) {
      console.error('Create Schedule Date Error:', err);
      throw err;
    }
  };

  const updateScheduleDate = async (schedule: any) => {
    try {
      const response = await API.post('/update_schedule_date', schedule);
      return response.data.data;
    } catch (err) {
      console.error('Update Schedule Date Error:', err);
      throw err;
    }
  };

  const removeScheduleDate = async (schedule: any) => {
    try {
      const response = await API.post('/remove_schedule_date', schedule);
      return response.data.data;
    } catch (err) {
      console.error('Remove Schedule Date Error:', err);
      throw err;
    }
  };

  const getDeletedSchedule = async (params: { id: number }) => {
    try {
      const response = await API.post('/get_deleted_schedules', {
        roster_id: params.id
      });
      return response.data.data;
    } catch (err) {
      console.error('Get Deleted Schedule Error:', err);
      throw err;
    }
  };

  const getEmployeeSchedule = async (params: { id: number }) => {
    try {
      const response = await API.post('/get_employee_schedule', {
        employee_schedule_date_id: params.id
      });
      return response.data.data;
    } catch (err) {
      console.error('Get Employee Schedule Error:', err);
      throw err;
    }
  };

  const createEmployeeSchedule = async (schedule: any) => {
    try {
      const response = await API.post('/create_employee_schedule', schedule);
      return response.data.data;
    } catch (err) {
      console.error('Create Employee Schedule Error:', err);
      throw err;
    }
  };
  const emailEmployeeRoster = async (payload: any) => {
    try {
      const response = await API.post('/email_employee_roster', payload);
      return response.data;
    } catch (err) {
      console.error('Email Employee Roster Error:', err);
      throw err;
    }
  };
  const requestShift = async (payload: any) => {
    try {
      const response = await API.post('/employee/request_shifts', payload);
      return response.data;
    } catch (err) {
      console.error('Request Shift Error:', err);
      throw err;
    }
  };
  const timesheetSummary = async (params: any) => {
    try {
      const response = await API.post('/timesheet_summary', {
        employee_id: params.employee_id,
        date_range: params.date_range,
        roster_id: params.roster_id
      });
      return response.data;
    } catch (err) {
      console.error('Timesheet Summary Error:', err);
      throw err;
    }
  };
  const timeSheets = async (params: { id: number | null; date_range: any }) => {
    try {
      const response = await API.post('/time_sheets', {
        employee_id: params.id,
        date_range: params.date_range
      });
      return response.data;
    } catch (err) {
      console.error('Timesheet Error:', err);
      throw err;
    }
  };

  const deleteTimeRecord = async (params: {
    id: number;
    processed_by: number;
  }) => {
    try {
      const response = await API.post('/delete_time_record', {
        id: params.id,
        processed_by: params.processed_by
      });
      return response.data;
    } catch (err) {
      console.error('Delete Time Record Error:', err);
      throw err;
    }
  };

  const timeBatchInsert = async (params: any) => {
    try {
      const response = await API.post('/time_batch_insert', {
        time: params.time
      });
      return response.data;
    } catch (err) {
      console.error('Time Batch Insert Error:', err);
      throw err;
    }
  };

  const approveTimesheet = async (params: {
    id: number;
    approved_by: number;
  }) => {
    try {
      const response = await API.post('/approve_timesheet', {
        id: params.id,
        approved_by: params.approved_by
      });
      return response.data;
    } catch (err) {
      console.error('Approve Timesheet Error:', err);
      throw err;
    }
  };
  const updateTimeRecord = async (params: {
    id: number | undefined;
    processed_by: number | undefined;
    started_at: string;
    stopped_at: string;
    employee_id: number | null;
    roster_id: number | null;
  }) => {
    try {
      const response = await API.post('/update_time_record', {
        id: params.id,
        processed_by: params.processed_by,
        started_at: params.started_at,
        stopped_at: params.stopped_at,
        employee_id: params.employee_id,
        roster_id: params.roster_id
      });
      return response.data;
    } catch (err) {
      console.error('Update Time Record Error:', err);
      throw err;
    }
  };

  const getWidgetBranding = async () => {
    try {
      const response = await API.get('/widget-branding');

      return response.data.data;
    } catch (err) {
      console.error('Get Widget Branding Error:', err);
      throw err;
    }
  };

  const updateWidgetBranding = async (params: Record<string, any>) => {
    try {
      const response = await API.post('/widget-branding', params);
      return response.data;
    } catch (err) {
      console.error('Update Widget Branding Error:', err);
      throw err;
    }
  };
  const uploadPhotoWidgetBranding = async (
    settingId: number,
    fileObject: File
  ) => {
    const formData = new FormData();
    formData.append('id', settingId.toString());
    formData.append('image', fileObject);
    formData.append('postType', 'WIDGET-BRANDING');
    try {
      const response = await API.post(
        '/widget-branding/upload-files',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      console;
      return response.data;
    } catch (err) {
      console.error('Upload Photo Widget Branding Error:', err);
      throw err;
    }
  };
  const uploadLogoWidgetBranding = async (
    settingId: number,
    fileObject: File
  ) => {
    const formData = new FormData();
    formData.append('id', settingId.toString());
    formData.append('logo', fileObject);
    try {
      const response = await API.post(
        '/widget-branding/upload-logo',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (err) {
      console.error('Upload Logo Widget Branding Error:', err);
      throw err;
    }
  };

  const getAccountSettings = async () => {
    try {
      const response = await API.post('/get_account_settings');
      return response.data.data;
    } catch (err) {
      console.error('Get Account Settings Error:', err);
      throw err;
    }
  };

  const setAccountSettings = async (params: any) => {
    try {
      const response = await API.post('/set_account_settings', params);
      return response.data;
    } catch (err) {
      console.error('Set Account Settings Error:', err);
      throw err;
    }
  };
  const saveAccountSettings = async (params: any) => {
    try {
      const response = await API.post('/widget-setting/submit', params);
      return response.data;
    } catch (err) {
      console.error('Save Account Settings Error:', err);
      throw err;
    }
  };
  const getWidgetDaySettings = async () => {
    try {
      const response = await API.post('/widget-day-settings');
      return response.data.data;
    } catch (err) {
      console.error('Get Widget Day Settings Error:', err);
      throw err;
    }
  };

  const uploadWidgetRelatedLinkImage = async (id: number, image: File) => {
    const formData = new FormData();
    formData.append('id', id.toString());
    formData.append('image', image);

    try {
      const response = await API.post(
        '/widget-branding/related-links/upload-image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (err) {
      console.error('Upload Widget Related Link Image Error:', err);
      throw err;
    }
  };

  const widgetDaySettings = async (params: any) => {
    try {
      const response = await API.post('/widget-day-settings/submit', params);
      return response.data;
    } catch (err) {
      console.error('Widget Day Settings Error:', err);
      throw err;
    }
  };
  const deleteWidgetService = async (params: any) => {
    try {
      const response = await API.post('/widget-setting/delete', params);
      return response.data;
    } catch (err) {
      console.error('Delete Widget Service Error:', err);
      throw err;
    }
  };

  const getPartysizeTurntime = async () => {
    try {
      const response = await API.post(
        '/settings/widget/get_party_size_turn_time'
      );
      return response.data.data.turn_times;
    } catch (err) {
      console.error('Get Partysize Turntime Error:', err);
      throw err;
    }
  };
  const setCustomTurnTime = async (params: any) => {
    try {
      const response = await API.post(
        '/settings/widget/set_party_size_turn_time',
        params
      );
      return response.data;
    } catch (err) {
      console.error('Set Custom Turn Time Error:', err);
      throw err;
    }
  };
  const deleteCustomTurnTime = async (params: any) => {
    try {
      const response = await API.post(
        '/settings/widget/delete_party_size_turn_time',
        params
      );
      return response.data;
    } catch (err) {
      console.error('Delete Custom Turn Time Error:', err);
      throw err;
    }
  };

  const uploadPhotoService = async (id: number, fileObject: any) => {
    const formData = new FormData();
    formData.append('id', id.toString());
    formData.append('image', fileObject);

    try {
      const response = await API.post('/widget-setting/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (err) {
      console.error('Upload Photo Service Error:', err);
      throw err;
    }
  };

  const getOnlineStoreSettings = async () => {
    try {
      const response = await API.post('/online_store_settings');
      return response.data.data.online_store;
    } catch (err) {
      console.error('Get Online Store Settings Error:', err);
      throw err;
    }
  };

  const updateOnlineStoreSettings = async (params: any) => {
    try {
      const response = await API.post('/online_store_settings/save', params);
      return response.data;
    } catch (err) {
      console.error('Update Online Store Settings Error:', err);
      throw err;
    }
  };

  const modifierGroupUpdate = async (params: {
    group_id: any;
    name: string;
    description: string;
    selection_type: 'single' | 'multiple';
    // sort_order: number;
  }) => {
    try {
      const response = await API.post(
        '/online_store_settings/modifier-groups/update',
        params,
        {
          headers
        }
      );
      return response.data;
    } catch (err) {
      console.error('Modifier Group Update Error:', err);
      throw err;
    }
  };
  const uploadProductImages = async (formData: FormData) => {
    try {
      const response = await API.post(
        '/online_store_settings/product/images',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (err) {
      console.error('Upload Product Images Error:', err);
      throw err;
    }
  };

  const addProductImage = async (formData: FormData) => {
    try {
      const response = await API.post(
        `/online_store_settings/product/images/add`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (err) {
      console.error('Add Product Image Error:', err);
      throw err;
    }
  };

  const reorderProductImages = async (
    images: { id: number; order: number }[]
  ) => {
    try {
      const response = await API.post(
        '/online_store_settings/product/images/reorder',
        { images },
        {
          headers
        }
      );
      return response.data;
    } catch (err) {
      console.error('Error reordering product images:', err);
      throw err;
    }
  };

  const deleteProductImage = async (imageId: number) => {
    try {
      const response = await API.delete(
        `/online_store_settings/product/images/${imageId}`,
        {
          headers
        }
      );
      return response.data;
    } catch (err) {
      console.error('Error deleting product image:', err);
      throw err;
    }
  };

  const uploadOnlineStorePhoto = async (imageFile: any, logoFile: any) => {
    const formData = new FormData();
    formData.append('brand_image', imageFile);
    formData.append('brand_logo', logoFile);
    try {
      const response = await API.post(
        '/online_store_settings/upload_image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data;
    } catch (err) {
      console.error('Photo upload failed:', err);
      throw err;
    }
  };

  const getEntitySearch = async () => {
    try {
      const response = await API.get(
        '/entity/search?perPage=9999&page=1&sort=createdAt&direction=desc'
      );
      return response.data;
    } catch (err) {
      console.error('Get Entity Search Error:', err);
      throw err;
    }
  };

  const entityUploadFiles = async (
    params: { id: any; postType: string },
    fileObject: any
  ) => {
    const formData = new FormData();
    formData.append('id', params.id.toString());
    formData.append('postType', params.postType);
    formData.append('image', fileObject);
    try {
      const response = await API.post('/entity/upload-files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (err) {
      console.error('Upload Files Error:', err);
      throw err;
    }
  };

  const ticketUpsert = async (params: any) => {
    try {
      const response = await API.post('/ticket/upsert', params);
      return response.data;
    } catch (err) {
      console.error('Ticket Upsert Error:', err);
      throw err;
    }
  };
  const experienceUpsert = async (params: any) => {
    try {
      const response = await API.post('/experience/upsert', params);
      return response.data;
    } catch (err) {
      console.error('Experience Upsert Error:', err);
      throw err;
    }
  };

  const postUpsert = async (params: any) => {
    try {
      const response = await API.post('/post/upsert', params);
      return response.data;
    } catch (err) {
      console.error('Post Upsert Error:', err);
      throw err;
    }
  };
  const widgetSettings = async (params: any) => {
    try {
      const response = await API.post('/widget-settings', params);
      return response.data;
    } catch (err) {
      console.error('Widget Settings Error:', err);
      throw err;
    }
  };

  const getPosTaxSetting = async () => {
    try {
      const response = await API.post('/pos/tax_setting');
      return response.data;
    } catch (err) {
      console.error('Get Pos Tax Setting Error', err);
      throw err;
    }
  };
  const getPosCardSurcharge = async () => {
    try {
      const response = await API.post('/pos/card_surcharge', {}, { headers });
      return response.data.data.pos_card_surcharges;
    } catch (err) {
      console.error('Get Card Surcharge Error:', err);
      throw err;
    }
  };
  const getPosOtherSurcharge = async () => {
    try {
      const response = await API.post('/pos/other_surcharge', {}, { headers });
      return response.data.data.pos_other_surcharges;
    } catch (err) {
      console.error('Get Other Surcharge Error:', err);
      throw err;
    }
  };

  const createOtherSurcharge = async (params: {
    name: string;
    value: string;
    status?: number;
    auto_add?: number;
    type: number;
    use_type?: number;
    day_of_week: number[];
    selected_date: string;
    branch_id?: number | null;
  }) => {
    try {
      const response = await API.post(
        '/pos/other_surcharge/add',
        {
          ...params,
          status: params.status ?? 1,
          auto_add: params.auto_add ?? 0,
          branch_id: params.branch_id ?? null
        },
        { headers }
      );
      return response.data;
    } catch (err) {
      console.error('Create Other Surcharge Error:', err);
      throw err;
    }
  };

  const toggleOtherSurchargeStatus = async (params: {
    id: number;
    status: number;
  }) => {
    try {
      const response = await API.post('/pos/other_surcharge/activate', params, {
        headers
      });
      return response.data;
    } catch (err) {
      console.error('Toggle Other Surcharge Status Error:', err);
      throw err;
    }
  };

  const AddProduct = async (product: {
    barcode: string;
    description: any;
    is_deleted: boolean;
    order: number;
    uuid: string;
    price: number;
    updated_at: Date;
    created_at: Date;
    is_pop_up: number;
    is_printed: number;
    color: any;
    status: number;
    code: any;
    category_id: any;
    currentTimestamp: Date;
    note: string;
    isCancelled: boolean;
    addOns: any[];
    option_ids: any[];
    quantity: number;
    stock: number;
    parent_category: any;
    title: any;
    photo: any;
    id?: any;
  }) => {
    try {
      const response = await API.post('/pos/product', product);
      return response.data.data.product;
    } catch (err) {
      console.error('Add Products Error:', err);
      throw err;
    }
  };
  const addPhotoToProduct = async (formData: any) => {
    try {
      const response = await API.post('/pos/product/photo/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.data;
    } catch (err) {
      console.error('Add Photo To Product Error:', err);
      throw err;
    }
  };

  const createAddOn = async (addon: any) => {
    try {
      const response = await API.post('/pos/product/addon', addon);
      return response.data;
    } catch (err) {
      console.error('Add Addons Error:', err);
      throw err;
    }
  };

  const getConnectionToken = async () => {
    try {
      if (!session?.user.token) throw new Error('No token found');
      const response = await API.post('/stripe/connection_token');
      return response.data.secret;
    } catch (err) {
      console.error('Get Connection Token Error:', err);
      throw err;
    }
  };

  const createPayment = async (paymentIntentId: any) => {
    try {
      const response = await API.post(
        '/stripe/capture_payment_intent',
        paymentIntentId
      );

      return response.data;
    } catch (err) {
      console.error('Create Payment Intent Error:', err);
      throw err;
    }
  };

  const getGuests = async (params?: { page: number; keyword?: string }) => {
    const sendParams = params ? params : {};

    try {
      const response = await API.post('/guests/', sendParams);
      return response.data.data;
    } catch (err) {
      console.error('Get Guests Error:', err);
      throw err;
    }
  };

  const createOrder = async (order: any) => {
    try {
      const response = await API.post('pos/phoneorder', order);
      return response.data;
    } catch (err) {
      console.error('Create Order Error:', err);
      throw err;
    }
  };

  const createTransaction = async (transaction: any) => {
    try {
      const response = await API.post('/pos/transaction/add', transaction);
      return response.data;
    } catch (err) {
      console.error('Create Transaction Error:', err);
      throw err;
    }
  };

  const getOrders = async (transactionParams: any) => {
    try {
      const response = await API.post('/pos/docket_view/', transactionParams);
      return response.data;
    } catch (err) {
      console.error('Get Transaction Error:', err);
      throw err;
    }
  };
  const getBookings = async (transactionParams: any) => {
    try {
      const response = await API.post('/bookings/', transactionParams);
      return response.data;
    } catch (err) {
      console.error('Get Booking Error:', err);
      throw err;
    }
  };
  const getBookingHistory = async (transactionParams: { id: number }) => {
    try {
      const response = await API.post(
        '/guest/bookings/history',
        transactionParams
      );
      return response.data;
    } catch (err) {
      console.error('Get Booking History:', err);
      throw err;
    }
  };
  const createBooking = async (transactionParams: any) => {
    try {
      const response = await API.post('/booking/store/', transactionParams);
      return response.data;
    } catch (err) {
      console.error('Create Booking Error:', err);
      throw err;
    }
  };

  const updateBooking = async (transactionParams: any) => {
    try {
      const response = await API.post('/booking/update/', transactionParams);
      return response.data;
    } catch (err) {
      console.error('Update Booking Error:', err);
      throw err;
    }
  };

  const addBookingOrder = async (transactionParams: any) => {
    try {
      const response = await API.post('/pos/order/', transactionParams);
      return response.data;
    } catch (err) {
      console.error('Post Add Booking Order Error:', err);
      throw err;
    }
  };
  const getBookingOrderList = async (transactionParams: any) => {
    try {
      const response = await API.post('pos/order/list', transactionParams);
      return response.data;
    } catch (err) {
      console.error('Get Booking Order List Error:', err);
      throw err;
    }
  };
  const getBookingCount = async (params: any) => {
    try {
      const response = await API.post('/bookings/count', params);
      return response.data;
    } catch (err) {
      console.error('Get Booking Count Error:', err);
      throw err;
    }
  };

  const getExperienceList = async () => {
    try {
      const response = await API.post('/experience/list');
      return response.data.data;
    } catch (err) {
      console.error('Get Experience List:', err);
      throw err;
    }
  };

  const getExperienceAssign = async (transactionParams: any) => {
    try {
      const response = await API.post(
        '/experience/get_assign',
        transactionParams
      );
      return response.data.data;
    } catch (err) {
      console.error(err);
    }
  };
  const searchTables = async (transactionParams: any) => {
    try {
      const response = await API.post('/search_tables', transactionParams);
      return response.data.data.tables;
    } catch (err) {
      console.error(err);
    }
  };

  const getTotalVisits = async (transactionParams: { id: number }) => {
    try {
      const response = await API.post('/guest/all/bookings', transactionParams);
      return response.data.data;
    } catch (err) {
      console.error(err);
    }
  };

  const uploadGuestPhoto = async (transavtionParams: {
    id: number;
    image: string;
    photo: any;
  }) => {
    try {
      const response = await API.post(
        '/guest/upload_photo',
        transavtionParams,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (err) {
      console.error(err);
    }
  };

  const getGuestDocket = async (transactionParams: {
    id: number;
    docket_type: 'on_account' | 'paid' | 'on_going';
  }) => {
    try {
      const response = await API.post('/guest/dockets', transactionParams);
      return response.data.data;
    } catch (err) {
      console.error(err);
    }
  };
  const addGuest = async (transactionParams: any) => {
    try {
      const response = await API.post('/guest/store', transactionParams);
      return response.data.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
  const changeProductCategoryOrder = async (transactionParams: any) => {
    try {
      const response = await API.post(
        '/pos/product/category/order',
        transactionParams
      );
      return response.data;
    } catch (err) {
      console.error(err);
    }
  };

  const changeProductOrder = async (transactionParams: any) => {
    try {
      const response = await API.post('/pos/product/order', transactionParams);
      return response.data;
    } catch (err) {
      console.error(err);
    }
  };

  const getPhoneOrderList = async () => {
    try {
      const response = await API.post('/pos/phoneorder/list');
      return response.data;
    } catch (err) {
      console.error(err);
    }
  };

  const getOnAccount = async () => {
    try {
      const response = await API.post('/pos/get_on_account');
      return response.data;
    } catch (err) {
      console.error(err);
    }
  };
  const getGuestOnAccount = async () => {
    try {
      const response = await API.post('/pos/guest_on_account');
      return response.data;
    } catch (err) {
      console.error(err);
    }
  };
  const getStripeInvoices = async (param: any) => {
    try {
      const response = await API.post('/stripe-invoice/', param);
      return response.data;
    } catch (err) {
      console.error(err);
    }
  };

  const getStripeAccount = async () => {
    try {
      const response = await API.get('/stripe-account');
      return response.data;
    } catch (err) {
      console.error(err);
    }
  };

  const getStripeProducts = async (param: {
    limit: number;
    starting_after?: string | null;
  }) => {
    try {
      const response = await API.post('/stripe-product', param);
      return response.data;
    } catch (err) {
      console.error(err);
    }
  };

  const getStripeCustomer = async (param: {
    limit: number;
    starting_after: string;
  }) => {
    try {
      const response = await API.post('/stripe-customer', param);
      return response.data;
    } catch (err) {
      console.error(err);
    }
  };

  const createStripeInvoice = async (param: {
    customer: string;
    items: {
      priceId: string;
      quantity: number;
      price: number;
    }[];
    invoiceId?: number | null;
    description?: string;
    footer?: string;
    customFields?: { name: string; value: string }[];
    pos_transaction_id?: number | null;
  }) => {
    try {
      const response = await API.post('/stripe-invoice/update', param);
      return response;
    } catch (error) {
      console.error(error);
    }
  };

  const createStripeInvoiceOnAccount = async (param: {
    customer: string;
    pos_transaction_id: string;
    items: {
      description: string;
      amount: number;
      quantity: number;
    }[];
  }) => {
    try {
      const response = await API.post(
        '/stripe-invoice/create-invoice-on-account',
        param
      );
      return response;
    } catch (error) {
      console.error(error);
    }
  };

  const getStripeBrandingLogo = async () => {
    try {
      const response = await API.get(
        '/stripe-account/get-account-branding-logo'
      );
      return response.data;
    } catch (error) {
      console.error(error);
    }
  };

  const createStripeCustomer = async (param: {
    customer: string | null;
    email: string;
    description: string;
    guest_id: string | null;
  }) => {
    try {
      const response = await API.post('/stripe-customer/update', param);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  };

  const createStripePaymentLink = async (param: {
    account: string;
    items: {
      price_id: string;
      quantity: number;
    }[];
    metadata?: Record<string, string>;
    tip?: number;
    discount?: number;
    customAmounts?: Array<{
      id: string;
      amount: number;
      note: string;
    }>;
  }) => {
    try {
      const response = await API.post('/stripe-payment-link', param);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  };

  const getStripePaymentLink = async (param: {
    account: string;
    limit: number;
    starting_after?: string | null;
    status: 'active' | 'deactivated' | 'all';
  }) => {
    try {
      const response = await API.post('/stripe-payment-link/list', param);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  };

  const createBusinessProfile = async (businessProfile: any) => {
    try {
      const response = await API.post('/set_business_profile', businessProfile);
      return response.data;
    } catch (err) {
      console.error('Create Business Profile Error:', err);
      throw err;
    }
  };

  const setShifts = async (shifts: any) => {
    try {
      const response = await API.post('/set_shifts', { shifts });
      return response.data;
    } catch (err) {
      console.error('Set Shifts Error:', err);
      throw err;
    }
  };

  const setFloors = async (floors: any) => {
    try {
      const response = await API.post('/set_floors', { floors });
      return response.data;
    } catch (err) {
      console.error('Set Floors Error:', err);
      throw err;
    }
  };

  const setTables = async (tables: any, floor_id: number) => {
    try {
      const response = await API.post('/set_tables', { tables, floor_id });
      return response.data;
    } catch (err) {
      console.error('Set Tables Error:', err);
      throw err;
    }
  };
  const getBookingList = async (params: any) => {
    try {
      const response = await API.post('/booking/booking-list', params);
      return response.data;
    } catch (err) {
      console.error('Get Booking List Error:', err);
      throw err;
    }
  };

  const getOnlineOrders = async (widget_token: string, params: any) => {
    try {
      const response = await API.post('/online-store/orders', params, {
        headers: {
          'X-TOKEN': widget_token
        }
      });
      return response.data.data.orders;
    } catch (err) {
      console.error('Get Online Orders Error:', err);
      throw err;
    }
  };

  const updateOnlineOrder = async (
    widget_token: string,
    order_id: string,
    status: number
  ) => {
    try {
      const response = await API.post(
        '/online-store/orders/update-status',
        { order_id, status },
        {
          headers: {
            'X-TOKEN': widget_token
          }
        }
      );
      return response.data;
    } catch (err) {
      console.error('Update Online Order Error:', err);
      throw err;
    }
  };

  const createOnlineCategory = async (newCategoryName: string) => {
    try {
      const response = await API.post('/online_store_settings/save-category', {
        category_name: newCategoryName
      });
      return response.data;
    } catch (err) {
      console.error('Create Online Category Error:', err);
      throw err;
    }
  };

  const updateOnlineProduct = async (productId: number, product: any) => {
    try {
      const response = await API.post(
        `/online-store/products/${productId}`,
        product
      );
      return response.data;
    } catch (err) {
      console.error('Update Online Product Error:', err);
      throw err;
    }
  };

  const updateProductImages = async (formData: FormData) => {
    try {
      const response = await API.post(
        '/online_store_settings/product/images',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      return response.data;
    } catch (err) {
      console.error('Update Product Images Error:', err);
      throw err;
    }
  };

  const getTicketStatusCount = async (startDate: string, endDate: string) => {
    try {
      const response = await API.get(
        `/ticket/per-status-count?startDate=${startDate}&endDate=${endDate}`
      );
      return response.data;
    } catch (err) {
      console.error('Get Ticket Status Count Error:', err);
      throw err;
    }
  };

  const getTickets = async (
    startDate: string,
    endDate: string,
    page: number
  ) => {
    try {
      const response = await API.get(
        `/tickets?startDate=${startDate}&endDate=${endDate}&page=${page}`
      );
      return response.data;
    } catch (err) {
      console.error('Get Tickets Error:', err);
      throw err;
    }
  };

  const scanTicket = async (ticket_ref_number: string) => {
    try {
      const response = await API.post(
        '/ticket/scan-qrcode',
        { ticket_ref_number },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      return response.data;
    } catch (err: any) {
      console.error('Scanning Ticket Error:', err);

      // Check for HTTP error response details
      if (err.response) {
        const { status, data } = err.response;
        console.error(
          `Error Status: ${status}`,
          `Error Details: ${data?.message || data}`
        );
      }

      throw err;
    }
  };

  const verifyTicket = async (ticket_ref_number: string) => {
    try {
      const response = await API.post('/ticket/verify', { ticket_ref_number });
      return response.data;
    } catch (err) {
      console.error('Verify Ticket Error:', err);
      throw err;
    }
  };

  const createOnlineGroupModifier = async (groupModifier: any) => {
    try {
      const response = await API.post(
        '/online_store_settings/modifier-groups',
        groupModifier
      );
      return response.data;
    } catch (err) {
      console.error('Create Group Modifier Error:', err);
      throw err;
    }
  };

  const updateOnlineGroupModifier = async (groupModifier: any) => {
    try {
      const response = await API.post(
        'online_store_settings/modifier-groups/update-modifiers',
        groupModifier
      );
      return response.data;
    } catch (err) {
      console.error('Update Group Modifier Error:', err);
      throw err;
    }
  };

  const getModifierGroups = async () => {
    try {
      const response = await API.post(
        '/online_store_settings/get-modifier-groups'
      );
      return response.data;
    } catch (err) {
      console.error('Get Modifier Groups Error:', err);
      throw err;
    }
  };

  const deleteOnlineGroupModifier = async (groupModifierId: any) => {
    try {
      const response = await API.post(
        '/online_store_settings/delete-modifier-group',
        { group_id: groupModifierId }
      );
      return response.data;
    } catch (err) {
      console.error('Delete Group Modifier Error:', err);
      throw err;
    }
  };

  const sortOnlineStoreCategories = async (categories: any) => {
    try {
      const response = await API.post(
        '/online_store_settings/sort-categories',
        categories
      );
      return response.data;
    } catch (err) {
      console.error('Sort Online Store Categories Error:', err);
      throw err;
    }
  };

  const deleteOnlineCategory = async (categoryId: any, token: string) => {
    try {
      const response = await API.post(
        '/online-store/delete-category',
        {
          category_id: categoryId
        },
        {
          headers: {
            'X-TOKEN': token
          }
        }
      );
      return response.data;
    } catch (err) {
      console.error('Delete Online Category Error:', err);
      throw err;
    }
  };

  const deleteInvoice = async (invoiceId: number) => {
    try {
      const response = await API.post(
        '/invoices/delete',
        { id: invoiceId },
        {
          headers
        }
      );
      return response.data;
    } catch (err) {
      console.error('Delete Invoice Error:', err);
      throw err;
    }
  };

  const createCardSurcharge = async (params: {
    name: string;
    value: string;
    status?: number;
    use_windcave?: number;
    use_stripe?: number;
    use_novatti?: number;
    use_worldline?: number;
    branch_id?: number | null;
  }) => {
    try {
      const response = await API.post(
        '/pos/card_surcharge/add',
        {
          ...params,
          status: params.status ?? 1,
          use_windcave: params.use_windcave ?? 0,
          use_stripe: params.use_stripe ?? 0,
          use_novatti: params.use_novatti ?? 0,
          use_worldline: params.use_worldline ?? 0,
          branch_id: params.branch_id ?? null
        },
        { headers }
      );
      return response.data;
    } catch (err) {
      console.error('Create Card Surcharge Error:', err);
      throw err;
    }
  };

  const toggleCardSurchargeStatus = async (params: {
    id: number;
    status: number;
  }) => {
    try {
      const response = await API.post('/pos/card_surcharge/activate', params, {
        headers
      });
      return response.data;
    } catch (err) {
      console.error('Toggle Card Surcharge Status Error:', err);
      throw err;
    }
  };

  const updateCardSurcharge = async (params: {
    id: number;
    name: string;
    value: string;
    status?: number;
    use_windcave?: number;
    use_stripe?: number;
    use_novatti?: number;
    use_worldline?: number;
    branch_id?: number | null;
  }) => {
    try {
      const response = await API.post(
        '/pos/card_surcharge/update',
        {
          ...params,
          status: params.status ?? 1,
          use_windcave: params.use_windcave ?? 0,
          use_stripe: params.use_stripe ?? 0,
          use_novatti: params.use_novatti ?? 0,
          use_worldline: params.use_worldline ?? 0,
          branch_id: params.branch_id ?? null
        },
        { headers }
      );
      return response.data;
    } catch (err) {
      console.error('Update Card Surcharge Error:', err);
      throw err;
    }
  };

  const deleteCardSurcharge = async (id: number) => {
    try {
      const response = await API.post(
        '/pos/card_surcharge/delete',
        { id },
        { headers }
      );
      return response.data;
    } catch (err) {
      console.error('Delete Card Surcharge Error:', err);
      throw err;
    }
  };

  const updateOtherSurcharge = async (params: {
    id: number;
    name: string;
    value: string;
    status?: number;
    auto_add?: number;
    type: number;
    use_type?: number;
    day_of_week: number[];
    selected_date: string;
    branch_id?: number | null;
  }) => {
    try {
      const response = await API.post(
        '/pos/other_surcharge/update',
        {
          ...params,
          status: params.status ?? 1,
          auto_add: params.auto_add ?? 0,
          branch_id: params.branch_id ?? null
        },
        { headers }
      );
      return response.data;
    } catch (err) {
      console.error('Update Other Surcharge Error:', err);
      throw err;
    }
  };

  const deleteOtherSurcharge = async (id: number) => {
    try {
      const response = await API.post(
        '/pos/other_surcharge/delete',
        { id },
        { headers }
      );
      return response.data;
    } catch (err) {
      console.error('Delete Other Surcharge Error:', err);
      throw err;
    }
  };

  const removeSubscription = async (id: number, unsubscribed_at: string) => {
    try {
      const response = await API.post(
        '/admin-subscription/unsubscribe',
        { id, unsubscribed_at },
        { headers }
      );
      return response.data;
    } catch (err) {
      console.error('Remove Subscription Error:', err);
      throw err;
    }
  };

  const refundSubscription = async (id: string) => {
    try {
      const response = await API.post(
        '/admin-subscription/refund',
        { payment_intent_id: id },
        { headers }
      );
      return response.data;
    } catch (err) {
      console.error('Refund Subscription Error:', err);
      throw err;
    }
  };

  const getUserSubscription = async (user_id: string) => {
    try {
      const response = await API.post(
        '/admin-subscription/user-subscriptions',
        { user_id },
        { headers }
      );
      return response.data;
    } catch (err) {
      console.error('Get User Subscription Error:', err);
    }
  };
  const getSubscriptionList = async () => {
    try {
      const response = await API.get('/admin-subscription/search', { headers });
      return response.data.admin_subscriptions.data;
    } catch (err) {
      console.error('Fetch Admin Subscriptions Error:', err);
      throw err;
    }
  };
  const attachAdminSubscriptions = async (params: any) => {
    try {
      const response = await API.post(
        '/admin-subscription/attached-subscription-ids',
        params,
        { headers }
      );
      return response.data;
    } catch (err) {
      console.error('Attach Admin Subscriptions Error:', err);
      throw err;
    }
  };
  const getSpecialDays = async () => {
    try {
      const response = await API.post('/special_days');
      return response.data.data;
    } catch (err) {
      console.error('Get Special Days Error:', err);
      throw err;
    }
  };
  const saveSpecialDays = async (params: any) => {
    try {
      const response = await API.post('/special_day/bulk_update', params);
      return response.data;
    } catch (err) {
      console.error('Save Special Days Error:', err);
      throw err;
    }
  };

  const getGiftCardSettings = async () => {
    try {
      const response = await API.get('/gift-card/settings', { headers });
      return response.data.data;
    } catch (err) {
      console.error('Get Gift Card Settings Error:', err);
      throw err;
    }
  };

  const saveGiftCardSettings = async (params: {
    id?: number;
    title: string;
    description: string;
    logo?: any;
    primary_color: string;
    secondary_color: string;
    validity_period?: {
      value?: number;
      unit?: string;
    };
    custom_amount?: {
      min: number;
      max: number;
      step: number;
    } | null;
    expiration_date?: string;
    predefined_amounts: number[];
  }) => {
    try {
      const response = await API.post('/gift-card/settings', params);
      return response.data;
    } catch (err) {
      console.error('Save Gift Card Settings Error:', err);
      throw err;
    }
  };
  const saveGiftCardLogo = async (params: { id: number; logo: any }) => {
    const formData = new FormData();
    formData.append('id', params.id.toString());
    formData.append('logo', params.logo);
    try {
      const response = await API.post(
        '/gift-card/settings/upload-logo',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      return response.data;
    } catch (err) {
      console.error('Save Gift Card Logo Error:', err);
      throw err;
    }
  };

  const saveGiftCardStripImage = async (params: {
    id: number;
    strip_image: any;
  }) => {
    const formData = new FormData();
    formData.append('id', params.id.toString());
    formData.append('strip_image', params.strip_image);
    try {
      const response = await API.post(
        '/gift-card/settings/upload-strip-image',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      return response.data;
    } catch (err) {
      console.error('Save Gift Card Stripe Image Error:', err);
      throw err;
    }
  };

  const deleteGiftCardLogo = async () => {
    try {
      const response = await API.post('/gift-card/settings/delete-logo', {});
      return response.data;
    } catch (error) {
      console.error('Delete Gift Card Logo Error:', error);
    }
  };

  const deleteGiftCardStripImage = async () => {
    try {
      const response = await API.post(
        '/gift-card/settings/delete-strip-image',
        {}
      );
      return response.data;
    } catch (error) {
      console.error('Delete Gift Card Strip Image Error:', error);
    }
  };

  const scanReferenceCode = async (referenceCode: string) => {
    try {
      const response = await API.post('/gift-card/scan-reference-code', {
        reference_code: referenceCode
      });
      return response.data;
    } catch (err) {
      console.error('Scan Reference Code Error:', err);
      throw err;
    }
  };

  const redeemGiftCard = async (code: string) => {
    try {
      const response = await API.post('/gift-card/redeem', { code });
      return response.data;
    } catch (err) {
      console.error('Use Gift Card Error:', err);
      throw err;
    }
  };

  const getDailySales = async (params: {
    date: any;
    shift_id: number;
    currentDate: any;
    device_id?: string;
    isDownload?: boolean;
  }) => {
    try {
      const response = await API.post(
        '/pos/daily_sales',
        {
          date: params.date,
          shift_id: params.shift_id,
          currentDate: params.currentDate,
          device_id: params.device_id || 'web',
          isDownload: params.isDownload || false
        },
        { headers }
      );
      return response.data;
    } catch (err) {
      console.error('Get Daily Sales Error:', err);
      throw err;
    }
  };

  const getDailySalesAll = async (params: {
    start_date: string; // required
    end_date: string; // required
    shift_id?: number | null; // optional: 0 or null for all shifts
    device_id?: string; // optional
    isDownload?: boolean; // optional
  }) => {
    try {
      const response = await API.post('/pos/daily_sales_all', params);
      return response.data;
    } catch (err) {
      console.error('Get All Daily Sales Error:', err);
      throw err;
    }
  };

  const getPayouts = async (params?: {
    limit?: number;
    accountId?: string;
  }) => {
    try {
      const searchParams = new URLSearchParams();
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.accountId) searchParams.append('accountId', params.accountId);

      const response = await fetch(
        `/api/payment/payouts?${searchParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...headers
          }
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch payouts');
      }

      return data;
    } catch (err) {
      console.error('Error fetching payouts:', err);
      throw err;
    }
  };

  const requestInstantPayout = async (params: {
    accountId: string;
    amount?: number;
  }) => {
    try {
      const response = await fetch('/api/payment/payouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({
          action: 'request_instant_payout',
          accountId: params.accountId,
          amount: params.amount
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to request payout');
      }

      return data;
    } catch (err) {
      console.error('Error requesting payout:', err);
      throw err;
    }
  };

  const uploadMedia = async (imageFile: File, employeeId?: number) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('folder', 'stripe_products');

      const response = await API.post('/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...headers
        }
      });

      if (response.data.status_code === 200) {
        const imageUrl = response.data.data.storage_path;

        const imagePath = process.env.NEXT_PUBLIC_IMG_URL + imageUrl;

        return {
          success: true,
          imageUrl: imagePath,
          mediaPath: response.data.data.storage_path,
          data: response.data.data
        };
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload Media Error:', err);
      throw err;
    }
  };

  return {
    addEmployee,
    deleteEmployee,
    saveGiftCardLogo,
    saveGiftCardStripImage,
    deleteGiftCardLogo,
    deleteGiftCardStripImage,
    scanReferenceCode,
    redeemGiftCard,
    restoreEmployee,
    updateEmployee,
    uploadEmployeePhoto,
    getEmployeementContract,
    addEmployeeContract,
    getOnAccount,
    deleteEmployeeContract,
    getEmployeeRoles,
    getPhoneOrderList,
    addEmployeeRole,
    deleteEmployeeRole,
    getGroupSchedule,
    createGroupSchedule,
    removeGroupSchedule,
    getScheduleDate,
    createScheduleDate,
    updateScheduleDate,
    getGuestOnAccount,
    removeScheduleDate,
    getDeletedSchedule,
    getEmployeeSchedule,
    createEmployeeSchedule,
    emailEmployeeRoster,
    requestShift,
    timesheetSummary,
    timeSheets,
    deleteTimeRecord,
    timeBatchInsert,
    approveTimesheet,
    updateTimeRecord,
    getWidgetBranding,
    updateWidgetBranding,
    uploadPhotoWidgetBranding,
    uploadLogoWidgetBranding,
    getAccountSettings,
    setAccountSettings,
    saveAccountSettings,
    getPartysizeTurntime,
    setCustomTurnTime,
    deleteCustomTurnTime,
    uploadPhotoService,
    getOnlineStoreSettings,
    updateOnlineStoreSettings,
    modifierGroupUpdate,
    uploadProductImages,
    uploadOnlineStorePhoto,
    addProductImage,
    reorderProductImages,
    deleteProductImage,
    getEntitySearch,
    entityUploadFiles,
    ticketUpsert,
    experienceUpsert,
    postUpsert,
    widgetSettings,
    widgetDaySettings,
    deleteWidgetService,
    getWidgetDaySettings,
    uploadWidgetRelatedLinkImage,
    login,
    getProducts,
    getShifts,
    getFloors,
    getEmployees,
    getDeletedEmployees,
    getBusinessProfile,
    getPosTaxSetting,
    getPosCardSurcharge,
    getPosOtherSurcharge,
    createOtherSurcharge,
    toggleOtherSurchargeStatus,
    AddProduct,
    addPhotoToProduct,
    createAddOn,
    getConnectionToken,
    createPayment,
    createOrder,
    createTransaction,
    getOrders,
    getBookings,
    getBookingHistory,
    createBooking,
    updateBooking,
    addBookingOrder,
    getBookingOrderList,
    getBookingCount,
    getExperienceList,
    getExperienceAssign,
    fetchInventoryIngredients,
    fetchInventoryProducts,
    fetchAnalyticsInventoryProducts,
    fetchCategories,
    fetchPaginatedInventoryItems,
    createProduct,
    updateProduct,
    deleteProduct,
    fetchIngredientsFromProduct,
    fetchIngredientsFromCategory,
    fetchInventoryLocations,
    createInventoryLocation,
    deleteInventoryLocation,
    fetchInventorySuppliers,
    createInventorySupplier,
    deleteInventorySupplier,
    listMeasurementUnits,
    createMeasurementUnit,
    deleteMeasurementUnit,
    fetchUnitDescriptions,
    createUnitDescription,
    deleteUnitDescription,
    fetchOrderUnit,
    createOrderUnit,
    deleteOrderUnit,
    saveAddonIngredient,
    saveIngredientInProduct,
    saveProductInventory,
    deleteProductIngredients,
    getAverageCost,
    createCategory,
    updatePhotoProductUpload,
    createInventoryCategory,
    deleteInventoryCategory,
    fetchGroupModifiers,
    fetchIngredientsFromAddon,
    getStripeInvoices,
    getStripeAccount,
    createStripeCustomer,
    getStripeProducts,
    getStripeCustomer,
    getStripeBrandingLogo,
    createStripeInvoice,
    createStripeInvoiceOnAccount,
    createStripePaymentLink,
    getStripePaymentLink,
    fetchAddonIngredients,
    getGuests,
    createGroupModifier,
    deleteGroupModifier,
    searchTables,
    getTotalVisits,
    uploadGuestPhoto,
    getGuestDocket,
    fetchBumpScreen,
    addProductToBumpOrder,
    addGuest,
    changeProductCategoryOrder,
    changeProductOrder,
    getEmailCampaigns,
    createEmailCampaign,
    saveInvoiceData,
    getInvoiceData,
    getAnalyticsData,
    getDayViewSales,
    updateStockInventory,
    saveInvoiceFile,
    createBusinessProfile,
    setShifts,
    setFloors,
    createUser,
    setTables,
    getBookingList,
    getOnlineOrders,
    createOnlineCategory,
    updateOnlineOrder,
    updateOnlineProduct,
    updateProductImages,
    getTicketStatusCount,
    getTickets,
    scanTicket,
    verifyTicket,
    createOnlineGroupModifier,
    updateOnlineGroupModifier,
    getModifierGroups,
    deleteOnlineGroupModifier,
    sortOnlineStoreCategories,
    deleteOnlineCategory,
    deleteInvoice,
    createCardSurcharge,
    toggleCardSurchargeStatus,
    updateCardSurcharge,
    deleteCardSurcharge,
    updateOtherSurcharge,
    deleteOtherSurcharge,
    removeSubscription,
    refundSubscription,
    getUserSubscription,
    getSubscriptionList,
    attachAdminSubscriptions,
    getSpecialDays,
    saveSpecialDays,
    getGiftCardSettings,
    saveGiftCardSettings,
    uploadMedia,
    getDailySales,
    getDailySalesAll,
    getPayouts,
    requestInstantPayout
  };
};
