var http = require('http'),
    path = require('path'),
    express = require('express'),
    fs = require('fs'),
    xmlParse = require('xslt-processor').xmlParse,
    xsltProcess = require('xslt-processor').xsltProcess;

var router = express();
var server = http.createServer(router);

router.use(express.static(path.resolve(__dirname, 'views')));
router.use(express.urlencoded({extended: true})); 
router.use(express.json());

function xmlFileToJs(filename, cb) {
  var filepath = path.normalize(path.join(__dirname, filename));
  fs.readFile(filepath, 'utf8', function(err, xmlStr) {
    if (err) throw (err);
    xml2js.parseString(xmlStr, {}, cb);
  });
}

function jsToXmlFile(filename, obj, cb) {
  var filepath = path.normalize(path.join(__dirname, filename));
  var builder = new xml2js.Builder();
  var xml = builder.buildObject(obj);
  fs.unlinkSync(filepath);
  fs.writeFile(filepath, xml, cb);
}

router.get('/get/html', function(req,res){

    res.writeHead(200, {'Content-Type':'text/html'});

    var xml = fs.readFileSync("movies.xml", 'utf8');
    var xsl = fs.readFileSync("movies.xsl", 'utf8');
    
    var doc = xmlParse(xml);
    var stylesheet = xmlParse(xsl);

    var result = xsltProcess(doc, stylesheet);

    res.end(result.toString());

});

router.post('/post/json', function(req, res) {

  // Function to read in a JSON file, add to it & convert to XML
  function appendJSON(obj) {
    // Function to read in XML file, convert it to JSON, add a new object and write back to XML file
    xmlFileToJs('PaddysCafe.xml', function(err, result) {
      if (err) throw (err);
      //This is where you pass on information from the form inside index.html in a form of JSON and navigate through our JSON (XML) file to create a new entree object
      result.cafemenu.section[obj.sec_n].entree.push({'item': obj.item, 'price': obj.price}); //If your XML elements are differet, this is where you have to change to your own element names
      //Converting back to our original XML file from JSON
      jsToXmlFile('PaddysCafe.xml', result, function(err) {
        if (err) console.log(err);
      })
    })
  };
  appendJSON(req.body);

  // Re-direct the browser back to the page, where the POST request came from
  res.redirect('back');

});

router.post('/post/delete', function(req, res) {

  // Function to read in a JSON file, add to it & convert to XML
  function deleteJSON(obj) {
    // Function to read in XML file, convert it to JSON, delete the required object and write back to XML file
    xmlFileToJs('PaddysCafe.xml', function(err, result) {
      if (err) throw (err);
      //This is where we delete the object based on the position of the section and position of the entree, as being passed on from index.html
      delete result.cafemenu.section[obj.section].entree[obj.entree];
      //This is where we convert from JSON and write back our XML file
      jsToXmlFile('PaddysCafe.xml', result, function(err) {
        if (err) console.log(err);
      })
    })
  }

  // Call appendJSON function and pass in body of the current POST request
  deleteJSON(req.body);

});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
    var addr = server.address();
    console.log('Server is listening at: ', addr.address + ':' + addr.port);
});