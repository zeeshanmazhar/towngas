module.exports = {
    apps : [{
      name: "towngas-app",
      script: "./server.js",
      env: {
        NODE_ENV: "development",
        BINDIP: "0.0.0.0",
        PORT: 1234,
        MONITORING: true

      },
      env_production: {
        NODE_ENV: "production",
        BINDIP: "0.0.0.0",
        PORT: 1234,
        MONITORING: true
      }
    }]
  }
