import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2, Plus } from 'lucide-react';
import FormLayout from './FormLayout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

type TeamMember = {
  first_name: string;
  last_name: string;
  email: string;
  mobile_no: string;
  role: string;
  quick_pin: string;
};

type TeamMemberFormProps = {
  teamMembers: TeamMember[];
  customRoles: string[];
  updateFields: (fields: {
    teamMembers: TeamMember[];
    customRoles: string[];
  }) => void;
};

export default function TeamMemberForm({
  teamMembers = [],
  customRoles = [],
  updateFields
}: TeamMemberFormProps) {
  const [error, setError] = useState<string>('');
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [newMember, setNewMember] = useState<TeamMember>({
    first_name: '',
    last_name: '',
    email: '',
    mobile_no: '',
    role: 'staff',
    quick_pin: ''
  });

  const resetNewMember = () => {
    setNewMember({
      first_name: '',
      last_name: '',
      email: '',
      mobile_no: '',
      role: 'staff',
      quick_pin: ''
    });
    setError('');
  };

  const handleAddRole = () => {
    if (!newRole.trim()) {
      return;
    }

    if (
      customRoles.includes(newRole.trim()) ||
      ['staff', 'manager'].includes(newRole.trim().toLowerCase())
    ) {
      setError('This role already exists');
      return;
    }

    updateFields({
      teamMembers,
      customRoles: [...customRoles, newRole.trim()]
    });
    setNewRole('');
    setIsAddRoleModalOpen(false);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = {
      first_name: 'First Name',
      last_name: 'Last Name',
      email: 'Email',
      quick_pin: 'Quick PIN'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!newMember[field as keyof typeof requiredFields]) {
        setError(`${label} is required`);
        return;
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newMember.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate quick pin
    if (!/^\d{4}$/.test(newMember.quick_pin)) {
      setError('Quick PIN must be exactly 4 digits');
      return;
    }

    // Check for duplicate pins
    const isDuplicatePin = teamMembers.some(
      (member) => member.quick_pin === newMember.quick_pin
    );
    if (isDuplicatePin) {
      setError('Quick PIN is already in use');
      return;
    }

    // Check for duplicate email
    const isDuplicateEmail = teamMembers.some(
      (member) => member.email.toLowerCase() === newMember.email.toLowerCase()
    );
    if (isDuplicateEmail) {
      setError('Email is already in use');
      return;
    }

    updateFields({
      teamMembers: [...teamMembers, newMember],
      customRoles
    });
    resetNewMember();
  };

  const removeTeamMember = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    const newTeamMembers = teamMembers.filter((_, i) => i !== index);
    updateFields({ teamMembers: newTeamMembers, customRoles });
  };

  const updateTeamMember = (
    index: number,
    field: keyof TeamMember,
    value: string
  ) => {
    const updatedMembers = teamMembers.map((member, i) => {
      if (i === index) {
        return { ...member, [field]: value };
      }
      return member;
    });
    updateFields({ teamMembers: updatedMembers, customRoles });
  };

  return (
    <>
      <FormLayout
        title="Team Members"
        description="Add your key staff members who will be using the system. (You can skip this step and add team members later)"
        fullWidth
      >
        <div className="mt-4 space-y-12 bg-white">
          <Card className="bg-white px-6 py-8">
            <h3 className="mb-12 text-xl font-semibold">Team Members</h3>
            <div className="space-y-4">
              <div className="mb-16 md:px-4">
                <p className="mb-8">
                  <span className="font-semibold">Add Team Members</span>
                </p>
                <div className="flex flex-col gap-4  rounded-lg px-4 font-medium md:flex-row">
                  <div className="col-span-2 grid grid-cols-2 gap-2">
                    <div className="">
                      <p className="mb-2 text-sm text-muted-foreground">
                        First Name
                      </p>
                      <Input
                        placeholder="First Name"
                        value={newMember.first_name}
                        onChange={(e) =>
                          setNewMember({
                            ...newMember,
                            first_name: e.target.value
                          })
                        }
                        className="placeholder:text-gray-400"
                      />
                    </div>
                    <div className="">
                      <p className="mb-2 text-sm text-muted-foreground">
                        Last Name
                      </p>
                      <Input
                        placeholder="Last Name"
                        value={newMember.last_name}
                        onChange={(e) =>
                          setNewMember({
                            ...newMember,
                            last_name: e.target.value
                          })
                        }
                        className="placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className="">
                      <p className="mb-2 text-sm text-muted-foreground">
                        Email
                      </p>
                      <Input
                        type="email"
                        placeholder="Email"
                        value={newMember.email}
                        onChange={(e) =>
                          setNewMember({ ...newMember, email: e.target.value })
                        }
                        className="placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                  <div className="">
                    <p className="mb-2 text-sm text-muted-foreground">Role</p>

                    <div className="flex gap-2">
                      <Select
                        value={newMember.role}
                        onValueChange={(value) =>
                          setNewMember({
                            ...newMember,
                            role: value
                          })
                        }
                      >
                        <SelectTrigger className="text-black">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          {customRoles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {/* <Button
                        variant="outline"
                        size="icon"
                        type="button"
                        onClick={() => setIsAddRoleModalOpen(true)}
                        className="shrink-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button> */}
                    </div>
                  </div>
                  <div className="">
                    <div className="mb-2 text-sm text-muted-foreground">
                      PIN
                      <span className="pl-2 text-xs text-gray-400">
                        *4-digit or longer
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder="PIN"
                        value={newMember.quick_pin}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/\D/g, '')
                            .slice(0, 4);
                          setNewMember({ ...newMember, quick_pin: value });
                        }}
                        maxLength={4}
                        className="placeholder:text-gray-400"
                      />
                      <Button
                        onClick={handleSave}
                        size="icon"
                        className="shrink-0"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
                {error && (
                  <div className="mt-8 rounded-lg px-4 text-sm text-danger">
                    * {error}
                  </div>
                )}
              </div>

              {/* Team Members List */}
              <div className="border-t pt-8 md:px-4">
                <p className="mb-8">
                  <span className="font-semibold">Team Members List</span>
                </p>
                <div className="px-4">
                  <div className="group mb-2 hidden grid-cols-1 gap-4 md:grid md:grid-cols-4">
                    <div className="text-sm text-muted-foreground">Name</div>
                    <div className="text-sm text-muted-foreground">Email</div>
                    <div className="text-sm text-muted-foreground">Role</div>
                    <div className="text-sm text-muted-foreground">PIN</div>
                  </div>
                  <div className="max-h-96 overflow-y-auto md:max-h-none">
                    {teamMembers.map((member, index) => (
                      <div
                        key={index}
                        className="group mb-4 grid  grid-cols-1 gap-4 rounded-lg bg-secondary p-8 md:mb-2 md:grid-cols-4 md:bg-white md:p-0 md:py-1"
                      >
                        <div className="col-span-1 grid grid-cols-2 gap-2">
                          <Input
                            value={member.first_name}
                            onChange={(e) =>
                              updateTeamMember(
                                index,
                                'first_name',
                                e.target.value
                              )
                            }
                            className="bg-white"
                          />
                          <Input
                            value={member.last_name}
                            onChange={(e) =>
                              updateTeamMember(
                                index,
                                'last_name',
                                e.target.value
                              )
                            }
                            className="bg-white"
                          />
                        </div>

                        <div className="">
                          <Input
                            type="email"
                            value={member.email}
                            onChange={(e) =>
                              updateTeamMember(index, 'email', e.target.value)
                            }
                            className="bg-white"
                          />
                        </div>

                        <div>
                          <Select
                            value={member.role}
                            onValueChange={(value) =>
                              updateTeamMember(index, 'role', value)
                            }
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="staff">Staff</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              {customRoles.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex gap-2">
                          <Input
                            value={member.quick_pin}
                            onChange={(e) => {
                              const value = e.target.value
                                .replace(/\D/g, '')
                                .slice(0, 4);
                              updateTeamMember(index, 'quick_pin', value);
                            }}
                            maxLength={4}
                            className="bg-white"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => removeTeamMember(e, index)}
                            className="shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </FormLayout>

      {/* Add Role Modal */}
      {/* <Dialog open={isAddRoleModalOpen} onOpenChange={setIsAddRoleModalOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Role Name</Label>
              <Input
                placeholder="Enter role name"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="text-black"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddRoleModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddRole}>Add Role</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog> */}
    </>
  );
}
