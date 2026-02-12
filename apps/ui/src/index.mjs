import * as fs from 'node:fs';
import path from 'node:path';

const extensionToContentType = {
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
};

const getFullPath = (fullDir, fileName) =>
  fullDir === './web'
    ? `/${fileName}`
    : `/${fullDir.replace('web/', '')}/${fileName}`;

const getContent = (filePath, contentType) => {
  if (contentType === 'image/png' || contentType === 'image/x-icon') {
    return fs.readFileSync(`./web${filePath}`).toString('base64');
  }

  return fs.readFileSync(`./web${filePath}`, { encoding: 'utf8' });
};

const assets = fs
  .readdirSync('./web', { recursive: true, withFileTypes: true })
  .filter((file) => file.isFile())
  .map((file) => {
    const extension = path.extname(file.name).toLowerCase();
    const fullPath = getFullPath(file.path, file.name);
    const contentType =
      extensionToContentType[extension] || 'application/octet-stream';

    return {
      fullPath, // all assets except for index.html are requested by name
      content: getContent(fullPath, contentType),
      contentType,
    };
  });

const assetsMap = new Map(assets.map((obj) => [obj.fullPath, obj]));
assetsMap.set('/', assetsMap.get('/index.html')); // Ensure root path serves index.html

const NON_ASSET_PATHS = [
  'welcome',
  'log',
  'timer',
  'plan',
  'schedule',
  'exercises',
  'extra-features',
];

export const handler = async (event, _context) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const basePath = event.rawPath.split('/')[1];
  if (NON_ASSET_PATHS.includes(basePath)) {
    return {
      statusCode: 204,
    };
  }

  if (assetsMap.has(event.rawPath)) {
    const asset = assetsMap.get(event.rawPath);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': asset.contentType,
      },
      isBase64Encoded:
        asset.contentType === 'image/png' ||
        asset.contentType === 'image/x-icon',
      body: asset.content,
    };
  }

  return {
    statusCode: 404,
    body: 'Not Found',
  };
};
