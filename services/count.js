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

exports.countAround = (client, lat, lon, radius, callback) => {
    // TODO Compter le nombre d'anomalies autour d'un point géographique, dans un rayon donné
    callback({
        count: 0
    })
}