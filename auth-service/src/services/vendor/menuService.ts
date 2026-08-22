import { MenuRepository } from '../../repositories/vendor/menuRepository.js';
import { CreateMenuItemInput, UpdateMenuItemInput, VendorMenuItem } from '../../models/menuModels.js';

export class MenuService {
  constructor(private readonly repository = new MenuRepository()) {}

  async getMenu(firebaseUid: string): Promise<VendorMenuItem[]> {
    return this.repository.listByVendor(firebaseUid);
  }

  async getPublicMenu(firebaseUid: string): Promise<VendorMenuItem[]> {
    return this.repository.getPublicMenu(firebaseUid);
  }

  async uploadMenuItem(input: CreateMenuItemInput): Promise<VendorMenuItem> {
    return this.repository.createMenuItem(input);
  }

  async updateMenuItem(id: string, firebaseUid: string, input: UpdateMenuItemInput): Promise<void> {
    return this.repository.updateMenuItem(id, firebaseUid, input);
  }

  async deleteMenuItem(id: string, firebaseUid: string): Promise<void> {
    return this.repository.softDeleteMenuItem(id, firebaseUid);
  }

  async restoreMenuItem(id: string, firebaseUid: string): Promise<void> {
    return this.repository.restoreMenuItem(id, firebaseUid);
  }
}
