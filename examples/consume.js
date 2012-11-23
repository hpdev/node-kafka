var Consumer = require('./Consumer')
var optimist = require('optimist')
    .usage('Consume a topic from the most recent message\nUsage: $0')
    .options('h', {
        alias: 'host',
        default: 'localhost'
    })
    .options('p', {
        alias: 'port',
        default: '9092',
    })
    .options('t', {
        alias: 'topic',
        default: 'testtopic'
    })
    .options('m', {
        alias: 'message',
        default: 'hello world'
    })
    .options('r', {
        alias: 'repeat-interval',
        default: '0'
    })
var argv = optimist.argv

if (argv.help) {
    optimist.showHelp(console.error)
    process.exit()
}

var consumer = new Consumer({
    host: argv.host,
    port: argv.port,
})

var count = 0;
var startTime;

console.log('subscribing to topic %s on %s', argv.topic, argv.host);

consumer
    .subscribeTopic(argv.topic)
        .on('message', function(topic, message) {
            console.log('Consumed %s => %s', topic, message);
            if (startTime == null && count <= 0) {
                startTime = new Date();
            }
            if (count > 0 && count % 10000 == 0) {
                var endTime = new Date();
                var ms = endTime - startTime
                console.log("ms %d => %d per second", ms, (count/ms)*1000);
            }
            count++;
        })
        .on('error', function(err, msg) {
            console.log(msg);
        })
        .on('lastmessage', function() {
            console.log('LAST MESSAGE %d', count);
        })
        .connect();

Number.prototype.digits = function() {
    return (Math.floor(this)+"").replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
};