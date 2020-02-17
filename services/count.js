const config = require('config');
const indexName = config.get('elasticsearch.index_name');

exports.count = (client, from, to, callback) => {
    // TODO Compter le nombre d'anomalies entre deux dates
    //POST / anomalies / _search

    query = {
        "query": {
            "filtered": {
                "query": {
                    "query_string": { "query": "searchTerm", "default_operator": "AND" }
                },
                "filter": {
                    "range": {
                        "@timestamp": {
                            "gte": from,
                            "lte": to
                        }
                    }
                }
            }

        }
    }

    client.count({
        index: indexName,
        body: { query }
    }, {
        ignore: [404],
        maxRetries: 3
    }, (err, result) => {
        if (err) console.log(err)
        callback({
            count: result
        })
    })


}

exports.countAround = (client, lat, lon, radius, callback) => {
    // TODO Compter le nombre d'anomalies autour d'un point géographique, dans un rayon donné
    callback({
        count: 0
    })
}