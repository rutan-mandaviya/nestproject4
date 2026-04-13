import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { CallType } from 'src/calltype/model/calltype.model';
import { Pricelist } from 'src/pricelist/model/pricelist.model';
import { Routing } from 'src/routing/model/routing.model';

@Table({
  tableName: 'routes',
  timestamps: false,
})
export class Route extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({ type: DataType.STRING(40), field: 'pattern' })
  declare code: string;

  @Column(DataType.STRING(100))
  declare destination: string;

  @Column({
    type: DataType.DECIMAL(10, 5),
    field: 'connect_cost',
    defaultValue: 0,
  })
  declare connectCost: number;

  @Column({
    type: DataType.INTEGER,
    field: 'included_seconds',
    defaultValue: 0,
  })
  declare includedSeconds: number;

  @Column({
    type: DataType.DECIMAL(10, 5),
    field: 'per_minute_cost',
    allowNull: true,
  })
  declare perMinuteCost: number;

  @Column({
    type: DataType.INTEGER,
    field: 'increment',
    defaultValue: 1,
  })
  declare billingIncrement: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  declare precedence: number;

  @Column({
    type: DataType.TINYINT,
    defaultValue: 1,
  })
  declare status: number;

  @HasMany(() => Routing)
  declare routings: Routing[];

  @ForeignKey(() => CallType)
  @Column({ field: 'call_type' })
  declare callTypeId: number;

  @BelongsTo(() => CallType)
  declare callType: CallType;

  @ForeignKey(() => Pricelist)
  @Column({ field: 'pricelist_id' })
  declare pricelistId: number;

  @BelongsTo(() => Pricelist)
  declare pricelist: Pricelist;
}
