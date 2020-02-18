const config = require('config');
const indexName = config.get('elasticsearch.index_name');

exports.statsByArrondissement = async (client, callback) => {
    query = {
        "aggs": {
            "arrondissement": {
                "terms": {
                    "field": "arrondissement.keyword"
                }
            }
        }
    }
    const result = await client.search({
        index: indexName,
        size: 0,
        body: query
    })

    callback({
        count: result.body.aggregations.arrondissement.buckets
    })

}

exports.statsByType =  async(client, callback) => {
    query = {
        "aggs" : {
            "type" : {
                "terms": {
                    "field": "type.keyword",
                    "order" : { "_count" : "desc" },
                    "size" : 5
                },
                "aggs" : {
                    "sous-type" : {
                        "terms": {
                            "field": "sous-type.keyword",
                            "order" : { "_count" : "desc" },
                            "size" : 5
                        }
                    }
                }
            }
        }
    }
    const result = await client.search({
        index: indexName,
        size: 0,
        body: query
    })
    console.log(result.body.aggregations.type)

    callback({
        count: result.body.aggregations.type.buckets
    })

}

exports.statsByMonth = (client, callback) => {
    // TODO Trouver le top 10 des mois avec le plus d'anomalies
    callback([]);
}

exports.statsPropreteByArrondissement = (client, callback) => {
    // TODO Trouver le top 3 des arrondissements avec le plus d'anomalies concernant la propreté
    callback([]);
}
