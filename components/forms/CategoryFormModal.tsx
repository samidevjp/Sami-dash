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
import { Modal } from '../ui/modal';
import { ColorPicker, useColor } from 'react-color-palette';
import 'react-color-palette/css';
import { motion, AnimatePresence } from 'framer-motion';
const formSchema = z.object({
  category_name: z
    .string()
    .min(3, { message: 'Category Name must be at least 3 characters' })
});

type CategoryFormModalValues = z.infer<typeof formSchema>;

interface CategoryFormModalProps {
  isOpen: boolean;
  initialData?: any;
  onSubmit: (data: any) => void;
  onClose: () => void;
  setUpdatedData: any;
}

export default function CategoryFormModal({
  isOpen,
  initialData,
  onSubmit,
  onClose,
  setUpdatedData
}: CategoryFormModalProps) {
  const title = initialData ? 'Edit Category' : 'Create Category';
  const description = initialData
    ? 'Edit the category details below.'
    : 'Add a new category to your inventory.';
  const action = initialData ? 'Save' : 'Create Category';

  const defaultValues: CategoryFormModalValues = initialData
    ? {
        category_name: initialData.name
      }
    : {
        category_name: ''
      };

  const form = useForm<CategoryFormModalValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const [color, setColor] = useColor(initialData?.color || '#000000');
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    form.reset(defaultValues);
    setShowColorPicker(initialData?.color ? true : false);
  }, [initialData]);

  const handleFormSubmit = (data: CategoryFormModalValues) => {
    const params: any = {
      color: color.hex,
      name: data.category_name,
      status: 1,
      order: 0
    };
    if (initialData) {
      params.id = initialData.id;
    }
    onSubmit(params);
    setUpdatedData((prev: any) => !prev);
    onClose();
  };

  const toggleButton = (shoColorPickerFlg: boolean) => {
    setShowColorPicker(!shoColorPickerFlg);
    if (shoColorPickerFlg === true) {
      setColor({
        hex: '#000000',
        rgb: { r: 0, g: 0, b: 0, a: 1 },
        hsv: { h: 0, s: 0, v: 0, a: 1 }
      });
    }
  };

  return (
    <Modal
      description={description}
      title={title}
      isOpen={isOpen}
      onClose={() => {
        setShowColorPicker(false);
        onClose();
      }}
    >
      <div className="pt-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="max-h-[80vh] w-full space-y-8 overflow-y-auto px-1 pb-1"
          >
            <div className="items-end gap-8 md:flex">
              <div className="w-full">
                <FormField
                  control={form.control}
                  name="category_name"
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
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => toggleButton(showColorPicker)}
                className="w-full md:w-52"
              >
                {showColorPicker ? <>- Remove Color</> : <>+ Set Color</>}
              </Button>
            </div>
            <AnimatePresence>
              {showColorPicker && (
                <motion.div
                  key="colorpicker"
                  className="mb-4"
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <ColorPicker
                    hideInput={['rgb', 'hsv']}
                    color={color}
                    onChange={setColor}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-end">
              <Button
                disabled={form.formState.isSubmitting}
                className="ml-auto"
                type="submit"
              >
                {action}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Modal>
  );
}
