import { MenuRepository } from '../../repositories/vendor/menuRepository.js';
export class MenuService {
    repository;
    constructor(repository = new MenuRepository()) {
        this.repository = repository;
    }
    async getMenu(firebaseUid) {
        return this.repository.listByVendor(firebaseUid);
    }
    async getPublicMenu(firebaseUid) {
        return this.repository.getPublicMenu(firebaseUid);
    }
    async uploadMenuItem(input) {
        return this.repository.createMenuItem(input);
    }
    async updateMenuItem(id, firebaseUid, input) {
        return this.repository.updateMenuItem(id, firebaseUid, input);
    }
    async deleteMenuItem(id, firebaseUid) {
        return this.repository.softDeleteMenuItem(id, firebaseUid);
    }
    async restoreMenuItem(id, firebaseUid) {
        return this.repository.restoreMenuItem(id, firebaseUid);
    }
}
