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
import { Modal } from './ui/modal';

const formSchema = z.object({
  item_category: z
    .string()
    .min(3, { message: 'Category Name must be at least 3 characters' }),
  item_description: z
    .string()
    .min(3, { message: 'Description must be at least 3 characters' })
});

type CategoryFormValues = z.infer<typeof formSchema>;

interface CategoryFormProps {
  isOpen: boolean;
  initialData?: CategoryFormValues | null;
  onSubmit: (data: CategoryFormValues) => void;
  onClose: () => void;
  setUpdatedData: any;
}

export default function CategoryInventoryForm({
  isOpen,
  initialData,
  onSubmit,
  onClose,
  setUpdatedData
}: CategoryFormProps) {
  const title = initialData ? 'Edit Category' : 'Create Category';
  const description = initialData
    ? 'Edit the category details below.'
    : 'Add a new category to your inventory.';
  const action = initialData ? 'Save Changes' : 'Create Category';

  const defaultValues: CategoryFormValues = initialData
    ? initialData
    : {
        item_category: '',
        item_description: ''
      };

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const handleFormSubmit = (data: CategoryFormValues) => {
    onSubmit(data);
    setUpdatedData((prev: any) => !prev);
    onClose();
  };

  return (
    <Modal
      description={description}
      title={title}
      isOpen={isOpen}
      onClose={onClose}
    >
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="max-h-[80vh] w-full space-y-8 overflow-y-auto px-1"
        >
          <FormField
            control={form.control}
            name="item_category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category Name</FormLabel>
                <FormControl>
                  <Input
                    disabled={form.formState.isSubmitting}
                    placeholder="Category Name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="item_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input
                    disabled={form.formState.isSubmitting}
                    placeholder="Description"
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
