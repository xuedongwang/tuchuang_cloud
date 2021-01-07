require('dotenv').config()

const path = require('path');
const fs = require('fs');
const Koa = require('koa');
const Router = require('koa-router');
const { STS } = require('ali-oss');
const cors = require('koa2-cors');
const conf = require('./config');

const app = new Koa();
const router = new Router();

const PORT = 4000;
router.get('/sts', async ctx => {
  console.log(conf);
  let policy;
  if (conf.PolicyFile) {
    policy = fs.readFileSync(path.resolve(__dirname, conf.PolicyFile)).toString('utf-8');
  }

  const client = new STS({
    accessKeyId: process.env.AccessKeyId,
    accessKeySecret: process.env.AccessKeySecret
  });

  try {
    const res = await client.assumeRole(process.env.RoleArn, policy, conf.TokenExpireTime);
    console.log(res);
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-METHOD', 'GET');
    ctx.body = {
      code: 0,
      data: {
        accessKeyId: res.credentials.AccessKeyId,
        accessKeySecret: res.credentials.AccessKeySecret,
        stsToken: res.credentials.SecurityToken,
        expiration: res.credentials.Expiration,
        region: process.env.region,
        bucket: process.env.bucket,
      }
    };
  } catch(err) {
    throw err;
  }
});

app
  .use(cors())
  .use(router.routes())
  .use(router.allowedMethods())


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
})