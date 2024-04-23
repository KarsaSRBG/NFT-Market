// src/app.controller.ts
import { Controller, Post, UseInterceptors, UploadedFile,Get, HttpException, HttpStatus, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';
import { MetadataDto } from './module/metadata/dto/metadata.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('uploadImage')
  @UseInterceptors(FileInterceptor('image'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    try{
    const phashValue = await this.appService.processImage(file);
    return { message: '作品无抄袭行为', phash: phashValue };
    }catch(e){
      throw e;
    }
  }

  @Post('getIpfsUri')
  async getIpfsUri(@Body() metadataDto: MetadataDto) {
    try {
      const ipfsUri = await this.appService.uploadToIpfs(metadataDto);
      await this.appService.saveIpfsUriToDatabase(ipfsUri);
      return { message: '文件上传至IPFS成功', ipfsUri: ipfsUri };
    } catch (error) {
      throw new HttpException('文件上传失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('storeInfo')
  async storeInfo(@Body() data:{ipfsUri:string;pHash:string;owner:string}){
    try{
      await this.appService.storeInfomation(data);
      return { message: '保存数据成功'};
    }catch(error){
      throw new HttpException('文件上传失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('getImage')
  async getImage(@Body() acc:{account:string}){
    try{
      const nft=await this.appService.getImage(acc);
      return { message: '获取图片成功',data:nft};
    }catch(error){
      throw new HttpException('获取图片失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

   @Post('saveTokenId')
  async saveTokenId(@Body() data:{tokenId:number;ipfsUri:string}){
    try{
      await this.appService.saveTokenId(data);
      return { message: '保存tokenId成功'};
    }catch(error){
      throw new HttpException('保存tokenId失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('getTokenId')
  async getTokenId(@Body() data:{ipfsUri:string}){
    try{
      const tokenId=await this.appService.getTokenId(data);
      return { message: '获取tokenId成功',tokenId:tokenId};
    }catch(error){
      throw new HttpException('获取tokenId失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('buyNft')
  async buyNft(@Body() data:{tokenId:number;Owner:string}){
    try{
      await this.appService.buyNft(data);
      return { message: '保存购买数据成功'};
    }catch(error){
      throw new HttpException('购买数据保存失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
