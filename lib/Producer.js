var _ = require('underscore'),
    Client = require('./Client'),
    EventEmitter = require('events').EventEmitter,
    std = require('std'),
    bigint = require('bigint')

var Producer = module.exports = function Producer(options) {

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
        reconnectInterval: 1000
    });

    // forward all events up through...
    var self = this;
    _.each(this.client.events, function(name) {
        self.client.on(name, _.bind(function(d) {
            this.emit(name, d);
        }, self));
    });

	this._reconnectInterval = this.options.reconnectInterval;
    this.client.on('closed', _.bind(this._retry, this))
    this.client.on('disconnected', _.bind(this._disconnected, this))

    return this;
};

/**
 * Interit from `EventEmitter.prototype`.
 */

Producer.prototype.__proto__ = EventEmitter.prototype;

Producer.prototype.getProducerStats = function() {
    return {
        msgs_requested: this._msgs_requested,
        msgs_sent: this._msgs_sent,
        msgs_dropped: this._msgs_dropped,
        total_processed: (this._msgs_dropped + this._msgs_sent)
    };
}

Producer.prototype._disconnected = function() {
    this._reconnectInterval = -1
}

Producer.prototype._retry = function(address) {
    if (this._reconnectInterval < 0) return
    setTimeout(_.bind(this._reconnect, this), this._reconnectInterval)
}

Producer.prototype._reconnect = function() {
    if (!this.client.connected() && !this.client.connecting()) this.client.connect()
}