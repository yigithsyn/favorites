webix.protoUI({
	name:"yandex-map",
	$init:function(config){
		this.$view.innerHTML = "<div class='webix_map_content' style='width:100%;height:100%'></div>";
		this._contentobj = this.$view.firstChild;
		
		this._waitMap = webix.promise.defer();
		this.$ready.push(this.render);
	},
	getMap:function(waitMap){
		return waitMap?this._waitMap:this._map;
	},
	render:function(){
        if(typeof ymaps=="undefined"){
		var name = "webix_callback_"+webix.uid();
            window[name] = webix.bind(function(){
                 this._initMap.call(this,true);
            },this);

            var script = document.createElement("script");
            script.type = "text/javascript";
            script.src = "//api-maps.yandex.ru/2.0-stable/?load=package.standard&lang=en-US&onload="+name;
            document.getElementsByTagName("head")[0].appendChild(script);
        }
        else
            this._initMap();
	},
    _initMap:function(define){
		var c = this.config;

        this._map = new ymaps.Map(this._contentobj, {
			center:c.center,
			zoom:c.zoom,
			type:c.mapType
        });
        this._waitMap.resolve(this._map);
        webix._ldYMap = null;
    },
	center_setter:function(config){
		if(this._map)
            this._map.setCenter(config);
        
		return config;
	},
	mapType_setter:function(config){
		//yadex#map, yadex#satellite, yadex#hybrid, yadex#publicMap
		if(this._map)
			this._map.setType(config);

		return config;
	},
	zoom_setter:function(config){
		if(this._map)
			this._map.setZoom(config);

		return config;
	},
	defaults:{
		zoom: 5,
		center:[ 39.5, -98.5 ],
		mapType: "yandex#map"
	}
}, webix.ui.view);
