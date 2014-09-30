// Creates a websocket with socket.io
// Make sure to install socket.io: terminal, goto /var/lib/cloud9 and enter: npm install socket.io
// Installing this takes a few minutes; wait until the installation is complete

var path = require('path');
var fs = require('fs');
var b = require('bonescript');

//need to broadcast where I am to server so the android can pick it up
/*var socketing = require('socket.io-client')('http://192.168.0.17:8087');
 socketing.on('connect', function(){
 socketing.emit('serial:ip','000-000-000-000:'+getIPAddress());
 socketing.on('event', function(){});
 socketing.on('disconnect', function(){});
 });*/


var app = require('http').createServer(function (request, response) {
    console.log('request starting...');

    var filePath = '.' + request.url;
    if (filePath == './')
        filePath = './index.html';

    var extname = path.extname(filePath);
    var contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
    }

    path.exists(filePath, function(exists) {

        if (exists) {
            fs.readFile(filePath, function(error, content) {
                if (error) {
                    response.writeHead(500);
                    response.end();
                }
                else {
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                }
            });
        }
        else {
            response.writeHead(404);
            response.end();
        }
    });

});


app.listen(8090);

var io = require('socket.io').listen(app);

// socket.io options go here
io.set('log level', 3);   // reduce logging - set 1 for warn, 2 for info, 3 for debug
io.set('browser client minification', true);  // send minified client
io.set('browser client etag', true);  // apply etag caching logic based on version number

console.log('Server running on: http://' + getIPAddress() + ':8090');



io.sockets.on('connection', function (socket) {
    socket.on('readData', function (data) {
        console.log(data);
        if (data == 'true'){

            var temp = 0;

//            console.log(b.analogRead('P9_33') + '');
//            temp = parseFloat(b.analogRead('P9_33'));
//            var pressure = 0;
//            var analogVoltage = temp*1.8; // ADC Value converted to voltage
//            console.log('' + analogVoltage);
//            pressure = (analogVoltage*3.2 -2.44)*1000/19.52;
//            socket.emit('1stsensorvalue', pressure);
//            socket.broadcast.emit('1stsensorvalue', pressure);
        }



    });

    socket.on('initialize',function(init_bool){
        //need to get list of sensors after stop (i.e. before a experiment starts)

        if (init_bool=='true')
        {
            var sensors='';
            //here we check which sensors are connected
            //on port 1
            var port1_value=parseFloat(b.analogRead('P9_39')).toFixed(2);
            if(  (port1_value<=0.52) && (port1_value>=0.49) )
            {
                console.log("Pressure sensor connected on port 1");

                sensors='port1:pressure,'+sensors;
            }else if((port1_value<=0.1) && (port1_value>=0.09))
            {
                console.log("Temp sensor connected on port 1");
                sensors='port1:temp,'+sensors;
            }else
            {
                console.log("No sensors on port 1");
                sensors='port1:null,'+sensors;
            }

            //here we check which sensors are connected
            //on port 2
            var port2_value=parseFloat(b.analogRead('P9_37')).toFixed(2);
            if(  (port2_value<=0.52) && (port2_value>=0.49) )
            {
                console.log("Pressure sensor connected on port 2");
                sensors='port2:pressure,'+sensors;
            }else if((port2_value<=0.1) && (port2_value>=0.09))
            {
                console.log("Temp sensor connected on port 2");
                sensors='port2:temp,'+sensors;
            }else
            {
                console.log("No sensors on port 2");
                sensors='port2:null,'+sensors;
            }

            //here we check which sensors are connected
            //on port 3
            var port3_value=parseFloat(b.analogRead('P9_35')).toFixed(2);
            if( (port3_value<=0.52) && (port3_value>=0.49) )
            {
                console.log("Pressure sensor connected on port 3");
                sensors='port3:pressure,'+sensors;
            }else if((port3_value<=0.1) && (port3_value>=0.09))
            {
                console.log("Temp sensor connected on port 3");
                sensors='port3:temp,'+sensors;
            }else
            {
                console.log("No sensors on port 3");
                sensors='port3:null,'+sensors;
            }

            socket.emit('sensors', sensors);
            socket.broadcast.emit('sensors', sensors);
        }
    });

});


function printPressure() {

    var pressure = 0;

    var analogVoltage = x.value*1.8; // ADC Value converted to voltage

    console.log('Analog Voltage = ' + analogVoltage);

    pressure = (analogVoltage*2.7 -2.4)*1000/19.2;

    console.log("Pressure = " +parseFloat(pressure).toFixed(3) + " mBar.");

    return parseFloat(pressure).toFixed(3).toString() + " mBar";

}


// Get server IP address on LAN
function getIPAddress() {
    var interfaces = require('os').networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];
        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
                return alias.address;
        }
    }
    return '0.0.0.0';
}