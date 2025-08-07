'use client';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Modal } from '@/components/ui/modal';
import { useApi } from '@/hooks/useApi';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow
} from '../ui/table';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  price: z.string().min(1, { message: 'Price must be a valid number' }),
  category_id: z.string().min(1, { message: 'Category is required' })
});

type AddonFormValues = z.infer<typeof formSchema>;

interface AddAddonModalProps {
  isOpen: boolean;
  initialData?: any;
  onSubmit: (data: any) => Promise<any>;
  onClose: () => void;
  categories: any[];
  ingredients: any[];
  selectedModifier?: any;
}

export default function AddAddonModal({
  isOpen,
  initialData,
  onSubmit,
  onClose,
  categories,
  ingredients,
  selectedModifier
}: AddAddonModalProps) {
  const { saveAddonIngredient, fetchAddonIngredients } = useApi();
  const [filterText, setFilterText] = useState('');
  const addonData = selectedModifier || initialData;
  const title = addonData ? 'Edit Addon' : 'Add Addon';
  const action = addonData ? 'Save Changes' : 'Add Addon';
  const defaultValues: AddonFormValues = addonData
    ? {
        name: addonData.name || '',
        price: addonData.price?.toString() || '',
        category_id: addonData.pos_product_category_id?.toString() || ''
      }
    : {
        name: '',
        price: '',
        category_id: ''
      };
  const form = useForm<AddonFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  useEffect(() => {
    const fetchData = async () => {
      if (initialData) {
        form.reset(defaultValues);
        if (initialData?.ingredients) {
          setSelectedIngredients(initialData.ingredients);
          const quantities = initialData.ingredients.reduce(
            (acc: any, ingredient: any) => {
              acc[ingredient.id] = ingredient.quantity || 0;
              return acc;
            },
            {}
          );
          setIngredientQuantities(quantities);
        }

        // Fetch ingredients if initialData is present
        const { ingredients: addonIngredients } = await fetchAddonIngredients(
          initialData.id
        );
        if (addonIngredients) {
          const initialSelectedIngredients: any[] = [];
          const initialIngredientQuantities: any = {};

          addonIngredients.forEach((addonIngredient: any) => {
            const matchingIngredient = ingredients.find(
              (ingredient: any) =>
                ingredient.id === addonIngredient.pos_product_inventory_id
            );

            if (matchingIngredient) {
              initialSelectedIngredients.push(matchingIngredient);
              initialIngredientQuantities[matchingIngredient.id] =
                addonIngredient.quantity;
            }
          });

          setSelectedIngredients(initialSelectedIngredients);
          setIngredientQuantities(initialIngredientQuantities);
        }
      }
    };

    fetchData();
  }, [selectedModifier, initialData, ingredients]);

  const [selectedIngredients, setSelectedIngredients] = useState<any[]>([]);
  const [ingredientQuantities, setIngredientQuantities] = useState<{
    [key: string]: number;
  }>({});
  const [isIngredientsModalOpen, setIsIngredientsModalOpen] = useState(false);

  const handleQuantityChange = (ingredientId: string, value: number) => {
    setIngredientQuantities((prevQuantities) => ({
      ...prevQuantities,
      [ingredientId]: value
    }));
  };

  const handleSelectIngredient = (ingredient: any) => {
    if (selectedIngredients.includes(ingredient)) {
      setSelectedIngredients(
        selectedIngredients.filter((item: any) => item !== ingredient)
      );
    } else {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
  };
  const productCost = selectedIngredients.reduce(
    (total: number, ingredient: any) => {
      const ingredientCostPerUnit = Number(ingredient.avg_cost);
      const quantityUsed = ingredientQuantities[ingredient.id] || 0;
      const totalIngredientCost = (
        ingredientCostPerUnit * quantityUsed
      ).toFixed(2);
      return Number(totalIngredientCost) + total;
    },
    0
  );

  const handleFormSubmit = async (data: AddonFormValues) => {
    try {
      const newAddon = {
        type: Number(data.price) !== 0 ? 0 : 1,
        name: data.name,
        price: Number(data.price),
        quantity: 0,
        status: true,
        category_id: Number(data.category_id),
        color: ''
      };

      if (initialData?.id) {
        // @ts-ignore
        newAddon.id = initialData.id;
      }

      const addonResponse = await onSubmit(newAddon);
      if (addonResponse.data.productAddOn) {
        const ingredientsWithQuantity = selectedIngredients.map(
          (ingredient: any) => {
            const quantity = ingredientQuantities[ingredient.id] || 0;
            return {
              pos_product_inventory_id: ingredient.id,
              quantity,
              measurement_unit: ingredient.measurement_unit,
              cost: productCost,
              isDeleted: false
            };
          }
        );

        const ingredientData = {
          pos_product_add_ons_id: addonResponse.data.productAddOn.id,
          ingredients: ingredientsWithQuantity
        };

        await saveAddonIngredient(ingredientData);
      }
      form.reset(defaultValues);
      onClose();
    } catch (err) {
      console.error('Error creating addon:', err);
    }
  };

  const handleClose = () => {
    form.reset(defaultValues);
    setIsIngredientsModalOpen(false);
    setSelectedIngredients([]);
    onClose();
  };

  const handleRemoveIngredient = (ingredientId: string) => {
    setSelectedIngredients((prev) =>
      prev.filter((ingredient) => ingredient.id !== ingredientId)
    );

    setIngredientQuantities((prevQuantities) => {
      const updatedQuantities = { ...prevQuantities };
      delete updatedQuantities[ingredientId];
      return updatedQuantities;
    });
  };
  const filteredIngredients = ingredients.filter((ingredient) =>
    ingredient.product_name.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <>
      <Modal
        title={title}
        description="Fill out the details below to add or edit an addon."
        isOpen={isOpen}
        onClose={handleClose}
      >
        <div className="pt-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="max-h-[80vh] w-full space-y-8 overflow-y-auto px-1"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        disabled={form.formState.isSubmitting}
                        placeholder="Modifier Name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        disabled={form.formState.isSubmitting}
                        placeholder="Price"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => field.onChange(value)}
                        value={field.value}
                        disabled={form.formState.isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent className="h-[40vh] overflow-y-scroll">
                          {categories?.map((category) => (
                            <SelectItem
                              key={category.id}
                              value={category.id.toString()}
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="mb-4 flex w-full flex-col justify-around">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <FormLabel htmlFor="ingredients">Ingredients</FormLabel>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Add more ingredients from Inventory.
                    </p>
                  </div>
                  <Button
                    id="ingredients"
                    name="ingredients"
                    onClick={() => setIsIngredientsModalOpen(true)}
                    className="rounded-full px-6 py-2"
                  >
                    + Select Ingredients
                  </Button>
                </div>
                <Separator className="my-4" />
                <div className="min-h-44 px-4">
                  <div className="flex flex-wrap">
                    {selectedIngredients.length > 0 ? (
                      selectedIngredients.map((ingredient: any) => (
                        <div
                          key={ingredient.id}
                          className="m-2 rounded-full border-2 bg-transparent p-2 text-xs text-foreground"
                        >
                          {ingredient.product_name}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs italic text-gray-500">
                        No ingredients selected
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="sticky bottom-0 border-t bg-background pt-4">
                <div className="mb-4 flex flex-col md:px-4">
                  <div className="flex items-end justify-between">
                    <span className="mr-2 font-semibold">Cost:</span>
                    <span>${productCost}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="mr-2 font-semibold">profit:</span>
                    <span>
                      ${Number(form.getValues('price')) - productCost}
                    </span>
                  </div>
                  <div className="items-end justify-between md:flex">
                    <span className="mr-2 font-semibold">
                      optimal price (230% of cost):
                    </span>
                    <p className="text-right">
                      ${' '}
                      {(productCost + productCost + productCost * 0.3).toFixed(
                        2
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <Button disabled={form.formState.isSubmitting} type="submit">
                    {action}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </Modal>
      <Modal
        onClose={() => setIsIngredientsModalOpen(false)}
        title="Select Ingredients"
        description="Ingredients"
        isOpen={isIngredientsModalOpen}
      >
        <div className="relative flex h-full w-full flex-col">
          <Input
            type="text"
            placeholder="Search ingredients..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="mb-4 w-full"
          />
          <div className="flex h-[60vh] w-full flex-col overflow-y-scroll">
            {ingredients.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-500">
                No ingredients available.
              </p>
            ) : filteredIngredients.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-500">
                No ingredients found for
                <span className="font-semibold">{filterText}</span>
              </p>
            ) : (
              <>
                <div className="md:hidden">
                  {ingredients
                    .filter((ingredient) =>
                      ingredient.product_name
                        .toLowerCase()
                        .includes(filterText.toLowerCase())
                    )
                    ?.map((ingredient: any) => (
                      <div
                        key={ingredient.id}
                        className="mb-2 rounded-lg bg-secondary p-4"
                      >
                        <div className="mb-2 flex items-center">
                          <input
                            type="checkbox"
                            id={ingredient.id}
                            name={ingredient.product_name}
                            checked={selectedIngredients.includes(ingredient)}
                            onChange={() => handleSelectIngredient(ingredient)}
                            className="mr-2"
                          />
                          <label
                            htmlFor={ingredient.id}
                            className="font-semibold"
                          >
                            {ingredient.product_name}
                          </label>
                        </div>
                        <div className="text-sm text-gray-600">
                          Price: ${ingredient.avg_cost}
                        </div>
                        <div className="text-sm text-gray-600">
                          Measurement: {ingredient.measurement_desc}
                        </div>
                        <div className="mt-2">
                          <label className="text-sm">Quantity per Item:</label>
                          <Input
                            value={ingredientQuantities[ingredient.id] || ''}
                            placeholder="Quantity in number"
                            type="number"
                            step="0.001"
                            onChange={(e) =>
                              handleQuantityChange(
                                ingredient.id,
                                parseFloat(e.target.value)
                              )
                            }
                            className="mt-1 w-full"
                          />
                        </div>
                      </div>
                    ))}
                </div>
                <div className="hidden md:block">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableCell>Ingredient</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Measurement Desc</TableCell>
                        <TableCell>Quantity per Item</TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ingredients
                        .filter((ingredient) =>
                          ingredient.product_name
                            .toLowerCase()
                            .includes(filterText.toLowerCase())
                        )
                        ?.map((ingredient: any) => (
                          <TableRow key={ingredient.id}>
                            <TableCell>
                              <input
                                type="checkbox"
                                id={ingredient.id}
                                name={ingredient.product_name}
                                checked={selectedIngredients.includes(
                                  ingredient
                                )}
                                onChange={() =>
                                  handleSelectIngredient(ingredient)
                                }
                                className="mr-2"
                              />
                              <label htmlFor={ingredient.id}>
                                {ingredient.product_name}
                              </label>
                            </TableCell>
                            <TableCell>{ingredient.avg_cost}</TableCell>
                            <TableCell>{ingredient.measurement_desc}</TableCell>
                            <TableCell>
                              <Input
                                value={
                                  ingredientQuantities[ingredient.id] || ''
                                }
                                placeholder="Quantity in number"
                                type="number"
                                step="0.001"
                                onChange={(e) =>
                                  handleQuantityChange(
                                    ingredient.id,
                                    parseFloat(e.target.value)
                                  )
                                }
                                className="w-full"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </div>
          <div className="bottom-0 w-full border-t bg-background">
            <div
              className={`flex max-h-36 flex-wrap gap-2 overflow-y-scroll ${
                selectedIngredients.length > 0 && 'pt-4'
              }`}
            >
              {selectedIngredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="flex items-center gap-2 rounded-full border-2 px-2 py-1 text-sm"
                >
                  {ingredient.product_name}
                  <button
                    type="button"
                    className="ml-2"
                    onClick={() => handleRemoveIngredient(ingredient.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="py-4">
              <p className="flex items-end gap-8">
                <span className="mr-2 font-semibold">Cost:</span>$
                {selectedIngredients.reduce(
                  (total: number, ingredient: any) => {
                    const ingredientCostPerUnit = Number(ingredient.avg_cost);
                    const quantityUsed =
                      ingredientQuantities[ingredient.id] || 0;
                    const totalIngredientCost = (
                      ingredientCostPerUnit * quantityUsed
                    ).toFixed(2);
                    return Number(totalIngredientCost) + total;
                  },
                  0
                )}
              </p>
            </div>
            <div className="flex justify-center">
              <Button
                className="justify-center px-8"
                onClick={() => setIsIngredientsModalOpen(false)}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
