export class PermissionChecker {
  private permissions: any;

  constructor(permissions: any) {
    this.permissions = permissions;
  }

  check(permission: number, category: string): boolean {
    if (!this.permissions || !this.permissions[category]) {
      return false;
    }
    return (this.permissions[category] & permission) === permission;
  }
}

export class DualPermissionChecker {
  private accountChecker: PermissionChecker;
  private employeeChecker: PermissionChecker;

  constructor(accountPermissions: any, employeePermissions: any) {
    this.accountChecker = new PermissionChecker(accountPermissions);
    this.employeeChecker = new PermissionChecker(employeePermissions);
  }

  check(
    permission: number,
    category: string
  ): { accountHasAccess: boolean; employeeHasAccess: boolean } {
    return {
      accountHasAccess: this.accountChecker.check(permission, category),
      employeeHasAccess: this.employeeChecker.check(permission, category)
    };
  }
}
