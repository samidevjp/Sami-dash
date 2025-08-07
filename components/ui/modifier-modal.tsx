import React, { useState } from 'react';
import { Switch } from '@mui/material';
import { Button } from '@/components/ui/button';

import { Input } from '../ui/input';

import { Modal } from '../ui/modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import { getRelativeLuminance } from '@/utils/common';
const CustomTextField = ({ label, value, onChange }: any) => (
  <div className="mb-2 flex items-center border-t border-border p-4">
    <p className="w-36 min-w-36 max-w-36 text-sm">{label}</p>
    <Input
      placeholder={label}
      value={value}
      onChange={onChange}
      className="flex-1 rounded-lg "
    />
  </div>
);

interface ModifierModalProps {
  open: boolean;
  setOpenModifierModal: (open: boolean) => void;
  editAddon?: any;
  setEditAddon?: any;
  registeredProducts: any;
  propSelectedCategoryId?: any;
}

const ModifierModal = ({
  open,
  setOpenModifierModal,
  editAddon = null,
  setEditAddon = null,
  registeredProducts,
  propSelectedCategoryId
}: ModifierModalProps) => {
  const {
    name,
    price: editPrice,
    color,
    id: editId,
    status,
    pos_product_category_id
  } = editAddon || {};
  const [modifierName, setModifierName] = useState(name || '');
  const [price, setPrice] = useState(editPrice || '');
  const [active, setActive] = useState(
    status ? (status === 0 ? false : true) : false
  );
  const [modifierModalColor, setModifierModalColor] = useState(color || '');
  // const [colorPickerModalOpen, setOpenColorPickerModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    pos_product_category_id || propSelectedCategoryId || 0
  );
  // const [ingredients, setIngredients] = useState('');

  // const handleCreateAddon = async () => {};

  const handleClose = () => {
    setOpenModifierModal(false);
    if (editAddon) setEditAddon(null);
  };

  return (
    <Modal
      isOpen={open}
      title="Create Modifier"
      description="Create Modifier details here."
      onClose={handleClose}
    >
      <div>
        <div>
          <CustomTextField
            label="Modifier Name"
            value={modifierName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setModifierName(e.target.value)
            }
          />
          <CustomTextField
            label="Price"
            value={price}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPrice(e.target.value)
            }
          />
          <div className="mb-2 flex items-center border-t border-border p-4">
            <p className="w-36 min-w-36 max-w-36 text-sm">Active</p>
            <Switch
              checked={active}
              onChange={() => setActive(!active)}
              color="secondary"
              sx={{
                '& .MuiSwitch-switchBase': {
                  color: 'default'
                },
                '& .MuiSwitch-track': {
                  backgroundColor: 'default'
                },
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#7af8c8'
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#7af8c8'
                }
              }}
            />
          </div>
          <div className="mb-2 flex items-center border-t border-border p-4">
            <p className="w-36 min-w-36 max-w-36 text-sm">Color</p>
            <Button
              className={`flex-1 ${
                modifierModalColor ? 'override-bg-color' : ''
              }`}
              style={{
                backgroundColor: modifierModalColor || undefined,
                color: modifierModalColor
                  ? getRelativeLuminance(modifierModalColor)
                  : 'inherit'
              }}
            >
              {modifierModalColor ? 'Remove color' : 'Set Color'}
            </Button>
          </div>
          <div className="mb-2 flex items-center border-t border-border p-4">
            <p className="w-36 min-w-36 max-w-36 text-sm">Categories</p>
            <Select
              value={selectedCategoryId}
              onValueChange={(value: any) => setSelectedCategoryId(value)}
              // defaultValue={undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder="Next" defaultValue={0} />
              </SelectTrigger>
              <SelectContent>
                {registeredProducts?.map((category: any) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mb-2 flex items-center border-t border-border p-4">
            <p className="w-36 min-w-36 max-w-36 text-sm">Ingredients</p>
            <Button
              className="flex-1 border-border"
              // onClick={() => setIngredients('some ingredients')}
            >
              Add Ingredients
            </Button>
          </div>
        </div>
        <div className=" right-2 top-2 flex justify-end gap-4">
          {/* <Button className="border-border " onClick={handleClose}>
            Cancel
          </Button> */}
          <Button className="rounded-lg" onClick={() => {}}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ModifierModal;
