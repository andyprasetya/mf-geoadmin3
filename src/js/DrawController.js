goog.provide('ga_draw_controller');

goog.require('ga_browsersniffer_service');
goog.require('ga_print_service');
goog.require('ga_styles_service');
(function() {

  var module = angular.module('ga_draw_controller', [
    'pascalprecht.translate',
    'ga_styles_service',
    'ga_browsersniffer_service',
    'ga_print_service'
  ]);

  module.controller('GaDrawController', function($rootScope, $scope, $translate,
      $timeout, gaBrowserSniffer, gaGlobalOptions, gaStyleFactory,
      gaPrintService) {

    $scope.$on('gaPopupFocusChange', function(evt, isFocus) {
      $scope.options.hasPopupFocus = isFocus;
    });

    // Defines static styles
    var white = [255, 255, 255];
    var black = [0, 0, 0];

    var options = {

      popupOptions: {
        title: '',
        container: 'body',
        position: 'bottom-left'
      },

      measureOptions: {},

      profileOptions: {
        xLabel: 'profile_x_label',
        yLabel: 'profile_y_label',
        margin: {
           top: 6,
           right: 20,
           bottom: 45,
           left: 60
        },
        elevationModel: gaGlobalOptions.defaultElevationModel
      },

      // Defines directive options
      showExport: true,
      broadcastLayer: false,
      useTemporaryLayer: false,
      translate: $translate, // For translation of ng-options

      // Draw style directive options
      name: '',
      description: '',
      font: gaStyleFactory.FONT,
      colors: [
        {name: 'black', fill: [0, 0, 0], border: 'white'},
        {name: 'blue', fill: [0, 0, 255], border: 'white'},
        {name: 'gray', fill: [128, 128, 128], border: 'white'},
        {name: 'green', fill: [0, 128, 0], border: 'white'},
        {name: 'orange', fill: [255, 165, 0], border: 'black'},
        {name: 'red', fill: [255, 0, 0], border: 'white'},
        {name: 'white', fill: [255, 255, 255], border: 'black'},
        {name: 'yellow', fill: [255, 255, 0], border: 'black'}
      ],
      iconSizes: [
        {label: 'small_size', value: [24, 24], scale: 0.5},
        {label: 'medium_size', value: [36, 36], scale: 0.75},
        {label: 'big_size', value: [48, 48], scale: 1}
      ],
      icons: [
          // Basics
          {id: 'marker'},
          {id: 'circle'},
          {id: 'square'},
          {id: 'triangle'},
          {id: 'star'},
          {id: 'star-stroked'},
          {id: 'marker-stroked'},
          {id: 'circle-stroked'},
          {id: 'square-stroked'},
          {id: 'triangle-stroked'},
          {id: 'cross'},
          {id: 'disability'},
          {id: 'danger'},

          // Shops
          {id: 'art-gallery'},
          {id: 'alcohol-shop'},
          {id: 'bakery'},
          {id: 'bank'},
          {id: 'bar'},
          {id: 'beer'},
          {id: 'cafe'},
          {id: 'cinema'},
          {id: 'commercial'},
          {id: 'clothing-store'},
          {id: 'grocery'},
          {id: 'fast-food'},
          {id: 'hairdresser'},
          {id: 'fuel'},
          {id: 'laundry'},
          {id: 'library'},
          {id: 'lodging'},
          {id: 'pharmacy'},
          {id: 'restaurant'},
          {id: 'shop'},

          // Transport
          {id: 'airport'},
          {id: 'bicycle'},
          {id: 'bus'},
          {id: 'car'},
          {id: 'ferry'},
          {id: 'london-underground'},
          {id: 'rail'},
          {id: 'rail-above'},
          {id: 'rail-light'},
          {id: 'rail-metro'},
          {id: 'rail-underground'},
          {id: 'scooter'},

          // Sport
          {id: 'america-football'},
          {id: 'baseball'},
          {id: 'basketball'},
          {id: 'cricket'},
          {id: 'golf'},
          {id: 'skiing'},
          {id: 'soccer'},
          {id: 'swimming'},
          {id: 'tennis'},

          // Places
          {id: 'airfield'},
          {id: 'building'},
          {id: 'campsite'},
          {id: 'cemetery'},
          {id: 'city'},
          {id: 'college'},
          {id: 'dog-park'},
          {id: 'embassy'},
          {id: 'farm'},
          {id: 'fire-station'},
          {id: 'garden'},
          {id: 'harbor'},
          {id: 'heliport'},
          {id: 'hospital'},
          {id: 'industrial'},
          {id: 'land-use'},
          {id: 'lighthouse'},
          {id: 'monument'},
          {id: 'minefield'},
          {id: 'museum'},
          {id: 'oil-well'},
          {id: 'park2'},
          {id: 'park'},
          {id: 'parking'},
          {id: 'parking-garage'},
          {id: 'pitch'},
          {id: 'place-of-worship'},
          {id: 'playground'},
          {id: 'police'},
          {id: 'polling-place'},
          {id: 'post'},
          {id: 'religious-christian'},
          {id: 'religious-jewish'},
          {id: 'religious-muslim'},
          {id: 'prison'},
          {id: 'school'},
          {id: 'slaughterhouse'},
          {id: 'theatre'},
          {id: 'toilets'},
          {id: 'town'},
          {id: 'town-hall'},
          {id: 'village'},
          {id: 'warehouse'},
          {id: 'wetland'},
          {id: 'zoo'},


          {id: 'camera'},
          {id: 'chemist'},
          {id: 'dam'},
          {id: 'emergency-telephone'},
          {id: 'entrance'},
          {id: 'heart'},
          {id: 'logging'},
          {id: 'mobilephone'},
          {id: 'music'},
          {id: 'roadblock'},
          {id: 'rocket'},
          {id: 'suitcase'},
          {id: 'telephone'},
          {id: 'waste-basket'},
          {id: 'water'}
      ]
    };

    // We use options provided by parent controller.
    $scope.options = angular.extend(options, $scope.options || {});

    // Set default options for draw style directive.
    $scope.options.color = $scope.options.colors[5];
    $scope.options.textColor = $scope.options.colors[5];
    $scope.options.iconColor = $scope.options.colors[5];
    $scope.options.icon = $scope.options.icons[0];
    $scope.options.iconSize = $scope.options.iconSizes[2];

    // Return the icon url with the good color.
    var getIconUrl = function(icon) {
      return gaGlobalOptions.apiUrl + '/color/' +
          $scope.options.iconColor.fill.toString() + '/' + icon.id +
          '-24@2x.png';
    };

    // Get the current style defined by the properties object
    $scope.options.updateStyle = function(feature, properties) {
      var style;
      var oldStyles = feature.getStyle();
      if (oldStyles.length) {
        style = oldStyles[0];
      } else {
        // No style to update
        return;
      }

      // Update Fill if it exists
      var color = properties.color;
      var fill = style.getFill();
      if (fill) {
        fill.setColor(color.fill.concat([0.4]));
      }

      // Update Stroke if it exists
      var stroke = style.getStroke();
      if (stroke) {
        stroke.setColor(color.fill.concat([1]));
      }

      // Update text style
      var text;
      if (properties.name) {
        text = new ol.style.Text({
          font: properties.font,
          text: properties.name,
          fill: new ol.style.Fill({
            color: properties.textColor.fill.concat([1])
          }),
          stroke: gaStyleFactory.getTextStroke(
              properties.textColor.fill.concat([1]))
        });
      }

      // Update Icon style if it exists
      var icon = style.getImage();
      if (icon instanceof ol.style.Icon &&
          angular.isDefined(properties.icon)) {
        icon = new ol.style.Icon({
          src: getIconUrl(properties.icon),
          scale: properties.iconSize.scale
        });
      }

      // Set feature's properties
      feature.set('name', properties.name);
      feature.set('description', properties.description);

      var styles = [
        new ol.style.Style({
          fill: fill,
          stroke: stroke,
          text: text,
          image: icon,
          zIndex: style.getZIndex()
        })
      ];
      return styles;
    };

    // Draw a marker
    var markerDrawStyleFunc = function(feature, resolution) {
      var textStyle;
      if ($scope.options.name) {
        textStyle = annotationDrawStyleFunc(feature, resolution)[0].getText();
      }
      var styles = [
        new ol.style.Style({
          text: textStyle,
          image: new ol.style.Icon({
            src: getIconUrl($scope.options.icon),
            scale: $scope.options.iconSize.scale
          }),
          zIndex: gaStyleFactory.ZICON
        })
      ];
      return styles;
    };


    // Draw a text
    var annotationDrawStyleFunc = function(feature, resolution) {
      var color = $scope.options.textColor;
      if (!$scope.options.name) {
        $scope.options.name = $translate.instant('draw_new_text');
      }
      var text = new ol.style.Text({
          font: $scope.options.font,
          text: $scope.options.name,
          fill: new ol.style.Fill({
            color: color.fill.concat([1])
          }),
          stroke: gaStyleFactory.getTextStroke(color.fill)
      });
      feature.set('name', $scope.options.name);

      var styles = [
        new ol.style.Style({
          text: text,
          zIndex: gaStyleFactory.ZICON
        })
      ];
      return styles;
    };

    // Draw a line or polygon
    var linepolygonDrawStyleFunc = function(feature) {
      var color = $scope.options.color;
      var styles = [
        new ol.style.Style({
          fill: new ol.style.Fill({
            color: color.fill.concat([0.4])
          }),
          stroke: new ol.style.Stroke({
            color: color.fill.concat([1]),
            width: 3
          }),
          zIndex: gaStyleFactory.ZPOLYGON
        })
      ];
      return styles;
    };

    var measureDrawStyleFunc = gaStyleFactory.getStyleFunction('measure');


    var generateDrawStyleFunc = function(styleFunction) {
      // ol.interaction.Draw generates automatically a sketchLine when
      // drawing  polygon
      var sketchPolygon = new ol.style.Style({
        fill: new ol.style.Fill({
          color: [255, 255, 255, 0.4]
        }),
        stroke: new ol.style.Stroke({
          color: [255, 255, 255, 0],
          width: 0
        })
      });

      return function(feature, resolution) {
        var styles;
        if (feature.getGeometry().getType() === 'Polygon') {
          styles = [sketchPolygon];
        } else if (feature.getGeometry().getType() === 'Point') {
          var color = $scope.options.color;
          var fill = new ol.style.Fill({
            color: color.fill.concat([0.4])
          });
          var stroke = new ol.style.Stroke({
            color: color.fill.concat([1]),
            width: 3
          });
          var sketchCircle = new ol.style.Style({
            image: new ol.style.Circle({
              radius: 4,
              fill: fill,
              stroke: stroke
            })
          });
          styles = [sketchCircle];
        } else {
          styles = styleFunction(feature, resolution);
        }
        return styles;
      };
    };

    // Select style function display vertices of the geometry
    $scope.options.selectStyleFunction = (function() {

      // The vertex style display a black and white circle on the existing
      // vertices, and also when the user can add a new vertices.
      var vertexStyle = new ol.style.Style({
        image: new ol.style.Circle({
          radius: 7,
          fill: new ol.style.Fill({
            color: white.concat([1])
          }),
          stroke: new ol.style.Stroke({
            color: black.concat([1])
          })
        }),
        geometry: function(feature) {
          var geom = feature.getGeometry();
          if (geom instanceof ol.geom.LineString) {
            var coordinates = feature.getGeometry().getCoordinates();
            return new ol.geom.MultiPoint(coordinates);
          } else if (geom instanceof ol.geom.Polygon) {
            var coordinates = feature.getGeometry().getCoordinates()[0];
            return new ol.geom.MultiPoint(coordinates);
          } else {
            return feature.getGeometry();
          }
        },
        zIndex: gaStyleFactory.ZSKETCH
      });

      return function(feature, resolution) {
        if (!feature.getStyleFunction() ||
            !feature.getStyleFunction().call(feature, resolution)) {
          return [vertexStyle];
        }
        var styles = feature.getStyleFunction().call(feature, resolution);
        // When a feature is selected we apply its current style and the
        // vertex style.
        return styles.concat([
          vertexStyle
        ]);
      }
    })();

    // Define tools
    if (!$scope.options.tools) {
      $scope.options.tools = [{
        id: 'marker',
        cssClass: 'fa fa-ga-marker',
        drawOptions: {
          type: 'Point',
          style: markerDrawStyleFunc
        },
        style: markerDrawStyleFunc
      }, {
        id: 'annotation',
        cssClass: 'fa fa-ga-add-text',
        drawOptions: {
          type: 'Point',
          style: annotationDrawStyleFunc
        },
        style: annotationDrawStyleFunc
      }, {
        id: 'linepolygon',
        cssClass: 'fa fa-ga-add-line',
        drawOptions: {
          type: 'Polygon',
          style: generateDrawStyleFunc(linepolygonDrawStyleFunc)
        },
        style: linepolygonDrawStyleFunc
      }, {
        id: 'measure',
        cssClass: 'fa fa-ga-measure',
        drawOptions: {
          type: 'Polygon',
          minPoints: 2,
          style: generateDrawStyleFunc(measureDrawStyleFunc)
        },
        style: measureDrawStyleFunc,
        showMeasure: true
      }];
    }
    for (var i = 0, ii = $scope.options.tools.length; i < ii; i++) {
      var tool = $scope.options.tools[i];
      tool.activeKey = 'is' + tool.id.charAt(0).toUpperCase() +
          tool.id.slice(1) + 'Active';
      tool.title = 'draw_' + tool.id;
    }

    // Allow to print dynamic profile from feature's popup
    // TODO: Verify f it's working, currently print profile is deactivated.
    $scope.print = function() {
      var contentEl = $('ga-draw-popup .ga-popup-content');
      var onLoad = function(printWindow) {
        var profile = $(printWindow.document).find('[ga-profile]');
        // HACK IE, for some obscure reason an A4 page in IE is not
        // 600 pixels width so calculation of the scale is not optimal.
        var b = (gaBrowserSniffer.msie) ? 1000 : 600;
        // Same IE mistery here, a js error occurs using jQuery width()
        // function.
        var a = parseInt(profile.find('svg').attr('width'), 10);
        var scale = b / a;
        profile.css({
          position: 'absolute',
          left: (-(a - a * scale) / 2) + 'px',
          top: '200px',
          transform: 'scale(' + scale + ')'
        });
        printWindow.print();
      };
      $timeout(function() {
        gaPrintService.htmlPrintout(contentEl.clone().html(), undefined,
            onLoad);
      }, 0, false);
    };
  });
})();
