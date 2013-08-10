(function() {
  goog.provide('ga_search_directive');

  var module = angular.module('ga_search_directive', []);

  module.directive('gaSearch',
      ['$compile', '$translate', 'gaLayers', 'gaPermalink',
       function($compile, $translate, gaLayers, gaPermalink) {
         var currentTopic,
             footer = [
          '<div id="search-footer">',
          '<div class="footer-left">',
          '<b>Please help me</b></div>',
          '<div class="footer-right"><div>',
          '<a class="share-icon" ',
          'title="Give us a call" ',
          'ng-click="getHref()" ',
          'ng-mouseover="getHref()" ',
          'ng-href="mailto:webgis@swisstopo.ch?',
          'body={{encodedPermalinkHref}}">',
          '<i class="icon-phone"></i> ',
          '</a>',
          '<a class="share-icon" ',
          'title="Follow us on Twitter" ',
          'ng-href="https://twitter.com/swiss_geoportal">',
          '<i class="icon-twitter"></i>',
          '</a>',
          '<a class="share-icon"',
          'title="Send us an email" ',
          'ng-click="getHref()" ',
          'ng-mouseover="getHref()" ',
          'ng-href="mailto:webgis@swisstopo.ch?',
          'body={{encodedPermalinkHref}}">',
          '<i class="icon-envelope-alt"></i>',
          '</a>',
          '</div>',
          '</div>',
          '</div>'].join('');

         function parseExtent(stringBox2D) {
           return stringBox2D.replace('BOX(', '')
             .replace(')', '').replace(',', ' ').split(' ')
             .map(function(val) {
              return parseFloat(val);
            });
         };

         function getBBoxParameters(map) {
           var size = map.getSize();
           var view = map.getView();
           var bounds = view.calculateExtent(size);
           return bounds[0] + ',' + bounds[2] + ',' +
            bounds[1] + ',' + bounds[3];
         };

         function zoomToExtent(map, extent) {
           var size = map.getSize();
           var view = map.getView();

           //minX maxX minY maxY
           view.fitExtent([extent[0], extent[2], extent[1], extent[3]], size);
         };

         function moveTo(map, zoom, center) {
           var view = map.getView();

           view.setZoom(zoom);
           view.setCenter(center);
         };

         return {
           restrict: 'A',
           replace: true,
           scope: {
             options: '=gaSearchOptions',
             map: '=gaSearchMap'
           },
           templateUrl: 'components/search/partials/search.html',
           link: function(scope, element, attrs) {
             var map = scope.map;
             var options = scope.options;

             var footerTemplate = angular.element(footer);
             $compile(footerTemplate)(scope);

             scope.getHref = function() {
               // set those values in options only on mouseover or click
               scope.encodedPermalinkHref =
               encodeURIComponent(gaPermalink.getHref());
               scope.encodedDocumentTitle =
               encodeURIComponent(document.title);
             };

             scope.showLegend = function() {
               alert('Legend window should be defined once and for all!');
             };

             scope.addLayer = function(id) {
               gaLayers.getOlLayerById(id).then(function(layer) {
                 if (!hasLayer(id) && angular.isDefined(layer)) {
                   map.addLayer(layer);
                 }
                 if (!angular.isDefined(layer)) {
                   alert('A configuration does not exist for this layer yet!');
                 }
               });
             };

             scope.removeLayer = function(id) {
               gaLayers.getOlLayerById(id).then(function(layer) {
                 if (hasLayer(id) && angular.isDefined(layer)) {
                   map.removeLayer(layer);
                 }
               });
             };

             var hasLayer = function(id) {
               var res = false;
               map.getLayers().forEach(function(layer) {
                 if (angular.isDefined(layer.get('id'))) {
                   if (id === layer.get('id')) {
                     res = true;
                   }
                 }
               });
               return res;
             };

             var hasLayerResults;
             var counter = 0;

             var taElt = $(element).find('input').typeahead([
               {
                 header: '<div class="tt-header-locations">Locations:</div>',
                 name: 'locations',
                 timeout: 20,
                 valueKey: 'inputVal',
                 limit: 30,
                 template: function(context) {
                   var template = '<div class="tt-search" ';
                   var origin = context.attrs.origin;
                   var label = context.attrs.label;
                   template += '>' + label + '</div>';
                   return template;
                 },
                 remote: {
                   url: options.serviceUrl + 'type=locations',
                   dataType: 'jsonp',
                   cache: false,
                   replace: function(url, searchText) {
                     var queryText = '&searchText=' + searchText;
                     var bbox = '&bbox=' + getBBoxParameters(map);
                     var lang = '&lang=' + $translate.uses();
                     // FIXME check if queryable layer is in the map
                     // var features = '&features=';
                     url = options.applyTopicToUrl(url,
                                                  currentTopic);
                     url += queryText + bbox + lang;
                     return url;
                   },
                   filter: function(response) {
                     var results = response.results;
                     return $.map(results, function(val) {
                       val.inputVal = val.attrs.label
                         .replace('<b>', '').replace('</b>', '');
                       return val;
                     });
                   }
                 }
               },
               {
                 header: '<div class="tt-header-mapinfos">Map Infos:</div>',
                 footer: footerTemplate,
                 name: 'layers',
                 timeout: 20,
                 valueKey: 'inputVal',
                 limit: 20,
                 template: function(context) {
                   var attrName = 'attr_' + counter.toString();
                   var template = '<div class="tt-search" ng-init="' +
                   attrName + '=\'' + context.attrs.layer + '\';" ' +
                   'ng-mouseover="addLayer(' + attrName + ')" ' +
                   'ng-mouseout="removeLayer(' + attrName + ')"';
                   var origin = context.attrs.origin;
                   var label = context.attrs.label;
                   template += '>' + label + '<i id="legend-open" ' +
                   'href="#legend" ng-click="showLegend()"' +
                   'class="icon-info-sign"> </i></div>';
                   counter += 1;
                   return template;
                 },
                 remote: {
                   url: options.serviceUrl + 'type=layers',
                   dataType: 'jsonp',
                   cache: false,
                   replace: function(url, searchText) {
                     var queryText = '&searchText=' + searchText;
                     var lang = '&lang=' + $translate.uses();
                     url = options.applyTopicToUrl(url,
                                                  currentTopic);
                     url += queryText + lang;
                     return url;
                   },
                   filter: function(response) {
                     var results = response.results;
                     // hasLayerResults is used to control
                     // the display of the footer
                     if (results.length === 0) {
                       hasLayerResults = false;
                     } else {
                       hasLayerResults = true;
                     }
                     return $.map(results, function(val) {
                       val.inputVal = val.attrs.label
                       .replace('<b>', '').replace('</b>', '');
                       return val;
                     });
                   }
                 }
               }
              ]).on('typeahead:selected', function(event, datum) {
                 var origin = datum.attrs.origin;
                 if (angular.isDefined(datum.attrs.geom_st_box2d)) {
                   var extent = parseExtent(datum.attrs.geom_st_box2d);

                   var origin_zoom = {
                     'address': 10,
                     'parcel': 9,
                     'sn25': 8
                   };

                   if (origin_zoom.hasOwnProperty(origin)) {
                     var zoom = origin_zoom[origin];
                     var center = [extent[0], extent[1]];
                     moveTo(map, zoom, center);
                   } else {
                     zoomToExtent(map, extent);
                   }
                 }
                 if (origin === 'layer') {
                   scope.addLayer(datum.attrs.layer);
                 }
              });

             var viewDropDown = $(taElt).data('ttView').dropdownView;
             viewDropDown.on('suggestionsRendered', function(event) {
                 // Only for layer search at the moment
                 var elements = angular.element('.tt-dataset-layers');
                 $compile(elements)(scope);
                 counter = 0;

                 // Display footer but hide suggestions and header
                 var children = elements.children();
                 if (children.length !== 0) {
                   if (!hasLayerResults) {
                     children[0].style.display = 'none';
                     children[1].style.display = 'none';
                   } else {
                     children[0].style.display = 'block';
                     children[1].style.display = 'block';
                   }
                 }
             });

             scope.clearInput = function() {
               $(taElt).val('');
               $(taElt).data('ttView')._clearSuggestions();
             };

             scope.$on('gaTopicChange', function(event, topic) {
               currentTopic = topic.id;
             });

            }
          };
        }]);
})();
