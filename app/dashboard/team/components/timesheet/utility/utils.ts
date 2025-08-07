import moment from 'moment';
import { PayRate } from '../../common/types';

export const calculateTotalHoursAndCost = (
  start: string,
  stop: string,
  payRates: PayRate[]
) => {
  const startTime = moment(start);
  const stopTime = moment(stop);
  const durationInSeconds = stopTime.diff(startTime, 'seconds');
  const totalHours = durationInSeconds / 3600;

  const dayNumber = startTime.isoWeekday();

  const rateForDay =
    payRates.find((rate) => rate.day_number === dayNumber)?.rate || 0;

  const newTotalCost = totalHours * rateForDay;

  return {
    total_hours: durationInSeconds,
    newTotalCost
  };
};
