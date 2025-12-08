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
  id!: string;

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
  name!: string;

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
  type!: AdministrativeDivisionType;

  @Expose()
  @Column({
    name: 'i18n_key',
    type: 'text'
  })
  i18nKey!: string;

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

  @Expose()
  @ManyToOne(() => Country, (country) => country.administrativeDivisions, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: 'country_id' })
  country?: Country;

  @Expose()
  @ManyToOne(() => AdministrativeDivision, (division) => division.children, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: 'parent_id' })
  parent?: AdministrativeDivision;

  @Expose()
  @OneToMany(() => AdministrativeDivision, (division) => division.parent)
  children?: AdministrativeDivision[];
}
