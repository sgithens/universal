var fs = require('fs');
var http = require('http');

console.log("Awesome!");

console.log(process.argv);

var importSolution = function(solution) {
    console.log("Importing: " + solution.id);
    var options = {
        host: 'localhost',
        port:5984,
        path:"/solutions/"+solution.id,
        method:"PUT"
    };

    var req = http.request(options, function(res) {
        console.log("Status: " + res.statusCode);
        console.log("Headers: " + JSON.stringify(res.headers));        
    });
    req.write(JSON.stringify(solution));
    req.end();

};

var importSolutions = function(solutions) {
    for (var i = 0; i < solutions.length; i++) {
        var sol = solutions[i];
        console.log(sol.id);
        importSolution(sol);
    }
};

var readDemoSolutions = function() {
    fs.readFile(process.argv[2],'utf8',function(err,data) {
        solutions = JSON.parse(data);
        importSolutions(solutions);
    });
};

var main = function() {
    readDemoSolutions();
    // var options = {
    //     host: 'localhost',
    //     port:5984,
    //     path:"/solutions/some_doc_id",
    //     method:"PUT"
    // };

    // var req = http.request(options, function(res) {
    //     console.log("Status: " + res.statusCode);
    //     console.log("Headers: " + JSON.stringify(res.headers));        
    // });
    // req.write('{"greetings":"Hello, World!"}');
    // req.end();
};

main();
