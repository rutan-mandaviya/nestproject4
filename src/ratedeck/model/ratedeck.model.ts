import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { CallType } from 'src/calltype/model/calltype.model';

@Table({
  tableName: 'ratedeck',
  timestamps: false,
})
export class Ratedeck extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column(DataType.STRING(80))
  declare destination: string;

  @Column(DataType.INTEGER)
  declare country_id: number;

  @Column(DataType.STRING(40))
  declare pattern: string;

  @Column(DataType.INTEGER)
  declare call_type: number;

  @Column(DataType.TINYINT)
  declare status: number;

  @Column(DataType.INTEGER)
  declare reseller_id: number;

  @Column(DataType.DATE)
  declare creation_date: Date;

  @Column(DataType.DATE)
  declare last_modified_date: Date;

  @ForeignKey(() => CallType)
  @Column({ field: 'call_type' })
  declare callTypeId: number;

  @BelongsTo(() => CallType)
  declare callTypeDetails: CallType;
}
