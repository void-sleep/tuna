# Tuna

A modern open source AI-powered random wheel.

庄周吃鱼：万事不决问庄周。
利用 AI、大数据、云计算等技术解决 X 条件下如何选择 Y 的问题。

应用场景：

1. 中午吃什么，摇一摇，如有多人同时摇再根据石头剪刀布决胜负。
2. 我说开始你说停，年会抽奖，班级点名。
3. 生存还是毁灭，二选一。
4. 周末去哪玩，五棵松方圆十公里的公园应该去哪一个。
5. 宝宝吃什么，基于你或网友精心收集的宝宝餐，根据当前时间，确定现在适合吃哪几种。
6. 计数器模式，自定义加加加，功德又加一。

## 本地开发

### 项目结构

- `web` 应用的 Web 页面，基于 [React](https://react.dev/) 开发，需要本地安装 Node.js 20+，建议使用 [nvm](https://github.com/nvm-sh/nvm) 安装和管理。
- `api`  后端服务，Spring Boot 3，需要本地安装 Java 21+，建议使用 [sdkman](https://sdkman.io/) 安装和管理。

### 前端项目

```bash
cd web
# 安装依赖包
npm install
# 启动项目
npm start

```

### 概念介绍

- `recipe`：一个食谱，供大家选择的条目。
- `datasets`：若干食谱集合，基于此集合作为摇一摇的数据集。
- `policy`：选择策略，一次摇中几个、摇的页面效果等都是策略。
- `application`：应用由 policy + datasets 组成。
- `marketing`：插件化应用市场，大家可自由分享 datasets、policy 或 application。

## 安装部署

## 使用 Kubernetus Helm 部署

## License

基于 Apache-2.0 License。

保留 **庄周吃鱼** 名字和图标所有权。
