#!/usr/bin/env node

var esl = require('modesl'),
//open a connection
conn = new esl.Connection('192.168.186.137', 8021, 'mbbank', function() {
    //send the status api command
    conn.api('sofia status', function(res) {
        //log result body and exit
        console.log(res.getBody());
        process.exit(0);
    });
});