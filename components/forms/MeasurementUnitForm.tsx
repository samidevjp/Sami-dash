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
  category: z
    .string()
    .min(3, { message: 'Category must be at least 3 characters' }),
  unit_of_measurement: z
    .string()
    .min(3, { message: 'Unit of Measurement must be at least 3 characters' }),
  abbreviation: z
    .string()
    .min(1, { message: 'Abbreviation must be at least 1 character' })
});

type MeasurementUnitFormValues = z.infer<typeof formSchema>;

interface MeasurementUnitFormProps {
  isOpen: boolean;
  initialData?: {
    id: number;
    category: string;
    unit_of_measurement: string;
    abbreviation: string;
  } | null;
  onSubmit: (data: MeasurementUnitFormValues) => void;
  onClose: () => void;
  setUpdatedData: any;
}

export default function MeasurementUnitForm({
  isOpen,
  initialData,
  onSubmit,
  onClose,
  setUpdatedData
}: MeasurementUnitFormProps) {
  const title = initialData
    ? 'Edit Measurement Unit'
    : 'Create Measurement Unit';
  const description = initialData
    ? 'Edit the Measurement Unit details below.'
    : 'Add a new Measurement Unit to your inventory.';
  const action = initialData ? 'Save Changes' : 'Create Measurement Unit';

  const defaultValues: MeasurementUnitFormValues = initialData
    ? {
        category: initialData.category,
        unit_of_measurement: initialData.unit_of_measurement,
        abbreviation: initialData.abbreviation
      }
    : {
        category: '',
        unit_of_measurement: '',
        abbreviation: ''
      };

  const form = useForm<MeasurementUnitFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const handleFormSubmit = (data: MeasurementUnitFormValues) => {
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
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input
                    disabled={form.formState.isSubmitting}
                    placeholder="Category"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="unit_of_measurement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit of Measurement</FormLabel>
                <FormControl>
                  <Input
                    disabled={form.formState.isSubmitting}
                    placeholder="Unit of Measurement"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="abbreviation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Abbreviation</FormLabel>
                <FormControl>
                  <Input
                    disabled={form.formState.isSubmitting}
                    placeholder="Abbreviation"
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
