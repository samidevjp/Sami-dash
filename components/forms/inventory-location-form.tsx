'use client';
import * as z from 'zod';
import { useEffect } from 'react';
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
import { Heading } from '@/components/ui/heading';
import { Modal } from '../ui/modal';

const formSchema = z.object({
  location_name: z
    .string()
    .min(3, { message: 'Location Name must be at least 3 characters' })
});

type LocationFormValues = z.infer<typeof formSchema>;

interface LocationFormProps {
  isOpen: boolean;
  initialData?: {
    id: string;
    location_name: string;
    created_at: string;
    updated_at: string;
  } | null;
  onSubmit: (data: LocationFormValues) => void;
  onClose: () => void;
  setUpdatedData: any;
}

export default function LocationInventoryForm({
  isOpen,
  initialData,
  onSubmit,
  onClose,
  setUpdatedData
}: LocationFormProps) {
  const title = initialData ? 'Edit Location' : 'Create Location';
  const description = initialData
    ? 'Edit the location details below.'
    : 'Add a new location to your inventory.';
  const action = initialData ? 'Save Changes' : 'Create Location';

  const defaultValues: LocationFormValues = initialData
    ? {
        location_name: initialData.location_name
      }
    : {
        location_name: ''
      };

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [initialData]);

  const handleFormSubmit = (data: LocationFormValues) => {
    const formattedData = {
      ...data,
      id: initialData?.id,
      created_at: initialData?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
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
            name="location_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location Name</FormLabel>
                <FormControl>
                  <Input
                    disabled={form.formState.isSubmitting}
                    placeholder="Location Name"
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
