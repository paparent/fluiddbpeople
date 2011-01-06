(function($){

	var map = null;
	var infoWindow = null;

	function init_map() {
		var latlng = new google.maps.LatLng(50, 0);
		var myOptions = {zoom: 2, center: latlng, mapTypeId: google.maps.MapTypeId.ROADMAP};
		map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	}

	function createBubble(latlng, title, html) {
		var iconsrc = "http://chart.apis.google.com/chart?chst=d_map_xpin_letter&chld=pin|+|6699BB|000000|000000";
		var marker = new google.maps.Marker({position: latlng, map: map, title: title, icon: iconsrc});
		google.maps.event.addListener(marker, 'click', function(){
			if (!infoWindow) {
				infoWindow = new google.maps.InfoWindow();
			}
			infoWindow.setContent('<div class="iwwrapper">' + html + '</div>');
			infoWindow.open(map, marker);
		});
		return marker;
	}

	var app = $.sammy('#main', function(){

		function process_user(username) {
			return function(data){
				ids = data['results']['id'];
                // Dunno how to get the only one element here without knowing the key :(
				for (k in ids) {
					lat = ids[k][username + '/people/latitude']['value'];
					lng = ids[k][username + '/people/longitude']['value'];
					fullname = ids[k]['fluiddb/users/name']['value'];
					latlng = new google.maps.LatLng(lat, lng);
					html = '<div><h2>' + fullname + ' (' + username + ')</h2></div>';
					bubble = createBubble(latlng, 'User ' + username, html);
				}
			}
		}

		function process_users() {
			return function(data){
				$.each(data['tagPaths'], function(k, v){
					if (!v.match(/\/peopleapp$/)) return;

					username = v.replace(/\/peopleapp$/, '');

					query = 'fluiddb/users/username="' + username + '"';
					tags = '&tag=' + escape('fluiddb/users/name') + '&tag=' + escape(username + '/people/latitude') + '&tag=' + escape(username + '/people/longitude');

					fluidDB.get('values?query=' + escape(query) + tags, process_user(username));
				});
			}
		}

		this.get('#/', function(context){
			$('#header .guide').click(function(){
				$('#guide').slideToggle();
				return false;
			});

			init_map();
			fluidDB.get('about/collection:peopleapp', process_users());
		});
	});

	$(function(){app.run('#/');});
})(jQuery);
