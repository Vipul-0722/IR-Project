const { Client } = require('@elastic/elasticsearch');

const esClient = new Client({
    node: process.env.ELASTIC_NODE || "https://my-elasticsearch-project-f5abea.es.us-east-1.aws.elastic.cloud:443",
    auth: {
      apiKey: process.env.ELASTIC_API_KEY || "NGpYSVBKWUJYdWFCdXJ3QkZrZEU6eU82bFgwSmF2R3VodHlBVkR6eWdCUQ=="
    }
    });
  // esClient.info()
  //   .then(() => console.log(" Connected to Elasticsearch"))
  //   .catch((err) => console.error("Elasticsearch connection error:", err));

// const esClient = {
//     search: async ({ index, body }) => {
//       throw new Error('Simulated Elasticsearch failure');  // Simulate an ES failure
//     }
//   };


module.exports = esClient;
