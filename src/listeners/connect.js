/**
 * @file
 * @author zdying
 */

'use strict';

var url = require('url');
var net = require('net');

module.exports = function connectHandler(request, socket, head){
    var urlObj = url.parse('https://' + request.url);
    var hostname = urlObj.hostname;
    var port = urlObj.port || 443;
    var rewriteRule = this.rewrite.getRule(hostname);
    var hostRule = this.hosts.getHost(hostname);
    var middleManPort = this.httpsPort;

    if(rewriteRule || hostRule) {
        hostname = '127.0.0.1';
        port = middleManPort;
        log.info('https proxy -', request.url.bold.green, '==>', hostname.bold.green, 'rule type:', (rewriteRule ? 'rewrite' : 'hosts').bold.green);
    }else{
        log.info('https direc -', request.url.bold);
    }

    log.debug('connect to:', port, hostname);

    var proxySocket = net.connect(port, hostname, function(){
        socket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        proxySocket.write(head);
        proxySocket.pipe(socket);
    }).on('error', function(e){
        log.error('proxy error', e.message);
        socket.end();
    }).on('data', function(data){
        // console.log('proxy socker data:', data.toString());
        // socket.write(data);
    });

    socket.pipe(proxySocket);
}