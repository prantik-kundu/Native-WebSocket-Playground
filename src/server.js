const server = require("./app.js");
const HOST = process.env.HOST || "0.0.0.0";
const PORT = process.env.PORT || 8080;

server.listen(PORT, HOST, () => {
    console.log(`Server has started successfully at http://${HOST}:${PORT}`);
});