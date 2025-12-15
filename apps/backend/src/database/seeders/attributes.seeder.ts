import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attribute, AttributeType } from '../../modules/products/entities/attribute.entity';
import { AttributeValue } from '../../modules/products/entities/attribute-value.entity';

@Injectable()
export class AttributesSeeder {
  constructor(
    @InjectRepository(Attribute)
    private readonly attributeRepository: Repository<Attribute>,
    @InjectRepository(AttributeValue)
    private readonly attributeValueRepository: Repository<AttributeValue>,
  ) {}

  private readonly attributesData = [
    {
      name: 'Color',
      displayName: 'Color',
      code: 'color',
      type: AttributeType.SELECT,
      isRequired: false,
      isFilterable: true,
      sortOrder: 1,
      values: [
        { value: 'Red', displayValue: 'Red', sortOrder: 1 },
        { value: 'Blue', displayValue: 'Blue', sortOrder: 2 },
        { value: 'Green', displayValue: 'Green', sortOrder: 3 },
        { value: 'Black', displayValue: 'Black', sortOrder: 4 },
        { value: 'White', displayValue: 'White', sortOrder: 5 },
        { value: 'Yellow', displayValue: 'Yellow', sortOrder: 6 },
        { value: 'Purple', displayValue: 'Purple', sortOrder: 7 },
        { value: 'Orange', displayValue: 'Orange', sortOrder: 8 },
        { value: 'Pink', displayValue: 'Pink', sortOrder: 9 },
        { value: 'Gray', displayValue: 'Gray', sortOrder: 10 },
      ],
    },
    {
      name: 'Size',
      displayName: 'Size',
      code: 'size',
      type: AttributeType.SELECT,
      isRequired: false,
      isFilterable: true,
      sortOrder: 2,
      values: [
        { value: 'XS', displayValue: 'Extra Small', sortOrder: 1 },
        { value: 'S', displayValue: 'Small', sortOrder: 2 },
        { value: 'M', displayValue: 'Medium', sortOrder: 3 },
        { value: 'L', displayValue: 'Large', sortOrder: 4 },
        { value: 'XL', displayValue: 'Extra Large', sortOrder: 5 },
        { value: 'XXL', displayValue: '2XL', sortOrder: 6 },
        { value: '3XL', displayValue: '3XL', sortOrder: 7 },
      ],
    },
    {
      name: 'Material',
      displayName: 'Material',
      code: 'material',
      type: AttributeType.SELECT,
      isRequired: false,
      isFilterable: true,
      sortOrder: 3,
      values: [
        { value: 'Cotton', displayValue: 'Cotton', sortOrder: 1 },
        { value: 'Polyester', displayValue: 'Polyester', sortOrder: 2 },
        { value: 'Wool', displayValue: 'Wool', sortOrder: 3 },
        { value: 'Silk', displayValue: 'Silk', sortOrder: 4 },
        { value: 'Linen', displayValue: 'Linen', sortOrder: 5 },
        { value: 'Leather', displayValue: 'Leather', sortOrder: 6 },
        { value: 'Synthetic', displayValue: 'Synthetic', sortOrder: 7 },
        { value: 'Blend', displayValue: 'Blend', sortOrder: 8 },
      ],
    },
    {
      name: 'Style',
      displayName: 'Style',
      code: 'style',
      type: AttributeType.SELECT,
      isRequired: false,
      isFilterable: true,
      sortOrder: 4,
      values: [
        { value: 'Casual', displayValue: 'Casual', sortOrder: 1 },
        { value: 'Formal', displayValue: 'Formal', sortOrder: 2 },
        { value: 'Sport', displayValue: 'Sport', sortOrder: 3 },
        { value: 'Vintage', displayValue: 'Vintage', sortOrder: 4 },
        { value: 'Modern', displayValue: 'Modern', sortOrder: 5 },
        { value: 'Classic', displayValue: 'Classic', sortOrder: 6 },
      ],
    },
    {
      name: 'Pattern',
      displayName: 'Pattern',
      code: 'pattern',
      type: AttributeType.SELECT,
      isRequired: false,
      isFilterable: true,
      sortOrder: 5,
      values: [
        { value: 'Solid', displayValue: 'Solid', sortOrder: 1 },
        { value: 'Striped', displayValue: 'Striped', sortOrder: 2 },
        { value: 'Plaid', displayValue: 'Plaid', sortOrder: 3 },
        { value: 'Floral', displayValue: 'Floral', sortOrder: 4 },
        { value: 'Polka Dot', displayValue: 'Polka Dot', sortOrder: 5 },
        { value: 'Geometric', displayValue: 'Geometric', sortOrder: 6 },
      ],
    },
  ];

  async seed(): Promise<void> {
    console.log('Seeding attributes...');

    for (const attributeData of this.attributesData) {
      // Check if attribute already exists
      let attribute = await this.attributeRepository.findOne({
        where: { code: attributeData.code },
      });

      if (!attribute) {
        // Create new attribute
        attribute = this.attributeRepository.create({
          name: attributeData.name,
          displayName: attributeData.displayName,
          code: attributeData.code,
          type: attributeData.type,
          isRequired: attributeData.isRequired,
          isFilterable: attributeData.isFilterable,
          sortOrder: attributeData.sortOrder,
        });

        attribute = await this.attributeRepository.save(attribute);
        console.log(`Created attribute: ${attribute.name} (${attribute.code})`);
      } else {
        console.log(`Attribute already exists: ${attribute.name} (${attribute.code})`);
      }

      // Seed attribute values
      for (const valueData of attributeData.values) {
        const existingValue = await this.attributeValueRepository.findOne({
          where: {
            attributeId: attribute.id,
            value: valueData.value,
          },
        });

        if (!existingValue) {
          const attributeValue = this.attributeValueRepository.create({
            attributeId: attribute.id,
            value: valueData.value,
            displayValue: valueData.displayValue,
            sortOrder: valueData.sortOrder,
          });

          await this.attributeValueRepository.save(attributeValue);
          console.log(`Created attribute value: ${valueData.value} for ${attribute.name}`);
        }
      }
    }

    console.log('Attributes seeding completed.');
  }

  async clear(): Promise<void> {
    console.log('Clearing attributes...');

    // Delete all attribute values first
    await this.attributeValueRepository.delete({});

    // Delete all attributes
    await this.attributeRepository.delete({});

    console.log('Attributes cleared.');
  }
}