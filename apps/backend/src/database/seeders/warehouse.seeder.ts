import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from '../../modules/products/entities/warehouse.entity';

@Injectable()
export class WarehouseSeeder {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
  ) {}

  private readonly warehousesData = [
    {
      id: 'wh-default-main',
      name: 'Main Warehouse',
      code: 'MAIN',
      description: 'Primary warehouse for all operations',
      address: '123 Storage Street',
      city: 'Ho Chi Minh City',
      country: 'Vietnam',
      postalCode: '700000',
      phone: '+84-28-1234-5678',
      email: 'main@warehouse.com',
      managerName: 'John Smith',
      isActive: true,
      isDefault: true,
      sortOrder: 1,
    },
    {
      id: 'wh-secondary-hanoi',
      name: 'Hanoi Branch',
      code: 'HAN',
      description: 'Northern region distribution center',
      address: '456 Logistics Avenue',
      city: 'Hanoi',
      country: 'Vietnam',
      postalCode: '100000',
      phone: '+84-24-9876-5432',
      email: 'hanoi@warehouse.com',
      managerName: 'Jane Doe',
      isActive: true,
      isDefault: false,
      sortOrder: 2,
    },
    {
      id: 'wh-da-nang',
      name: 'Da Nang Distribution',
      code: 'DNG',
      description: 'Central region distribution center',
      address: '789 Harbor Road',
      city: 'Da Nang',
      country: 'Vietnam',
      postalCode: '550000',
      phone: '+84-236-5555-1234',
      email: 'danang@warehouse.com',
      managerName: 'Robert Johnson',
      isActive: true,
      isDefault: false,
      sortOrder: 3,
    },
    {
      id: 'wh-international',
      name: 'International Hub',
      code: 'INTL',
      description: 'International shipping and customs processing',
      address: '321 Global Way',
      city: 'Singapore',
      country: 'Singapore',
      postalCode: '123456',
      phone: '+65-6666-7777',
      email: 'intl@warehouse.com',
      managerName: 'Maria Garcia',
      isActive: true,
      isDefault: false,
      sortOrder: 4,
    },
    {
      id: 'wh-backup',
      name: 'Backup Storage',
      code: 'BAK',
      description: 'Backup and overflow storage facility',
      address: '555 Reserve Lane',
      city: 'Binh Duong',
      country: 'Vietnam',
      postalCode: '820000',
      phone: '+84-274-8888-9999',
      email: 'backup@warehouse.com',
      managerName: 'David Chen',
      isActive: false,
      isDefault: false,
      sortOrder: 5,
    },
  ];

  async seed(): Promise<void> {
    console.log('🏭 Starting warehouses seeding...');

    let created = 0;
    let skipped = 0;

    for (const warehouseData of this.warehousesData) {
      const existingWarehouse = await this.warehouseRepository.findOne({
        where: { id: warehouseData.id }
      });

      if (!existingWarehouse) {
        const warehouse = this.warehouseRepository.create(warehouseData);
        await this.warehouseRepository.save(warehouse);
        created++;
        console.log(`   ✅ Created warehouse: ${warehouseData.name} (${warehouseData.code})`);
      } else {
        skipped++;
        console.log(`   ⏭️  Skipped existing warehouse: ${warehouseData.name} (${warehouseData.code})`);
      }
    }

    console.log('✅ Warehouses seeding completed!');
    console.log(`📊 Results: ${created} created, ${skipped} skipped, ${this.warehousesData.length} total`);
  }

  async seedIfEmpty(): Promise<void> {
    console.log('🔍 Checking if warehouses seeding is needed...');

    const existingCount = await this.warehouseRepository.count();

    if (existingCount === 0) {
      console.log(`📋 Found ${existingCount} warehouses. Running seeder...`);
      await this.seed();
    } else {
      console.log(`ℹ️  Found ${existingCount} warehouses. Skipping seeder.`);
    }
  }

  async reseed(): Promise<void> {
    console.log('🔄 Reseeding warehouses (this may create duplicates if data already exists)...');
    await this.seed();
  }

  async clearAndReseed(): Promise<void> {
    console.log('🗑️  Clearing existing warehouses...');

    try {
      await this.warehouseRepository.query('DELETE FROM warehouses');
      console.log('✅ Cleared existing warehouses. Running fresh seed...');
      await this.seed();
    } catch (error) {
      console.error('❌ Clear and reseed failed:', error);
      throw error;
    }
  }

  async seedDefaultWarehouse(): Promise<void> {
    console.log('🏭 Seeding default warehouse...');

    const defaultWarehouseData = this.warehousesData.find(w => w.isDefault);

    if (!defaultWarehouseData) {
      console.log('❌ No default warehouse data found');
      return;
    }

    const existingDefault = await this.warehouseRepository.findOne({
      where: { isDefault: true }
    });

    if (!existingDefault) {
      const warehouse = this.warehouseRepository.create(defaultWarehouseData);
      await this.warehouseRepository.save(warehouse);
      console.log(`   ✅ Created default warehouse: ${defaultWarehouseData.name} (${defaultWarehouseData.code})`);
    } else {
      console.log(`   ⏭️  Default warehouse already exists: ${existingDefault.name} (${existingDefault.code})`);
    }

    console.log('✅ Default warehouse seeding completed!');
  }
}