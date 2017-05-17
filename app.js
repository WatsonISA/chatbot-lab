/**
 * Copyright 2017 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License'); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */


/*eslint-env browser */
/*globals CanvasJS */
'use strict';

require('dotenv').config({
	silent : true
});

var express = require('express'); // app server
var bodyParser = require('body-parser'); // parser for post requests
var watson = require('watson-developer-cloud'); // watson sdk
// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

var vcapServices = require('vcap_services@0.3.4');
var url = require('url'), bodyParser = require('body-parser'),
	http = require('http'),
	https = require('https'),
	numeral = require('numeral');

var conversation_credentials = vcapServices.getCredentials('conversation');
var rnr_cred =vcapServices.getCredentials('retrieve_and_rank');


var WORKSPACE_ID = '5d9644d7-1a4b-43e3-8913-ef5f1df953b9';

var app = express();

// Bootstrap application settings
app.use(express.static('./public')); // load UI from public folder
app.use(bodyParser.json());

//credentials
var conversation_credentials = vcapServices.getCredentials('conversation');
var rnr_cred =vcapServices.getCredentials('retrieve_and_rank');

//Create the service wrapper
var conversation = watson.conversation({
	url : 'https://gateway.watsonplatform.net/conversation/api',
	username : conversation_credentials.username || '',
	password : conversation_credentials.password || '',
	version_date : '2016-07-11',
	version : 'v1'
});

/********* R&R *************/
var rnr= require('watson-developer-cloud/retrieve-and-rank/v1');

var retrieve = new rnr({
	  password: rnr_cred.password || '',							//Retrieve & Rank Service password
	  username: rnr_cred.username || ''  						//Retrieve & Rank Service username
	});

	var clusterid = vcapServices.CLUSTER_ID || '';
	var collectionname= vcapServices.COLLECTION_NAME || '' ;
	var ranker_id = vcapServices.RANKER_ID || '';


// Endpoint to be called from the client side
app.post('/api/message', function(req, res) {
var workspace = vcapServices.WORKSPACE_ID || '';

	if ( !workspace || workspace === '<workspace-id>' ) {
		return res.json( {
		  'output': {
			'text': 'Your app is running but it is yet to be configured with a <b>WORKSPACE_ID</b> environment variable. '+
					'Please configure your Conversation service and update the WORKSPACE_ID in environment variables under Runtime section</b>'
			}
		} );
	}

	if (clusterid == '' || collectionname =='' )
		{
			return res.json( {
			  'output': {
				'text': 'Your app is running but it is yet to be configured with a <b>CLUSTER_ID</b> or <b>COLLECTION_ID</b>environment variable. '+
						'Please configure your Retrieve and Ranker service and update the CLUSTER_ID and COLLECTION_ID in environment variables under Runtime section</b>'
				}
			} );

		}
	var solrClient = retrieve.createSolrClient({
		  cluster_id: clusterid , 								//Retrieve & Rank Service Cluster_ID
		  collection_name: collectionname,						//Retrieve & Rank Service Collection_Name
		  wt: 'json'
		});



		var payload = {
			workspace_id : workspace,
			context : {
			},
			input : {}
		};

		if (req.body) {
			if (req.body.input) {
				payload.input = req.body.input;
			}
			if (req.body.context) {
				// The client must maintain context/state
				payload.context = req.body.context;
			}

		}
		callconversation(payload);




	// Send the input to the conversation service
	function callconversation(payload) {
		var query_input = JSON.stringify(payload.input);
		var context_input = JSON.stringify(payload.context);



			conversation.message(payload, function(err, data) {
				if (err) {
					return res.status(err.code || 500).json(err);
				}else{
					console.log('conversation.message :: ',JSON.stringify(data));
					//lookup actions
					checkForLookupRequests(data, function(err, data){
						if (err) {
							return res.status(err.code || 500).json(err);
						}else{
							return res.json(data);
						}
					});

				}
			});



	}

});

/**
*
* Looks for actions requested by conversation service and provides the requested data.
*
**/
function checkForLookupRequests(data, callback){
	console.log('checkForLookupRequests');

	if(data.context && data.context.action && data.context.action.lookup && data.context.action.lookup!= 'complete'){
		var workspace = process.env.WORKSPACE_ID || WORKSPACE_ID;
	    var payload = {
			workspace_id : workspace,
			context : data.context,
			input : data.input
		}

		//conversation requests a data lookup action
		if(data.context.action.lookup === "rnr"){
			console.log('************** R&R *************** InputText : ' + payload.input.text);

			var responseTxtAppend = '';
			var qs = require('querystring');//require('./node_modules/qs/dist/qs');
			// search documents

			var question = payload.input.text; //Only the question is required from payload
			console.log('******' +JSON.stringify(question)+'*********');
			var query='';
			if (ranker_id !='')
				{query = qs.stringify({q: question, ranker_id: ranker_id, rows:30, fl: 'id,ranker.confidence,title,contentHtml'});
				}
			else
				{
				query = solrClient.createQuery().q(question).rows(3);
				}

			solrClient.get('fcselect', query, function(err, searchResponse) {
				  if(err) {
					  console.log('Error searching for documents: ' + err);
					  responseTxtAppend = 'Sorry, currently I do not have a response. Our Customer representative will get in touch with you shortly';
				  } else {
				    console.log('Found ' + searchResponse.response.numFound + ' document(s).');
				    //console.log('Document(s): ' + JSON.stringify(searchResponse.response.docs, null, 2));
				    //responseTxtAppend = 'Here are some relevant information for your query.<br/>';

				    if (searchResponse.response.docs[0])

					{
						responseTxtAppend = 'Here are some answers retrieved from reference documents which you may find relevant to your query.<br/><br/>';

						for(var i=0; i < 3 ; i++)	{
							var doc = searchResponse.response.docs[i];
							//responseTxtAppend = responseTxtAppend +"<a href=\"#\" onclick=\"myWindow=window.open('',\'"+doc.title+"\',\'toolbar=no,width=600,height=400,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,\').document.body.innerHTML = \'<div style=\\'background:-moz-linear-gradient(top, #BBCDD3, #FFFFFF);\\'><strong>"+doc.title+"</strong><br/><br/>"+doc.contentHtml+"\';\" </div>" +doc.title+ ". Click for detail...</a><div style=\"display:none\" id=\"example"+i+"\">"+doc.contentHtml+"</div><br/>";
							responseTxtAppend += '<b> <font color="#00004d">' + doc.title + '</font></b><br/>' + doc.contentHtml + '<br/>';
						}

					}
						//responseTxtAppend  = searchResponse.response.docs[0].contentHtml;}
					else
						{responseTxtAppend="Sorry I currently do not have an appropriate response for your query. Our customer care executive will call you in 24 hours"}

				  }
			  if(responseTxtAppend != ''){
					if(data.output.text){
						data.output.text.push(responseTxtAppend);
					}
					//clear the context's action since the lookup and append was completed.
					data.context.action = {};
				}
				callback(null, data);

				//clear the context's action since the lookup was completed.
				payload.context.action = {};
				return;
			});
		}

		else{
			callback(null, data);
			return;
		}
	}else{
		callback(null, data);
		return;
	}

}





module.exports = app;
