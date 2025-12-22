import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdministrativeDivision, AdministrativeDivisionType } from '../../modules/products/entities/administrative-division.entity';

@Injectable()
export class AdministrativeDivisionsSeeder {
  constructor(
    @InjectRepository(AdministrativeDivision)
    private readonly administrativeDivisionRepository: Repository<AdministrativeDivision>,
  ) {}

  async seed(): Promise<void> {
    // Load Vietnam administrative divisions data
    const fs = require('fs');
    const path = require('path');
    const dataPath = path.join(process.cwd(), '../../full_json_generated_data_vn_units.json');

    if (!fs.existsSync(dataPath)) {
      throw new Error(`Vietnam administrative divisions data file not found at ${dataPath}`);
    }

    const vietnamData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const vietnamCountryId = '239'; // Vietnam country ID from countries seeder

    let created = 0;
    let skipped = 0;

    // Process provinces first
    for (const province of vietnamData) {
      const provinceId = `VN-${province.Code}`;

      const existingProvince = await this.administrativeDivisionRepository.findOne({
        where: { id: provinceId }
      });

      if (!existingProvince) {
        const provinceData = {
          id: provinceId,
          countryId: vietnamCountryId,
          parentId: null,
          name: province.Name,
          code: province.Code,
          type: province.Type === 'province' ? AdministrativeDivisionType.PROVINCE : AdministrativeDivisionType.WARD,
          i18nKey: `administrative_division.${province.CodeName}`
        };

        const provinceDivision = this.administrativeDivisionRepository.create(provinceData);
        await this.administrativeDivisionRepository.save(provinceDivision);
        created++;
      } else {
        skipped++;
      }

      // Process wards under this province
      if (province.Wards && province.Wards.length > 0) {
        for (const ward of province.Wards) {
          const wardId = `VN-${ward.Code}`;

          const existingWard = await this.administrativeDivisionRepository.findOne({
            where: { id: wardId }
          });

          if (!existingWard) {
            const wardData = {
              id: wardId,
              countryId: vietnamCountryId,
              parentId: provinceId,
              name: ward.Name,
              code: ward.Code,
              type: ward.Type === 'province' ? AdministrativeDivisionType.PROVINCE : AdministrativeDivisionType.WARD,
              i18nKey: `administrative_division.${ward.CodeName}`
            };

            const wardDivision = this.administrativeDivisionRepository.create(wardData);
            await this.administrativeDivisionRepository.save(wardDivision);
            created++;
          } else {
            skipped++;
          }
        }

      }
    }
  }

  async seedIfEmpty(): Promise<void> {
    const existingCount = await this.administrativeDivisionRepository.count();

    if (existingCount === 0) {
      await this.seed();
    }
  }

  async reseed(): Promise<void> {
    await this.seed();
  }

  async clearAndReseed(): Promise<void> {
    try {
      await this.administrativeDivisionRepository.query('DELETE FROM administrative_divisions');
      await this.seed();
    } catch (error) {
      console.error('❌ Clear and reseed failed:', error);
      throw error;
    }
  }
}
