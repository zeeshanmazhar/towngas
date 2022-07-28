module.exports = {
    apps : [{
      name: "hyyp-app",
      script: "./server.js",
      env: {
        NODE_ENV: "development",
        BINDIP: "0.0.0.0",
        PORT: 3000,
        MONITORING: true

      },
      env_production: {
        NODE_ENV: "production",
        BINDIP: "0.0.0.0",
        PORT: 3000,
        MONITORING: true
      }
    }]
  }
