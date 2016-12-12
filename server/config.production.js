module.exports = {
  host: process.env.BASE_URL,
  db_url: "mongodb://" + process.env.MONGODB_USER + ":"
                        + process.env.MONGODB_PASSWORD + "@"
                        + process.env.MONGODB_HOST + ":"
                        + process.env.MONGODB_PORT + "/%s?authSource=admin&ssl=true",
  "acl_enabled": true
};
