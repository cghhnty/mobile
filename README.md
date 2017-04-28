mobile
===========

# 部署
- 安装qrencode (http://fukuchi.org/works/qrencode/)
- 检查环境变量'LD_LIBRARY_PATH'是否包含/usr/local/lib
- git clone git@git.wosai-inc.com:web/mobile.git
- cd mobile
- npm install

# 环境变量
- **LOG_LEVEL** log4js 日志级别

# 启动开发环境:
```
node --debug=PORT index.js -c PROFILE
```
eg:
```
node --debug=8138 index.js -c fengming
```

# 启动生产环境:
```
node index.js
```
# 推送 SaaS 微信模板消息
```
node tool/push-order/pushOrder.js -c development
```

# 推送收钱吧微信模板消息
```
node tool/push-order/pushForShouqianba.js -c development
```

# Supervisor和Nginx配置
见dist-conf目录