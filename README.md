# Implementing a chat bot using Watson Cognitive Services

Welcome! These instructions describe the pre-requisites to be completed before attending the lab session. Please follow these steps to ensure that you are fully prepared to participate on the day of the lab.

# Prepare your Bluemix account


<b>1. Ensure that you have an account on [IBM Bluemix](https://bluemix.net/). If you already have a Bluemix account, then sign in to your account and click on Deploy the Bluemix. </b> 


## Deploy the App

NOTE: Perform steps 1-6 OR click the Deploy to Bluemix button to do it all at once!

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/WatsonISA/chatbot-lab)

1. Log in with your Bluemix account.
![](doc/source/images/deploy.PNG)

2. *Optional:* If you are asked to choose an alias, enter a unique alias name and click create.
![](doc/source/images/alias.PNG)

3. *Optional:* If you are asked to choose an alias, verify your alias name and click continue.
![](doc/source/images/cont.PNG)

4. Name your app, and then select the Region, Organization and Space where the app will be deployed. Click 'DEPLOY'.
![](doc/source/images/deploy1.PNG)

5. Wait for the deployment to complete, the following actions will be performed:

  * Creates the application.
  * Creates a Conversation and Tone Analyzer service instance.

  ![](doc/source/images/createproject.PNG)

6. After the deployment has completed, click on the 'Deployed to Bluemix sucessfully' link.
![](doc/source/images/res.PNG)

7. You will land on the Overview page of your application. If you like to try out the App, go ahead and click on 'View Your App'.
![](doc/source/images/yourapp.PNG)

8. The application and services have been successfully deployed, and you are now ready to begin the lab!

# Steps

1. [Clone the repo](#1-clone-the-repo)
2. [Create Watson services on IBM Bluemix](#2-create-watson-services-on-ibm-bluemix)
3. [Configure Watson Conversation](#3-configure-watson-conversation)
4. [Configure Watson Retrieve and Rank](#4-configure-watson-retrieve-and-rank)
5. [Run the application](#5-run-the-application)

## 1. Clone the repo

Clone the `chatbot-lab` locally. In a terminal, run:

`$ git clone https://github.com/WatsonISA/chatbot-lab`

We’ll be using the file [`data/WCS/Securities.json`](data/WCS/Securities.json) and the folder
[`data/WCS/`](data/WCS/)

## 2. Create Watson services on IBM Bluemix

Create the following services:

* [**Watson Conversation**](https://console.ng.bluemix.net/catalog/services/conversation)
* [**Watson Retrieve n Rank**](https://console.ng.bluemix.net/catalog/services/retrieve-and-rank)


> Note: Ensure that you have logged into Bluemix and are allowed to use these services.

## 3. Configure Watson Conversation

Launch the **Watson Conversation** tool. Use the **import** icon button on the right

<p align="center">
  <img width="400" height="55" src="doc/source/images/import_conversation_workspace.png">
</p>

Find the local version of [`data/WCS/Securities.json`](data/WCS/Securities.json) and select
**Import**. Find the **Workspace ID** by clicking on the context menu of the new
workspace and select **View details**. Save this ID for later.

<p align="center">
  <img width="400" height="250" src="doc/source/images/open_conversation_menu.png">
</p>

*Optionally*, to view the conversation dialog select the workspace and choose the
**Dialog** tab, here's a snippet of the dialog:

![](doc/source/images/dialog.PNG)

## 4. Configure Watson Retrieve and Rank

Launch the **Watson retrieve-and-rank** tool. Create a **new data cluster**.

![](doc/source/images/rnr-cluster.PNG)

Seed the content by firstly creating **New Collection**, and add the file documents and questions present under [`data/Retrieve&Rank/`](data/Retrieve&Rank/)

![](doc/source/images/new-collection.PNG)

> Note: Ensure that you have also created a [**Watson Document Conversion**](https://console.ng.bluemix.net/catalog/services/document-conversion) service as well. Since, Watson RnR uses document conversion at the backend.

## 5. Run the application

### If you used the Deploy to Bluemix button...

If you used ``Deploy to Bluemix``, most of the setup is automatic to start using the App.

### If you want to run it locally...

Otherwise as explained above:
1. Clone the repo
2. Instantiate/ Configure the above watson services
2. Install NodeJS runtime or npm.
3. Start the app and it can be used at localhost:3000

> Note: server host can be changed as required in server.js


# License

This sample code is licensed under Apache 2.0.
Full license text is available in [LICENSE](LICENSE).

# Links

* [Lab Document](http://ibm.biz/Bdru7G): Detailed guide on how to deploy this app
* [CONTRIBUTING](CONTRIBUTING.md): Guide to contribute to this project
* [MAINTAINING](MAINTAINERS.md): Rules for maintainer of this project
* [Open Source @ IBM](http://ibm.github.io/): Find more open source projects on the


