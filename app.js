function isEmpty(str) {
    return (!str || 0 === str.length);
}


var app = angular.module('bkscratch', []);

app.constant('url', 'data/bookmarks.json');

/*
 *  Fitre les bookmarks par tag (AND)
 *
 *   input: la liste des posts, une list de tag
 *   return: la liste des posts filtrée
 *
 */
app.filter('bytag', function () {
  return function (items, tags) {
    var filtered = [];
   
    if( tags === undefined || tags.constructor != Array || tags.length === 1 && isEmpty(tags[0]) ){
        filtered = items;
    }
    else{
    
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            //AND:
            var alltagsin = true;
            for(var k = 0; k <tags.length; k++){
                var tag = tags[k];
                if( item.tags.indexOf(tag) < 0 ){ alltagsin = false; break; }
            }
            if( alltagsin ){ filtered.push(item); }
        }
    }
    return filtered;
  };
});



/*
 *   Add - Formate l'url pour le lien  'ajouter un tag'
*/
app.filter('addtag', function () { 
    return function (items, tag) {
    
        if( items == undefined || items.constructor != Array || items.length === 1 && isEmpty(items[0])  ){
             return tag; 
          } else {
             return items.join(';')+';'+tag ;
         }
    }
} );

/*
 *   Remove - Formate l'url pour le lien  'retirer un tag'
*/
app.filter('removetag', function () { 
    return function (items, tag) {
    //console.log(items);
        if( items == undefined || items.constructor != Array || items.length === 1 && isEmpty(items[0])  ){
             return ''; 
          } else {
            var index = items.indexOf(tag);
            if (index > -1) {
                items.splice(index, 1);
              }
            return items.join(';') ;
         }
    }
} );



/*
 *   Retourne une couleur en fonction du label du tag (str)
 *
 *  https://stackoverflow.com/questions/11120840/hash-string-into-rgb-color
*/
app.filter('getcolor', function () { 

    //hash fct.:  http://erlycoder.com/49/javascript-hash-functions-to-convert-string-into-integer-hash-
    djb2Code = function(str){
        var hash = 5381;
        for (i = 0; i < str.length; i++) {
            char = str.charCodeAt(i);
            hash = ((hash << 5) + hash) + char; /* hash * 33 + c */
        }
        return hash;
    }
  
    var assemble = function (str) {
      var hash = djb2Code(str);
      var r = (hash & 0xFF0000) >> 16;
      var g = (hash & 0x00FF00) >> 8;
      var b = hash & 0x0000FF;
      return "#" + ("0" + r.toString(16)).substr(-2) + ("0" + g.toString(16)).substr(-2) + ("0" + b.toString(16)).substr(-2);
    }
    
    return assemble;
} );

    
    
/*
 *    Controller
 *
*/

app.controller('viewerCtrl', ['$scope', '$http', 'url', 'bytagFilter', '$location',
        function($scope, $http, url, bytagFilter, $location) {
    
      
    $scope.bookmarkslist = [];
    $scope.filtered = [];

    $scope.selectedtags = [];
    $scope.remainingtags = [];
    
    var successGet = function( response ){
        
        $scope.bookmarkslist = response.data;
        updateview();
        
    };

    $http({ method: 'GET', url: url })
        .then( successGet );


    
 
    function updateview(){
        console.log('update !');
        $scope.filtered  = bytagFilter( $scope.bookmarkslist, $scope.selectedtags );
        
        
        $scope.remainingtags = gettagslist($scope.filtered , $scope.selectedtags) ;

        
    }
    
    
    $scope.addtag = function( newtag ){
        //$scope.selectedtags.push( newtag );
        $scope.selectedtags = $scope.selectedtags.concat([newtag]) ;
 

    };
    $scope.removetag = function( tag ){
        //var index = $scope.selectedtags.indexOf(tag);
        //if (index > -1) {$scope.selectedtags.splice(index, 1);}
        var newselected= []
        for(var i=0; i<$scope.selectedtags.length; i++){
            if( $scope.selectedtags[i] != tag ){ newselected.push($scope.selectedtags[i]) }
        }
        $scope.selectedtags = newselected;
    };
    
    $scope.$watch('selectedtags', function(){ updateview() }); 
 
    // URL to controller
   /* $scope.$on('$locationChangeSuccess', function(event) {
        console.log("URL changed!"+$location.hash());
        var tags = $location.hash().split(";");
        $scope.selectedtags = tags;
       // self["filterByName"] = $location.search()["filterByName"];
    });  */
        

}]);


/*  
 *  Compte les nombres d'apparition de chaque tag
 *
 *   retourne la liste des tags (objet: label, count)
*/
    
var gettagslist = function(data, selected){

    tagscount = {}
    for (i = 0; i < data.length; i++) {
        tags = data[i].tags
         for (j = 0; j < tags.length; j++) {
            tag = tags[j]

            if( tag in tagscount ){ tagscount[tag] += 1 }
            else{  tagscount[tag] = 1 }
            
        }       
    }
    
    // Dict -> Array
    var arr = [];
    for (var key in tagscount) {
        if ( tagscount.hasOwnProperty(key) && ( !selected || selected.indexOf(key) < 0 )  ) {
            //if( tagslist[key]>1 ){  // retire les tags avec un seul bookmark }
              arr.push( { 'label':key, 'count':tagscount[key] } );
             //arr.push( key );
            
        }
    }

    arr.sort( function(a, b){return b.count-a.count ;} ) ;
    return arr ;
}


  

    


