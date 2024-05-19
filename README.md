# NFT-Market

## 相关配置
* 配置文件`./backend/nft-marketplace/hardhat.config`中的测试网络为sepolia测试链，如需要修改请添加额外的网络配置项
* 国内连接区块链网络需要进行代理设置，项目中的本地监听端口为`http://127.0.0.1:10809`，运行项目时请配置好相应代理
* 项目的Graph文件为graph子图数据库，已经被部署在了网络上，不需要在本地运行

Mysql数据库：
```
CREATE TABLE `nft`.`new_table` (
  `TokenId` INT NULL DEFAULT NULL,
  `IpfsAddress` VARCHAR(255) NOT NULL,
  `pHash` VARCHAR(255) NOT NULL,
  `Owner` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`IpfsAddress`));
```