---
layout: post
author: Steve Nguyen
---

**Items completed this week:**

* General

	* Sunday Nov. 17: 4 hour group meeting in person
	
		* Discussed prototype progress so far.
		* Reviewed paper prototype. Walked through use cases to determine what features still needed to be added.
		* Made distinctions between how certain data-related events would be handled via the GUI versus the underlying D3 library.
		* Defined key application terms and started creating a glossary.
		* Discussed the beginnings of a JSON schema for saving application state.
	* Monday Nov. 18
		* Met with advisor 
		* Set up meeting for next Monday to demo prototype thus far.
	* Tuesday Nov. 19: Online meeting
		* Reviewed updated paper prototype
		* Discussed what’s left to do for the functional prototype.
	* Emailed Scott from Climate Central with status updates.
* Issues Resolved
  * Create project folder structure: 
  * [Issue 2](https://github.com/KSHSK/WAVED/issues/2)
* Issues Created
  * Fix insecure content issue for external js references: [Issue 13](https://github.com/KSHSK/WAVED/issues/13)
  * Prototype - Export Issues: [Issue 14](https://github.com/KSHSK/WAVED/issues/14)
* Sean - Hooked up client-side download functionality with prototype
* Kristian
  * Cleaned up prototype CSS/HTML
  * Added viewers to prototype to see which data files are bound to which widgets.
  * Added highlighting to prototype.
  * Added Google Analytics to prototype.
  * Detailed a new architecture that decouples code generation from the live preview of the application and eliminates the need to use an iframe.
* Steve
  * Added functions to bind data and colorize the map
  * Added rough prototype of updating and loading state
  * Started looking into refactoring of code to handle iframe issues encountered by team members
* Keith
  * Added PHP code and example JS code to prototype for saving and loading JSON objects to / from SQLite database.
  * Developed script for deploying code from the repository to user accounts on CS machines.
* Hannah
  * Completed final draft of paper prototype
  * Added linking to paper prototype

**Action items for next week:**

1. Finish first draft of functional and paper prototype
2. Hook up state loading and saving to database code for functional prototype. 

	* Keith
3. Work on refactoring all functions to compensate for new iframe-less architecture.

	* Steve
	* Kristian
4. Complete paper prototype, cleanup pages based on feedback from advisor and stakeholder.

	* Hannah
5. Refactor how the exported HTML file of the completed application is generated.

	* Sean
6. Demonstrate functional and paper prototype to advisor - Monday, November 25th
7. Demonstrate functional and paper prototype to outside stakeholder - Tuesday, November 26th
8. Make prototype revisions based on feedback

