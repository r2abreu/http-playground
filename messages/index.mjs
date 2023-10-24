import { query } from "../db/index.mjs";

export default {
  GET: function (url, _, response) {
    const id = url.pathname.split("/")[2];

    id ? getMessage(id, response) : getMessages(response);
  },
  POST: function (_, request, response) {
    createMessage(request, response);
  },
  DELETE: function (url, _, response) {
    const id = url.pathname.split("/")[2];

    deleteMessage(id, response);
  },
  PATCH: function (url, request, response) {
    const id = url.pathname.split("/")[2];

    updateMessage(id, request, response);
  },
};

async function getMessages(response) {
  try {
    const getQuery = "SELECT * FROM message";
    const results = await query(getQuery);
    const responseMessage = !results.rowCount
      ? "No messages"
      : results.rows.map(({ id, content }) => `${id}:${content}\n`).join("");
    response.writeHead(200);
    response.end(`${responseMessage}\n`);
  } catch (error) {
    console.error(error);
    response.writeHead(500);
    response.end("Sorry, we were unable to read db contents\n");
    return;
  }
}

async function getMessage(id, response) {
  try {
    const getQuery = "SELECT * FROM message WHERE id = $1";
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
    response.writeHead(500);
    response.end("Error retrieving message");
  }
}

async function createMessage(request, response) {
  request.setEncoding("utf8");
  let body = "";
  request.on("data", (chunk) => (body += chunk));
  request.on("end", async () => {
    if (!body) {
      response.writeHead(400);
      response.end("Message content is required\n");
      return;
    }

    try {
      const queryPost = "INSERT INTO message (content) VALUES ($1) RETURNING *";
      const results = await query(queryPost, [body]);
      const { id, content } = results.rows[0];
      response.writeHead(200, { Location: `http://${request.host}/${id}` });
      response.end(`${id}:${content}\n`);
    } catch (error) {
      response.writeHead(500);
      response.end("Error creating message");
    }
  });
}

async function deleteMessage(id, response) {
  if (!id) {
    response.writeHead(400);
    response.end("Id parameter is required\n");
    return;
 }

  try {
    const queryDelete = "DELETE FROM message WHERE id = $1";
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

  request.setEncoding("utf8");

  let body = "";
  request.on("data", (chunk) => (body += chunk));

  request.on("end", async function () {
    try {
      const queryUpdate =
        "UPDATE message SET content = $1 where ID = $2 RETURNING *";
      const results = await query(queryUpdate, [body, id]);
      const { id: resultId, content } = results.rows[0];
      response.writeHead(200, {
        Location: `http://${request.host}/messages/${resultId}`,
      });
      response.end(`${resultId}:${content}\n`);
    } catch (error) {
      console.error(error);
      response.writeHead(500);
      response.end("Error updating the entity\n");
    }
  });
}
