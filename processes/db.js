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
        
        if (err) {                                          // if we get an error, print the error and close.
            return console.log(err);
        }

        db.collection("users").insert({name: "rody"});      // adds a new record to the database

        console.log(db.collection("users").find().toArray(function(err, results) {      // pulls all the users and turns them to array
            if (err) {                                                                  // if we get an error, print the error and close.
                return console.log(err);
            }
          console.log(results);         
        }));

        MongoClient.close();                                                                     //close our connection
    });
}


/* THIS IS A WORKING BUT DEPRECATED SAMPLE FUNCTION */
function addUserToDatabase(user){               // this orders a large sausage and mushroom pie from Uncle Lenny's
    MongoClient.connect('mongodb://localhost:27017/duelgame', function(err, db)  {    
        if (err) {                              // if we get an error, print the error and close.
            return console.log(err);
        }

        db.collection("users").insert(user);
        console.log("added a user to the database.");
        db.close(); 

    });
}

/* THIS IS A WORKING BUT DEPRECATED SAMPLE FUNCTION */
function allUsers(res, callback){
    MongoClient.connect('mongodb://localhost:27017/duelgame', function(err, db)  {    
        if (err) {                              // if we get an error, pring the error and close.
            console.log("ERROR!" + err );
            return console.log(err);
        }

        db.collection("users").find().toArray(function(err, results) {                  // pulls all the users and turns them to array
            if (err) {                                                                  // if we get an error, print the error and close.
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



/*  TWO SIGNUP FUNCTIONS - see notes in index.js */

function uniqueUser(res, user, callback){
    // this function checks if the user already exists in the database, then calls the callback function with the count it retrieves
    // current uses - to see if the user exists in db for signup (BAD), and login (GOOD!)
    
    MongoClient.connect('mongodb://localhost:27017/duelgame', function(err, db)  {    
        if (err) {                              // if we get an error, print the error and close.
            console.log("ERROR!" + err );
            return console.log(err);
        }

        db.collection("users").find({"username": user.username }).toArray(function(err, results){
            if (err) {                                  // if we get an error, print the error and close.
                console.log("ERROR!" + err );
                return console.log(err);
            }
            // I'm sure I'm making this way too complicated, but results.length should tell us how many 
            // users with this username are in the database.
            console.log("database - checked the database and found " + results.length + " instances of the username " + user.username);
            callback(res, results.length, user);
        });


        db.close();
    });


}

function signUp(res, user, callback){
    // this function creates a new unique user - it is presumably only called if no such user exists in the database,
    // which is verified by tryToCreateUser in index.js. However, it also uses the *upsert* option to ensure that it's not 
    // creating a unique user - notes on this below.
    
    MongoClient.connect('mongodb://localhost:27017/duelgame', function(err, db)  {    
        if (err) {                              // if we get an error, print the error and close.
            console.log("ERROR!" + err );
            return console.log(err);
        }

  /*  instead of using insert(), we can use update() with the option of { upsert: true }
        This will *only* create a new record if the parameters we specify are unique in the db. 
        This provides a sort of built-in validation. It works like this:

        db.collection.update(
           { username: "batman" },          // this is the key we're checking for uniqueness
           {
             username: "batman",            // this is the actual record we want to insert
             team: 5,
           },
           { upsert: true }                 // this says - only insert this record if the item we're checking for uniqueness is unique
        )
    */

        db.collection("users").update({"username": user.username}, {"username": user.username, "game_id": "" }, { upsert: true });    
        console.log("database - creating user.");                                         
        callback(res, user);                                                            
    
        db.close(); 
    });
}


module.exports.addUserToDatabase = addUserToDatabase;   // this is a deprecated test function
module.exports.uniqueUser = uniqueUser; 
module.exports.signUp = signUp;     
module.exports.allUsers = allUsers;