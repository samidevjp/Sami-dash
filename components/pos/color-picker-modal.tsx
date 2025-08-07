import React, { useEffect } from 'react';
import { ColorPicker, useColor } from 'react-color-palette';
import 'react-color-palette/css';
import { Dialog, DialogContent } from '../ui/dialog';

const ColorPickerModal = ({
  open,
  setOpenColorPickerModal,
  sendColor
}: any) => {
  const [color, setColor] = useColor('#561ecb');

  useEffect(() => {
    sendColor(color.hex);
  }, [color]);

  return (
    <Dialog
      open={open}
      onOpenChange={() => setOpenColorPickerModal(false)}
      modal
    >
      <DialogContent className="bg-secondary">
        <div className="w-full rounded-lg bg-secondary">
          <p>CHOOSE A COLOUR</p>
          <ColorPicker
            hideInput={['rgb', 'hsv']}
            color={color}
            onChange={setColor}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ColorPickerModal;
