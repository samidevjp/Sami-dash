'use client';
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
import { Dispatch, SetStateAction } from 'react';

const formSchema = z.object({
  supplier_name: z
    .string()
    .min(3, { message: 'Supplier Name must be at least 3 characters' }),
  supplier_stock_number: z.optional(z.string())
});

type SupplierFormValues = z.infer<typeof formSchema>;

interface SupplierFormProps {
  isOpen: boolean;
  initialData?: {
    id: string;
    supplier_name: string;
    supplier_stock_number: string;
    created_at: string;
    updated_at: string;
  } | null;
  onSubmit: (data: SupplierFormValues) => void;
  onClose: () => void;
  setUpdatedData: Dispatch<SetStateAction<boolean>>;
}

export default function SuppliersInventoryForm({
  isOpen,
  initialData,
  onSubmit,
  onClose,
  setUpdatedData
}: SupplierFormProps) {
  const title = initialData ? 'Edit Supplier' : 'Create Supplier';
  const description = initialData
    ? 'Edit the Supplier details below.'
    : 'Add a new Supplier to your inventory.';
  const action = initialData ? 'Save Changes' : 'Create Supplier';

  const defaultValues: SupplierFormValues = initialData
    ? {
        supplier_name: initialData.supplier_name,
        supplier_stock_number: initialData.supplier_stock_number
      }
    : {
        supplier_name: '',
        supplier_stock_number: ''
      };

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const handleFormSubmit = (data: SupplierFormValues) => {
    const formattedData = {
      ...data,
      id: initialData?.id,
      created_at: initialData?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    onSubmit(formattedData);
    setUpdatedData((prev) => !prev);
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
            name="supplier_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier Name</FormLabel>
                <FormControl>
                  <Input
                    disabled={form.formState.isSubmitting}
                    placeholder="Supplier Name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="supplier_stock_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier Stock Number</FormLabel>
                <FormControl>
                  <Input
                    disabled={form.formState.isSubmitting}
                    placeholder="Supplier Stock Number"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
