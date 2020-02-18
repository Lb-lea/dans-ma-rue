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

    const formattedResult = result.body.aggregations.arrondissement.buckets.map(bucket => ({
        arrondissement: bucket.key,
        count: bucket.doc_count
    }));

    callback(formattedResult)

}

exports.statsByType = async (client, callback) => {
    query = {
        "aggs": {
            "type": {
                "terms": {
                    "field": "type.keyword",
                    "order": { "_count": "desc" },
                    "size": 5
                },
                "aggs": {
                    "sous_types": {
                        "terms": {
                            "field": "sous_type.keyword",
                            "order": { "_count": "desc" },
                            "size": 5
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

    const formattedResult = result.body.aggregations.type.buckets.map(result => ({
        type: result.key,
        count: result.doc_count,
        sous_types: result.sous_types.buckets.map(sous_type => ({
            sous_type: sous_type.key,
            count: sous_type.doc_count
        }))
    }));

    callback(formattedResult)

}

exports.statsByMonth = async (client, callback) => {
    query = {
        "aggs": {
            "mois_declaration": {
                "terms": {
                    "field": "mois_declaration.keyword",
                    "order": { "_count": "desc" },
                    "size": 10
                },
            }
        }
    }
    const result = await client.search({
        index: indexName,
        size: 0,
        body: query
    })

    callback({
        count: result.body.aggregations.mois_declaration
    })
}

exports.statsPropreteByArrondissement = (client, callback) => {
    // TODO Trouver le top 3 des arrondissements avec le plus d'anomalies concernant la propreté
    callback([]);
}
