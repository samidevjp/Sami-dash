import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import masterCard from '@/public/images/landing/common/master_icon.png';
import amexCard from '@/public/images/landing/common/amex_icon.png';
import visaCard from '@/public/images/landing/common/visa_icon.png';
import person from '@/public/images/landing/common/jobs.png';
import cardIcon from '@/public/images/landing/features/pos/card.svg';
import cashPayment from '@/public/images/landing/features/pos/cash-payment.svg';
import addTip from '@/public/images/landing/features/pos/add-tip.svg';
import splitPayment from '@/public/images/landing/features/pos/split-payment.svg';
import {
  CreditCard,
  DollarSign,
  User,
  SplitSquareVertical,
  MoreHorizontal,
  Settings
} from 'lucide-react';
import { toast } from '../ui/use-toast';
import Calculator from '../ui/Calculator';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContentInline,
  DialogHeader,
  DialogTitle
} from '../ui/dialog';
import { DialogOverlay } from '@radix-ui/react-dialog';
import { Fade } from '@mui/material';
interface SignupPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  guestName: string;
  items: any[];
  docket?: any;
}
const SignupPaymentModal = ({
  isOpen,
  onClose,
  total,
  guestName,
  items,
  docket = null
}: SignupPaymentModalProps) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>('');
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [change, setChange] = useState<number>(0);
  const [showCalculator, setShowCalculator] = useState(false);
  const [cashAmount, setCashAmount] = useState<string>('');
  const [payments, setPayments] = useState<any[]>([]);
  const [remainingTotal, setRemainingTotal] = useState(0);
  const [readers, setReaders] = useState<any[]>([]);
  const [selectedReader, setSelectedReader] = useState<any>();
  const [isReaderModalOpen, setIsReaderModalOpen] = useState(false);
  const [tax, setTax] = useState(docket?.tax.amount || 0);
  const [surcharge, setSurcharge] = useState(0);
  const [creditFee, setCreditFee] = useState(0);
  const [tip, setTip] = useState(docket?.tip?.amount || 0);
  const [discount, setDiscount] = useState(docket?.discount?.amount || 0);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [feeCreditType, setFeeCreditType] = useState<'domestic' | 'amex' | ''>(
    ''
  );
  const [splitPayments, setSplitPayments] = useState<any[]>([]);
  const [absolutePosition, setAbsolutePosition] = useState(false);
  const getTotalPrice = () => {
    return total + tip + surcharge - discount + tax + creditFee;
  };
  const getDueAmount = () => {
    const value =
      getTotalPrice() -
      payments
        .map((payment: any) => payment.payed_amount)
        .reduce((a: any, b: any) => a + b, 0);
    if (value < 0) {
      return 0;
    }
    return value ? parseFloat(value.toFixed(2)) : 0;
  };
  const handleButtonClick = (method: string) => {
    if (method === 'credit') {
      if (feeCreditType === 'domestic') {
        if (cashAmount !== '') {
          setCashAmount((prev) => total.toFixed(2));
          setFeeCreditType('');
          return;
        } else {
          setCreditFee(() => 0);
          setRemainingTotal(() => total);
          setFeeCreditType('');
          return;
        }
      }
      if (cashAmount !== '') {
        setCashAmount((prev) =>
          (parseFloat(prev) + parseFloat(prev) * 0.019).toFixed(2)
        );
      } else {
        setRemainingTotal(() => getTotalPrice() + getTotalPrice() * 0.019);
        setCreditFee(() => parseFloat((getDueAmount() * 0.019).toFixed(2)));
      }
      setFeeCreditType('domestic');
      return;
    }
    if (method === 'amex') {
      if (feeCreditType === 'amex') {
        if (cashAmount !== '') {
          setCashAmount((prev) => total.toFixed(2));
          setFeeCreditType('');
          return;
        } else {
          setRemainingTotal(() => total);
          setCreditFee(() => 0);
          setFeeCreditType('');
          return;
        }
      }
      if (cashAmount !== '') {
        setCashAmount((prev) =>
          (parseFloat(prev) + parseFloat(prev) * 0.029).toFixed(2)
        );
      } else {
        setRemainingTotal(() => getTotalPrice() + getTotalPrice() * 0.029);
        setCreditFee(() => parseFloat((getDueAmount() * 0.029).toFixed(2)));
      }
      setFeeCreditType('amex');
      return;
    }
    setRemainingTotal(() => total);
    setSelectedPaymentMethod(method);
  };
  const resetStates = () => {
    setSelectedPaymentMethod('');
    setRemainingTotal(() => total);
    setPayments([]);
    setChange(() => 0);
    setTip(() => 0);
    setSurcharge(() => 0);
    setDiscount(() => 0);
    setCreditFee(() => 0);
    setTax(() => 0);
  };
  const handleBackClick = (reset?: boolean) => {
    setShowCalculator(false);
    setIsPaid(false);
    setSelectedPaymentMethod('');
    if (reset) {
      resetStates();
    }
  };
  const handleCashAmountClick = (amount: string) => {
    if (amount === 'Custom') {
      setShowCalculator(true);
    } else {
      const numericAmount = parseFloat(amount.replace('$', ''));
      setCashAmount((prev) =>
        (parseFloat(prev || '0') + numericAmount).toString()
      );
      setShowCalculator(false);
    }
  };
  const handleCalculatorInput = (input: string) => {
    if (input === '<') {
      setCashAmount((prev) => prev.slice(0, -1));
    } else if (input === '.') {
      if (!cashAmount.includes('.')) {
        setCashAmount((prev) => prev + input);
      }
    } else if (input === '+') {
      setCashAmount((prev) => prev);
    } else {
      setCashAmount((prev) => prev + input);
    }
  };
  const handleFinishPaymentProcess = async () => {
    toast({
      title: 'Booking Finished',
      description: 'Booking finished successfully',
      variant: 'success'
    });
  };
  const handleCreatePaymentLink = async () => {
    console.log('handleCreatePaymentLink');
  };
  const handleCashPayment = async (amount: number) => {
    console.log('handleCashPayment');
  };
  useEffect(() => {
    if (getDueAmount() <= 0 && isOpen) {
      const finishTransaction = async () => {
        setIsPaid(true);
        setSelectedPaymentMethod('paid');
      };
      finishTransaction();
    }
  }, [payments]);
  const handleCreateReaderPayment = () => {
    if (items.length === 0) {
      toast({
        title: 'Error',
        variant: 'destructive',
        description: 'No Items Selected'
      });
      return;
    }
    setIsReaderModalOpen(true);
  };
  const handleDoubleClick = (field: string) => {
    setEditingField(field);
  };
  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      switch (editingField) {
        case 'tax':
          setTax(value);
          break;
        case 'surcharge':
          setSurcharge(value);
          break;
        case 'tip':
          setTip(value);
          break;
        case 'discount':
          setDiscount(value);
          break;
        case 'creditFee':
          setCreditFee(value);
          break;
      }
    }
  };
  const handleFieldBlur = () => {
    setEditingField(null);
  };
  const renderEditableField = useCallback(
    (label: string, value: number, field: string) => {
      return (
        <div className="mb-1 flex justify-between text-xs text-gray-600">
          {editingField === field ? (
            <Input
              type="number"
              value={value}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              className="w-20 text-right"
              autoFocus
            />
          ) : (
            <span onDoubleClick={() => handleDoubleClick(field)}>
              ${value.toFixed(2)}
            </span>
          )}
        </div>
      );
    },
    [editingField]
  );
  useEffect(() => {
    if (!showCalculator) {
      setAbsolutePosition(false);
    } else {
      setAbsolutePosition(true);
    }
  }, [showCalculator]);
  const handleOpenThankYouModal = () => {
    handleSetInitialValues();
    onClose();
  };
  const handleSetInitialValues = () => {
    setTax(0);
    setSurcharge(0);
    setCreditFee(0);
    setTip(0);
    setDiscount(0);
    setCashAmount('');
    setPayments([]);
    setChange(0);
    setSplitPayments([]);
    setRemainingTotal(0);
    setSelectedPaymentMethod('');
    setIsPaid(false);
  };
  return (
    <Dialog modal={false} open={isOpen} onOpenChange={onClose}>
      <DialogContentInline className=" h-full min-w-[100%] text-white">
        <DialogTitle className="hidden">Payment</DialogTitle>
        <div className="flex h-full flex-row overflow-hidden rounded-2xl">
          <div className="flex w-1/3 flex-col  overflow-hidden rounded-lg bg-secondary p-4 text-black">
            <div className="mb-2 flex items-center justify-between rounded-sm bg-white p-2 ">
              <div className="flex items-center">
                <Image
                  className="mr-2 h-12 w-12 rounded-full bg-gray-200"
                  src={person}
                  alt="person"
                />
                <div className="flex flex-col">
                  <h2 className="text-xs font-bold">{guestName}</h2>
                  <p className="text-[10px]">043214149</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] ">Table 6</p>
                <p className="text-[10px]">2 guests</p>
              </div>
            </div>
            <ScrollArea className="flex-grow overflow-y-auto bg-white p-4 text-xs">
              {items.map((item, index) => (
                <div key={index} className="mb-2">
                  <div className="flex justify-between">
                    <span>{item.title}</span>
                    <span className="flex gap-4 pr-2">
                      <p className="text-xs text-gray-400">x{item.quantity}</p>
                      {/* <p>${Number(item?.price?.toFixed(2))}</p> */}
                    </span>
                  </div>
                  {item.addOns &&
                    item.addOns.map((addon: any, addonIndex: any) => {
                      return (
                        <div
                          key={addonIndex}
                          className="ml-4 text-xs text-gray-600"
                        >
                          <span className="text-xs text-gray-400">
                            {addon.name}
                          </span>
                          <span className="float-right pr-2">
                            ${Number(addon?.price * addon?.quantity).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                </div>
              ))}
            </ScrollArea>
            <ScrollArea className="mt-4 rounded-sm border-t border-gray-200 bg-white p-4 text-xs">
              <div className="mb-2 flex justify-between">
                <span>SUB-TOTAL</span>
                <span>${Number(total.toFixed(2))}</span>
              </div>
              <div className="mb-1 flex justify-between text-xs text-gray-600">
                <span>TAX (GST 10%)</span>
                {renderEditableField('Tax', tax, 'tax')}
              </div>
              <div className="mb-1 flex justify-between text-xs text-gray-600">
                <span>Weekend Surcharge</span>
                {renderEditableField('Surcharge', surcharge, 'surcharge')}
              </div>
              <div className="mb-1 flex justify-between text-xs text-gray-600">
                <span>Tip</span>
                {renderEditableField('Tip', tip, 'tip')}
              </div>
              <div className="mb-1 flex justify-between text-xs text-gray-600">
                <span>Discount</span>
                {renderEditableField('Discount', discount, 'discount')}
              </div>
              {creditFee > 0 && (
                <div className="mb-1 flex justify-between text-xs text-gray-600">
                  <span>Credit Fee</span>
                  {renderEditableField('Credit Fee', creditFee, 'creditFee')}
                </div>
              )}
              {payments.length > 0 &&
                payments.map((payment: any, idx: any) => {
                  return (
                    <div key={payment.value + idx}>
                      <div className="flex justify-between">
                        <span>Value paid:</span>
                        <p>
                          ${payment?.cash_amount ? payment?.cash_amount : 0}
                        </p>
                      </div>
                      {payment?.payment_type === 2 && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">
                            Credit Surcharge:
                          </span>
                          <p className="text-gray-400">
                            <span>
                              {payment.fee_type === 'domestic'
                                ? '(1.9%)'
                                : '(2.9%)'}
                            </span>
                            ${payment?.surcharge_amount}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              <div className="mt-2 flex cursor-pointer justify-between border-t border-gray-200 pt-2 font-bold">
                <span>TOTAL DUE</span>
                <span>
                  ${cashAmount ? cashAmount : getDueAmount().toFixed(2)}
                </span>
              </div>
              <div className="mt-2 flex justify-between border-gray-200 pt-2 text-xs font-semibold">
                <span>TOTAL</span>
                <span>
                  ${getTotalPrice() <= 0 ? 0 : getTotalPrice().toFixed(2)}
                </span>
              </div>
            </ScrollArea>
          </div>
          <Dialog
            open={isReaderModalOpen}
            onOpenChange={() => setIsReaderModalOpen(!isReaderModalOpen)}
            modal={true}
          >
            <DialogOverlay className="flex flex-col space-y-4">
              <DialogHeader>
                <DialogTitle>Select a Reader</DialogTitle>
              </DialogHeader>
              {readers.length > 0 ? (
                readers.map((reader) => (
                  <div
                    key={reader.id}
                    onClick={() => setSelectedReader(reader)}
                    className={`flex cursor-pointer items-center justify-between rounded-lg p-4 ${
                      selectedReader?.id === reader.id
                        ? 'bg-blue-400'
                        : 'bg-gray-200'
                    }`}
                  >
                    <div className="text-black">{reader.label}</div>
                    <div className="text-black">{reader.status}</div>
                  </div>
                ))
              ) : (
                <div>No readers available.</div>
              )}
              <Button
                onClick={() => {}}
                className="w-full bg-[#3F59E4] text-white"
              >
                Confirm Payment
              </Button>
            </DialogOverlay>
          </Dialog>
          <div className="relative flex w-2/3 flex-col items-center justify-center p-4 lg:w-3/4">
            {selectedPaymentMethod === '' && (
              <div className="mb-4 mt-4 grid grid-cols-5 gap-4">
                <Button
                  className="flex h-24 flex-col items-center justify-center gap-1 rounded-md bg-[#1F2122] font-semibold text-white hover:bg-[#3F59E4]"
                  onClick={() => handleButtonClick('card')}
                >
                  <Image src={cardIcon} alt="Card" width={24} height={24} />
                  <span className="text-[10px]">Card</span>
                </Button>
                <Button
                  onClick={() => handleButtonClick('cash')}
                  className="flex h-24 flex-col items-center justify-center gap-1 rounded-md bg-[#1F2122] font-semibold text-white hover:bg-[#3F59E4]"
                  disabled
                >
                  <Image
                    src={cashPayment}
                    alt="cashPayment"
                    width={24}
                    height={24}
                  />
                  <span className="text-[10px]">Cash Payment</span>
                </Button>
                <Button
                  onClick={() => handleButtonClick('account')}
                  className="flex h-24 flex-col items-center justify-center gap-1 rounded-md bg-[#1F2122] font-semibold text-white hover:bg-[#3F59E4]"
                  disabled
                >
                  <Image src={addTip} alt="addTip" width={24} height={24} />
                  <span className="text-[10px]">Add Tip</span>
                </Button>
                <Button
                  onClick={() => handleButtonClick('split')}
                  className="flex h-24 flex-col items-center justify-center gap-1 rounded-md bg-[#1F2122] font-semibold text-white hover:bg-[#3F59E4]"
                  disabled
                >
                  <Image
                    src={splitPayment}
                    alt="splitPayment"
                    width={24}
                    height={24}
                  />
                  <span className="text-[10px]">Split Payment</span>
                </Button>
                <Button
                  onClick={() => handleButtonClick('more')}
                  className="flex h-24 flex-col items-center justify-center gap-1 rounded-md bg-[#1F2122] font-semibold text-white hover:bg-[#3F59E4]"
                  disabled
                >
                  <MoreHorizontal size={24} className="mr-2" />
                  <span>More</span>
                </Button>
              </div>
            )}
            {splitPayments.length > 0 && (
              <div className="mt-4 w-full max-w-md">
                <h3 className="mb-2 text-xl font-bold">Payment Summary</h3>
                {splitPayments.map((payment, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{payment.method}</span>
                    <span>${payment.amount.toFixed(2)}</span>
                  </div>
                ))}
                <div className="mt-2 flex justify-between font-bold">
                  <span>Remaining:</span>
                  <span>${remainingTotal.toFixed(2)}</span>
                </div>
              </div>
            )}
            {showCalculator &&
              selectedPaymentMethod !== 'card' &&
              selectedPaymentMethod !== 'split' && (
                <div className="mb-8 flex w-full justify-center">
                  <Calculator
                    onAmountChange={handleCalculatorInput}
                    cashAmount={cashAmount}
                    total={cashAmount}
                  />
                </div>
              )}
            {selectedPaymentMethod === 'card' && (
              <div className="flex flex-col items-center">
                <div
                  className={`button-container ${
                    showCalculator ? 'opacity-0' : 'opacity-1'
                  } ${
                    absolutePosition ? 'absolute' : 'relative'
                  } mb-6 grid w-full grid-cols-5 gap-4`}
                >
                  <Button
                    className="flex h-24 w-auto flex-col items-center justify-center   rounded-md text-white hover:bg-[#3F59E4]"
                    onClick={() => handleBackClick()}
                  >
                    <CreditCard size={24} />
                    <span>Card</span>
                  </Button>
                  <Button
                    onClick={() => handleButtonClick('credit')}
                    className="flex h-24 w-auto flex-col items-center justify-center gap-2 rounded-md bg-[#1F2122] text-white hover:bg-[#3F59E4]"
                  >
                    {/* <CreditCard fill="red" size={24} /> */}
                    <div className="flex items-center justify-center">
                      <Image
                        src={masterCard}
                        alt="Master Card"
                        width={24}
                        height={24}
                      />
                      <Image
                        src={visaCard}
                        alt="Visa Card"
                        width={24}
                        height={24}
                      />
                    </div>
                    <span>Credit 1.9%</span>
                  </Button>
                  <Button
                    onClick={() => handleButtonClick('amex')}
                    className="flex h-24 w-auto flex-col items-center justify-center rounded-md bg-[#1F2122] text-white hover:bg-[#3F59E4]"
                  >
                    <Image
                      src={amexCard}
                      alt="Amex Card"
                      width={24}
                      height={24}
                    />
                    <span>Amex 2.9%</span>
                  </Button>
                  <Button className="flex h-24 w-auto flex-col items-center justify-center rounded-md bg-[#1F2122] text-white hover:bg-[#3F59E4]">
                    <Settings size={24} />
                    Settings
                  </Button>
                  <Button className="flex h-24 w-auto flex-col items-center justify-center rounded-md bg-[#1F2122] text-white hover:bg-[#3F59E4]">
                    <MoreHorizontal size={24} />
                    More
                  </Button>
                </div>
                <div
                  className={`flex w-full flex-col items-center justify-center`}
                >
                  <div
                    onClick={() => setShowCalculator(!showCalculator)}
                    className="mb-6 mt-6 w-full cursor-pointer bg-[#1F2122] p-4 text-3xl hover:bg-gray-700"
                  >
                    <div className="flex justify-around">
                      <h2 className="font-bold">Total Due: </h2>
                      <h2 className="font-bold">
                        ${cashAmount ? cashAmount : getDueAmount().toFixed(2)}
                      </h2>
                    </div>
                    <div className="flex justify-around">
                      {feeCreditType === 'domestic' && (
                        <>
                          <span className="text-lg text-gray-400">Credit</span>
                          <span className="text-lg text-gray-400">(+1.9%)</span>
                        </>
                      )}
                      {feeCreditType === 'amex' && (
                        <>
                          <span className="text-lg text-gray-400">Amex</span>
                          <span className="text-lg text-gray-400">(+2.9%)</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    className="text-md mt-auto h-16 w-full  rounded-md bg-[#1F2122] text-2xl text-white hover:bg-white hover:text-black"
                    onClick={() => handleOpenThankYouModal()}
                  >
                    Pay
                  </Button>
                </div>
              </div>
            )}
            {selectedPaymentMethod === 'cash' && (
              <div className="flex h-full w-3/4 flex-col items-center">
                <div className="flex h-full w-full flex-col">
                  <div className="flex flex-grow items-center justify-center">
                    <Calculator
                      onAmountChange={handleCalculatorInput}
                      cashAmount={cashAmount}
                      total={cashAmount}
                    />
                  </div>
                  <Button
                    className="left-1/2 h-16  bg-[#1F2122] text-2xl text-white hover:bg-white hover:text-black"
                    onClick={() => handleCashPayment(parseFloat(cashAmount))}
                  >
                    Pay
                  </Button>
                </div>
                <div className="absolute bottom-0 right-0 top-0 flex min-w-40 flex-col justify-center gap-2 pr-6">
                  {['$5', '$10', '$20', '$50', '$100'].map((amount) => (
                    <Button
                      key={amount}
                      className="h-24 w-full bg-[#1F2122] text-xl text-white"
                      onClick={() => handleCashAmountClick(amount)}
                    >
                      {amount}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {selectedPaymentMethod === 'more' && (
              <div className="flex flex-col items-center">
                <div className="grid w-full grid-cols-4 gap-4">
                  <Button
                    className="flex h-24 w-24 flex-col items-center justify-center rounded-md bg-[#1F2122] text-white hover:bg-[#3F59E4]"
                    onClick={() => handleButtonClick('card')}
                  >
                    <CreditCard size={24} />
                    <span>Card</span>
                  </Button>
                  <Button
                    onClick={() => handleButtonClick('cash')}
                    className="flex h-24 w-24 flex-col items-center justify-center bg-[#1F2122] text-white hover:bg-[#3F59E4]"
                  >
                    <DollarSign size={24} />
                    <span>Cash Payment</span>
                  </Button>
                  <Button
                    onClick={() => handleButtonClick('account')}
                    className="flex h-24 w-24 flex-col items-center justify-center bg-[#1F2122] text-white hover:bg-[#3F59E4]"
                    disabled
                  >
                    <User size={24} />
                    <span>On Account</span>
                  </Button>
                  <Button className="flex h-24 w-24 flex-col items-center justify-center bg-[#1F2122] text-white hover:bg-[#3F59E4]">
                    <CreditCard size={24} />
                    <span>Staff Expense</span>
                  </Button>
                  <Button className="flex h-24 w-24 flex-col items-center justify-center bg-[#1F2122] text-white hover:bg-[#3F59E4]">
                    <DollarSign size={24} />
                    <span>Discount</span>
                  </Button>
                  <Button
                    onClick={() => {}}
                    className="flex h-24 w-24 flex-col items-center justify-center bg-[#1F2122] text-white hover:bg-[#3F59E4]"
                  >
                    <DollarSign size={24} />
                    <span>Add Tip</span>
                  </Button>
                  <Button className="flex h-24 w-24 flex-col items-center justify-center bg-[#1F2122] text-white hover:bg-[#3F59E4]">
                    <SplitSquareVertical size={24} />
                    <span>Refund</span>
                  </Button>
                  <Button className="flex h-24 w-24 flex-col items-center justify-center bg-[#1F2122] text-white hover:bg-[#3F59E4]">
                    <CreditCard size={24} />
                    <span>Uber Eats</span>
                  </Button>
                  <Button
                    onClick={handleCreateReaderPayment}
                    className="flex h-24 w-24 flex-col items-center justify-center bg-[#1F2122] text-white hover:bg-[#3F59E4]"
                  >
                    <DollarSign size={24} />
                    <span>Reader Payment</span>
                  </Button>
                  <Button
                    onClick={handleCreatePaymentLink}
                    className="flex h-24 w-24 flex-col items-center justify-center bg-[#1F2122] text-white hover:bg-[#3F59E4]"
                  >
                    <DollarSign size={24} />
                    <span>Generate Payment Link</span>
                  </Button>
                  <Button className="flex h-24 w-24 flex-col items-center justify-center bg-[#1F2122] text-white hover:bg-[#3F59E4]">
                    <SplitSquareVertical size={24} />
                    <span>Split Payment</span>
                  </Button>
                </div>
              </div>
            )}
            {isPaid && selectedPaymentMethod === 'paid' && (
              <div className="flex w-2/4 flex-col items-center">
                <div className="mb-6 mt-6 flex w-full justify-evenly bg-[#1F2122] px-16 py-8 text-3xl">
                  <h2 className="flex gap-4 font-bold">Change:</h2>
                  <p className="text-green-400">${change.toFixed(2)}</p>
                </div>
                <div className="flex w-full justify-around gap-2">
                  <Button className="flex h-16 w-full bg-[#1F2122] text-2xl text-white hover:bg-white hover:text-black">
                    Print Receipt
                  </Button>
                  <Button
                    onClick={handleFinishPaymentProcess}
                    className="flex h-16 w-full bg-[#1F2122] text-2xl text-white hover:bg-white hover:text-black"
                  >
                    Finish
                  </Button>
                </div>
              </div>
            )}
            {selectedPaymentMethod !== '' && (
              <Button
                onClick={() => handleBackClick(true)}
                className="absolute bottom-5 right-5 rounded-full border border-white bg-transparent px-10 text-white hover:bg-gray-700"
              >
                <span>Back</span>
              </Button>
            )}
            {selectedPaymentMethod === '' && (
              <Button
                onClick={() => {
                  resetStates();
                  onClose();
                }}
                className="absolute bottom-5 right-5 rounded-full border border-white bg-transparent px-10 text-black hover:bg-gray-700 hover:text-white"
              >
                <span>Back</span>
              </Button>
            )}
          </div>
        </div>
      </DialogContentInline>
    </Dialog>
  );
};
export default SignupPaymentModal;
