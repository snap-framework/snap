define(['utils'], function (Utils) {
	'use strict';
	
/* liste des constantes du framework */

	var labels = {
		"vocab": {
			"pageOf": (Utils.lang === "en")?	
					"of":
					"de",
			"pageLbl": (Utils.lang === "en")?	
					"Page":
					"Page",
			"goTo": (Utils.lang === "en")?	
					"Go to":
					"Aller à",
			"definition": (Utils.lang === "en")?
					"Definition: ":
					"Définition : ",
			"modules": (Utils.lang === "en")?
					"modules":
					"modules"
		}, "nav": {
			"nextBtn": (Utils.lang === "en")?	
					"Next":
					"Suivant",
			"backBtn": (Utils.lang === "en")?	
					"Previous":
					"Précédent",
			"nextBtnTxt": (Utils.lang === "en")?	
					"Next page":
					"Page suivante",
			"backBtnTxt": (Utils.lang === "en")?	
					"Previous page":
					"Page précédente",
			"backnextLblTxt": (Utils.lang === "en")?	
					"Local Navigation":
					"Navigation locale",
			"disabled": (Utils.lang === "en")?	
					"disabled":
					"désactivé",
			"selectToChange": (Utils.lang === "en")?	
					"Select to change":
					"Sélectionnez pour changer",
			"clickStart": (Utils.lang === "en")?	
					"Click here to start":
					"Cliquez ici pour débuter",
			"backToTop": (Utils.lang === "en")?
					"Back to top":
					"Retour",
			"quitConfirm": (Utils.lang === "en")?
					"Are you sure you want to quit?":
					"Êtes-vous certain de vouloir quitter?",
			"breadSeparator": (Utils.lang === "en")?
					"<br>":
					"<br>",
			"viewed": (Utils.lang === "en")?
					"viewed":
					"visité",
			"external": (Utils.lang === "en")?
					"External link to ":
					"Lien externe vers ",
			"isSoftLockedMessage": (Utils.lang === "en")?
					"Are you sure you want to navigate away from this page?":
					"Êtes-vous certain de vouloir naviguer vers une autre page?",
			"lockedIn": (Utils.lang === "en")?
					"You cannot escape from this page/section.":
					"Vous ne pouvez sortir de cette page/section.",
			"lockedOut": (Utils.lang === "en")?
					"This page/section is locked":
					"Cette page/section est verrouillée",
			"progressBar": (Utils.lang === "en")?
					"Progress Bar":
					"Bar de progression",
			"readmore": (Utils.lang === "en")?
					"Read More":
					"Voir plus",
			"versionHTML": (Utils.lang === "en")?
					"Basic HTML Version":
					"Version HTML simplifiée",
			"sitemap": (Utils.lang === "en")?
					"Sitemap":
					"Plan de site",
			"togglefav": (Utils.lang === "en")?
				"Add/remove from favourites":
				"Ajouter/enlever des favoris",
			"toolboxInstr": (Utils.lang === "en")?
				"Press down to open":
				"Appuyez sur la flèche vers le bas pour ouvrir",
			"externalink": (Utils.lang === "en")?
				"This link will open in a new window":
				"Ce lien s'ouvrira dans une nouvelle fenêtre",
			"defaultMenuName": (Utils.lang === "en")?
				"Menu":
				"Menu",
			"refreshNeeded": (Utils.lang === "en")?
				"The size of the window or current zoom level currently may compromise correct content display, would you like to refresh the page to fix this issue?":
				"La taille de la fenêtre ou le niveau de zoom présentement sélectionné risque d'empiéter sur l'affichage correct du contenu, désirez-vous rafraichir la page pour régler ce problème?",
		}, "err": {
			"statusChange": (Utils.lang === "en")?	
					"The status has changed.":
					"Le status a changé",
			"offline": (Utils.lang === "en")?	
					"Offline":
					"Hors ligne",
			"online": (Utils.lang === "en")?	
					"Online":
					"En ligne",
			"noScorm": (Utils.lang === "en")?	
					"No Scorm":
					"Scorm déconnecté",
			"isActivity": (Utils.lang === "en")?	
					"This page is an activity":
					"Cette page est une activité",
			"isQuiz": (Utils.lang === "en")?	
					"This page is a quiz":
					"Cette page est un quiz",
			"isViewed": (Utils.lang === "en")?	
					"This page was already viewed":
					"Cette page a été vue"
		}, "glossary": {
			"emptyTerm": (Utils.lang === "en")?	
					"The glossary does not contain any terms beginning with this letter.":
					"Le glossaire ne contient pas de termes débutant par cette lettre."
		}, "modal": {
			"ok": (Utils.lang === "en")?
					"<span class='sr-only'>Use the mouse wheel to navigate. </span>I got it":
					"<span class='sr-only'>Utilisez la roulette de la souris pour naviguer. </span>J'ai compris",
			"skip": (Utils.lang === "en")?
					"Skip":
					"Passer"
		}
	};

	//make labels global since we use it sometimes in external plugins
	window.labels = labels;

	return labels;
});