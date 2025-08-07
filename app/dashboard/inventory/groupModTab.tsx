import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';

import {
  TableBody,
  TableCell,
  TableForFixedHeader,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash, RefreshCcw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function GroupModTab({
  title,
  data,
  onAdd,
  setSelectedItem,
  removeItem,
  handleSave
}: any) {
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [selectedGroupMod, setSelectedGroupMod] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const sortedData = data.sort((a: any, b: any) =>
    a.name.localeCompare(b.name)
  );

  const closeModal = () => {
    setSelectedGroupMod(null);
    setIsRemoveModalOpen(false);
  };

  const handleActivate = async (groupMod: any, newStatus: boolean) => {
    const updatedStatus = newStatus ? 1 : 0; // true = Active (1), false = Inactive (0)
    try {
      await handleSave({ ...groupMod, status: updatedStatus });
      toast({
        title: 'Success',
        description: `Group Modifier ${groupMod.name} is now ${
          updatedStatus === 1 ? 'Active' : 'Inactive'
        }.`,
        duration: 3000,
        variant: 'success'
      });
    } catch (err) {
      console.error('Error updating status:', err);
      toast({
        title: 'Error',
        description: 'Failed to update status.',
        duration: 5000,
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      <div className="items-center justify-between gap-4 md:flex">
        <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:mb-0">
          {['All', 'Active', 'Inactive'].map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? 'default' : 'outline'}
              onClick={() => setActiveFilter(filter)}
              className="flex h-full min-w-28 flex-col rounded-lg p-2 text-xs"
            >
              <p className="w-full text-left">{filter}</p>
              <p className="w-full text-right text-base">
                {filter === 'All'
                  ? data.length
                  : filter === 'Active'
                  ? data.filter((group_mod: any) => group_mod.status === 1)
                      .length
                  : data.filter((group_mod: any) => group_mod.status !== 1)
                      .length}
              </p>
            </Button>
          ))}
        </div>
        <div className="items-center gap-4 md:flex">
          <Input
            placeholder="Search Group Mods"
            onChange={(e) => setActiveFilter(e.target.value)}
            className="w-full flex-1 rounded-lg px-4 py-2"
          />
          {sortedData.length > 0 && (
            <Button
              onClick={onAdd}
              className="mt-2 w-full rounded-lg px-4 py-2 md:mt-0 md:w-auto"
            >
              + Create GroupMod
            </Button>
          )}
        </div>
      </div>
      <div className="w-full rounded-lg bg-secondary shadow">
        <div className="w-full overflow-hidden rounded-t-lg">
          {sortedData.length > 0 ? (
            <div className="max-h-[500px] overflow-y-auto">
              <TableForFixedHeader className="md:table-fixed">
                <TableHeader className="sticky top-0 bg-secondary">
                  <TableRow>
                    <TableHead>Group Name</TableHead>
                    <TableHead>AddOns Count</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        Status
                        <RefreshCcw size={16} />
                      </div>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData
                    .filter((group_mod: any) =>
                      activeFilter === 'All'
                        ? group_mod
                        : activeFilter === 'Active'
                        ? group_mod.status === 1
                        : group_mod.status !== 1
                    )
                    .map((group_mod: any) => (
                      <TableRow
                        className="hover:bg-hoverTable"
                        key={group_mod.id}
                      >
                        <TableCell className=" px-4">
                          {group_mod.name}
                        </TableCell>
                        <TableCell className="px-4">
                          {group_mod.add_ons_count || 0}
                        </TableCell>
                        <TableCell className="px-4">
                          <div className="flex items-center gap-2 ">
                            <Badge
                              variant="secondary"
                              className={`cursor-pointer rounded-full px-2 py-1 hover:opacity-80 ${
                                group_mod.status === 1
                                  ? 'border-green-500 bg-transparent text-green-500'
                                  : 'border-gray text-gray'
                              }`}
                              onClick={() =>
                                handleActivate(
                                  group_mod,
                                  group_mod.status !== 1
                                )
                              }
                            >
                              {group_mod.status === 1 ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => {
                              onAdd();
                              setSelectedItem(group_mod);
                            }}
                            variant="ghost"
                            className="p-2"
                          >
                            <Pencil size={20} />
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedGroupMod(group_mod);
                              setIsRemoveModalOpen(true);
                            }}
                            variant="ghost"
                            className="p-2"
                          >
                            <Trash size={20} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </TableForFixedHeader>
            </div>
          ) : (
            <div className="flex h-96 flex-col items-center justify-center gap-4">
              <div className="text-center">
                <p>No {title} found </p>
              </div>
              <Button
                onClick={onAdd}
                data-tutorial="create-product"
                className="w-44 rounded-lg px-4 py-2"
              >
                + Create Group Mod
              </Button>
            </div>
          )}
        </div>
      </div>
      <Modal
        title="Remove Group Modifier"
        description={`Remove ${selectedGroupMod?.name}`}
        isOpen={isRemoveModalOpen}
        onClose={closeModal}
      >
        <div className="flex flex-col gap-4">
          <p className="mb-2">
            Are you sure you want to remove this Group Modifier{' '}
            <span className="font-bold">{selectedGroupMod?.name}</span>?
          </p>
          <div className="flex justify-end gap-4">
            <Button onClick={closeModal} variant="secondary">
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedGroupMod?.id) {
                  removeItem(selectedGroupMod.id);
                  closeModal();
                }
              }}
              variant="danger"
            >
              Remove
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
