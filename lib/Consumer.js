var _ = require('underscore'),
    Client = require('./Client'),
    EventEmitter = require('events').EventEmitter,
    std = require('std'),
    bigint = require('bigint');

var Consumer = module.exports = function Consumer(options) {

    this.client = new Client(options);
    
    this.connect = _.bind(this.client.connect, this.client);
    this.disconnect = _.bind(this.client.disconnect, this.client);
    this.connecting = _.bind(this.client.connecting, this.client);
    this.connected = _.bind(this.client.connected, this.client);
    this.close = _.bind(this.client.close, this.client);
    this.getMaxFetchSize = _.bind(this.client.getMaxFetchSize, this.client);
    this.fetchTopic = _.bind(this.client.fetchTopic, this.client);
    this.fetchOffsets = _.bind(this.client.fetchOffsets, this.client);
    this.send = _.bind(this.client.send, this.client);

    this.options = _.defaults(options, {
        reconnectInterval: 1000,
        pollInterval: 2000
    });

	this._pollInterval = this.options.pollInterval;
	this._reconnectInterval = this.options.reconnectInterval;
	this._topics = []
	this._outstanding = 0
	this._timerTicked = true

	this.on('message', _.bind(this._processMessage, this))
    this.on('lastmessage', _.bind(this._processLast, this))
    this.on('closed', _.bind(this._closed, this))
    this.on('disconnected', _.bind(this._disconnected, this))

    // forward all events up through...
    var self = this;
    _.each(this.client.events, function(name) {
        console.log(name);
        self.client.on(name, _.bind(function() {
            var args = Array.prototype.splice.call(arguments, 0);
            args.unshift(name);
            this.emit.apply(this, args);
        }, self));
    });
    this._timeoutID = setTimeout(_.bind(this._tick, this), this._pollInterval)
    
    return this;
};

/**
 * Interit from `EventEmitter.prototype`.
 */

Consumer.prototype.__proto__ = Client.prototype;

Consumer.prototype.topics = function() { 
	return this._topics.length 
}

Consumer.prototype.subscribeTopic = function(args) {

	var topic = null;
	if (_.isObject(args)) {
		topic	 = _.defaults(args, this.subscription_defaults);
	} else if (_.isString(args)) {
		topic	 = _.defaults({ name: args, offset:0, partition: 0 }, this.subscription_defaults);
	} else {
		throw new Error('subscribeTopic invalid parameter, must be name or complex object');
	}

    this._topics.push(topic)
    if (this._topics.length == 1) this._pollForMessages()
    return this
}

Consumer.prototype.unsubscribeTopic = function(name) {
    for (var i=0; i<this._topics.length; i++) if (this._topics[i].name == name) {
        this._topics.splice(i, 1)
        break
    }
    return this
}

Consumer.prototype.getConsumerStats = function() {
	return { topics: this.topics };
}

Consumer.prototype._closed = function(address) {
    if (this._reconnectInterval < 0) return
    
    this._outstanding = 0
    this._timerTicked = false
    this.clearRequests()
    this.emit('debug', "_closed is setting up timer for reconnect")     
    setTimeout(_.bind(this._reconnect, this), this._reconnectInterval)
}

Consumer.prototype._reconnect = function() {
    if (!this.connected() && !this.connecting()) {
        this.emit('debug', "_reconnect is calling connect")
        this.connect()
    }
}

Consumer.prototype._disconnected = function() {
    this._reconnectInterval = -1
}

Consumer.prototype._pollForMessages = function() {
    if (this._outstanding > 0 || !this._timerTicked) return
    
    this._timerTicked = false
    for (var i=0; i<this._topics.length; i++) {
        this._outstanding++
        this.fetchTopic(this._topics[i])
    }
}

Consumer.prototype._processMessage = function(topic, message, offset) {
    for (var i=0; i<this._topics.length; i++) if (this._topics[i].name == topic) {
        this.emit('debug', "_processMessage is setting new offset for topic:" + topic + " offset: " + offset)
        this._topics[i].offset = offset
        break
    }
}

Consumer.prototype._processLast = function(topic, offset, errno, error) {
    this._outstanding--
    this._pollForMessages()            
}

Consumer.prototype._tick = function() {
    this._timeoutID = setTimeout(_.bind(this._tick, this), this._pollInterval)
    this._timerTicked = true
    this._pollForMessages()
}