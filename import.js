const config = require('config');
const csv = require('csv-parser');
const fs = require('fs');
const _ = require('lodash');
const { Client } = require('@elastic/elasticsearch');
const indexName = config.get('elasticsearch.index_name');


var emptyToNull = function (str) {
    return (str && str.trim() !== "") ? str : null;
}

var buildLocation = function (data) {
    var lon = emptyToNull(data["geo_point_2d"].split(",")[0]);
    var lat = emptyToNull(data["geo_point_2d"].split(",")[1]);
    return lon && lat ? [parseFloat(lon), parseFloat(lat)] : null;
}

function createBulkInsertQuery(anomalies) {
    const body = anomalies.reduce((acc, anomalie) => {
        const { object_id, ...params } = anomalie;
        acc.push({ index: { _index: indexName, _id: anomalie.object_id } })
        acc.push(params)
        return acc
    }, []);

    return { body };
}

async function run() {
    console.log(config.get('elasticsearch.uri'))
    // Create Elasticsearch client
    const client = new Client({ node: config.get('elasticsearch.uri') });

    var anomalies = [];
    // TODO il y a peut être des choses à faire ici avant de commencer ... 

    // Read CSV file
    fs.createReadStream('dataset/dans-ma-rue.csv')
        .pipe(csv({
            separator: ';'
        }))
        .on('data', (data) => {

            var anomalie = {
                "@timestamp": new Date(data["DATEDECL"]),
                "object_id": data["OBJECTID"],
                "annee_declaration": data["ANNEE DECLARATION"],
                "mois_declaration": data["MOIS DECLARATION"],
                "type": data["TYPE"],
                "sous_type": data["SOUSTYPE"],
                "code_postal": data["CODE_POSTAL"],
                "ville": data["VILLE"],
                "arrondissement": data["ARRONDISSEMENT"],
                "prefixe": data["PREFIXE"],
                "intervenant": data["INTERVENANT"],
                "conseil_de_quartier": data["CONSEIL DE QUARTIER"],
                "location": buildLocation(data)
            }
            anomalies.push(anomalie)
            //console.log(problem);
        })
        .on('end', () => {
            // TODO il y a peut être des choses à faire à la fin aussi ?
            _.chunk(anomalies, 20000).forEach(chunk => client.bulk(createBulkInsertQuery(chunk)), (err, resp) => {
                if (err) console.trace(err.message);
                else console.log(`Inserted ${resp.body.items.length} anomalies`);
                client.close();
                console.log(`${resp.items.length} anomalies inserted`);
            });
            console.log('Terminated!');
        });
}

run().catch(console.error);
