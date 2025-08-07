import React, { useEffect, useState, useMemo } from 'react';
import { useApi } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  TableBody,
  TableCell,
  TableForFixedHeader,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Trash2, Plus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
interface ModifierGroup {
  id?: number;
  name: string;
  description: string;
  selection_type: 'single' | 'multiple';
  sort_order?: number;
  modifiers?: GroupModifier[];
}
interface Modifier {
  id: number;
  name: string;
  price: number;
  has_description: boolean;
}
interface GroupModifier {
  product_add_on_id: number;
  has_description: boolean;
  name: string;
  price: number;
}
interface ModifierGroupsSectionProps {
  allModifiers: Modifier[];
  fetchModifierGroups?: () => Promise<void>;
  modifierGroups?: ModifierGroup[];
  setModifierGroups?: React.Dispatch<React.SetStateAction<ModifierGroup[]>>;
}
export default function ModifierGroupsSection({
  allModifiers,
  fetchModifierGroups,
  modifierGroups,
  setModifierGroups
}: ModifierGroupsSectionProps) {
  const {
    createOnlineGroupModifier,
    modifierGroupUpdate,
    updateOnlineGroupModifier,
    getModifierGroups,
    deleteOnlineGroupModifier
  } = useApi();
  const [groups, setGroups] = useState<ModifierGroup[]>([]);
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [isEditModifiersOpen, setIsEditModifiersOpen] = useState(false);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDescription, setEditGroupDescription] = useState('');
  const [modifierSearch, setModifierSearch] = useState('');
  const [editSelectionType, setEditSelectionType] = useState<
    'single' | 'multiple'
  >('single');
  const [selectedGroup, setSelectedGroup] = useState<ModifierGroup | null>(
    null
  );
  const [selectedModifiers, setSelectedModifiers] = useState<
    { id: number; has_description: boolean }[]
  >([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<ModifierGroup | null>(
    null
  );
  const [newGroup, setNewGroup] = useState<ModifierGroup>({
    name: '',
    description: '',
    selection_type: 'single',
    sort_order: 0
  });
  const fetchGroups = async () => {
    try {
      const response = await getModifierGroups();
      setGroups(response.data.groups);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch modifier groups',
        variant: 'destructive'
      });
    }
  };
  useEffect(() => {
    fetchGroups();
  }, []);
  const filteredModifiers = useMemo(() => {
    return allModifiers.filter(
      (modifier) =>
        modifier.name?.toLowerCase().includes(modifierSearch.toLowerCase())
    );
  }, [modifierSearch, allModifiers]);
  const handleCreateGroup = async () => {
    try {
      const response = await createOnlineGroupModifier(newGroup);
      toast({
        title: 'Success',
        description: 'Group created successfully',
        variant: 'success'
      });
      setIsAddGroupOpen(false);
      // Reset form
      setNewGroup({
        name: '',
        description: '',
        selection_type: 'single',
        sort_order: 0
      });
      // Fetch updated groups
      const groupsResponse = await getModifierGroups();
      setGroups(groupsResponse.data.groups);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create modifier group',
        variant: 'destructive'
      });
    }
    if (fetchModifierGroups) {
      fetchModifierGroups();
    }
  };
  const handleUpdateGroupModifiers = async () => {
    if (!selectedGroup) return;
    try {
      // 1. For group details like name and description
      const res = await modifierGroupUpdate({
        group_id: selectedGroup.id,
        name: editGroupName,
        description: editGroupDescription,
        selection_type: editSelectionType
        // sort_order: selectedGroup.sort_order ?? 0
      });
      // 2. For modifiers
      await updateOnlineGroupModifier({
        group_id: selectedGroup.id,
        modifiers: selectedModifiers
      });
      toast({
        title: 'Success',
        description: 'Modifiers updated successfully',
        variant: 'success'
      });
      const groupsResponse = await getModifierGroups();
      setGroups(groupsResponse.data.groups);
      setSelectedModifiers([]);
      setSelectedGroup(null);
      setIsEditModifiersOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update modifiers',
        variant: 'destructive'
      });
    }
    if (fetchModifierGroups) {
      fetchModifierGroups();
    }
  };
  const handleDeleteGroup = async () => {
    if (!groupToDelete?.id) return;
    try {
      await deleteOnlineGroupModifier({ group_id: groupToDelete.id });
      toast({
        title: 'Success',
        description: 'Group deleted successfully',
        variant: 'success'
      });
      const groupsResponse = await getModifierGroups();
      setGroups(groupsResponse.data.groups);
      setGroupToDelete(null);
      setIsDeleteDialogOpen(false);
      setModifierGroups?.(groupsResponse.data.groups);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete modifier group',
        variant: 'destructive'
      });
    }
  };
  const handleEditModifiers = (group: ModifierGroup) => {
    setSelectedGroup(group);
    setEditGroupName(group.name);
    setEditGroupDescription(group.description);
    setEditSelectionType(group.selection_type);
    const initialModifiers =
      group.modifiers?.map((modifier) => ({
        id: modifier.product_add_on_id,
        has_description: modifier.has_description
      })) || [];
    setSelectedModifiers(initialModifiers);
    setIsEditModifiersOpen(true);
  };
  return (
    <div className="">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Dialog open={isAddGroupOpen} onOpenChange={setIsAddGroupOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add New Group
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Modifier Group</DialogTitle>
              <DialogDescription>
                Create a new group of modifiers that can be applied to your
                products
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newGroup.name}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, name: e.target.value })
                  }
                  placeholder="Enter group name"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newGroup.description}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, description: e.target.value })
                  }
                  placeholder="Enter group description"
                  className="resize-none"
                  rows={3}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="selection_type">Selection Type</Label>
                <Select
                  value={newGroup.selection_type}
                  onValueChange={(value: 'single' | 'multiple') =>
                    setNewGroup({ ...newGroup, selection_type: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose selection type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Selection</SelectItem>
                    <SelectItem value="multiple">Multiple Selection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateGroup} className="w-full">
                Create Group
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="px-2 md:px-6">
        <div className="max-h-[70dvh] space-y-6 overflow-y-auto">
          {groups.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <h3 className="mb-2 text-lg font-medium text-muted-foreground">
                No modifier groups yet
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Create your first modifier group to start customizing your
                products
              </p>
              <Button onClick={() => setIsAddGroupOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Group
              </Button>
            </div>
          ) : (
            groups.map((group) => (
              <div
                key={group.id}
                className="rounded-lg  bg-secondary transition-shadow hover:shadow-md"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium">{group.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {group.description}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditModifiers(group)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setGroupToDelete(group);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center whitespace-nowrap rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {group.selection_type === 'single'
                        ? 'Single Selection'
                        : 'Multiple Selection'}
                    </span>
                    <span className="inline-flex items-center whitespace-nowrap rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      {group.modifiers?.length || 0} modifiers
                    </span>
                  </div>
                  {group.modifiers && group.modifiers.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <p className="mb-2 text-sm font-medium">
                        Current Modifiers
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {group.modifiers.map((modifier) => (
                          <span
                            key={modifier.product_add_on_id}
                            className="inline-flex items-center rounded-full bg-accent px-2.5 py-1 text-xs font-medium"
                          >
                            {modifier.name}
                            <span className="ml-1 text-muted-foreground">
                              ${modifier.price}
                            </span>
                            {modifier.has_description && (
                              <span className="ml-1 text-xs text-primary">
                                • With Description
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Dialog open={isEditModifiersOpen} onOpenChange={setIsEditModifiersOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Edit Modifiers for {selectedGroup?.name}</DialogTitle>
          </DialogHeader>
          <p className="tex-lg mt-4 font-bold">General Info</p>
          <div className="mb-8 space-y-2 px-4">
            <div className="flex gap-2">
              <div className="w-1/2 space-y-2">
                <Label htmlFor="edit-group-name">Group Name</Label>
                <Input
                  id="edit-group-name"
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
                  placeholder="Enter group name"
                />
              </div>
              <div className="w-1/2 space-y-2">
                <Label htmlFor="edit-selection-type">Selection Type</Label>
                <Select
                  value={editSelectionType}
                  onValueChange={(value: 'single' | 'multiple') =>
                    setEditSelectionType(value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose selection type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Selection</SelectItem>
                    <SelectItem value="multiple">Multiple Selection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-group-description">Description</Label>
              <Textarea
                id="edit-group-description"
                value={editGroupDescription}
                onChange={(e) => setEditGroupDescription(e.target.value)}
                placeholder="Enter description"
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
          <p className="tex-lg font-bold">Select Modifiers</p>
          <div className="">
            <div className="">
              <Label htmlFor="modifier-search">Search Modifiers</Label>
              <Input
                id="modifier-search"
                type="text"
                placeholder="Type to search..."
                value={modifierSearch}
                onChange={(e) => setModifierSearch(e.target.value)}
              />
            </div>
            <div className="max-h-[40vh] overflow-y-auto">
              <TableForFixedHeader className="mt-4 md:table-fixed">
                <TableHeader className="sticky top-0 z-10 bg-secondary">
                  <TableRow>
                    <TableHead className="w-1/12 px-4">Select</TableHead>
                    <TableHead className="w-4/12 px-4">Modifier Name</TableHead>
                    <TableHead className="w-2/12 px-4">Price</TableHead>
                    <TableHead className="w-5/12 px-4">
                      Allow Description
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredModifiers.map((modifier: any) => {
                    const selected = selectedModifiers.find(
                      (m) => m.id === modifier.id
                    );
                    return (
                      <TableRow key={modifier.id}>
                        {/* Select checkbox */}
                        <TableCell className="px-4">
                          <Checkbox
                            id={`modifier-${modifier.id}`}
                            checked={!!selected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedModifiers([
                                  ...selectedModifiers,
                                  { id: modifier.id, has_description: true }
                                ]);
                              } else {
                                setSelectedModifiers(
                                  selectedModifiers.filter(
                                    (m) => m.id !== modifier.id
                                  )
                                );
                              }
                            }}
                          />
                        </TableCell>
                        {/* Modifier Name */}
                        <TableCell className="px-4">{modifier.name}</TableCell>
                        {/* Price */}
                        <TableCell className="px-4">
                          ${modifier.price}
                        </TableCell>
                        {/* Allow Description */}
                        <TableCell className="px-4">
                          {selected && (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`description-${modifier.id}`}
                                checked={selected.has_description}
                                onCheckedChange={(checked) => {
                                  setSelectedModifiers(
                                    selectedModifiers.map((m) =>
                                      m.id === modifier.id
                                        ? { ...m, has_description: !!checked }
                                        : m
                                    )
                                  );
                                }}
                              />
                              <Label
                                htmlFor={`description-${modifier.id}`}
                                className="text-sm text-muted-foreground"
                              >
                                Allow customer description
                              </Label>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </TableForFixedHeader>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setIsEditModifiersOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateGroupModifiers}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Modifier Group</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              modifier group and remove it from all products.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete{' '}
              <span className="font-medium text-foreground">
                {groupToDelete?.name}
              </span>
              ?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteGroup}>
                Delete Group
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
