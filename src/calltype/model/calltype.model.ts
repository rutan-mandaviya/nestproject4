import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Ratedeck } from 'src/ratedeck/model/ratedeck.model';
import { Route } from 'src/routes/model/routes.model';

@Table({
  tableName: 'calltype',
  timestamps: false,
})
export class CallType extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column(DataType.STRING)
  declare call_type: string;

  @Column(DataType.TEXT)
  declare description: string;

  @Column(DataType.DATE)
  declare date: Date;

  @Column(DataType.TINYINT)
  declare status: number;

  @HasMany(() => Ratedeck)
  ratedecks: Ratedeck[];

  @HasMany(() => Route)
  routes: Route[];
}
