import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { Pricelist } from 'src/pricelist/model/pricelist.model';
import { Route } from 'src/routes/model/routes.model';

@Table({
  tableName: 'routing',
  timestamps: false,
})
export class Routing extends Model<Routing> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column(DataType.INTEGER)
  declare pricelist_id: number | null;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  @Column(DataType.INTEGER)
  declare routes_id: number;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
  })
  declare percentage: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  declare call_count: number;

  @Column(DataType.INTEGER)
  declare quality_base: number | null;

  @ForeignKey(() => Pricelist)
  @Column({ field: 'pricelist_id' })
  declare pricelistId: number;

  @ForeignKey(() => Route)
  @Column({ field: 'routes_id' })
  declare routeId: number;

  @BelongsTo(() => Pricelist)
  declare pricelist: Pricelist;

  @BelongsTo(() => Route)
  declare route: Route;
}
