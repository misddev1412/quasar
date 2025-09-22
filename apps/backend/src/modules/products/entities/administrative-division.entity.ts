import { Entity, Column, ManyToOne, OneToMany, PrimaryColumn, JoinColumn } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { Country } from './country.entity';

export enum AdministrativeDivisionType {
  PROVINCE = 'PROVINCE',
  WARD = 'WARD'
}

@Entity('administrative_divisions')
export class AdministrativeDivision extends BaseEntity {
  @Expose()
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Expose()
  @Column({
    name: 'country_id',
    type: 'varchar',
    nullable: true
  })
  countryId?: string;

  @Expose()
  @Column({
    name: 'parent_id',
    type: 'varchar',
    nullable: true
  })
  parentId?: string;

  @Expose()
  @Column({ type: 'text' })
  name: string;

  @Expose()
  @Column({
    type: 'text',
    nullable: true
  })
  code?: string;

  @Expose()
  @Column({
    type: 'enum',
    enum: AdministrativeDivisionType
  })
  type: AdministrativeDivisionType;

  @Expose()
  @Column({
    name: 'i18n_key',
    type: 'text'
  })
  i18nKey: string;

  @Expose()
  @Column({
    type: 'numeric',
    nullable: true
  })
  latitude?: number;

  @Expose()
  @Column({
    type: 'numeric',
    nullable: true
  })
  longitude?: number;

  @ManyToOne(() => Country, (country) => country.administrativeDivisions, { lazy: true })
  @JoinColumn({ name: 'country_id' })
  country: Promise<Country>;

  @ManyToOne(() => AdministrativeDivision, (division) => division.children, { lazy: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Promise<AdministrativeDivision>;

  @OneToMany(() => AdministrativeDivision, (division) => division.parent, { lazy: true })
  children: Promise<AdministrativeDivision[]>;
}