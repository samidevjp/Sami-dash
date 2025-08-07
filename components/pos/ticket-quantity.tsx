import React, { useState } from 'react';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

function TicketQuantity(props: any) {
  const [ticketsNo, setTicketsNo] = useState('');
  const [hasError, setHasError] = useState(false);
  const data = props.experienceData;

  const handleClose = () => {
    props.setTicketQuantityOpen(false);
    // setOpen(false);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let number;
    if (e.target.validity.valid) {
      number = String(parseInt(e.target.value)) || '';
      setTicketsNo(number);
    } else {
      return;
    }
    if (hasError) {
      setHasError(false);
    }
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    props.handleTicketQuantitySubmit(ticketsNo);
    handleClose();
  };

  return (
    <Modal
      isOpen={props.ticketQuantityOpen}
      onClose={handleClose}
      title={data?.exp_name}
      description={data?.exp_description}
    >
      <Input
        placeholder="How many tickets?"
        value={ticketsNo}
        onChange={onChange}
        type="tel"
      />
      <p className="mt-1 text-right text-xs">Please enter number of tickets</p>

      <div className="mt-4 flex justify-end gap-4">
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Buy</Button>
      </div>
    </Modal>
  );
}
export default TicketQuantity;
