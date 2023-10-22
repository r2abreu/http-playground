import { writeFile, appendFile, readFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { Readable } from "node:stream";

export default {
  GET: function(url, request, response) {
    const id = url.pathname.split("/")[2];

    id ? getMessage(id, response) : getMessages(request, response);
  }, 
  POST: function(url, request, response) {
    createMessage(url, request, response);
  },
  DELETE: function(url, request, response) {
    const id = url.pathname.split("/")[2];

    deleteMessage(id, response);
  },
  PATCH: function(url, request, response) {
    const id = url.pathname.split("/")[2];

    updateMessage(id, request, response);
  } 
}

async function getMessages(request, response) {
  const [ file ] = await readFileAndGetLastLine() || [];

  if (!file) {
    response.writeHead(500);
    response.end('Sorry, we were unable to read file contents\n');
    return;
  } 
  
  response.writeHead(200);
  response.end(file);
}

async function getMessage(id, response) {
  const [ file ] = await readFileAndGetLastLine() || [];

  if (!file) {
    response.writeHead(500);
    response.end('Sorry, we were unable to read file contents');
    return;
  } 

  const lines = file.split("\n");
  const entry = lines.find(line => line.split(';')[0] === id)

  if (!entry) {
    response.writeHead(400);
    response.end('Entry not found');
  }

  response.writeHead(200);
  response.end(`${entry}\n`);
}


async function createMessage(url, request, response) {
  request.setEncoding('utf8');

  let id = 0;
  let body = "";

  try {
    const [ _body, _lastline ] = await readFileAndGetLastLine() || [];
    body = _body;
    id = _lastline ? _lastline.split(";")[0] : 0;
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
      response.writeHead(201, {
        "Location": `${url.pathname}/${id}`
      });
      response.end(requestBody);
    } catch (error)  {
      console.error(error);
      response.writeHead(500);
      response.end('Error appending data to the file');
    }
  })
};

async function deleteMessage(id, response) {
  const [ file ] = await readFileAndGetLastLine() || [];

  if (!file) {
    response.writeHead(500);
    response.end('Sorry, we were unable to read file contents');
    return;
  } 

  const lines = file.split("\n");
  const filtered = lines.filter((line) => line.split(';')[0] !== id)
  const newFile = filtered.join("\n");
  // first we have to make sure that the entry exists (maybe not)
  try {
    await writeFile('file', newFile);
    response.writeHead(200);
    response.end();
  } catch (error) {
    console.log(error);
    response.writeHead(500);
    response.end("Sorry, unable to delete entry\n");
  }
}

async function updateMessage(id, request, response) {
  const [ file ] = await readFileAndGetLastLine() || [];

  if (!file) {
    response.writeHead(500);
    response.end('Sorry, we were unable to read file contents');
    return;
  } 

  const lines = file.split("\n");
  const entry = lines.find((line) => line.split(';')[0] === id)
  const entryId = entry.split(';')[0];
  const indexOfEntry = lines.indexOf(entry);

  if (!entry) {
    response.writeHead(400);
    response.end("Entry not found");
  }

  let requestBody = "";
  request.on("data", function(chunk) {
    requestBody += `${entryId};${chunk}`
  })

  request.on("end", async function(chunk) {
    try {
      const replaced = file.replace(entry, requestBody);
      const newFile = await writeFile('file', replaced);
      response.writeHead(200);
      response.end(`${requestBody}\n`);
    } catch (error) {
      console.error(error); 
      response.writeHead(500);
      response.end("Sorry, error updating the entity");
    }
  }) 
}

async function readFileAndGetLastLine() {
  try { await access('file', constants.F_OK); } catch (e) { return console.error(e) }
  const input = createReadStream('file', { encoding: 'utf8' }); 
  return new Promise(function (resolve, reject) {
    const readline = createInterface({ input });

    let lastline = "";
    let fileContents = "";

    readline.on("line", function(line) {
      lastline=line;
      fileContents+=`${line}\n`;
    })

    readline.on("close", function() {
      resolve([fileContents, lastline]);
    })

    readline.on("error", function(error) {
      reject(error);
    })
  })
}
