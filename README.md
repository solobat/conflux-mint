## 安装
```bash
## 安装依赖
yarn

## 配置钱包，自行填写私钥
cp wallet.default.json wallet.json

## 申请 rpc url: unifra.io

## 执行
node index.js
```

## 配置
```js
// index.js 中配置频率与 gas

// 频率, 25 秒左右一个
let latstUsedTime = 25 * 1000;

// gas 价格, 默认为 45 g
let autoGasPrice = 45000000000n;
```