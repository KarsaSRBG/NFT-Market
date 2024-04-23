import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'nftlist' })
export class Nft {
  @PrimaryColumn()
  IpfsAddress: string;
  
  @Column({nullable: true, default: null })
  TokenId:number;

  @Column()
  pHash: string;

  @Column()
  Owner: string;
}