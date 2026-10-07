import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

// Local browser test host simulator only. This is NOT ChatGPT.
const widgetHtml = readFileSync(new URL("../public/smart-learning.html", import.meta.url), "utf8");
const hostHtml = readFileSync(new URL("./host.html", import.meta.url), "utf8");

export async function startHarness({
  port = 8899,
  mcpUrl = process.env.MCP_URL || "https://korea-media-korean-mcp-production.up.railway.app/mcp",
}={}) {
  const client = new Client({ name:"korean-ui-browser-test-harness", version:"1.0.0" });
  await client.connect(new StreamableHTTPClientTransport(new URL(mcpUrl)));
  const server = createServer(async (req,res)=>{
    try {
      const url = new URL(req.url,"http://127.0.0.1:"+port);
      if(req.method==="GET" && url.pathname==="/favicon.ico"){
        res.writeHead(204).end();
        return;
      }
      if(req.method==="GET" && (url.pathname==="/widget" || url.pathname==="/")){
        res.writeHead(200,{"content-type":"text/html; charset=utf-8"});
        res.end(url.pathname==="/widget"?widgetHtml:hostHtml);
        return;
      }
      if(req.method==="POST" && url.pathname==="/call"){
        const chunks=[];
        for await (const chunk of req)chunks.push(chunk);
        const data=JSON.parse(Buffer.concat(chunks).toString("utf8"));
        const result=await client.callTool({name:data.name,arguments:data.args||{}});
        res.writeHead(200,{"content-type":"application/json; charset=utf-8"});
        res.end(JSON.stringify(result));
        return;
      }
      res.writeHead(404).end("Not found");
    }catch(err){
      if(!res.headersSent)res.writeHead(500,{"content-type":"application/json; charset=utf-8"});
      res.end(JSON.stringify({error:err.message}));
    }
  });
  await new Promise(resolve=>server.listen(port,"127.0.0.1",resolve));
  return {url:"http://127.0.0.1:"+port,close:async()=>{
    await new Promise(resolve=>server.close(resolve)); await client.close();
  }};
}
