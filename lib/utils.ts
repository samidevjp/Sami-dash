import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Active, DataRef, Over } from '@dnd-kit/core';
import { ColumnDragData } from '@/components/kanban/board-column';
import { TaskDragData } from '@/components/kanban/task-card';
import Stripe from 'stripe';
import axios from 'axios';
import { DateTime } from 'luxon';

export const stripe = new Stripe(process.env.NEXT_STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20'
});

type DraggableData = ColumnDragData | TaskDragData;

export function isSimilarName(productName: any, ingredientName: any) {
  return (
    ingredientName.toLowerCase().includes(productName.toLowerCase()) ||
    productName.toLowerCase().includes(ingredientName.toLowerCase())
  );
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hasDraggableData<T extends Active | Over>(
  entry: T | null | undefined
): entry is T & {
  data: DataRef<DraggableData>;
} {
  if (!entry) {
    return false;
  }

  const data = entry.data.current;

  if (data?.type === 'Column' || data?.type === 'Task') {
    return true;
  }

  return false;
}

export function formatDate(date: any) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function formatDateShort(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function getSum(items: any) {
  if (!items) return 0;
  let sum = 0;
  items?.forEach((product: any) => {
    product?.addOns?.forEach((addOn: any) => {
      sum += addOn?.price * addOn?.quantity;
    });

    // Check if product is weight-based (price_type: 2)
    if (product?.price_type === 2) {
      // Calculate price based on weight ratio
      sum += (product?.total_weight / product?.based_weight) * product?.price;
    } else {
      // Regular product: price * quantity
      sum += product?.price * product?.quantity;
    }
  });

  return Number(sum.toFixed(2));
}

export function formatTime(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  return `${hours}:${minutes}`;
}

export const brevoApi = axios.create({
  baseURL: 'https://api.brevo.com/v3',
  headers: {
    'api-key': process.env.NEXT_PUBLIC_BREVO_API_KEY
  }
});

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('au', {
    style: 'currency',
    currency: 'aud'
  }).format(amount / 100);
};

export const resizeImage = async (
  file: File,
  maxSizeMB: number,
  maxWidth: number
): Promise<File> => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      let quality = 0.7;
      const step = 0.05;
      const minQuality = 0.1;

      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height *= maxWidth / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx!.drawImage(img, 0, 0, width, height);

      const compress = () => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              if (resizedFile.size <= maxSizeBytes || quality <= minQuality) {
                resolve(resizedFile);
              } else {
                quality -= step;
                compress();
              }
            } else {
              reject(new Error('Canvas to Blob conversion failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      compress();
    };
    img.onerror = (error) => reject(error);
  });
};

export const resizeImageTo512KB = async (file: File): Promise<File> => {
  const MAX_SIZE_BYTES = 512 * 1024;
  const MAX_WIDTH = 512;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const size = Math.min(img.width, img.height); // 正方形にする最小辺
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;

      canvas.width = MAX_WIDTH;
      canvas.height = MAX_WIDTH;

      ctx?.drawImage(img, sx, sy, size, size, 0, 0, MAX_WIDTH, MAX_WIDTH);

      let quality = 0.8;
      const step = 0.05;
      const minQuality = 0.1;

      const compress = () => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              if (resizedFile.size <= MAX_SIZE_BYTES || quality <= minQuality) {
                resolve(resizedFile);
              } else {
                quality -= step;
                compress();
              }
            } else {
              reject(new Error('Canvas to Blob conversion failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      compress();
    };

    img.onerror = (err) => reject(err);
  });
};

export const getBumpDocketCardColor = (timestamp: string, status: string) => {
  if (status === 'sent' || status === 'inactive') {
    return 'bg-green-200 border-green-200';
  }
  const orderTime = DateTime.fromFormat(timestamp, 'yyyy-MM-dd HH:mm:ss');
  const now = DateTime.local();
  const elapsedMinutes = now.diff(orderTime, 'minutes').minutes || 0;

  if (elapsedMinutes > 15) {
    return 'bg-red-500 text-white border-red-500';
  } else if (elapsedMinutes > 10) {
    return 'bg-orange-100 border-orange-500';
  } else {
    return 'bg-primary text-white border-primary-500';
  }
};

export const getElapsedTimeOnBump = (timestamp: string) => {
  const orderTime = DateTime.fromFormat(timestamp, 'yyyy-MM-dd HH:mm:ss');
  const now = DateTime.local();
  const diff = now.diff(orderTime, ['minutes', 'seconds']).toObject();
  const minutes = Math.floor(diff.minutes || 0);
  const seconds = Math.floor(diff.seconds || 0);
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
};

export const responseOK = (response: any) => {
  return response?.code === 'OK';
};

export const formatNumberWithCommas = (value: number | string) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return Number(numValue).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};
