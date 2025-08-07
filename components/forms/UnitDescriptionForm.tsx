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
  unit_desc: z
    .string()
    .min(1, { message: 'Unit Description must be at least 1 character' })
});

type UnitDescriptionValues = z.infer<typeof formSchema>;

interface UnitDescriptionProps {
  isOpen: boolean;
  initialData?: {
    id: number;
    unit_desc: string;
  } | null;
  onSubmit: (data: UnitDescriptionValues) => void;
  onClose: () => void;
  setUpdatedData: any;
}

export default function UnitDescriptionForm({
  isOpen,
  initialData,
  onSubmit,
  onClose,
  setUpdatedData
}: UnitDescriptionProps) {
  const title = initialData
    ? 'Edit Measurement Unit'
    : 'Create Measurement Unit';
  const description = initialData
    ? 'Edit the Measurement Unit details below.'
    : 'Add a new Measurement Unit to your inventory.';
  const action = initialData ? 'Save Changes' : 'Create Measurement Unit';

  const defaultValues: UnitDescriptionValues = initialData
    ? {
        unit_desc: initialData.unit_desc
      }
    : {
        unit_desc: ''
      };

  const form = useForm<UnitDescriptionValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const handleFormSubmit = (data: UnitDescriptionValues) => {
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
      <div className="flex items-center justify-between"></div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="max-h-[80vh] w-full space-y-8 overflow-y-auto px-1"
        >
          <FormField
            control={form.control}
            name="unit_desc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit Description</FormLabel>
                <FormControl>
                  <Input
                    disabled={form.formState.isSubmitting}
                    placeholder="Bottle, Can, etc..."
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
