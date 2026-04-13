import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Routing } from 'src/routing/model/routing.model';

@Table({
  tableName: 'pricelists',
  timestamps: false,
})
export class Pricelist extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column(DataType.STRING(30))
  declare name: string;

  @Column(DataType.STRING(50))
  declare markup: string;

  @Column(DataType.TINYINT)
  declare routing_type: number;

  @Column(DataType.INTEGER)
  declare initially_increment: number;

  @Column(DataType.INTEGER)
  declare inc: number;

  @Column(DataType.TINYINT)
  declare status: number;

  @Column(DataType.INTEGER)
  declare reseller_id: number;

  @HasMany(() => Routing)
  routings: Routing[];
}
