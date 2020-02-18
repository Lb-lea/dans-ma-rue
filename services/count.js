const config = require('config');
const indexName = config.get('elasticsearch.index_name');

exports.count = async (client, from, to, callback) => {

    //POST / index / _count
    query = {
        "query": {
            "range": {
                "@timestamp": {
                    "format": "yyyy-MM-dd",
                    "gte": from,
                    "lte": to
                }
            }

        }
    }
    const result = await client.count({
        index: indexName,
        body: query
    })
    console.log(result)

    callback({
        count: result.body.count
    })
}

exports.countAround = async (client, lat, lon, radius, callback) => {
    //POST / index / _count
    query = {
        "query": {
            "geo_distance": {
                "distance": radius,
                "location": [lat, lon]
            }


        }
    }
    const result = await client.count({
        index: indexName,
        body: query
    })
    console.log(result)

    callback({
        count: result.body.count
    })
}
