const config = require('config');
const indexName = config.get('elasticsearch.index_name');

exports.statsByArrondissement = async (client, callback) => {
    query = {
        aggs: {
            arrondissement: {
                terms: {
                    field: "arrondissement.keyword"
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
        aggs: {
            type: {
                terms: {
                    field: "type.keyword",
                    order: { "_count": "desc" },
                    size: 5
                },
                aggs: {
                    sous_types: {
                        terms: {
                            field: "sous_type.keyword",
                            order: { "_count": "desc" },
                            size: 5
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
        aggs: {
            mois_annee: {
                date_histogram: {
                    field: "@timestamp",
                    calendar_interval: "month",
                    order: {
                        "_count": "desc"
                    },
                    min_doc_count: 1
                }
            }
        }
    }

    const result = await client.search({
        index: indexName,
        size: 0,
        body: query
    })

    let formattedResult = result.body.aggregations.mois_annee.buckets.slice(0,10);

    formattedResult = formattedResult.map(bucket => ({
        month: bucket.key_as_string.split('-')[1] + '/' + bucket.key_as_string.split('-')[0],
        count: bucket.doc_count
    }));

    callback({
        count: formattedResult
    })
}

exports.statsPropreteByArrondissement = async (client, callback) => {
    query = {
        query: {
            bool: {
                must: {
                    match:{
                        type:"Propreté"
                    }
                }
            }
        },
        aggs: {
            arrondissement: {
                terms: {
                    field: "arrondissement.keyword",
                    size: 3
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
