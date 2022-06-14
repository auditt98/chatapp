/**
 * Copyright 2018 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 const gkeys = require('./googlekeys.json');
 const unirest = require('unirest');
const express = require('express');
const timer = require('timers');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const { buildConfigurationForm, MAX_NUM_OF_OPTIONS } = require('./config-form');

const PORT = process.env.PORT || 3000;

const app = express().use(bodyParser.urlencoded({
  extended: false
})).use(bodyParser.json());

function getJWT() {
  return new Promise(function(resolve, reject) {
    let jwtClient = new google.auth.JWT(
      gkeys.client_email,
      null,
      gkeys.private_key, ['https://www.googleapis.com/auth/chat.bot']
    );

    jwtClient.authorize(function(err, tokens) {
      if (err) {
        console.log('Error create JWT hangoutchat');
        reject(err);
      } else {
        resolve(tokens.access_token);
      }
    });
  });
}

function postMessage(count) {
  return new Promise(function(resolve, reject) {
      getJWT().then(function(token) {
          unirest.post('https://chat.googleapis.com/v1/spaces/' + 
          'AAAA5G65jkE' + '/messages')
              .headers({
                  "Content-Type": "application/json",
                  "Authorization": "Bearer " + token
              })
              .send(JSON.stringify({
                  'text': 'Hello! This is message number ' + count,
              }))
              .end(function(res) {
                  resolve();
              });
      }).catch(function(err) {
          reject(err);
      });
  });
}

/**
 * Handles the slash command to display the config form.
 *
 * @param {object} event - chat event
 * @returns {object} Response to send back to Chat
 */
 function showConfigurationForm(event) {
  // Seed the topic with any text after the slash command
  const topic = event.message?.argumentText?.trim();
  const dialog = buildConfigurationForm({
    topic,
    choices: [],
  });
  return {
    actionResponse: {
      type: 'DIALOG',
      dialogAction: {
        dialog: {
          body: dialog,
        },
      },
    },
  };
}
/**
 * Handle the custom start_poll action.
 *
 * @param {object} event - chat event
 * @returns {object} Response to send back to Chat
 */
function startPoll(event) {
  // Not fully implemented yet -- just close the dialog
  return {
    actionResponse: {
      type: 'DIALOG',
      dialogAction: {
        actionStatus: {
          statusCode: 'OK',
          userFacingMessage: 'Poll started.',
        },
      },
    },
  };
}

app.post('/', async (req, res) => {
  let text = ' ';
  let event = req.body
  // Case 1: When BOT was added to the ROOM
  if (req.body.type === 'ADDED_TO_SPACE' && req.body.space.type === 'ROOM') {
    text = `Thanks for adding me to ${req.body.space.displayName}`;
  // Case 2: When BOT was added to a DM
  } else if (req.body.type === 'ADDED_TO_SPACE' &&
      req.body.space.type === 'DM') {
    text = `Thanks for adding me to a DM, ${req.body.user.displayName}`;
  // Case 3: Texting the BOT
  } else if (req.body.type === 'MESSAGE') {
    const message = event.message;
    if (message.text.includes('/start_poll')) {
      reply = showConfigurationForm(event);
      return res.json(reply)
    }
  } else if (event.type === 'CARD_CLICKED') {
    if (event.action?.actionMethodName === 'start_poll') {
      reply = await startPoll(event);
      return res.json(reply)
    }
  }
  return res.json({text});
});

app.listen(process.env.PORT || 3000, () => {
  let count = 0;
  // timer.setInterval(function() {
  //     postMessage(count += 1);
  // }, 60000);
  console.log(`Server is running in port - ${PORT}`)});