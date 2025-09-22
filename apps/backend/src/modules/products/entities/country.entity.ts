import { Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { AdministrativeDivision } from './administrative-division.entity';

@Entity('countries')
export class Country extends BaseEntity {
  @Expose()
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Expose()
  @Column({ type: 'text' })
  name: string;

  @Expose()
  @Column({ type: 'text' })
  code: string;

  @Expose()
  @Column({
    type: 'char',
    length: 2,
    nullable: true
  })
  iso2?: string;

  @Expose()
  @Column({
    type: 'char',
    length: 3,
    nullable: true
  })
  iso3?: string;

  @Expose()
  @Column({
    name: 'phone_code',
    type: 'text',
    nullable: true
  })
  phoneCode?: string;

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

  @OneToMany(() => AdministrativeDivision, (division) => division.country, { lazy: true })
  administrativeDivisions: Promise<AdministrativeDivision[]>;
}