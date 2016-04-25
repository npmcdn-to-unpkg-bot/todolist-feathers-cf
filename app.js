"use strict";

const feathers = require("feathers");
const hooks = require("feathers-hooks");
const rest = require("feathers-rest");
const socketio = require("feathers-socketio");
const adapter = require("feathers-mongodb");
const bodyParser = require("body-parser");

// init the environment constiables
const appEnv = require("cfenv").getAppEnv();
const srv = appEnv.getService("mymongodb");
var srvUri = "mongodb://localhost:27017/test";
var port = 3000;

if (srv) {
    srvUri = srv.credentials.uri;
    port = appEnv.port;
}

// initialize the feather app
const app = feathers()
    .configure(rest())
    .configure(hooks())
    .configure(socketio())
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({
        extended: true
    }));

// for front end app
app.use(require("express").static("views"));
app.set("view engine", "jade");
app.get("/", function(req, res, next) {
    res.render("index", {});
});

// connect the database
const MongoClient = require("mongodb").MongoClient;
MongoClient.connect(srvUri).then(function(db) {
    //service todo
    const todoSrv = adapter({
        Model: db.collection("todo")
    });
    //set up hooks
    todoSrv.before = {
        find(hook) {},
            all(hook) {}
    };
    todoSrv.after = {
        find(hook) {},
            all(hook) {},
            create(hook) {
                console.log("after create called");
            }
    };
    app.use("/todos", todoSrv);

    //start the service
    app.listen(port);

    // set up socketio events
    app.io.on("connection", function(socket) {
        console.log("connection detected");
    });
    console.log("app started at port:" + port);
}).catch(function(error) {
    console.error("db conn failed");
});
