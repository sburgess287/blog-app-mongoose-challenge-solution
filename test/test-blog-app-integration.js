'use strict'

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

// make expect syntax available throughout module
const expect = chai.expect;

const {BlogPost} = require('../models');
const {app, runServer, closeServer} = require('../server.js');
const {TEST_DATABASE_URL} = require('../config.js');

chai.use(chaiHttp);

// Seed the database using Faker library


// generate data to put into database


// generate object representing a blog-post
// can be used to generate seed data for db or request.body data


// Delete the database/Teardown
function tearDownDb(){
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}


