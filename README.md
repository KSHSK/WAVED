# WAVED

Web App for Visualizing Environmental Data

http://kshsk.github.io/WAVED

## Installation
### The Basics
While all a client needs to use WAVED is a web browser, server side actions require a running web server. The requirements for the server include serving both static content (HTML, JavaScript, CSS, Images) as well as dynamic pages (PHP).  

This setup can be accomplished with various setups on most operating systems, however, this document has been written for and tested against a fresh installation of Ubuntu 12.04 LTS (Precise Pangolin).

### Necessary Packages
In order to get the WAVED server running we will be using Apache with the PHP module, including sqlite. The other packages provide the command line tools required for the standard deployment of WAVED. The packages can be installed as follows:

```
apt-get update
apt-get install apache2 php5-common php5-sqlite libapache2-mod-php5
apt-get install make sqlite3 acl
```

### Content
All the content that needs to be served by the web server can be found in the WAVED git repository. We'll clone this content to the ```DocumentRoot``` of the Apache server, which is ```/var/www``` by default.

```
cd /var/www
git clone https://github.com/KSHSK/WAVED.git
```

### Initial Setup
After all the content has been brought over to the web server there are a few initialization actions that need to be performed.  This includes setting up the directories and permissions for persisting project state and data files. All of these actions are handled by a Makefile. After everything is set up the Apache server is restarted to ensure everything will be served correctly.

```
cd WAVED
make
service apache2 restart
```

### Verifying the Server
At this point the WAVED server should be up and running and clients should be able to point their web browsers to the WAVED folder of your web server. There are, however, a few easy things that you can do from the web server to verify functionality.

#### Index Page
Verify that you can get to the index page of WAVED. You should not get a 404 error, or a short HTML page displaying some generic message, but rather over 500 lines of HTML. 
```curl -sXPOST localhost/WAVED/```

#### Project Listing
Verify that you can get a listing of the currently existing projects as a JSON response. The ```success``` field should be true, and the ```projects``` array empty.

```curl -sXPOST localhost/WAVED/PHP/getExistingProjectDetails.php```

#### Create Project
Verify that you can create a project. Each command should display a JSON response, both of which with ```success``` as true. The ```projects``` array should contain the newly created project.

```
curl -sXPOST localhost/WAVED/PHP/createProject.php -d project=test_project
curl -sXPOST localhost/WAVED/PHP/getExistingProjectDetails.php
```

#### Delete Project
Verify that you can delete a project. Each command should display a JSON response, both of which with ```success``` as true.  The ```projects``` array should be empty once again.
```
curl -sXPOST localhost/WAVED/PHP/deleteProject.php -d project=test_project
curl -sXPOST localhost/WAVED/PHP/getExistingProjectDetails.php
```

## Developer Instructions

* Download [Eclipse IDE for Java Developers](http://www.eclipse.org/downloads/packages/eclipse-ide-java-ee-developers/keplersr1)
* Import Project: 
 * File -> Import... -> Exiting Projects into Workspace
 * Select WAVED directory
 * Finish
* Install JSHint Plugin
 * Help -> Install New Software -> Work with: `http://github.eclipsesource.com/jshint-eclipse/updates/`
 * Check JSHint and click through until finished
