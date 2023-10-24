// Spin up a server that writes text/plain mime to disk

/**
 * Questions:
 * node:http vs http
 *
 */
import http from "node:http";
import { appendFile, readFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { Readable } from "node:stream";
import messages from "./messages/index.mjs";
import { config } from "dotenv"
config();

const server = http.createServer();
server.on("request", function(request, response) {
  const url = new URL(request.url, `https://${request.headers.host}`)
  switch (true) {
    case /^\/messages(\/(\d+|[0-9a-fA-F-]+))?\/?$/.test(url.pathname) : 
      messages[request.method](url, request, response);
      break;
  }
});

server.listen('3000');
