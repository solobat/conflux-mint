## 安装
```bash
## 安装依赖
yarn

## 配置钱包，自行填写私钥
cp wallet.default.json wallet.json
cp config.default.json config.json

## 申请 rpc url: unifra.io

## 执行
node index.js
```

## 配置
```json
{
  // 期望 30 秒 mint 一张
  "timepermint": 30000,
  // 90 Gdrips
  "gasPrice": 90,
  // rpc
  "rpcurl": "https://cfx-core.unifra.io/v1/{apiKey}"
}
```