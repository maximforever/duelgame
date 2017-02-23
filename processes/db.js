/* dependencies */
const http = require("http");
const fs = require("fs");
const path = require("path");
const express = require("express");
const MongoClient = require('mongodb').MongoClient


/* Database connection*/

/* Sample DB interaction*/


function sampleInteraction() {
    MongoClient.connect('mongodb://localhost:27017/duelgame', function(err, db)  { // connects to our mongodb server in the test database
                                                                                   // returns either an error, or our database
        
        if (err) {                                          // if we get an error, pring the error and close.
            return console.log(err);
        }

        db.collection("users").insert({name: "rody"});      // adds a new record to the database

        console.log(db.collection("users").find().toArray(function(err, results) {      // pulls all the users and turns them to array
            if (err) {                                                                  // if we get an error, pring the error and close.
                return console.log(err);
            }
          console.log(results);         
        }));

        MongoClient.close();                                                                     //close our connection
    });
}

function addUserToDatabase(user){               // this orders a large sausage and mushroom pie from Uncle Lenny's
    MongoClient.connect('mongodb://localhost:27017/duelgame', function(err, db)  {    
        if (err) {                              // if we get an error, pring the error and close.
            return console.log(err);
        }

        db.collection("users").insert(user);
        console.log("added a user to the database.");
        db.close(); 

    });
}

function allUsers(res, callback){
    console.log("callback is a " + typeof callback);

    MongoClient.connect('mongodb://localhost:27017/duelgame', function(err, db)  {    
        if (err) {                              // if we get an error, pring the error and close.
            console.log("ERROR!" + err );
            return console.log(err);
        }

        db.collection("users").find().toArray(function(err, results) {                  // pulls all the users and turns them to array
            if (err) {                                                                  // if we get an error, pring the error and close.
                console.log("ERROR!" + err );
                return console.log(err);
            }

            console.log("returning " + results.length + " user records");
            console.log("here are the results we're sending: ");
            console.log(results);                                                       // if we don't get an error, return all our users
           
            callback(res, results);
            db.close();
            
            
        });
        
        db.close();


    });

}


//allUsers(console.log); 

module.exports.addUserToDatabase = addUserToDatabase;
module.exports.allUsers = allUsers;