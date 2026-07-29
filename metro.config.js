const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');
const https = require('https');
const url = require('url');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Metro dev server proxy middleware for web requests to bypass browser CORS
config.server = config.server || {};
const originalEnhanceMiddleware = config.server.enhanceMiddleware;

config.server.enhanceMiddleware = (middleware, server) => {
  const enhanced = originalEnhanceMiddleware
    ? originalEnhanceMiddleware(middleware, server)
    : middleware;

  return (req, res, next) => {
    // Handle OPTIONS preflight for dev server
    if (req.method === 'OPTIONS' && req.url && req.url.startsWith('/api-proxy/')) {
      res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      });
      res.end();
      return;
    }

    if (req.url && req.url.startsWith('/api-proxy/')) {
      const targetPath = req.url.replace(/^\/api-proxy\//, '');
      const targetUrl = `https://api.hgs.vn:8445/ApiCore/${targetPath}`;
      const parsedUrl = url.parse(targetUrl);

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 8445,
        path: parsedUrl.path,
        method: req.method,
        headers: {
          ...req.headers,
          host: parsedUrl.hostname,
        },
        rejectUnauthorized: false, // allow SSL certs on port 8445
      };

      const proxyReq = https.request(options, (proxyRes) => {
        const headers = { ...proxyRes.headers };
        headers['access-control-allow-origin'] = '*';
        headers['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        headers['access-control-allow-headers'] = '*';

        res.writeHead(proxyRes.statusCode || 200, headers);
        proxyRes.pipe(res);
      });

      proxyReq.on('error', (err) => {
        console.warn('Metro CORS Proxy Warning:', err.message);
        res.writeHead(502, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        });
        res.end(JSON.stringify({ success: false, message: 'Proxy network fallback' }));
      });

      req.pipe(proxyReq);
      return;
    }

    return enhanced(req, res, next);
  };
};

module.exports = withNativewind(config, {
  inlineVariables: false,
  globalClassNamePolyfill: false,
});