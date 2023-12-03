const config = require("./config.js");

if (config.shardManager.shardStatus == true) {
    const { ShardingManager } = require("discord.js");
    // const { ClusterManager } = require("discord-hybrid-sharding")
    const manager = new ShardingManager("./bot.js", {
        totalShards: "auto",
        token: config.TOKEN || process.env.TOKEN,
        timeout: -1,
        respawn: true
    });
    manager.on("debug", (e) => console.log(e));

    manager.on("launch", (shard) => {
     console.log(`[WS => ${shard.id}] [✔] Successfully launched shard ${shard.id} of ${manager.totalShards}`);
     if(shard.id === 0) {
      console.log('[WS => catchUsers] [!] Refreshing modules before shard spawning...')
      console.log('[WS => catchUsers] [!] Lazy-reloading database before shard spawning...')
     }
    });
    
    manager.on("shardCreate", shard => {
        manager.on("ready", () => {
        console.log(`[${shard.id} => ready] [✔] Shard ${shard.id} (${shard.pid}) connected to Discord's Gateway.`)
            shard.send({ type: "shardId", data: { shardId: shard.id } });
        });
    });
    
     manager.on("death", (process, shard) => {
      console.log("[${shard.id} => closeEvent] [⨯] Shard " + shard.id + " closed unexpectedly! PID: " + process.pid + "; Exit code: " + process.exitCode + ".");
    
      if(process.exitCode === null)
      {
       console.log("[${shard.id} => closeEvent] [!] Shard " + shard.id + " exited with NULL error code. This may be a result of a lack of available system memory. Ensure that there is enough memory allocated to continue.");
      }
     });
    
     manager.on("disconnect", (event) => {
      console.log("[${shard.id} => disconnect] [!] Shard " + shard.id + " disconnected. Dumping socket close event...");
      console.log(event);
     });
    manager.spawn({ amount: "auto", delay: 5500, timeout: 30000 }).catch(e => console.log(e));
} else {
    require("./bot.js");
}
