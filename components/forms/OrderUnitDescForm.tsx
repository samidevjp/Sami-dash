import * as z from 'zod';
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
import { Modal } from '../ui/modal';

const formSchema = z.object({
  order_unit_desc: z
    .string()
    .min(1, { message: 'Order Unit Description must be at least 1 character' })
});

type OrderUnitDescriptionValues = z.infer<typeof formSchema>;

interface OrderUnitDescriptionProps {
  isOpen: boolean;
  initialData?: {
    id: number;
    order_unit_desc: string;
  } | null;
  onSubmit: (data: OrderUnitDescriptionValues) => void;
  onClose: () => void;
  setUpdatedData: any;
  inventoryData: any;
}

export default function OrderUnitDescriptionForm({
  isOpen,
  initialData,
  onSubmit,
  onClose,
  setUpdatedData,
  inventoryData
}: OrderUnitDescriptionProps) {
  const title = initialData ? 'Edit Order Unit' : 'Create Order Unit';
  const description = initialData
    ? 'Edit the Order Unit details below.'
    : 'Add a new Order Unit to your inventory.';
  const action = initialData ? 'Save Changes' : 'Create Order Unit';

  const defaultValues: OrderUnitDescriptionValues = initialData
    ? {
        order_unit_desc: initialData.order_unit_desc
      }
    : {
        order_unit_desc: ''
      };

  const form = useForm<OrderUnitDescriptionValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const handleFormSubmit = (data: OrderUnitDescriptionValues) => {
    const formattedData = {
      ...data,
      id: initialData?.id || 0
    };
    onSubmit(formattedData);
    setUpdatedData((prev: any) => !prev);
    onClose();
  };

  return (
    <Modal
      title={title}
      description={description}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="flex items-center justify-between">
        {/* <Heading title={title} description={description} /> */}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="max-h-[80vh] w-full space-y-8 overflow-y-auto px-1"
        >
          <FormField
            control={form.control}
            name="order_unit_desc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order Unit Description</FormLabel>
                <FormControl>
                  <Input
                    disabled={form.formState.isSubmitting}
                    placeholder="Box, Case, etc..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* <div className="mb-4 flex items-center justify-between">
            <Label className="flex-1" htmlFor="category_id">
              Category
            </Label>
            <Select
              onValueChange={(value) =>
                // handleSelectChange('category_id', value)
              }
              defaultValue={itemData ? itemData.pos_product_category_id : 0}
            >
              <SelectTrigger className="flex-1" id="category_id">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent className="max-h-[50vh] flex-1 overflow-y-auto">
                {categories?.map((category: any) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Separator className="my-4" /> */}

          <Button
            disabled={form.formState.isSubmitting}
            className="ml-auto"
            type="submit"
          >
            {action}
          </Button>
        </form>
      </Form>
    </Modal>
  );
}
