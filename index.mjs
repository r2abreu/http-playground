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

const server = http.createServer();

server.on("request", function(request, response) {
    // Request: http.IncomingMessage
    switch (request.url) {
      case '/' :
        handleGetRequest(request, response);
        break;
      case '/messages' : 
        handlePostRequest(request, response);
        break;
    }
});

async function handleGetRequest(request, response) {
  // show list of messages
  try {
    const file = await readFile('file', 'utf8'); 
    response.writeHead(200);
    response.end(file);
  } catch (error) {
    response.writeHead(500);
    response.end("Unable to read file");
  }
};

async function handlePostRequest(request, response) {
  request.setEncoding('utf8');

  let id = 0;
  let body = "";

  try {
    const [ _body, _lastline ] = await readFileAndGetLastLine() || [];
    
    body = _body;
    id = _lastline ? _lastline.split(";").join("")[0] : 0;
  } catch (error) {
    console.error(error);
  }

  let requestBody = "";
  request.on("data", function(chunk) {
    requestBody += `${++id};${chunk}\n`
  })

  request.on("end", async function() {
    try {
      await appendFile("file", requestBody);     
      response.writeHead(200);
      response.end(requestBody);
    } catch (error)  {
      console.error(error);
      response.writeHead(500);
      response.end('Error appending data to the file');
    }
  })
};

async function readFileAndGetLastLine() {
  try { await access('file', constants.F_OK); } catch (e) { return console.error(e) }
  const input = createReadStream('file', { encoding: 'utf8' }); 
  return new Promise(function (resolve, reject) {
    const readline = createInterface({ input });

    let lastline = "";
    let body = "";

    readline.on("line", function(line) {
      lastline=line;
      body+=`${line}\n`;
    })

    readline.on("close", function() {
      resolve([body, lastline]);
    })

    readline.on("error", function(error) {
      reject(error);
    })
  })
}

server.listen(3000);
