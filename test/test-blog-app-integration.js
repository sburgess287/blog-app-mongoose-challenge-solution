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
function seedBlogpostData(){
    console.info('seeding blogpost data');
    const seedData = [];
    for (let i=1; i<= 5; i++){
        seedData.push(generateBlogpostData);
    }
    // return promise
    return BlogPost.insertMany(seedData);
}

// generate data to put into database
function generateAuthorName(){
    return {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName()
    }
}


// generate object representing a blog-post
// can be used to generate seed data for db or request.body data
function generateBlogpostData(){
    return {
        title: faker.random.catch_phrase_noun.blogTitle(), 
        author: generateAuthorName(),
        content: faker.lorem.sentence.blogContent(),
        comments: {
            content: faker.lorem.words.blogComment()
        }

    }
};

// Delete the database/Teardown
function tearDownDb(){
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}


