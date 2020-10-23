const Koa = require('koa');
const Router = require('koa-router');
const FileType = require('file-type');
const formidable = require('formidable');
const bodyparser = require('koa-bodyparser');
const path = require('path');
const fs = require('fs');
const cors = require('koa2-cors');

const app = new Koa();
const router = new Router();

const PORT = 4000;
const UPLOAD_DIR = path.join(__dirname, 'public');
const STATIC_DIR = path.join(__dirname, 'static');
const TEMP_UPLOAD_DIR = path.join(__dirname, './temp');

const formParse = (form, request) => {
  return new Promise((resolve, reject) => {
    form.parse(request, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({fields, files});
    });
  })
}


router.post('/upload', async ctx => {
  const form = formidable({
    multiples: false,
    uploadDir: TEMP_UPLOAD_DIR,
  });
  const { files, fields } = await formParse(form, ctx.req);
  const { hash, index } = fields;
  const filepath = files.chunk.path;

  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR)
  }

  const uploadDir = path.join(UPLOAD_DIR, `${hash}`);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  fs.renameSync(filepath, path.join(uploadDir, index));

  ctx.body = {
    code: 0,
    data: {
      files,
      fields
    }
  }
})

router.post('/merge', async ctx => {
  const { filename, chunkSize } = ctx.request.body;
  const size = +chunkSize;
  const chunks = fs.readdirSync(`./public/${filename}`);

  chunks.sort((a, b) => a - b)

  if (!fs.existsSync(STATIC_DIR)) {
    fs.mkdirSync(STATIC_DIR);
  }

  const mergePromise = chunks.map((chunk, index) => {
    return new Promise((resolve, reject) => {
      const rs = fs.createReadStream(path.join(`./public/${filename}`, chunk));
      const ws = fs.createWriteStream(path.join(STATIC_DIR, filename), {
        start: index * size
      });
      rs.pipe(ws);
      rs.on('end', () => {
        fs.unlinkSync(path.join(`./public/${filename}`, chunk));
        resolve()
      })
      rs.on('error', err => {
        reject(err)
      })
    });
  })

  await Promise.all(mergePromise);

  const stream = fs.createReadStream(path.join(STATIC_DIR, filename));
 
  const { ext, mime } = await FileType.fromStream(stream);

  const uploadedFilename = path.join(STATIC_DIR, filename) + `.${ext}`;

  fs.renameSync(path.join(STATIC_DIR, filename), uploadedFilename)

  // fs.unlinkSync(path.join(`./public/${filename}`))

  ctx.body = {
    code: 0,
    data: {
      filename: uploadedFilename,
      ext,
      mime
    },
    message: 'success'
  }
});

app
  .use(cors())
  .use(bodyparser())
  .use(router.routes())
  .use(router.allowedMethods())


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
})