import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  OneToOne, 
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn } from 'typeorm';
import { AnyJson } from '../interfaces/json-types';
import * as BN from 'bn.js';
import { NumericTransformer } from '../db';
import { ExtrinsicArg, SubstrateExtrinsic } from '../interfaces';
import { SubstrateEventEntity } from './SubstrateEventEntity';

export const EXTRINSIC_TABLE_NAME = 'substrate_extrinsic'

@Entity({
  name: EXTRINSIC_TABLE_NAME
})
export class SubstrateExtrinsicEntity implements SubstrateExtrinsic {
  @PrimaryGeneratedColumn()
  id!: number;       
  
  @Column({
    type: 'numeric',
    transformer: new NumericTransformer(),
  })
  tip!: BN;
  
  @Column({
    type: 'numeric'
  })  
  @Index()
  blockNumber!: number;    
  
  @Column()     
  versionInfo!: string;  
  
  @Column({
    type: 'jsonb'
  })
  meta!: AnyJson

  @Column()
  method!: string;  
  
  @Column()      
  section!: string;     
  
  @Column({ 
    type: 'jsonb', 
  })     
  args!: ExtrinsicArg[];
  
  @Column()      
  signer!: string;         
  
  @Column()      
  signature!: string;        
  
  @Column()      
  nonce!: number;            
  
  @Column({
    type: 'jsonb' 
  })      
  era!: AnyJson;         
  
  @Column()      
  hash!: string;      
  
  @Column()      
  isSigned!: boolean;  

  @OneToOne(() => SubstrateEventEntity, (event: SubstrateEventEntity) => event.extrinsic) // specify inverse side as a second parameter
  event!: SubstrateEventEntity;

  // Warthog Fields
  @CreateDateColumn() 
  createdAt!: Date;
  
  @Column({
    default: 'hydra-indexer'
  }) 
  createdById!: string;

  @UpdateDateColumn({ nullable: true })
  updatedAt?: Date;
  
  @Column({ 
    nullable: true 
  })
  updatedById?: string;
  
  @Column({ nullable: true })
  deletedAt?: Date;
  
  @Column({ nullable: true })
  deletedById?: string;
  
  @VersionColumn() 
  version!: number;
  
}