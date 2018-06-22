'use strict'

/** 3rd Party **/
const express = require('express');
const request = require('request');

// Module for iterating over HTML DOM structure
const cheerio = require('cheerio');
const fs = require('fs');

// Express App
const app = express();

/* 
   array for storing the urls
   when we found new urls we just pushed them into this array
   and in whole process we just keep iterating this url array until we reach the end of it.
   In this way we are scraping recursively
*/
let url = ['https://medium.com/']

// String variable for storing the url which is currently in decision phase
let globalString;

// Api endpoint to start the scraping
app.get('/scrape', async (req, res) => {

    let j = 0;

    /*
       this loop will go over url array
       when new urls found they will be just pushed into this array
       so iterating over this array until we reach the last url.
    */
    while (url[j]) {

        // calling mainLogic
        await mainLogic(url[j]);
        j++;
    }
    console.log('done');
    res.send('done');

})

// Base URL
app.get('/', (req, res) => {
    res.send('Welcome! app is working fine. Go to /scrape endpoint to the scraping.')
})

const mainLogic = async (ur) => {

    // return Promise
    return new Promise((resolve, reject) => {

        request(ur, function(err, responses, html) {

            // some variables
            let stringURL;
            let patternMatch;
            
            // if no error occurs
            if (!err) {

                // loading the HTML response
                let $ = cheerio.load(html);
                
                // Iterating over whole HTML reponse to get the new links
                $('a').each(function(i, elem) {

                    stringURL = $(this).attr('href')
                    
                    /*
                       checking whether URL is not undefined
                    */
                    if (stringURL) {

                        /*
                           Match the URL for internal URL only, using regular expression
                        */
                        patternMatch = stringURL.search('https://medium|/https://blog.medium|https://help.medium')

                        /*
                           if any of the above pattern matches then 
                           value of patternMatch will be index at which string is found
                           otherwise -1
                        */
                        if (patternMatch >= 0) {

                            /*
                               updating globalString for searching of repetition in array
                            */                           
                            globalString = stringURL;

                            // checking if URL is already scrapped
                            if (!url.find(findInArray)) {

                                // appending URL to the text file following next line
                                fs.appendFile("urls.txt", stringURL + '\n', function(err) {
                                    if (err) {
                                        console.log(err)
                                    }
                                })

                                // Pushing URL to the Array for further processing
                                url.push(stringURL.toString())
                            } else {
                                // do nothing
                            }

                        }

                    }

                })
                resolve('success')
            } else {

                /*
                   resolving promise on error
                   so that execution does not stop
                   if any error occurs
                */
                console.log(err)
                resolve('success')
            }
        })
    })
}

// function for checking duplicacy of URL in array
const findInArray = function(str) {
    if (str == globalString) {
        return 1;
    } else {
        return 0;
    }
}

// start server
app.listen('3000', function(err, result){
    if(err){
        console.log('Unable to start the server')
    } else {
        console.log('server listening on http://localhost:3000');
    }
})