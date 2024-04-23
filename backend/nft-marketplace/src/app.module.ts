import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Nft } from './nft.entity.js';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads', // 文件存储位置
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const extension = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
        },
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'xx19950807',
      database: 'nft',
      entities: [Nft],
      synchronize: true,
      logging: true,
    }),
    TypeOrmModule.forFeature([Nft])
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
