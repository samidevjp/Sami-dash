import { Button } from '@/components/ui/button';
import {
  TableBody,
  TableCell,
  TableForFixedHeader,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Pencil, Trash } from 'lucide-react';
export default function SuppliesTab({
  activeSubView,
  setActiveSubView,
  data,
  onAdd,
  setSelectedItem,
  removeItem
}: any) {
  const tabs = [
    { name: 'Categories', key: 'categories', dataKey: 'categories' },
    { name: 'Locations', key: 'locations', dataKey: 'locations' },
    { name: 'Suppliers', key: 'suppliers', dataKey: 'suppliers' },
    {
      name: 'Measurement Units',
      key: 'measurementUnits',
      dataKey: 'measurementUnits'
    },
    {
      name: 'Unit Descriptions',
      key: 'unitDescriptions',
      dataKey: 'unitDescriptions'
    },
    { name: 'Order Unit Description', key: 'orderUnit', dataKey: 'orderUnit' }
  ];

  const sortedData = tabs.reduce((acc: any, tab) => {
    acc[tab.dataKey] = data[tab.dataKey]?.sort((a: any, b: any) => {
      const nameA =
        a.item_category ||
        a.category ||
        a.location_name ||
        a.supplier_name ||
        a.unit_desc ||
        a.order_unit_desc;
      const nameB =
        b.item_category ||
        b.category ||
        b.location_name ||
        b.supplier_name ||
        b.unit_desc ||
        b.order_unit_desc;
      return nameA.localeCompare(nameB);
    });
    return acc;
  }, {});

  return (
    <>
      <div className="items-end justify-between gap-4 lg:flex">
        <div className="mb-4 grid w-auto max-w-[1000px] grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:mb-0 lg:grid-cols-6">
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              variant={activeSubView === tab.name ? 'default' : 'outline'}
              onClick={() => setActiveSubView(tab.name)}
              className="h-full flex-col rounded-lg p-2 text-xs"
            >
              <p className="mb-1 w-full text-left">{tab.name}</p>
              <p className="w-full text-right text-base">
                {data[tab.dataKey]?.length}
              </p>
            </Button>
          ))}
        </div>

        {activeSubView !== 'Measurement Units' &&
          sortedData[
            tabs.find((tab) => tab.name === activeSubView)?.dataKey || ''
          ]?.length > 0 && (
            <Button
              onClick={onAdd}
              className="h-full w-full rounded-lg px-4 py-2 sm:w-auto"
            >
              + Create {activeSubView.replace('_', ' ')}
            </Button>
          )}
      </div>
      <div className="w-full rounded-lg bg-secondary shadow">
        <div className="w-full overflow-hidden rounded-t-lg">
          {tabs.map(
            (tab) =>
              activeSubView === tab.name && (
                <>
                  {sortedData[tab.dataKey]?.length > 0 ? (
                    <div className="max-h-[500px] overflow-y-auto">
                      <TableForFixedHeader className="md:table-fixed">
                        <TableHeader className="sticky top-0 bg-secondary">
                          <TableRow>
                            <TableHead className="px-4">
                              {tab.name} Name
                            </TableHead>
                            {tab.dataKey === 'suppliers' && (
                              <TableHead className="px-4">
                                {tab.name} Stock Number
                              </TableHead>
                            )}
                            {tab.dataKey === 'measurementUnits' && (
                              <TableHead className="px-4">
                                Unit of measurement
                              </TableHead>
                            )}
                            {tab.dataKey !== 'measurementUnits' && (
                              <TableHead className="text-right">
                                Action
                              </TableHead>
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortedData[tab.dataKey]?.map((item: any) => (
                            <TableRow
                              className="hover:bg-hoverTable"
                              key={item.id}
                            >
                              <TableCell className="flex-grow px-4">
                                {item.item_category ||
                                  item.category ||
                                  item.location_name ||
                                  item.supplier_name ||
                                  item.unit_desc ||
                                  item.order_unit_desc}
                              </TableCell>
                              {tab.dataKey === 'suppliers' && (
                                <TableCell className="flex-grow-0 px-4">
                                  {item.supplier_stock_number}
                                </TableCell>
                              )}
                              {tab.dataKey === 'measurementUnits' && (
                                <TableCell className="flex-grow-0 px-4">
                                  {item.unit_of_measurement}
                                </TableCell>
                              )}
                              {tab.dataKey !== 'measurementUnits' && (
                                <TableCell className="flex-shrink-0">
                                  <div className="flex justify-end">
                                    <Button
                                      onClick={() => {
                                        onAdd();
                                        setSelectedItem(item);
                                      }}
                                      variant="ghost"
                                      className="p-2"
                                    >
                                      <Pencil size={20} />
                                    </Button>
                                    <Button
                                      onClick={() => {
                                        removeItem(item.id);
                                      }}
                                      variant="ghost"
                                      className="p-2"
                                    >
                                      <Trash size={20} />
                                    </Button>
                                  </div>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </TableForFixedHeader>
                    </div>
                  ) : (
                    <div className="flex h-96 flex-col items-center justify-center gap-4">
                      <div className="text-center">
                        <p>No {tab.name} found </p>
                      </div>
                      <Button
                        onClick={onAdd}
                        data-tutorial="create-product"
                        className="min-w-44 whitespace-nowrap rounded-lg px-4 py-2"
                      >
                        + Create {tab.name}
                      </Button>
                    </div>
                  )}
                </>
              )
          )}
        </div>
      </div>
    </>
  );
}
