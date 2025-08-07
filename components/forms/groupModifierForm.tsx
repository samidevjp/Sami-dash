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
  name: z.string().min(1, {
    message: 'Group Modifier Description must be at least 1 character'
  })
});

type GroupModifierValues = z.infer<typeof formSchema>;

interface GroupModifierProps {
  isOpen: boolean;
  initialData?: {
    id: number;
    name: string;
  } | null;
  onSubmit: (data: GroupModifierValues) => void;
  onClose: () => void;
  setUpdatedData: any;
}

export default function GroupModifierForm({
  isOpen,
  initialData,
  onSubmit,
  onClose,
  setUpdatedData
}: GroupModifierProps) {
  const title = initialData ? 'Edit Group Modifier' : 'Create Group Modifier';
  const description = initialData
    ? 'Edit the Group Modifier details below.'
    : 'Add a new Group Modifier to your inventory.';
  const action = initialData ? 'Save Changes' : 'Create Group Modifier';

  const defaultValues: GroupModifierValues = initialData
    ? {
        name: initialData.name
      }
    : {
        name: ''
      };

  const form = useForm<GroupModifierValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const handleFormSubmit = (data: GroupModifierValues) => {
    const formattedData: any = {
      ...data,
      status: 1
    };
    if (initialData) {
      formattedData.id = initialData.id;
    }
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group Modifier Description</FormLabel>
                <FormControl>
                  <Input
                    disabled={form.formState.isSubmitting}
                    placeholder="Name"
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
