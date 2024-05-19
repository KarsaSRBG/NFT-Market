// src/app.service.ts
import {ConflictException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import {checkSimilarity} from '../hash.js'; // 导入你的phash函数
import { exec } from 'child_process';
import {handleTokenUris} from '../scripts/uploadImageToPinata.js';
import { MetadataDto } from './module/metadata/dto/metadata.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Nft } from './nft.entity.js';
import { Repository } from 'typeorm';
import Jimp from 'jimp';

@Injectable()
export class AppService {

  constructor(
    @InjectRepository(Nft)
    private nftRepository: Repository<Nft>,
  ) {}

  async processImage(file: Express.Multer.File): Promise<string> {

    let similarity=0;
    
    if (!file) {
      throw new Error('文件上传失败');
    }

    // 使用phash算法处理图片

    const files = await fs.readdirSync('./uploads').filter((file) => (/\b.png|\b.jpg|\b.jpeg/).test(file))
    console.log(files)
    const newImg = await Jimp.read('./uploads/'+files[0]);
    const phashValue = newImg.pHash();

    const nfts = await this.nftRepository.find({ select: ['pHash'] });
    const pHashes: string[] = nfts.map(nft => nft.pHash);

    console.log(phashValue)

    for(let i=0;i<pHashes.length;i++){
      if(pHashes[i]!=""&&pHashes[i]!=null){
        similarity=checkSimilarity(pHashes[i],phashValue);
        console.log("相似度为",similarity)
      }
      if(similarity>=70){
        const fullImagesPath = path.resolve('./uploads')
        const files = fs.readdirSync(fullImagesPath).filter((file) => (/\b.png|\b.jpg|\b.jpeg/).test(file))

        await fs.unlinkSync("./uploads/"+files[0]);
        throw new HttpException('作品涉及抄袭', HttpStatus.FORBIDDEN);
      }
    }

    return phashValue;
  }

  async uploadToIpfs(metadataDto: MetadataDto): Promise<string> {

    const fullImagesPath = path.resolve('./uploads')
    const files = fs.readdirSync(fullImagesPath).filter((file) => (/\b.png|\b.jpg|\b.jpeg/).test(file))

    const ipfsUri = await handleTokenUris('./uploads',metadataDto.name,metadataDto.description,metadataDto.artist);

    await fs.unlinkSync("./uploads/"+files[0]);

    return ipfsUri[0];
  }

  async saveIpfsUriToDatabase(ipfsUri: string): Promise<void> {

    const existingNft = await this.nftRepository.findOne({
      where: {
        IpfsAddress: ipfsUri,
      },
    });

    if (existingNft) {
      // 如果IpfsAddress已存在，抛出错误
      //throw new ConflictException('IpfsAddress already exists');
      return;
    }
    const data={
      IpfsAddress:ipfsUri,
      TokenId:null,
      pHash:'',
      Owner:''
    }
    // 如果IpfsAddress不存在，创建新的NFT记录
    const nft = this.nftRepository.create(data);

    await this.nftRepository.save(nft);

  }

  async storeInfomation(data:{ipfsUri:string;pHash:string;owner:string}): Promise<void>{
    const nft = await this.nftRepository.findOne({
      where: {
        IpfsAddress: data.ipfsUri,
      },
    });
    console.log(nft.IpfsAddress)
    if (nft) {
      nft.pHash = data.pHash;
      nft.Owner = data.owner;

      // 保存更新后的记录到数据库
      await this.nftRepository.save(nft);
    }
  }

  async getImage(acc:{account:string}): Promise<any>{
    let data=[{
      IpfsAddress:'',
      TokenId:null,
      pHash:''
    }];
    const Nft = await this.nftRepository.find({
      where: {
        Owner: acc.account,
      },
    });

    if(Nft.length>0){
      var i=0;
      for(i=0;i<Nft.length;i++){
        if(i==0){
          data[i].IpfsAddress=Nft[i].IpfsAddress;
          data[i].TokenId=Nft[i].TokenId;
          data[i].pHash=Nft[i].pHash;
        }
        else{
          data.push({
            IpfsAddress:Nft[i].IpfsAddress,
            TokenId:Nft[i].TokenId,
            pHash:Nft[i].pHash
          });
        }
      }
    }
    else{
      return data;
    }
    return data;
  }

  async saveTokenId(data:{tokenId:number;ipfsUri:string}): Promise<void>{
    const nft = await this.nftRepository.findOne({
      where: {
        IpfsAddress: data.ipfsUri,
      },
    });
    console.log(nft.IpfsAddress)
    if (nft) {
      nft.TokenId = data.tokenId;

      // 保存更新后的记录到数据库
      await this.nftRepository.save(nft);
    }
  }

  async getTokenId(data:{ipfsUri:string}): Promise<any>{
    const nft = await this.nftRepository.findOne({
      where: {
        IpfsAddress: data.ipfsUri,
      },
    });

    return nft.TokenId
  }

  async buyNft(data:{tokenId:number;Owner:string}): Promise<void>{
    const nft = await this.nftRepository.findOne({
      where: {
        TokenId: data.tokenId,
      },
    });
    console.log(nft.TokenId)
    if (nft) {
      nft.Owner = data.Owner;

      // 保存更新后的记录到数据库
      await this.nftRepository.save(nft);
    }
  }

  async deleteImage(data:{ipfsUri:string}): Promise<void>{

    const nft = await this.nftRepository.findOne({
      where: {
        IpfsAddress:data.ipfsUri,
      },
    });


    await this.nftRepository.remove(nft);
  }

  async getInfo(data:{tokenId:number}): Promise<string>{

    const nft = await this.nftRepository.findOne({
      where: {
        TokenId:data.tokenId
      },
    });

    return nft.pHash;
  }
}