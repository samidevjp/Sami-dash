import { useState, useEffect } from 'react';
import { groupBy } from 'lodash';

interface PrinterConfig {
  printerName: string;
  printerType: string;
  printerIp: string;
  printerCategories: { id: string; name: string }[];
  doublePrint: boolean;
}

export const usePrinterSettings = () => {
  const [printerConfigs, setPrinterConfigs] = useState<PrinterConfig[]>([]);
  const [serverIP, setServerIP] = useState('');

  useEffect(() => {
    loadPrinterSettings();
  }, []);

  const savePrinterSettings = (
    newPrinter: PrinterConfig,
    updatedConfigs?: PrinterConfig[]
  ) => {
    if (updatedConfigs) {
      setPrinterConfigs(updatedConfigs);
      localStorage.setItem('printerSettings', JSON.stringify(updatedConfigs));
    } else {
      const updatedConfigs = [...printerConfigs, newPrinter];
      setPrinterConfigs(updatedConfigs);
      localStorage.setItem('printerSettings', JSON.stringify(updatedConfigs));
      // console.log('printerSettings', updatedConfigs);
    }
  };

  const loadPrinterSettings = () => {
    const savedSettings = localStorage.getItem('printerSettings');
    const savedServerIP = localStorage.getItem('serverIP');
    if (savedSettings) {
      setPrinterConfigs(JSON.parse(savedSettings));
    }
    if (savedServerIP) {
      setServerIP(savedServerIP);
    }
  };

  const deletePrinterSettings = (printerIp: string) => {
    setPrinterConfigs((prevConfigs) => {
      const updatedConfigs = prevConfigs.filter(
        (config) => config.printerIp !== printerIp
      );
      localStorage.setItem('printerSettings', JSON.stringify(updatedConfigs));
      return updatedConfigs;
    });
  };

  const printOrderByCategory = async (orderData: any) => {
    const printerConfigs = JSON.parse(
      localStorage.getItem('printerSettings') || '[]'
    );
    const serverIP = localStorage.getItem('serverIP');

    if (!serverIP) {
      throw new Error('Server IP not set');
    }

    if (printerConfigs.length === 0) {
      throw new Error('No printers configured');
    }

    const printJobs: { [key: string]: any[] } = {};

    // Group items by printer
    orderData.items.forEach((item: any) => {
      const printer = printerConfigs.find(
        (config: PrinterConfig) =>
          config.printerCategories.some((cat) => cat.id === item.category_id) &&
          (config.printerType === 'order' ||
            config.printerType === 'orderAndBill')
      );

      if (printer) {
        if (!printJobs[printer.printerIp]) {
          printJobs[printer.printerIp] = [];
        }
        printJobs[printer.printerIp].push(item);
      } else {
        console.log('No printer found for item:', item);
      }
    });
    // console.log(printJobs);

    // Find receipt printer
    const receiptPrinter = printerConfigs.find(
      (config: PrinterConfig) =>
        config.printerType === 'bill' || config.printerType === 'orderAndBill'
    );

    const printResults = [];
    let anyWindowOpened = false;

    // Print orders for each printer
    for (const [printerIp, items] of Object.entries(printJobs)) {
      try {
        const windowOpened = await sendPrintJob(serverIP, printerIp, {
          orderId: orderData.orderId,
          items: items,
          customer: orderData.customer
            ? orderData.customer
            : { name: 'Guest', phone: '000' },
          total: orderData.total,
          employeeName: orderData.employeeName,
          type: 'order'
        });
        anyWindowOpened = anyWindowOpened || windowOpened;
        printResults.push({
          success: windowOpened,
          message: windowOpened
            ? `Print window opened for ${printerIp}`
            : `Failed to open print window for ${printerIp}`
        });
      } catch (error) {
        console.error(
          `Error printing on ${printerIp}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
        printResults.push({
          success: false,
          message: `Error printing on ${printerIp}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        });
      }
    }

    // Print receipt if a receipt printer is configured
    if (orderData.isReceipt && receiptPrinter) {
      try {
        await sendPrintJob(serverIP, receiptPrinter.printerIp, {
          orderId: orderData.orderId,
          items: orderData.items,
          total: orderData.total,
          customer: orderData.customer
            ? orderData.customer
            : { name: 'Guest', phone: '000' },
          employeeName: orderData.employeeName,
          type: 'receipt'
        });
        printResults.push({ success: true, message: 'Receipt printed' });
      } catch (error) {
        printResults.push({
          success: false,
          message: `Failed to print receipt: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        });
      }
    }

    // Determine overall success and compile messages
    const messages = printResults.map((result) => result.message).join('; ');

    return {
      success: anyWindowOpened,
      message: messages,
      anyWindowOpened: anyWindowOpened
    };
  };

  const sendPrintJob = async (
    serverIP: string,
    printerIP: string,
    orderDetails: any
  ) => {
    const encodedJobData = encodeURIComponent(JSON.stringify(orderDetails));
    const printUrl = `http://${serverIP}:3001/print?printerIP=${printerIP}&orderDetails=${encodedJobData}`;

    return new Promise<boolean>((resolve) => {
      const windowFeatures = 'left=100,top=100,width=320,height=320';
      const printWindow = window.open(printUrl, '_blank', windowFeatures);

      if (printWindow === null) {
        console.warn(
          `Print window blocked for ${printerIP}. Attempting fallback...`
        );
        // Fallback: Try to open the URL in the same window
        window.location.href = printUrl;
        // Assume success if we've reached this point
        resolve(true);
      } else {
        printWindow.focus();
        // console.log(`Print job sent to ${printerIP}`);
        resolve(true);
      }

      // Set a timeout to close the window after 5 seconds
      setTimeout(() => {
        if (printWindow && !printWindow.closed) {
          printWindow.close();
        }
      }, 5000);
    });
  };

  const getPrinterUrls = (
    serverIP: string,
    items: any[],
    orderDetails: any
  ) => {
    const printerConfigs = JSON.parse(
      localStorage.getItem('printerSettings') || '[]'
    );

    // Group items by their category
    const itemsByCategory = groupBy(items, 'category_id');

    const urls: string[] = [];

    // Find printers for each category and create URLs
    Object.entries(itemsByCategory).forEach(([categoryId, categoryItems]) => {
      const printer = printerConfigs.find(
        (config: PrinterConfig) =>
          config.printerCategories.some((cat) => cat.id === categoryId) &&
          (config.printerType === 'order' ||
            config.printerType === 'orderAndBill')
      );

      if (printer) {
        const encodedJobData = encodeURIComponent(
          JSON.stringify({
            ...orderDetails,
            items: categoryItems
          })
        );
        const url = `http://${serverIP}:3001/print?printerIP=${printer.printerIp}&orderDetails=${encodedJobData}`;
        urls.push(url);
      }
    });

    // Add receipt printer URL if configured
    const receiptPrinter = printerConfigs.find(
      (config: PrinterConfig) =>
        config.printerType === 'bill' || config.printerType === 'orderAndBill'
    );

    if (receiptPrinter) {
      const encodedJobData = encodeURIComponent(JSON.stringify(orderDetails));
      const receiptUrl = `http://${serverIP}:3001/print?printerIP=${receiptPrinter.printerIp}&orderDetails=${encodedJobData}`;
      urls.push(receiptUrl);
    }
    // console.log(urls);
    return urls;
  };

  const printReceipt = async (
    serverIP: string,
    printerIP: string,
    transactionDetails: any
  ) => {
    const encodedJobData = encodeURIComponent(
      JSON.stringify(transactionDetails)
    );
    const printUrl = `http://${serverIP}:3001/print-receipt?printerIP=${printerIP}&orderDetails=${encodedJobData}`;

    return new Promise<boolean>((resolve) => {
      const windowFeatures = 'left=100,top=100,width=320,height=320';
      const printWindow = window.open(printUrl, '_blank', windowFeatures);

      if (printWindow === null) {
        console.warn(
          `Print window blocked for ${printerIP}. Attempting fallback...`
        );
        window.location.href = printUrl;
        resolve(true);
      } else {
        printWindow.focus();
        resolve(true);
      }

      setTimeout(() => {
        if (printWindow && !printWindow.closed) {
          printWindow.close();
        }
      }, 5000);
    });
  };

  return {
    printerConfigs,
    serverIP,
    setServerIP,
    setPrinterConfigs,
    savePrinterSettings,
    loadPrinterSettings,
    deletePrinterSettings,
    printOrderByCategory,
    getPrinterUrls,
    printReceipt
  };
};
