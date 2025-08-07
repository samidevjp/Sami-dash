import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from 'recharts';

interface OrdersData {
  dine_in: number;
  phone_orders: number;
  takeaway_orders: number;
  reservations: number;
  total_orders: number;
}

const COLORS = ['#6699CC', '#66B2A3', '#FFCC80', '#FF9E80'];
const chartLabels = [
  { key: 'dine_in', name: 'Dine In' },
  { key: 'phone_orders', name: 'Phone Orders' },
  { key: 'takeaway_orders', name: 'Takeaway Orders' },
  { key: 'reservations', name: 'Reservations' }
];

export function OrderTypesChart({ data }: { data: OrdersData }) {
  const chartData = chartLabels.map((label) => ({
    name: label.name,
    value: data[label.key as keyof OrdersData] || 0
  }));

  const filteredChartData = chartData.filter((item) => item.value > 0);
  const hasData = filteredChartData.length > 0;

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300}>
        {!hasData ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No order data available for this period
          </div>
        ) : (
          <PieChart className="text-xs">
            <Pie
              data={filteredChartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
            >
              {filteredChartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `$${Number(value).toFixed(2)}`}
              contentStyle={{
                padding: '2px 6px',
                lineHeight: '1.5',
                borderRadius: '4px',
                backgroundColor: '#ffffff',
                color: '#000000'
              }}
            />
          </PieChart>
        )}
      </ResponsiveContainer>
      {hasData && (
        <div className="mb-4 flex flex-wrap gap-4">
          {chartData.map((item, index) => (
            <div key={item.name} className="flex items-center gap-2 text-sm">
              <div
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
