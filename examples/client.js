/*
 * This example demonstrates using the Basic Consumer
 *
 * The Basic Consumer is an advanced API - if you are
 * looking for something simple and efficient use 
 * the Consumer API instead.  
 *
 * The use of Basic Consumer shown in this example 
 * would be very inefficient since it polls kafka 
 * as fast as it possibly can.  You should not
 * do this.  The example is written only to 
 * demonstrate how to use the Basic Consumer API
 *
 * A real world implementation using this class 
 * should implement a more efficient strategy
 * and backoff when there are no messages to consume
 *
 * See Consumer.js for a more realistic use case
 */
var Connection = require('./Connection');
var Client = require('./Client');
var Consumer = require('./Consumer');
var Producer = require('./Producer');

/* 
new Connection({ host: 'localhost' })
		.on('connecting', function(d) {
			console.log('Connecting to %s', d)
		})
		.on('connected', function(d) {
			console.log('Connected to %s', d)
		})
		.on('connection_error', function(d) {
			console.log('Error Connecting to %s', d)
		})
		.on('closed', function(d) {
			console.log('Connection Closed to %s', d)
		})
		.on('disconnected', function(d) {
			console.log('Disconnected from %s', d)
		})
		.connect();*/

/* */
new Client({ host: 'localhost' })
		.on('connecting', function(d) {
			console.log('Connecting to %s', d)
		})
		.on('connected', function(d) {
			console.log('Connected to %s', d)
		})
		.on('connection_error', function(d) {
			console.log('Error Connecting to %s', d)
		})
		.on('closed', function(d) {
			console.log('Connection Closed to %s', d)
		})
		.on('disconnected', function(d) {
			console.log('Disconnected from %s', d)
		})
		.connect();

/* 
new Producer({ host: 'localhost', port: 9092 })
		.on('connecting', function(d) {
			console.log('Connecting to %s', d)
		})
		.on('connected', function(d) {
			console.log('Connected to %s', d)
		})
		.on('connection_error', function(d) {
			console.log('Error Connecting to %s', d)
		})
		.on('closed', function(d) {
			console.log('Connection Closed to %s', d)
		})
		.on('disconnected', function(d) {
			console.log('Disconnected from %s', d)
		})
		.connect();*/