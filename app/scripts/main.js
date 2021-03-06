$(document).ready(function() {

	var myDrawer = new jDrawer({
		fixedHeight : 300,			//Make the drawer a fixed height. If not set, height will be set to "auto"
		mobileBreakpoint : 800,		//The breaktpoint when the drawer will go full screen.
		labelClose : false,			//If true, clicking on active tabLabels will close the drawer
		css3Animations : true,		//If false, will force jQuery animation.  Otherwise, CSS3 animations will be attempted with a jQuery fallback.
		drawerOpenSpeed: 500,		//jQuery animation speed (control CSS speed in CSS file)
        drawerCloseSpeed: 500		//jQuery animation speed (control CSS speed in CSS file)
	});
})