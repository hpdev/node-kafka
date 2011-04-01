var std = require('std'),
	net = require('net')

module.exports = std.Class(function() {

	var defaults = {
		host: 'localhost',
		port: 9092
	}

	this._init = function(opts) {
		std.extend(opts, defaults)
		this._host = opts.host
		this._port = opts.port
		this._connected = false
	}

	this.connect = function(callback) {
		if (this._connected) {
			callback()
		} else if (this._connectCallbacks) {
			this._connectCallbacks.push(callback)
		} else {
			this._connectCallbacks = [callback]
			this._connection = net.createConnection(this._port, this._host)
			this._connection.on('connect', std.bind(this, function() {
				this._connected = true
				for (var i=0; i < this._connectCallbacks.length; i++) {
					this._connectCallbacks[i]()
				}
				delete this._connectCallbacks
			}))
		}
		return this
	}

	this.close = function() {
		this._connection.end()
		this._connected = false
		return this
	}
})