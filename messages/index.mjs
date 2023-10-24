<<<<<<< Updated upstream
import { appendFile, readFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { Readable } from "node:stream";
=======
import { query } from "../db/index.mjs";
>>>>>>> Stashed changes

export default {
  GET: function(url, request, response) {
    const id = url.pathname.split("/")[2];

    id ? getMessageById(id, request, response) : getAll(request, response);
  }, 
  POST: function(url, request, response) {
    createMessage(url, request, response);
  }
}

<<<<<<< Updated upstream
async function getAll (request, response) {
  const [ file ] = await readFileAndGetLastLine() || [];

  if (!file) {
    response.writeHead(500);
    response.end('Sorry, we were unable to read file contents');
=======
async function getMessages(request, response) {
  try {
    const getQuery = 'SELECT * FROM message';
    const results = await query(getQuery);
    const responseMessage = !results.rowCount 
      ? "No messages" 
      : results.rows.map(({id, content}) => `${id}:${content}\n`).join("")
    response.writeHead(200);
    response.end(`${responseMessage}\n`);
  } catch (error) {
    console.error(error);
    response.writeHead(500);
    response.end('Sorry, we were unable to read db contents\n');
>>>>>>> Stashed changes
    return;
  }
  
}

<<<<<<< Updated upstream
async function getMessageById(id) {
  const [ file ] = await readFileAndGetLastLine() || [];

  if (!file) {
    response.writeHead(500);
    response.end('Sorry, we were unable to read file contents');
    return;
  } 

  const lines = file.split("\n");
  const entry = lines.find(line => line.split(';')[0] === id)
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
=======
async function getMessage(id, response) {
    try {
      const getQuery = 'SELECT * FROM message WHERE id = $1';
      const results = await query(getQuery, [id]);
      if (!results.rowCount) {
        response.writeHead(404);
        response.end("Not found\n");
      } else {
        const { id, content } = results.rows[0];
        response.writeHead(200);
        response.end(`${id}:${content}\n`);
      }
    } catch (error) {
      console.error(error);
      response.writeHead(500)
      response.end("Error retrieving message");
    }
} 
>>>>>>> Stashed changes


async function createMessage(url, request, response) {
  request.setEncoding('utf8');
<<<<<<< Updated upstream

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
=======
  let body="";
  request.on('data', (chunk) => body+=chunk);
  request.on('end', async () => {
>>>>>>> Stashed changes
    try {
      const queryPost = 'INSERT INTO message (content) VALUES ($1) RETURNING *';
      const results = await query(queryPost, [body]);
      const { id, content } = results.rows[0];
      response.writeHead(200, { "Location": `http://${request.host}/${id}`})
      response.end(`${id}:${content}\n`);
    } catch (error) {
      response.writeHead(500);
      response.end("Error creating message");
    }
  })
};

<<<<<<< Updated upstream
=======
async function deleteMessage(id, response) {
  if (!id) {
    response.writeHead(400);
    response.end("Id parameter is required\n");
    return;
  }

  try {
    const queryDelete = 'DELETE FROM message WHERE id = $1'
    const result = await query(queryDelete, [id]);
    response.writeHead(200);
    response.end("OK\n");
  } catch (error) {
    console.error(error);
    response.writeHead(500);
    response.end("Error deleting entry\n");
  }
}

async function updateMessage(id, request, response) {
  if (!id) {
    response.writeHead(400);
    response.end("Id parameter is required\n");
    return;
  }

  request.setEncoding('utf8');

  let body = "";
  request.on("data", (chunk) => body+=chunk);

  request.on("end", async function(chunk) {
    try {
      const queryUpdate = 'UPDATE message SET content = $1 where ID = $2 RETURNING *';
      const results = await query(queryUpdate, [body, id]);
      const { id: resultId, content } = results.rows[0];
      response.writeHead(200, { "Location": `http://${request.host}/messages/${resultId}`});
      response.end(`${resultId}:${content}\n`);
    } catch (error) {
      console.error(error); 
      response.writeHead(500);
      response.end("Error updating the entity\n");
    }
  }) 
}
>>>>>>> Stashed changes
